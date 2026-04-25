import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { recordActivity } from "../services/activity.service";
import {
  shouldRegenerateProjectEmbedding,
  triggerProjectEmbedding,
} from "../services/embeddingFreshness.service";

const ensureStringArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return (val as unknown[])
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
};

const ensureDeliverables = (val: unknown): string[] => {
  if (Array.isArray(val)) return ensureStringArray(val);
  if (typeof val === "string") {
    return val
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const enrichProjectsWithOwner = async (projects: any[]) => {
  const ownerIds = Array.from(new Set(projects.map((p) => p.ownerId).filter(Boolean)));
  const owners = ownerIds.length
    ? await User.find({ _id: { $in: ownerIds } }, "name profile.avatarUrl profile.headline").lean()
    : [];

  const ownerMap = new Map<string, any>(owners.map((o) => [o._id.toString(), o]));

  return projects.map((p) => {
    const owner = ownerMap.get(p.ownerId?.toString());
    const ownerName = owner?.name || "Project Owner";
    const avatar = owner?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}`;
    return {
      ...p,
      id: p._id?.toString?.() || p.id,
      owner: {
        id: p.ownerId,
        name: ownerName,
        avatar,
        title: owner?.profile?.headline || "Project Owner",
        rating: 4.8,
        projectsPosted: 1,
      },
    };
  });
};

export const listPublicProjects = async (req: Request, res: Response) => {
  const {
    domain,
    technologies,
    difficulty,
    duration,
    status,
    tags,
    roleType,
    sortBy,
    q,
  } = req.query;

  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "9"), 10) || 9, 1), 50);

  const filter: Record<string, any> = {};

  if (typeof domain === "string" && domain.trim() && domain !== "All") {
    filter.domain = domain.trim();
  }

  if (typeof difficulty === "string" && difficulty.trim() && difficulty !== "All") {
    filter.difficulty = difficulty.trim();
  }

  if (typeof duration === "string" && duration.trim() && duration !== "All") {
    filter.duration = duration.trim();
  }

  if (typeof status === "string" && status.trim() && status !== "All") {
    filter.status = status.trim();
  }

  if (typeof technologies === "string" && technologies.trim().length > 0) {
    const techList = technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (techList.length > 0) {
      filter.technologies = { $all: techList };
    }
  }

  if (typeof tags === "string" && tags.trim().length > 0) {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length > 0) {
      filter.tags = { $in: tagList };
    }
  }

  if (typeof roleType === "string" && roleType.trim() && roleType !== "All") {
    filter["roles.title"] = { $regex: new RegExp(roleType.trim(), "i") };
  }

  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [
      { title: regex },
      { summary: regex },
      { domain: regex },
      { technologies: regex },
      { tags: regex },
    ];
  }

  const sort: Record<string, 1 | -1> = {};
  if (sortBy === "Oldest") {
    sort.createdAt = 1;
  } else {
    sort.createdAt = -1; // Newest, Most Relevant, Top Rated fallback
  }

  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const enriched = await enrichProjectsWithOwner(projects);

  return res.json({ success: true, data: { projects: enriched, total, page, pageSize } });
};

export const getPublicProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await Project.findById(id).lean();
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });

  const memberIds = (project.members || []).map((m) => m.userId).filter(Boolean) as string[];
  const userIds = Array.from(new Set([project.ownerId, ...memberIds].filter(Boolean)));
  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }, "name profile.avatarUrl profile.headline").lean()
    : [];
  const userMap = new Map<string, any>(users.map((u) => [u._id.toString(), u]));

  const owner = userMap.get(project.ownerId?.toString());
  const ownerName = owner?.name || "Project Owner";
  const ownerAvatar = owner?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}`;

  const members = (project.members || []).map((m) => {
    const member = userMap.get(m.userId?.toString());
    const name = member?.name || "Member";
    const avatar = member?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    return { ...m, name, avatar };
  });

  const response = {
    ...project,
    id: project._id?.toString?.() ?? String(project._id),
    owner: {
      id: project.ownerId,
      name: ownerName,
      avatar: ownerAvatar,
      title: owner?.profile?.headline || "Project Owner",
      rating: 4.8,
      projectsPosted: 1,
    },
    members,
  };

  return res.json({ success: true, data: { project: response } });
};

const getR2Config = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBase = process.env.R2_PUBLIC_BASE_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, bucket, publicBase } as const;
};

const uploadPosterToR2 = async (base64: string) => {
  const cfg = getR2Config();
  if (!cfg) throw new Error("R2 not configured");

  const base64Match = base64.match(/^data:(.+);base64,(.+)$/);
  const base64Data = base64Match ? base64Match[2] : base64;
  const contentType = base64Match?.[1] || "image/png";

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > 8 * 1024 * 1024) {
    throw new Error("Image too large (max 8MB)");
  }

  const key = `posters/${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
  await cfg.client.send(new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  const imageUrl = cfg.publicBase
    ? `${cfg.publicBase.replace(/\/$/, "")}/${key}`
    : `https://${cfg.bucket}.r2.cloudflarestorage.com/${key}`;

  return { imageUrl, key } as const;
};

