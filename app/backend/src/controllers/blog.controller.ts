import { Request, Response } from "express";
import { SortOrder } from "mongoose";
import { Blog } from "../models/blog.model";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ensureString = (val: unknown): string | undefined => (typeof val === "string" && val.trim() ? val.trim() : undefined);

const sanitizeTags = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean)
    .slice(0, 20);
};

const mapBlogResponse = (blog: any) => {
  const authorDoc = (blog as any).userId as any;
  const authorName = authorDoc?.profile?.name || authorDoc?.name || "Kollab member";
  const authorType = authorDoc?.userType === "mentor" ? "mentor" : "member";
  const authorId = authorDoc?._id?.toString?.() || (typeof blog.userId === "string" ? blog.userId : "");

  return {
    id: blog._id?.toString?.() ?? String(blog.id ?? ""),
    title: blog.title,
    excerpt: blog.excerpt || "",
    coverImage: blog.coverImage,
    tags: blog.tags || [],
    author: {
      id: authorId,
      name: authorName,
      type: authorType,
    },
    publishedAt: blog.createdAt,
    viewCount: blog.viewCount ?? 0,
    content: blog.content,
  };
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

  const key = `blogs/${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
  await cfg.client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

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

const getSort = (sortBy?: string): Record<string, SortOrder> => {
  if (sortBy === "Oldest") return { createdAt: 1 };
  if (sortBy === "Popular") return { viewCount: -1, createdAt: -1 };
  return { createdAt: -1 };
};

export const listBlogs = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const blogs = await Blog.find({ userId })
    .sort({ createdAt: -1 })
    .populate({ path: "userId", select: "name userType profile" })
    .lean();

  return res.json({ success: true, data: { blogs: blogs.map(mapBlogResponse) } });
};

export const publicListBlogs = async (req: Request, res: Response) => {
  const { tags, sortBy, page = "1", pageSize = "6" } = req.query;

  const parsedPage = Math.max(parseInt(String(page), 10) || 1, 1);
  const parsedPageSize = Math.min(Math.max(parseInt(String(pageSize), 10) || 6, 1), 50);
  const tagFilters = typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const sort = getSort(typeof sortBy === "string" ? sortBy : "Newest");

  const query: Record<string, any> = {};
  if (tagFilters.length) query.tags = { $in: tagFilters };

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .sort(sort)
    .skip((parsedPage - 1) * parsedPageSize)
    .limit(parsedPageSize)
    .populate({ path: "userId", select: "name userType profile" })
    .lean();

  return res.json({
    success: true,
    data: {
      blogs: blogs.map(mapBlogResponse),
      total,
      page: parsedPage,
      pageSize: parsedPageSize,
    },
  });
};

export const createBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { title, coverImage, excerpt, content, tags } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!title) return res.status(400).json({ success: false, message: "Title is required" });
  const cleanedTags = sanitizeTags(tags);
  let cover: { coverUrl: string; key?: string } | null = null;
  try {
    if (typeof coverImage === "string" && coverImage.startsWith("data:")) {
      cover = await uploadCoverToR2(coverImage);
    }
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || "Cover upload failed" });
  }

  const blog = await Blog.create({
    userId,
    title: String(title).trim(),
    coverImage: cover?.coverUrl || ensureString(coverImage),
    coverKey: cover?.key,
    excerpt: ensureString(excerpt),
    content: ensureString(content),
    tags: cleanedTags,
    viewCount: 0,
  });
  const populated = await blog.populate({ path: "userId", select: "name userType profile" });
  return res.status(201).json({ success: true, data: { blog: mapBlogResponse(populated) } });
};

export const updateBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const blog = await Blog.findOne({ _id: id, userId });
  if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
  if (req.body.title === "") return res.status(400).json({ success: false, message: "Title is required" });
  if (typeof req.body.coverImage === "string" && req.body.coverImage.startsWith("data:")) {
    try {
      const uploaded = await uploadCoverToR2(req.body.coverImage);
      if (blog.coverKey) void deleteR2Object(blog.coverKey);
      blog.coverImage = uploaded.coverUrl;
      blog.coverKey = uploaded.key;
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err?.message || "Cover upload failed" });
    }
    delete req.body.coverImage;
  }

  const updates: Record<string, any> = { ...req.body };
  if (Object.prototype.hasOwnProperty.call(updates, "tags")) updates.tags = sanitizeTags(updates.tags);
  if (updates.excerpt !== undefined) updates.excerpt = ensureString(updates.excerpt);
  if (updates.content !== undefined) updates.content = ensureString(updates.content);

  Object.assign(blog, updates || {});
  await blog.save();
  const populated = await blog.populate({ path: "userId", select: "name userType profile" });
  return res.json({ success: true, data: { blog: mapBlogResponse(populated) } });
};

export const getBlogByIdPublic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndUpdate(
    id,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate({ path: "userId", select: "name userType profile" })
    .lean();

  if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

  return res.json({ success: true, data: { blog: mapBlogResponse(blog) } });
};

export const deleteBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const deleted = await Blog.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ success: false, message: "Blog not found" });
  if (deleted.coverKey) void deleteR2Object(deleted.coverKey);
  return res.json({ success: true, message: "Deleted" });
};
