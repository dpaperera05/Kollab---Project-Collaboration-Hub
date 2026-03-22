import { Request, Response } from "express";
import { Blog } from "../models/blog.model";

export const listBlogs = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const blogs = await Blog.find({ userId }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { blogs } });
};

export const createBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { title, coverImage, excerpt, content } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!title) return res.status(400).json({ success: false, message: "Title is required" });
  const blog = await Blog.create({ userId, title, coverImage, excerpt, content });
  return res.status(201).json({ success: true, data: { blog } });
};

export const updateBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const blog = await Blog.findOne({ _id: id, userId });
  if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
  if (req.body.title === "") return res.status(400).json({ success: false, message: "Title is required" });
  Object.assign(blog, req.body || {});
  await blog.save();
  return res.json({ success: true, data: { blog } });
};

export const deleteBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const deleted = await Blog.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ success: false, message: "Blog not found" });
  return res.json({ success: true, message: "Deleted" });
};
