import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Project } from "../models/project.model";

export const listBookmarks = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const user = await User.findById(userId).populate("bookmarkedProjects");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  return res.json({ success: true, data: { projects: user.bookmarkedProjects || [] } });
};

export const addBookmark = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { projectId } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!projectId) return res.status(400).json({ success: false, message: "Project ID is required" });

  const exists = await Project.exists({ _id: projectId });
  if (!exists) return res.status(404).json({ success: false, message: "Project not found" });

  await User.updateOne({ _id: userId }, { $addToSet: { bookmarkedProjects: projectId } });
  return res.status(201).json({ success: true, message: "Bookmarked" });
};

export const removeBookmark = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { projectId } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!projectId) return res.status(400).json({ success: false, message: "Project ID is required" });

  await User.updateOne({ _id: userId }, { $pull: { bookmarkedProjects: projectId } });
  return res.json({ success: true, message: "Removed" });
};
