import { Request, Response } from "express";
import { Project } from "../models/project.model";

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
  const { title, roles, status } = req.body || {};
  if (!title) return res.status(400).json({ success: false, message: "Title is required" });
  const project = await Project.create({
    ownerId: userId,
    title,
    roles: Array.isArray(roles) ? roles : [],
    status: status && ["Open", "Ongoing", "Filled", "Finished"].includes(status) ? status : "Open",
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [{ userId, role: "Owner", status: status || "Open" }],
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
