import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { Project } from "../models/project.model";
import { Blog } from "../models/blog.model";
import { Event } from "../models/event.model";
import { PortfolioItem } from "../models/portfolio.model";
import { Booking } from "../models/booking.model";
import { Chat } from "../models/chat.model";
import { VerificationToken } from "../models/verificationToken.model";
import { toUserResponse } from "../utils/userResponse";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { recordActivity } from "../services/activity.service";
import {
  shouldRegenerateUserRecommendationEmbedding,
  triggerUserRecommendationEmbedding,
} from "../services/embeddingFreshness.service";

const sanitizeStringArray = (value?: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
  return cleaned.length ? cleaned : undefined;
};

const sanitizeLinks = (value?: unknown) => {
  if (!value || typeof value !== "object") return undefined;
  const linksValue = value as Record<string, unknown>;
  const github = typeof linksValue.github === "string" ? linksValue.github.trim() : undefined;
  const linkedin = typeof linksValue.linkedin === "string" ? linksValue.linkedin.trim() : undefined;
  const portfolio = typeof linksValue.portfolio === "string" ? linksValue.portfolio.trim() : undefined;
  const links = { github, linkedin, portfolio };
  const hasAny = github || linkedin || portfolio;
  return hasAny ? links : undefined;
};

const sanitizeAvailabilitySlots = (value?: unknown) => {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const slot = entry as Record<string, unknown>;
      const date = typeof slot.date === "string" ? slot.date.trim() : "";
      const startTime = typeof slot.startTime === "string" ? slot.startTime.trim() : "";
      const endTime = typeof slot.endTime === "string" ? slot.endTime.trim() : "";
      const timezone = typeof slot.timezone === "string" ? slot.timezone.trim() : undefined;
      const note = typeof slot.note === "string" ? slot.note.trim() : undefined;
      if (!date || !startTime || !endTime) return null;
      return { date, startTime, endTime, timezone, note };
    })
    .filter(Boolean) as Array<{ date: string; startTime: string; endTime: string; timezone?: string; note?: string }>;

  return cleaned.slice(0, 50);
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, data: { user: toUserResponse(user) } });
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user || user.userType !== "mentor" || user.isProfilePublic === false) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }
  return res.json({ success: true, data: { user: toUserResponse(user) } });
};

export const listPublicMembers = async (_req: Request, res: Response) => {
  const users = await User.find({ userType: "member", isProfilePublic: { $ne: false } });
  const payload = users.map((u) => toUserResponse(u));
  return res.json({ success: true, data: { users: payload } });
};

export const listPublicMentors = async (_req: Request, res: Response) => {
  const users = await User.find({ userType: "mentor", isProfilePublic: { $ne: false } });
  const payload = users.map((u) => toUserResponse(u));
  return res.json({ success: true, data: { users: payload } });
};

