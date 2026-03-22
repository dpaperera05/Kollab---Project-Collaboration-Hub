import { Request, Response } from "express";
import { Event } from "../models/event.model";

export const listEvents = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const events = await Event.find({ userId }).sort({ dateTime: 1 });
  return res.json({ success: true, data: { events } });
};

export const createEvent = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { title, coverImage, type, dateTime, location, tags, externalLink, description } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!title) return res.status(400).json({ success: false, message: "Title is required" });
  const event = await Event.create({ userId, title, coverImage, type, dateTime, location, tags, externalLink, description });
  return res.status(201).json({ success: true, data: { event } });
};

export const updateEvent = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const event = await Event.findOne({ _id: id, userId });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  if (req.body.title === "") return res.status(400).json({ success: false, message: "Title is required" });
  Object.assign(event, req.body || {});
  await event.save();
  return res.json({ success: true, data: { event } });
};

export const deleteEvent = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const deleted = await Event.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ success: false, message: "Event not found" });
  return res.json({ success: true, message: "Deleted" });
};
