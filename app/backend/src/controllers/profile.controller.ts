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

export const getMe = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
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
  } = req.body as Record<string, unknown>;

  const profile = user.profile && typeof (user.profile as any).toObject === "function"
    ? (user.profile as any).toObject()
    : { ...(user.profile || {}) };

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