export const getMemberProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user || user.userType !== "member" || user.isProfilePublic === false) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  const [ownedProjects, memberProjects, portfolioCount, pinnedPortfolio] = await Promise.all([
    Project.countDocuments({ ownerId: id }),
    Project.countDocuments({ "members.userId": id }),
    PortfolioItem.countDocuments({ userId: id, isPublished: { $ne: false } }),
    PortfolioItem.find({ userId: id, isPublished: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(4),
  ]);

  const stats = {
    projectsCount: ownedProjects + memberProjects,
    showcasesCount: portfolioCount,
  };

  const pinnedShowcases = pinnedPortfolio.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary || item.problem || "",
    techStack: item.techStack || [],
    tags: (item.techStack || []).slice(0, 4),
  }));

  return res.json({
    success: true,
    data: {
      user: toUserResponse(user),
      stats,
      pinnedShowcases,
    },
  });
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const previousKey = (user.profile as any)?.avatarKey as string | undefined;

  const { image } = req.body as { image?: string };
  if (!image) return res.status(400).json({ success: false, message: "Image is required" });
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBase = process.env.R2_PUBLIC_BASE_URL; // optional custom/public base

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return res.status(500).json({ success: false, message: "Image upload not configured" });
  }

  const base64Match = image.match(/^data:(.+);base64,(.+)$/);
  const base64Data = base64Match ? base64Match[2] : image;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch {
    return res.status(400).json({ success: false, message: "Invalid image data" });
  }

  if (buffer.byteLength > 5 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: "Image too large (max 5MB)" });
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const key = `avatars/${userId}-${Date.now()}.png`;

  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    }));
  } catch (err) {
    console.error("R2 upload failed", err);
    return res.status(502).json({ success: false, message: "Upload failed" });
  }

  const imageUrl = publicBase
    ? `${publicBase.replace(/\/$/, "")}/${key}`
    : `https://${bucket}.r2.cloudflarestorage.com/${key}`;

  const profile = user.profile && typeof (user.profile as any).toObject === "function"
    ? (user.profile as any).toObject()
    : { ...(user.profile || {}) };

  user.profile = { ...profile, avatarUrl: imageUrl, avatarKey: key } as any;
  await user.save();

  if (previousKey && previousKey !== key) {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: previousKey }));
    } catch (err) {
      console.error("R2 delete previous avatar failed", err);
    }
  }

  return res.json({ success: true, data: { user: toUserResponse(user) } });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const {
    name,
    bio,
    timezone,
    location,
    preferredRoles,
    skills,
    techStack,
    expertiseSkills,
    headline,
    languages,
    rateType,
    rateNote,
    links,
    availabilityHoursPerWeek,
    domainInterests,
    isProfilePublic,
    availabilitySlots,
  } = req.body as Record<string, unknown>;

  const profile = user.profile && typeof (user.profile as any).toObject === "function"
    ? (user.profile as any).toObject()
    : { ...(user.profile || {}) };

  // Snapshot recommendation-relevant fields before mutation
  const beforeEmbedSnapshot = {
    skills: profile.skills,
    preferredRoles: profile.preferredRoles,
    domainInterests: profile.domainInterests,
    techStack: profile.techStack,
    expertiseSkills: profile.expertiseSkills,
  };

  const cleanedProfile = {
    ...profile,
    name: typeof name === "string" ? name.trim() : profile.name,
    bio: typeof bio === "string" ? bio.trim() : profile.bio,
    timezone: typeof timezone === "string" ? timezone.trim() : profile.timezone,
    location: typeof location === "string" ? location.trim() : profile.location,
    preferredRoles: sanitizeStringArray(preferredRoles) ?? profile.preferredRoles,
    skills: sanitizeStringArray(skills) ?? profile.skills,
    techStack: sanitizeStringArray(techStack) ?? profile.techStack,
    expertiseSkills: sanitizeStringArray(expertiseSkills) ?? profile.expertiseSkills,
    headline: typeof headline === "string" ? headline.trim() : profile.headline,
    languages: sanitizeStringArray(languages) ?? profile.languages,
    rateType:
      typeof rateType === "string" && ["free", "paid"].includes(rateType)
        ? (rateType as "free" | "paid")
        : profile.rateType,
    rateNote: typeof rateNote === "string" ? rateNote.trim() : profile.rateNote,
    links: sanitizeLinks(links) ?? profile.links,
    availabilityHoursPerWeek:
      typeof availabilityHoursPerWeek === "number"
        ? availabilityHoursPerWeek
        : typeof availabilityHoursPerWeek === "string" && availabilityHoursPerWeek.trim()
          ? Number(availabilityHoursPerWeek)
          : profile.availabilityHoursPerWeek,
    domainInterests: sanitizeStringArray(domainInterests) ?? profile.domainInterests,
    availabilitySlots: sanitizeAvailabilitySlots(availabilitySlots) ?? profile.availabilitySlots,
  };

  if (
    cleanedProfile.availabilityHoursPerWeek !== undefined &&
    (Number.isNaN(cleanedProfile.availabilityHoursPerWeek) || cleanedProfile.availabilityHoursPerWeek < 1)
  ) {
    return res.status(400).json({ success: false, message: "Availability hours must be a positive number" });
  }

  user.profile = cleanedProfile;
  if (cleanedProfile.name) user.name = cleanedProfile.name;
  if (typeof isProfilePublic === "boolean") user.isProfilePublic = isProfilePublic;

  await user.save();
  void recordActivity({
    userId,
    type: "profile_updated",
    description: "Updated profile",
  });
  // Regenerate user recommendation embedding if relevant profile fields changed
  const afterEmbedSnapshot = {
    skills: cleanedProfile.skills,
    preferredRoles: cleanedProfile.preferredRoles,
    domainInterests: cleanedProfile.domainInterests,
    techStack: cleanedProfile.techStack,
    expertiseSkills: cleanedProfile.expertiseSkills,
  };
  if (shouldRegenerateUserRecommendationEmbedding(beforeEmbedSnapshot, afterEmbedSnapshot)) {
    triggerUserRecommendationEmbedding(userId, "profile_updated");
  }
  return res.json({ success: true, data: { user: toUserResponse(user) } });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new passwords are required" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ success: false, message: "Current password is incorrect" });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return res.json({ success: true, message: "Password updated" });
};

export const deleteAccount = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  await Promise.all([
    Project.deleteMany({ $or: [{ ownerId: userId }, { "members.userId": userId }, { "applicants.userId": userId }] }),
    Blog.deleteMany({ userId }),
    Event.deleteMany({ userId }),
    PortfolioItem.deleteMany({ userId }),
    Booking.deleteMany({ $or: [{ memberId: userId }, { mentorId: userId }] }),
    Chat.deleteMany({ participantIds: userId }),
    VerificationToken.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  return res.json({ success: true, message: "Account and associated data deleted" });
};
