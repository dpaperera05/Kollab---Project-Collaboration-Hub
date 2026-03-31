import { Request, Response } from "express";
import { Activity } from "../models/activity.model";

export const listActivities = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limitParam = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;
  const limit = Math.min(Math.max(limitParam || 20, 1), 50);
  const cursor = typeof req.query.before === "string" ? new Date(req.query.before) : null;

  if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

  const filter: Record<string, any> = { userId };
  if (cursor && !Number.isNaN(cursor.getTime())) {
    filter.createdAt = { $lt: cursor.toISOString() };
  }

  const activities = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return res.json({ success: true, data: { activities } });
};