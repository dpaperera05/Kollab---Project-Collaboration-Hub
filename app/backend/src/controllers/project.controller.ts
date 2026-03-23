import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
    .limit(pageSize);

  return res.json({ success: true, data: { projects, total, page, pageSize } });
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
  return res.status(201).json({ success: true, data: { project } });
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
  const { name, role, motivation, links, applicantId } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  if (!name || !role) return res.status(400).json({ success: false, message: "Name and role are required" });
  project.applicants.push({
    id: applicantId || `app-${Date.now()}`,
    userId,
    name,
    role,
    motivation,
    links,
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
