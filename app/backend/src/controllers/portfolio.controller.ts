import { Request, Response } from "express";
import { IPortfolioItem, PortfolioItem } from "../models/portfolio.model";

const normalizeLinks = (links: unknown): { label?: string; url: string }[] => {
  if (!Array.isArray(links)) return [];
  return links
    .map((link: any) => ({
      label: typeof link?.label === "string" ? link.label.trim() : undefined,
      url: typeof link?.url === "string" ? link.url.trim() : "",
    }))
    .filter((l) => !!l.url);
};

const sanitizeInput = (payload: any, applyDefaults = false) => {
  const sanitized: any = {};

  if (typeof payload?.title === "string") sanitized.title = payload.title.trim();
  if (typeof payload?.role === "string") sanitized.role = payload.role.trim();
  if (typeof payload?.summary === "string") sanitized.summary = payload.summary.trim();
  if (typeof payload?.problem === "string") sanitized.problem = payload.problem.trim();
  if (typeof payload?.solution === "string") sanitized.solution = payload.solution.trim();
  if (typeof payload?.responsibilities === "string") sanitized.responsibilities = payload.responsibilities.trim();
  if (typeof payload?.outcomes === "string") sanitized.outcomes = payload.outcomes.trim();

  if (Array.isArray(payload?.techStack)) {
    sanitized.techStack = payload.techStack.map((t: any) => (typeof t === "string" ? t.trim() : "")).filter(Boolean);
  } else if (applyDefaults) {
    sanitized.techStack = [];
  }

  if (Array.isArray(payload?.links)) {
    sanitized.links = normalizeLinks(payload.links);
  } else if (applyDefaults) {
    sanitized.links = [];
  }

  if (Array.isArray(payload?.collaborators)) {
    sanitized.collaborators = payload.collaborators.map((c: any) => (typeof c === "string" ? c.trim() : "")).filter(Boolean);
  } else if (applyDefaults) {
    sanitized.collaborators = [];
  }

  if (Array.isArray(payload?.screenshots)) {
    sanitized.screenshots = payload.screenshots.map((s: any) => (typeof s === "string" ? s : "")).filter(Boolean);
  } else if (applyDefaults) {
    sanitized.screenshots = [];
  }

  if (typeof payload?.coverImage === "string") sanitized.coverImage = payload.coverImage;
  if (typeof payload?.specialNotes === "string") sanitized.specialNotes = payload.specialNotes.trim();
  if (typeof payload?.isPublished === "boolean") sanitized.isPublished = payload.isPublished;
  else if (applyDefaults) sanitized.isPublished = true;

  return sanitized;
};

const serializePortfolio = (item: IPortfolioItem | (IPortfolioItem & { _id?: any }) | any) => ({
  id: item?._id?.toString?.() || item?.id,
  userId: item?.userId?.toString?.() || item?.userId,
  title: item?.title || "",
  role: item?.role || "",
  summary: item?.summary || "",
  problem: item?.problem || "",
  solution: item?.solution || "",
  responsibilities: item?.responsibilities || "",
  outcomes: item?.outcomes || "",
  techStack: Array.isArray(item?.techStack) ? item.techStack : [],
  links: normalizeLinks(item?.links),
  collaborators: Array.isArray(item?.collaborators) ? item.collaborators : [],
  screenshots: Array.isArray(item?.screenshots) ? item.screenshots : [],
  coverImage: item?.coverImage || "",
  specialNotes: item?.specialNotes || "",
  isPublished: typeof item?.isPublished === "boolean" ? item.isPublished : false,
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
});

export const listPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const items = await PortfolioItem.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: { items: items.map(serializePortfolio) } });
  } catch (error) {
    console.error("listPortfolio failed", error);
    return res.status(500).json({ success: false, message: "Failed to load portfolio" });
  }
};

export const getPortfolioById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const item = await PortfolioItem.findById(id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Portfolio item not found" });
    if (item.userId?.toString?.() !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: { item: serializePortfolio(item) } });
  } catch (error) {
    console.error("getPortfolioById failed", error);
    return res.status(500).json({ success: false, message: "Failed to load portfolio item" });
  }
};

export const getPublicPortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await PortfolioItem.findById(id).lean();
    if (!item || !item.isPublished) {
      return res.status(404).json({ success: false, message: "Portfolio item not found" });
    }
    return res.json({ success: true, data: { item: serializePortfolio(item) } });
  } catch (error) {
    console.error("getPublicPortfolio failed", error);
    return res.status(500).json({ success: false, message: "Failed to load portfolio item" });
  }
};

export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const payload = sanitizeInput(req.body || {}, true);
    if (!payload.title) return res.status(400).json({ success: false, message: "Title is required" });

    const item = await PortfolioItem.create({ ...payload, userId });
    return res.status(201).json({ success: true, data: { item: serializePortfolio(item) } });
  } catch (error) {
    console.error("createPortfolio failed", error);
    return res.status(500).json({ success: false, message: "Failed to create portfolio" });
  }
};

export const updatePortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const existing = await PortfolioItem.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Portfolio item not found" });
    if (existing.userId?.toString?.() !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const payload = sanitizeInput(req.body || {});
    if (payload.title === "") {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    Object.assign(existing, payload);
    await existing.save();

    return res.json({ success: true, data: { item: serializePortfolio(existing) } });
  } catch (error) {
    console.error("updatePortfolio failed", error);
    return res.status(500).json({ success: false, message: "Failed to update portfolio" });
  }
};

export const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const deleted = await PortfolioItem.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Portfolio item not found" });

    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("deletePortfolio failed", error);
    return res.status(500).json({ success: false, message: "Failed to delete portfolio" });
  }
};
