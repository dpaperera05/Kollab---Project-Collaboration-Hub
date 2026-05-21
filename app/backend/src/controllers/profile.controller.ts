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
import {
  smartSearchMentors,
  type RawMentorDoc,
} from "../services/mentorSmartSearch.service";
import {
  smartSearchMembers,
  type RawMemberDoc,
} from "../services/memberSmartSearch.service";
import { computeSkillEvidenceForMember } from "../services/skillEvidence.service";

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
  
  // Get user IDs
  const userIds = users.map((u) => u._id.toString());
  
  // Fetch projects for all users in parallel
  const projects = await Project.find({
    $or: [
      { ownerId: { $in: userIds } },
      { "members.userId": { $in: userIds } },
    ],
  }).select("ownerId members.userId").lean();
  
  // Fetch portfolio items for all users in parallel
  const portfolioItems = await PortfolioItem.find({
    userId: { $in: userIds },
    isPublished: { $ne: false },
  }).select("userId").lean();
  
  // Build stats map
  const statsMap = new Map<string, { projectsCount: number; showcasesCount: number }>();
  
  // Initialize all users with 0 stats
  userIds.forEach((id) => {
    statsMap.set(id, { projectsCount: 0, showcasesCount: 0 });
  });
  
  // Count projects
  projects.forEach((project) => {
    const ownerId = project.ownerId;
    if (statsMap.has(ownerId)) {
      statsMap.get(ownerId)!.projectsCount += 1;
    }
    
    (project.members || []).forEach((member) => {
      if (member?.userId && statsMap.has(member.userId)) {
        const current = statsMap.get(member.userId)!.projectsCount;
        // Only increment if not already counted as owner
        if (member.userId !== ownerId) {
          statsMap.set(member.userId, { ...statsMap.get(member.userId)!, projectsCount: current + 1 });
        }
      }
    });
  });
  
  // Count portfolios
  portfolioItems.forEach((item) => {
    const userId = item.userId;
    if (statsMap.has(userId)) {
      statsMap.get(userId)!.showcasesCount += 1;
    }
  });
  
  // Map users with stats
  const payload = users.map((u) => {
    const userId = u._id.toString();
    const stats = statsMap.get(userId) || { projectsCount: 0, showcasesCount: 0 };
    return { ...toUserResponse(u), stats };
  });
  
  return res.json({ success: true, data: { users: payload } });
};

export const listPublicMentors = async (_req: Request, res: Response) => {
  const users = await User.find({ userType: "mentor", isProfilePublic: { $ne: false } });
  const payload = users.map((u) => toUserResponse(u));
  return res.json({ success: true, data: { users: payload } });
};