const uploadResumeToR2 = async (base64: string, originalName?: string) => {
  const cfg = getR2Config();
  if (!cfg) throw new Error("R2 not configured");

  const base64Match = base64.match(/^data:(.+);base64,(.+)$/);
  const base64Data = base64Match ? base64Match[2] : base64;
  const contentType = base64Match?.[1] || "application/pdf";

  if (contentType !== "application/pdf") {
    throw new Error("Resume must be a PDF");
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > 8 * 1024 * 1024) {
    throw new Error("Resume too large (max 8MB)");
  }

  const safeName = (originalName || "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `resumes/${Date.now()}-${Math.floor(Math.random() * 10000)}-${safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`}`;
  await cfg.client.send(new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  const url = cfg.publicBase
    ? `${cfg.publicBase.replace(/\/$/, "")}/${key}`
    : `https://${cfg.bucket}.r2.cloudflarestorage.com/${key}`;

  return { url, key } as const;
};

const deleteR2Object = async (key?: string) => {
  const cfg = getR2Config();
  if (!cfg || !key) return;
  try {
    await cfg.client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
  } catch (err) {
    console.error("R2 delete failed", err);
  }
};

export const listOwnedProjects = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const projects = await Project.find({ ownerId: userId }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { projects } });
};

export const listJoinedProjects = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const projects = await Project.find({ "members.userId": userId, ownerId: { $ne: userId } }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { projects } });
};

export const createProject = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const {
    title,
    summary,
    problemStatement,
    deliverables,
    projectType,
    domain,
    technologies,
    difficulty,
    duration,
    weeklyHours,
    compensation,
    posterImage,
    tags,
    roles,
  } = req.body || {};

  if (!title || !summary || !projectType || !domain || !difficulty || !duration || !weeklyHours || !compensation) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const cleanedRoles = Array.isArray(roles)
    ? roles.map((r: any) => ({
        id: typeof r?.id === "string" ? r.id : `role-${Date.now()}`,
        title: typeof r?.title === "string" ? r.title.trim() : "",
        responsibilities: ensureDeliverables(r?.responsibilities),
        requiredSkills: ensureStringArray(r?.requiredSkills),
        niceToHaveSkills: ensureStringArray(r?.niceToHaveSkills),
        level: typeof r?.level === "string" && ["Junior", "Intermediate", "Senior"].includes(r.level) ? r.level : "Junior",
        seats: typeof r?.seats === "number" && r.seats > 0 ? r.seats : 1,
        status: "Open",
      }))
    : [];

  if (cleanedRoles.length === 0) {
    return res.status(400).json({ success: false, message: "At least one role is required" });
  }

  if (cleanedRoles.some((r) => !r.title || r.requiredSkills.length === 0 || r.responsibilities.length === 0)) {
    return res.status(400).json({ success: false, message: "Roles must include title, responsibilities, and required skills" });
  }

  let poster: { imageUrl: string; key?: string } | null = null;
  try {
    if (posterImage && typeof posterImage === "string" && posterImage.startsWith("data:")) {
      poster = await uploadPosterToR2(posterImage);
    }
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || "Poster upload failed" });
  }

  const project = await Project.create({
    ownerId: userId,
    title: String(title).trim(),
    summary: String(summary).trim(),
    problemStatement: typeof problemStatement === "string" ? problemStatement.trim() : undefined,
    deliverables: ensureDeliverables(deliverables),
    projectType: String(projectType).trim(),
    domain: String(domain).trim(),
    technologies: ensureStringArray(technologies),
    difficulty: String(difficulty).trim(),
    duration: String(duration).trim(),
    weeklyHours: Number(weeklyHours),
    compensation: String(compensation).trim(),
    posterImage: poster?.imageUrl || (typeof posterImage === "string" ? posterImage.trim() : undefined),
    posterKey: poster?.key,
    tags: ensureStringArray(tags),
    status: "Open",
    roles: cleanedRoles,
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  });
  void recordActivity({
    userId,
    type: "project_created",
    projectId: project._id.toString(),
    projectTitle: project.title,
    description: `Posted a new project: ${project.title}`,
  });
  // Trigger embedding generation in the background — must not block the response
  triggerProjectEmbedding(project._id.toString(), "created");
  return res.status(201).json({ success: true, data: { project } });
};

