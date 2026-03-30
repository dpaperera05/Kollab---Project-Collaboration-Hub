import { Request, Response } from "express";
import { Event } from "../models/event.model";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { recordActivity } from "../services/activity.service";

const ensureStringArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return (val as unknown[])
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
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

const uploadCoverToR2 = async (base64: string) => {
  const cfg = getR2Config();
  if (!cfg) throw new Error("R2 not configured");

  const match = base64.match(/^data:(.+);base64,(.+)$/);
  const base64Data = match ? match[2] : base64;
  const contentType = match?.[1] || "image/png";

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > 8 * 1024 * 1024) {
    throw new Error("Image too large (max 8MB)");
  }

  const key = `events/${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
  await cfg.client.send(new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  const coverUrl = cfg.publicBase
    ? `${cfg.publicBase.replace(/\/$/, "")}/${key}`
    : `https://${cfg.bucket}.r2.cloudflarestorage.com/${key}`;

  return { coverUrl, key } as const;
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

const buildDateFilter = (dateRange?: string) => {
  if (!dateRange || dateRange === "All") return undefined;
  const now = new Date();
  const target = new Date();
  if (dateRange === "This week") {
    target.setDate(now.getDate() + 7);
  } else if (dateRange === "This month") {
    target.setDate(now.getDate() + 31);
  } else {
    return undefined;
  }
  return { $gte: now.toISOString(), $lte: target.toISOString() };
};

export const listPublicEvents = async (req: Request, res: Response) => {
  const { type, location, tags, sortBy, dateRange } = req.query;

  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "6"), 10) || 6, 1), 50);

  const filter: Record<string, any> = {};
  if (typeof type === "string" && type !== "All" && type.trim()) filter.type = type.trim();
  if (typeof location === "string" && location !== "All" && location.trim()) filter.locationType = location.trim();

  if (typeof tags === "string" && tags.trim()) {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }

  const dateFilter = buildDateFilter(typeof dateRange === "string" ? dateRange : undefined);
  if (dateFilter) filter.dateTime = dateFilter;

  const sort: Record<string, 1 | -1> = {};
  if (sortBy === "Newest") {
    sort.createdAt = -1;
  } else if (sortBy === "Furthest") {
    sort.dateTime = -1;
  } else {
    sort.dateTime = 1; // Soonest default
  }

  const total = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return res.json({ success: true, data: { events, total, page, pageSize } });
};

export const listEvents = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const events = await Event.find({ userId }).sort({ dateTime: 1 });
  return res.json({ success: true, data: { events } });
};

export const createEvent = async (req: Request, res: Response) => {
  const userId = req.userId;
  const {
    title,
    coverImage,
    type,
    dateTime,
    endDateTime,
    timezone,
    locationType,
    city,
    virtualPlatform,
    tags,
    externalLink,
    description,
    featured,
    organizer,
    prize,
    participantCount,
    notes,
  } = req.body || {};

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!title || !type || !dateTime || !locationType || !externalLink || !coverImage) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  let cover: { coverUrl: string; key?: string } | null = null;
  try {
    if (typeof coverImage === "string" && coverImage.startsWith("data:")) {
      cover = await uploadCoverToR2(coverImage);
    }
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || "Cover upload failed" });
  }

  const event = await Event.create({
    userId,
    title: String(title).trim(),
    coverImage: cover?.coverUrl || (typeof coverImage === "string" ? coverImage.trim() : undefined),
    coverKey: cover?.key,
    type: String(type).trim(),
    dateTime: String(dateTime).trim(),
    endDateTime: endDateTime ? String(endDateTime).trim() : undefined,
    timezone: timezone ? String(timezone).trim() : undefined,
    locationType: String(locationType).trim(),
    city: city ? String(city).trim() : undefined,
    virtualPlatform: virtualPlatform ? String(virtualPlatform).trim() : undefined,
    tags: ensureStringArray(tags),
    externalLink: externalLink ? String(externalLink).trim() : undefined,
    description: description ? String(description).trim() : undefined,
    featured: Boolean(featured),
    organizer: organizer ? String(organizer).trim() : undefined,
    prize: prize ? String(prize).trim() : undefined,
    participantCount: participantCount != null ? Number(participantCount) : undefined,
    notes: notes ? String(notes).trim() : undefined,
  });
  void recordActivity({
    userId,
    type: "event_created",
    eventId: event._id.toString(),
    eventTitle: event.title,
    description: `Created an event: ${event.title}`,
  });
  return res.status(201).json({ success: true, data: { event } });
};

export const updateEvent = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const event = await Event.findOne({ _id: id, userId });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });

  if (req.body.title === "") return res.status(400).json({ success: false, message: "Title is required" });

  if (typeof req.body.coverImage === "string" && req.body.coverImage.startsWith("data:")) {
    try {
      const uploaded = await uploadCoverToR2(req.body.coverImage);
      if (event.coverKey) void deleteR2Object(event.coverKey);
      event.coverImage = uploaded.coverUrl;
      event.coverKey = uploaded.key;
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err?.message || "Cover upload failed" });
    }
    delete req.body.coverImage;
  }

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
  if (deleted.coverKey) void deleteR2Object(deleted.coverKey);
  return res.json({ success: true, message: "Deleted" });
};