export const smartSearchMentorsHandler = async (req: Request, res: Response) => {
  const { q, expertise, domain, languages, rate, sortBy } = req.query;
  const page     = Math.max(parseInt(String(req.query.page     ?? "1"),  10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? "9"),  10) || 9, 1), 50);
  const isDebug  = process.env.NODE_ENV !== "production" && req.query.debug === "true";

  // ── q is required ────────────────────────────────────────────────────────────
  if (!q || typeof q !== "string" || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: "Search query is required for mentor smart search",
    });
  }

  // ── Build hard filter ────────────────────────────────────────────────────────
  const filter: Record<string, unknown> = {
    userType: "mentor",
    isProfilePublic: { $ne: false },
  };

  // expertise: match profile.expertiseSkills OR profile.skills
  if (typeof expertise === "string" && expertise.trim()) {
    const expertiseList = expertise.split(",").map((e) => e.trim()).filter(Boolean);
    if (expertiseList.length > 0) {
      filter.$or = [
        { "profile.expertiseSkills": { $in: expertiseList } },
        { "profile.skills":          { $in: expertiseList } },
      ];
    }
  }

  // domain: case-insensitive substring match in profile.domainInterests
  if (typeof domain === "string" && domain.trim() && domain !== "All") {
    filter["profile.domainInterests"] = { $regex: new RegExp(domain.trim(), "i") };
  }

  // languages: profile.languages must include all requested
  if (typeof languages === "string" && languages.trim()) {
    const langList = languages.split(",").map((l) => l.trim()).filter(Boolean);
    if (langList.length > 0) {
      filter["profile.languages"] = { $in: langList };
    }
  }

  // rate: "Free" → rateType "free", "Paid" → rateType "paid"
  if (typeof rate === "string" && rate.trim() && rate !== "All") {
    if (rate === "Free")  filter["profile.rateType"] = "free";
    if (rate === "Paid")  filter["profile.rateType"] = "paid";
  }

  try {
    // ── Fetch mentors with embeddings ────────────────────────────────────────
    // profile.recommendationEmbedding has select:false so we must opt-in.
    const rawMentors = await User.find(filter)
      .select("+profile.recommendationEmbedding")
      .lean() as RawMentorDoc[];

    // ── Score + sort + paginate ──────────────────────────────────────────────
    const result = await smartSearchMentors(
      q.trim(),
      rawMentors,
      {
        page,
        pageSize,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
        debug: isDebug,
      },
    );

    // ── Strip internal _scoring; attach _debug when requested ───────────────
    const mentors = result.mentors.map(({ _scoring, ...pub }) => {
      if (isDebug && _scoring) {
        return {
          ...pub,
          _debug: {
            smartScore:         pub.smartScore,
            semanticScore:      _scoring.semanticScore,
            keywordScore:       _scoring.keywordScore,
            finalSmartScore:    _scoring.finalSmartScore,
            cosineSimilarity:   _scoring.cosineSimilarity !== null
                                  ? Math.round(_scoring.cosineSimilarity * 1000) / 1000
                                  : null,
            hasMentorEmbedding: _scoring.hasMentorEmbedding,
            passedThreshold:    _scoring.passedThreshold,
            thresholdReason:    _scoring.thresholdReason,
            searchReasons:      pub.searchReasons,
          },
        };
      }
      return pub;
    });

    return res.json({
      success: true,
      data: {
        mode:       result.mode,
        query:      result.query,
        page:       result.page,
        pageSize:   result.pageSize,
        total:      result.total,
        totalPages: result.totalPages,
        users:      mentors,   // key is "users" to stay compatible with the existing frontend mapper
        ...(result.message    ? { message:      result.message      } : {}),
        ...(isDebug && result.debugSummary ? { debugSummary: result.debugSummary } : {}),
      },
    });
  } catch (err) {
    console.error("[mentorSmartSearch] Unexpected error:", err);
    return res.status(500).json({ success: false, message: "Mentor smart search failed" });
  }
};