export const updateProject = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const project = await Project.findOne({ _id: id, ownerId: userId });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });

  const {
    title,
    summary,
    problemStatement,
    deliverables,
    projectType,
    domain,
    technologies,
    difficulty,
    duration,
    weeklyHours,
    compensation,
    posterImage,
    tags,
    roles,
  } = req.body || {};

  if (!title || !summary || !projectType || !domain || !difficulty || !duration || !weeklyHours || !compensation) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const cleanedRoles = Array.isArray(roles)
    ? roles.map((r: any) => ({
        id: typeof r?.id === "string" ? r.id : `role-${Date.now()}`,
        title: typeof r?.title === "string" ? r.title.trim() : "",
        responsibilities: ensureDeliverables(r?.responsibilities),
        requiredSkills: ensureStringArray(r?.requiredSkills),
        niceToHaveSkills: ensureStringArray(r?.niceToHaveSkills),
        level: typeof r?.level === "string" && ["Junior", "Intermediate", "Senior"].includes(r.level) ? r.level : "Junior",
        seats: typeof r?.seats === "number" && r.seats > 0 ? r.seats : 1,
        status: typeof r?.status === "string" && ["Open", "Filled"].includes(r.status) ? r.status : "Open",
      }))
    : [];

  if (cleanedRoles.length === 0) {
    return res.status(400).json({ success: false, message: "At least one role is required" });
  }

  if (cleanedRoles.some((r) => !r.title || r.requiredSkills.length === 0 || r.responsibilities.length === 0)) {
    return res.status(400).json({ success: false, message: "Roles must include title, responsibilities, and required skills" });
  }

  let poster: { imageUrl: string; key?: string } | null = null;
  try {
    if (posterImage && typeof posterImage === "string" && posterImage.startsWith("data:")) {
      poster = await uploadPosterToR2(posterImage);
      if (project.posterKey) {
        void deleteR2Object(project.posterKey);
      }
    }
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || "Poster upload failed" });
  }

  // Snapshot the embedding-relevant fields before mutation so we can decide
  // whether to regenerate after save.
  const beforeSnapshot = {
    title: project.title,
    summary: project.summary,
    problemStatement: project.problemStatement,
    domain: project.domain,
    technologies: [...(project.technologies ?? [])],
    tags: [...(project.tags ?? [])],
    difficulty: project.difficulty,
    duration: project.duration,
    roles: JSON.parse(JSON.stringify(project.roles ?? [])),
  };

  project.title = String(title).trim();
  project.summary = String(summary).trim();
  project.problemStatement = typeof problemStatement === "string" ? problemStatement.trim() : undefined;
  project.deliverables = ensureDeliverables(deliverables);
  project.projectType = String(projectType).trim();
  project.domain = String(domain).trim();
  project.technologies = ensureStringArray(technologies);
  project.difficulty = String(difficulty).trim();
  project.duration = String(duration).trim();
  project.weeklyHours = Number(weeklyHours);
  project.compensation = String(compensation).trim();
  project.posterImage = poster?.imageUrl || (typeof posterImage === "string" ? posterImage.trim() : project.posterImage);
  project.posterKey = poster?.key ?? project.posterKey;
  project.tags = ensureStringArray(tags);
  project.roles = cleanedRoles;

  const afterSnapshot = {
    title: project.title,
    summary: project.summary,
    problemStatement: project.problemStatement,
    domain: project.domain,
    technologies: project.technologies,
    tags: project.tags,
    difficulty: project.difficulty,
    duration: project.duration,
    roles: project.roles,
  };

  await project.save();
  void recordActivity({
    userId,
    type: "project_updated",
    projectId: project._id.toString(),
    projectTitle: project.title,
    description: `Updated project: ${project.title}`,
  });
  // Regenerate embedding only if relevant fields changed
  if (shouldRegenerateProjectEmbedding(beforeSnapshot, afterSnapshot)) {
    triggerProjectEmbedding(project._id.toString(), "updated");
  }
  return res.json({ success: true, data: { project } });
};

