import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { scoreProject } from "../services/recommendation.service";
import { generateEmbedding } from "../services/embeddingClient.service";
import {
  generateAndStoreProjectEmbedding,
  generateMissingProjectEmbeddings,
} from "../services/projectEmbedding.service";
import { generateAndStoreUserRecommendationEmbedding } from "../services/userEmbedding.service";

const MAX_RESULTS = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Enrich a list of lean project documents with their owner's name and avatar.
 * Mirrors the pattern used in project.controller.ts.
 */
const enrichWithOwner = async (projects: any[]): Promise<any[]> => {
  const ownerIds = [...new Set(projects.map((p) => p.ownerId).filter(Boolean))];

  const owners = ownerIds.length
    ? await User.find({ _id: { $in: ownerIds } }, "name profile.avatarUrl profile.headline").lean()
    : [];

  const ownerMap = new Map<string, any>(owners.map((o) => [o._id.toString(), o]));

  return projects.map((p) => {
    const owner = ownerMap.get(p.ownerId?.toString());
    const ownerName = owner?.name ?? "Project Owner";
    const avatar =
      owner?.profile?.avatarUrl ??
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}`;
    return {
      ...p,
      id: p._id?.toString() ?? p.id,
      owner: {
        id: p.ownerId,
        name: ownerName,
        avatar,
        title: owner?.profile?.headline ?? "Project Owner",
      },
    };
  });
};

/**
 * Shape a raw (enriched) project document into the fields expected by ProjectCard
 * on the frontend, plus optional recommendation metadata.
 */
const toCardShape = (
  p: any,
  extra?: {
    matchScore?: number;
    matchPercentage?: number;
    matchedSkills?: string[];
    matchedRoles?: string[];
    recommendationReasons?: string[];
  },
) => ({
  id: p.id ?? p._id?.toString(),
  title: p.title,
  summary: p.summary,
  problemStatement: p.problemStatement,
  domain: p.domain,
  difficulty: p.difficulty,
  status: p.status,
  technologies: p.technologies ?? [],
  tags: p.tags ?? [],
  postedAt: p.postedAt ?? p.createdAt ?? new Date().toISOString(),
  compensation: p.compensation,
  weeklyHours: p.weeklyHours,
  duration: p.duration,
  posterImage: p.posterImage,
  posterName: p.owner?.name ?? "Project Owner",
  posterAvatar: p.owner?.avatar,
  roles: (p.roles ?? []).map((r: any) => ({
    title: r.title,
    status: r.status,
    total: r.seats,
    filled: r.status === "Filled" ? r.seats : 0,
  })),
  ...(extra ?? {}),
});

// ── Controller ────────────────────────────────────────────────────────────────

export const getRecommendedProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Fetch all open projects, newest first (used as-is for guests, scored for members)
    const rawProjects = await Project.find({ status: "Open" })
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await enrichWithOwner(rawProjects);

    // ── Guest path ────────────────────────────────────────────────────────────
    if (!userId) {
      return res.json({
        success: true,
        data: {
          mode: "latest",
          title: "Latest Projects",
          subtitle: "Browse the most recently posted open projects",
          projects: enriched.slice(0, MAX_RESULTS).map((p) => toCardShape(p)),
        },
      });
    }

    // ── Authenticated path ────────────────────────────────────────────────────
    const user = await User.findById(userId, "profile").lean();
    const profile = user?.profile;

    // If profile is empty / missing meaningful signals, fall back to latest
    const hasSignals =
      (profile?.skills?.length ?? 0) > 0 ||
      (profile?.techStack?.length ?? 0) > 0 ||
      (profile?.expertiseSkills?.length ?? 0) > 0 ||
      (profile?.preferredRoles?.length ?? 0) > 0 ||
      (profile?.domainInterests?.length ?? 0) > 0;

    if (!profile || !hasSignals) {
      return res.json({
        success: true,
        data: {
          mode: "latest",
          title: "Latest Projects",
          subtitle: "Complete your profile to get personalised recommendations",
          projects: enriched.slice(0, MAX_RESULTS).map((p) => toCardShape(p)),
        },
      });
    }

    // Score every open project against the user's profile
    const allScored = enriched
      .map((p) => scoreProject(p, profile))
      .sort((a, b) => b.matchPercentage - a.matchPercentage || b.matchScore - a.matchScore);

    // Prefer projects with at least 1% match; fall back to all scored if none qualify
    const matched = allScored.filter((s) => s.matchPercentage > 0);
    const scored = (matched.length > 0 ? matched : allScored).slice(0, MAX_RESULTS);

    const projects = scored.map(({ project, matchScore, matchPercentage, matchedSkills, matchedRoles, recommendationReasons }) =>
      toCardShape(project, { matchScore, matchPercentage, matchedSkills, matchedRoles, recommendationReasons }),
    );

    return res.json({
      success: true,
      data: {
        mode: "personalized",
        title: "Recommended for you",
        subtitle: "Projects matched to your skills, interests, and preferred roles",
        projects,
      },
    });
  } catch (error) {
    console.error("[recommendations] Error generating recommendations:", error);
    return res.status(500).json({ success: false, message: "Failed to load recommendations" });
  }
};

// ── Development-only test endpoint ────────────────────────────────────────────

/**
 * POST /api/recommendations/test-embedding
 *
 * Verifies that the Node backend can successfully communicate with the Python
 * embedding service. Available in development only (NODE_ENV !== "production").
 *
 * Accepts: { "text": "..." }
 * Returns a confirmation object — never returns the raw embedding array.
 */
export const testEmbedding = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: "Request body must include a non-empty 'text' string.",
    });
  }

  try {
    const result = await generateEmbedding(text.trim());

    // Return only confirmation metadata — never the full embedding array
    return res.json({
      success: true,
      model: result.model,
      dimensions: result.dimensions,
      textLength: text.trim().length,
      embeddingGenerated: true,
    });
  } catch (error: any) {
    console.error("[test-embedding] Error:", error?.message ?? error);
    return res.status(502).json({
      success: false,
      message: error?.message ?? "Failed to generate embedding",
    });
  }
};

// ── Embedding generation endpoints (authenticated, admin/dev only) ─────────────

/**
 * POST /api/recommendations/projects/:projectId/generate-embedding
 *
 * Generate and store an embedding for a single project.
 * Requires authentication. Available in all environments (marked as admin use).
 *
 * Path param: projectId — MongoDB ObjectId string
 */
export const generateProjectEmbedding = async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;

  if (!projectId) {
    return res.status(400).json({ success: false, message: "projectId is required." });
  }

  try {
    const summary = await generateAndStoreProjectEmbedding(projectId);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    const msg: string = error?.message ?? "Failed to generate project embedding";
    console.error(`[generate-embedding] ${msg}`);

    if (msg.includes("Project not found")) {
      return res.status(404).json({ success: false, message: msg });
    }
    if (
      msg.toLowerCase().includes("unreachable") ||
      msg.toLowerCase().includes("timed out") ||
      msg.toLowerCase().includes("offline")
    ) {
      return res.status(502).json({ success: false, message: msg });
    }
    if (msg.toLowerCase().includes("dimensions")) {
      return res.status(422).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: msg });
  }
};

/**
 * POST /api/recommendations/projects/generate-missing-embeddings
 *
 * Batch-generate embeddings for all projects that do not yet have one.
 * Processes at most 10 projects per call, "Open" status first.
 * Per-project failures are recorded but do not abort the batch.
 * Requires authentication. Available in all environments (marked as admin use).
 */
export const generateMissingEmbeddings = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await generateMissingProjectEmbeddings();
    return res.json({ success: true, data: result });
  } catch (error: any) {
    const msg: string = error?.message ?? "Failed to run batch embedding generation";
    console.error(`[generate-missing-embeddings] ${msg}`);
    return res.status(500).json({ success: false, message: msg });
  }
};

// ── User embedding endpoints (authenticated) ───────────────────────────────────

/**
 * Shared error mapper for user embedding failures.
 */
function handleUserEmbeddingError(res: Response, error: any): Response {
  const msg: string = error?.message ?? "Failed to generate user embedding";
  console.error(`[user-embedding] ${msg}`);

  if (msg.includes("User not found")) {
    return res.status(404).json({ success: false, message: msg });
  }
  if (msg.includes("not contain enough recommendation data")) {
    return res.status(422).json({ success: false, message: msg });
  }
  if (
    msg.toLowerCase().includes("unreachable") ||
    msg.toLowerCase().includes("timed out") ||
    msg.toLowerCase().includes("offline")
  ) {
    return res.status(502).json({ success: false, message: msg });
  }
  if (msg.toLowerCase().includes("dimensions")) {
    return res.status(422).json({ success: false, message: msg });
  }
  return res.status(500).json({ success: false, message: msg });
}

/**
 * POST /api/recommendations/users/me/generate-embedding
 *
 * Generate and store a recommendation embedding for the currently
 * authenticated user. Requires a valid JWT (authenticate middleware).
 * Never returns the raw embedding array.
 */
export const generateMyUserEmbedding = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  try {
    const summary = await generateAndStoreUserRecommendationEmbedding(userId);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return handleUserEmbeddingError(res, error);
  }
};

/**
 * POST /api/recommendations/users/:userId/generate-embedding
 *
 * Generate and store a recommendation embedding for any user by id.
 * Requires authentication. Intended for admin / development use.
 * Never returns the raw embedding array.
 */
export const generateUserEmbeddingById = async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId as string;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required." });
  }

  try {
    const summary = await generateAndStoreUserRecommendationEmbedding(userId);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return handleUserEmbeddingError(res, error);
  }
};