export const smartSearchMembersHandler = async (req: Request, res: Response) => {
  const { q, preferredRoles, skills, techStack, domainInterests, sortBy } = req.query;
  const page     = Math.max(parseInt(String(req.query.page     ?? "1"),  10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? "9"),  10) || 9, 1), 50);
  const isDebug  = process.env.NODE_ENV !== "production" && req.query.debug === "true";

  // ── q is required ────────────────────────────────────────────────────────────
  if (!q || typeof q !== "string" || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: "Search query is required for member smart search",
    });
  }

  // ── Build hard filter ────────────────────────────────────────────────────────
  const filter: Record<string, unknown> = {
    userType: "member",
    isProfilePublic: { $ne: false },
  };

  // preferredRoles: profile.preferredRoles must include all requested
  if (typeof preferredRoles === "string" && preferredRoles.trim()) {
    const roleList = preferredRoles.split(",").map((r) => r.trim()).filter(Boolean);
    if (roleList.length > 0) {
      filter["profile.preferredRoles"] = { $in: roleList };
    }
  }

  // skills: profile.skills must include at least one
  if (typeof skills === "string" && skills.trim()) {
    const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      filter["profile.skills"] = { $in: skillList };
    }
  }

  // techStack: profile.techStack must include at least one
  if (typeof techStack === "string" && techStack.trim()) {
    const techList = techStack.split(",").map((t) => t.trim()).filter(Boolean);
    if (techList.length > 0) {
      filter["profile.techStack"] = { $in: techList };
    }
  }

  // domainInterests: profile.domainInterests must include at least one
  if (typeof domainInterests === "string" && domainInterests.trim()) {
    const domainList = domainInterests.split(",").map((d) => d.trim()).filter(Boolean);
    if (domainList.length > 0) {
      filter["profile.domainInterests"] = { $in: domainList };
    }
  }

  try {
    // ── Fetch members with embeddings ────────────────────────────────────────
    // profile.recommendationEmbedding has select:false so we must opt-in.
    const rawMembers = await User.find(filter)
      .select("+profile.recommendationEmbedding")
      .lean() as RawMemberDoc[];

    // ── Score + sort + paginate ──────────────────────────────────────────────
    const result = await smartSearchMembers(
      q.trim(),
      rawMembers,
      {
        page,
        pageSize,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
        debug: isDebug,
      },
    );

    // ── Compute stats for paginated members ─────────────────────────────────
    const memberIds = result.members.map((m) => m.id);
    
    const [projects, portfolioItems] = await Promise.all([
      Project.find({
        $or: [
          { ownerId: { $in: memberIds } },
          { "members.userId": { $in: memberIds } },
        ],
      }).select("ownerId members.userId").lean(),
      
      PortfolioItem.find({
        userId: { $in: memberIds },
        isPublished: { $ne: false },
      }).select("userId").lean(),
    ]);
    
    // Build stats map
    const statsMap = new Map<string, { projectsCount: number; showcasesCount: number }>();
    memberIds.forEach((id) => {
      statsMap.set(id, { projectsCount: 0, showcasesCount: 0 });
    });
    
    // Count projects
    projects.forEach((project) => {
      const ownerId = project.ownerId;
      if (statsMap.has(ownerId)) {
        statsMap.get(ownerId)!.projectsCount += 1;
      }
      
      (project.members || []).forEach((member) => {
        if (member?.userId && statsMap.has(member.userId)) {
          const current = statsMap.get(member.userId)!.projectsCount;
          if (member.userId !== ownerId) {
            statsMap.set(member.userId, { ...statsMap.get(member.userId)!, projectsCount: current + 1 });
          }
        }
      });
    });
    
    // Count portfolios
    portfolioItems.forEach((item) => {
      const userId = item.userId;
      if (statsMap.has(userId)) {
        statsMap.get(userId)!.showcasesCount += 1;
      }
    });

    // ── Strip internal _scoring; attach _debug when requested; add stats ────
    const members = result.members.map(({ _scoring, ...pub }) => {
      const stats = statsMap.get(pub.id) || { projectsCount: 0, showcasesCount: 0 };
      
      if (isDebug && _scoring) {
        return {
          ...pub,
          stats,
          _debug: {
            smartScore:          pub.smartScore,
            semanticScore:       _scoring.semanticScore,
            keywordScore:        _scoring.keywordScore,
            finalSmartScore:     _scoring.finalSmartScore,
            cosineSimilarity:    _scoring.cosineSimilarity !== null
                                   ? Math.round(_scoring.cosineSimilarity * 1000) / 1000
                                   : null,
            hasMemberEmbedding:  _scoring.hasMemberEmbedding,
            passedThreshold:     _scoring.passedThreshold,
            thresholdReason:     _scoring.thresholdReason,
            searchReasons:       pub.searchReasons,
          },
        };
      }
      return { ...pub, stats };
    });

    return res.json({
      success: true,
      data: {
        mode:       result.mode,
        query:      result.query,
        page:       result.page,
        pageSize:   result.pageSize,
        total:      result.total,
        totalPages: result.totalPages,
        users:      members,   // key is "users" to stay compatible with the existing frontend mapper
        ...(result.message       ? { message:      result.message      } : {}),
        ...(isDebug && result.debugSummary    ? { debugSummary:    result.debugSummary    } : {}),
        ...(isDebug && result.debugCandidates ? { debugCandidates: result.debugCandidates } : {}),
      },
    });
  } catch (err) {
    console.error("[memberSmartSearch] Unexpected error:", err);
    return res.status(500).json({ success: false, message: "Member smart search failed" });
  }
};

