import { Request, Response } from "express";
import { Project } from "../models/project.model";

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

export const listPublicProjects = async (_req: Request, res: Response) => {
  const projects = await Project.find({}).sort({ createdAt: -1 });
  return res.json({ success: true, data: { projects } });
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
  const projects = await Project.find({ "members.userId": userId }).sort({ createdAt: -1 });
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
    posterImage: typeof posterImage === "string" ? posterImage.trim() : undefined,
    tags: ensureStringArray(tags),
    status: "Open",
    roles: cleanedRoles,
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [{ userId, role: "Owner", status: "Open" }],
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