export const updateProjectStatus = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { status } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!status || !["Open", "Ongoing", "Filled", "Finished"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  const project = await Project.findOne({ _id: id, ownerId: userId });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  project.status = status;
  await project.save();
  return res.json({ success: true, data: { project } });
};

export const deleteProject = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const deleted = await Project.findOneAndDelete({ _id: id, ownerId: userId });
  if (!deleted) return res.status(404).json({ success: false, message: "Project not found" });
  if (deleted.posterKey) {
    void deleteR2Object(deleted.posterKey);
  }
  return res.json({ success: true, message: "Deleted" });
};

export const updateApplicant = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id, applicantId } = req.params;
  const { status, rejectionReason } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const project = await Project.findOne({ _id: id, ownerId: userId });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  const applicant = project.applicants.find((a) => a.id === applicantId);
  if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found" });
  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  applicant.status = status as any;
  applicant.rejectionReason = status === "rejected" ? (typeof rejectionReason === "string" ? rejectionReason.trim() : undefined) : undefined;

  const memberIndex = applicant.userId
    ? project.members.findIndex((m) => m.userId === applicant.userId)
    : -1;

  if (status === "approved" && applicant.userId) {
    if (memberIndex === -1) {
      project.members.push({ userId: applicant.userId, role: applicant.role, status: project.status });
    } else {
      project.members[memberIndex].role = applicant.role;
      project.members[memberIndex].status = project.status;
    }
  } else if (memberIndex !== -1) {
    project.members.splice(memberIndex, 1);
  }

  await project.save();
  return res.json({ success: true, data: { project } });
};

export const addApplicant = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, role, motivation, links, applicantId, resumeFile, resumeName, confirmed } = req.body || {};

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });

  if (project.status === "Filled" || project.status === "Finished") {
    return res.status(400).json({ success: false, message: "Project is not accepting applicants" });
  }

  if (!role || typeof role !== "string") {
    return res.status(400).json({ success: false, message: "Role is required" });
  }
  if (!motivation || typeof motivation !== "string" || motivation.trim().length < 20) {
    return res.status(400).json({ success: false, message: "Motivation must be at least 20 characters" });
  }
  if (!confirmed) {
    return res.status(400).json({ success: false, message: "You must agree to the terms" });
  }

  const evidenceLinks = ensureStringArray(links).filter((l) => /^https?:\/\//i.test(l));
  if (evidenceLinks.length === 0) {
    return res.status(400).json({ success: false, message: "At least one evidence link is required" });
  }

  if (!resumeFile || typeof resumeFile !== "string") {
    return res.status(400).json({ success: false, message: "Resume PDF is required" });
  }

  const user = await User.findById(userId, "name email profile.name").lean();
  const applicantName = typeof name === "string" && name.trim()
    ? name.trim()
    : (user?.profile?.name || user?.name || user?.email || "Applicant");

  let resumeUpload: { url: string; key?: string } | null = null;
  try {
    resumeUpload = await uploadResumeToR2(resumeFile, resumeName);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || "Resume upload failed" });
  }

  project.applicants.push({
    id: applicantId || `app-${Date.now()}`,
    userId,
    name: applicantName,
    role,
    motivation: motivation.trim(),
    evidenceLinks,
    resumeUrl: resumeUpload.url,
    resumeKey: resumeUpload.key,
    resumeName: resumeName || "resume.pdf",
    status: "pending",
  });
  await project.save();
  return res.status(201).json({ success: true, data: { project } });
};

export const leaveProject = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  project.members = project.members.filter((m) => m.userId !== userId);
  await project.save();
  return res.json({ success: true, data: { project } });
};