export const getMemberProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const isPerfLoggingEnabled = process.env.NODE_ENV !== "production";
  const perfPrefix = `[getMemberProfile:${id}:${Date.now()}]`;
  const logPerf = (label: string, durationMs: number) => {
    if (isPerfLoggingEnabled) {
      console.log(`${perfPrefix} ${label}: ${durationMs}ms`);
    }
  };

  const endpointStart = Date.now();

  const userLookupStart = Date.now();
  const user = await User.findById(id)
    .select("name email userType isEmailVerified onboardingCompleted onboardingStep isProfilePublic profile")
    .lean();
  logPerf("userLookup", Date.now() - userLookupStart);

  if (!user || user.userType !== "member" || user.isProfilePublic === false) {
    logPerf("total", Date.now() - endpointStart);
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  const basePortfolioFilter = { userId: id, isPublished: { $ne: false } };

  const portfolioQuery = (async () => {
    const queryStart = Date.now();
    const result = await PortfolioItem.find(basePortfolioFilter)
      .select("title summary problem techStack coverImage createdAt")
      .sort({ createdAt: -1 })
      .lean();
    logPerf("portfolioQuery", Date.now() - queryStart);
    return result;
  })();

  const involvedProjectsQuery = (async () => {
    const queryStart = Date.now();
    const result = await Project.find({
      $or: [{ ownerId: id }, { "members.userId": id }],
    })
      .select("ownerId members.userId technologies roles.requiredSkills roles.niceToHaveSkills")
      .lean();
    logPerf("involvedProjectsQuery", Date.now() - queryStart);
    return result;
  })();

  const [portfolioItems, involvedProjects] = await Promise.all([
    portfolioQuery,
    involvedProjectsQuery,
  ]);

  const statsStart = Date.now();
  let ownedProjects = 0;
  let memberProjects = 0;

  for (const project of involvedProjects) {
    if (project.ownerId === id) {
      ownedProjects += 1;
    }
    if ((project.members || []).some((member) => member?.userId === id)) {
      memberProjects += 1;
    }
  }

  const portfolioCount = portfolioItems.length;
  logPerf("statsAggregation", Date.now() - statsStart);

  const stats = {
    projectsCount: ownedProjects + memberProjects,
    showcasesCount: portfolioCount,
  };

  const pinnedMapStart = Date.now();
  const pinnedShowcases = portfolioItems.slice(0, 4).map((item) => ({
    id: item._id?.toString?.() ?? String(item._id),
    title: item.title,
    summary: item.summary || item.problem || "",
    techStack: item.techStack || [],
    tags: (item.techStack || []).slice(0, 4),
    coverImage: item.coverImage || "",
  }));
  logPerf("pinnedShowcasesMapping", Date.now() - pinnedMapStart);

  const profile = (user.profile || {}) as Record<string, unknown>;
  const profileSkills = Array.isArray(profile.skills)
    ? profile.skills.filter((s): s is string => typeof s === "string")
    : [];
  const profileTech = Array.isArray(profile.techStack)
    ? profile.techStack.filter((s): s is string => typeof s === "string")
    : [];

  const skillEvidenceStart = Date.now();
  const skillEvidenceScores = computeSkillEvidenceForMember({
    profileSkills,
    profileTechStack: profileTech,
    projects: involvedProjects.map((project) => ({
      technologies: project.technologies || [],
      requiredSkills: (project.roles || []).flatMap((role) => role.requiredSkills || []),
      niceToHaveSkills: (project.roles || []).flatMap((role) => role.niceToHaveSkills || []),
    })),
    showcases: portfolioItems.map((item) => ({
      techStack: item.techStack || [],
    })),
  });
  logPerf("skillEvidenceCalculation", Date.now() - skillEvidenceStart);
  logPerf("total", Date.now() - endpointStart);

  return res.json({
    success: true,
    data: {
      user: toUserResponse(user as any),
      stats,
      pinnedShowcases,
      skillEvidenceScores,
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
