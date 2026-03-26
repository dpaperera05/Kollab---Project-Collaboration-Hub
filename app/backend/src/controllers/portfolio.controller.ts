import { Request, Response } from "express";
import { PortfolioItem } from "../models/portfolio.model";

export const listPortfolio = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const items = await PortfolioItem.find({ userId }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { items } });
};

export const createPortfolio = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const payload = req.body || {};
  if (!payload.title) return res.status(400).json({ success: false, message: "Title is required" });
  const item = await PortfolioItem.create({ ...payload, userId });
  return res.status(201).json({ success: true, data: { item } });
};

export const updatePortfolio = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const existing = await PortfolioItem.findOne({ _id: id, userId });
  if (!existing) return res.status(404).json({ success: false, message: "Portfolio item not found" });
  const payload = req.body || {};
  if (payload.title === "") {
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  Object.assign(existing, payload);
  await existing.save();
  return res.json({ success: true, data: { item: existing } });
};

export const deletePortfolio = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const deleted = await PortfolioItem.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ success: false, message: "Portfolio item not found" });
  return res.json({ success: true, message: "Deleted" });
};
