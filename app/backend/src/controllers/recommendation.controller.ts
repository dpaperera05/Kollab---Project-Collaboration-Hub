import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { scoreProjectHybrid } from "../services/recommendation.service";
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
 * on the frontend. Only user-facing fields are included.
 */
const toCardShape = (
  p: any,
  rec?: {
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
  ...(rec ?? {}),
});

/** Extra fields attached only when ?debug=true and NODE_ENV !== "production". */
interface DebugFields {
  _debug: {
    matchScore: number;
    ruleBasedPercentage: number;
    semanticPercentage: number | undefined;
    cosineSimilarity: number | undefined;
    hasUserEmbedding: boolean;
    hasProjectEmbedding: boolean;
  };
}

// ── Controller ────────────────────────────────────────────────────────────────

export const getRecommendedProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Fetch all open projects, including their embeddings for hybrid scoring.
    // recommendationEmbedding has select:false on a top-level schema field so
    // the + prefix override works correctly here (unlike the nested user profile).
    const rawProjects = await Project.find({ status: "Open" })
      .select("+recommendationEmbedding")
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

    // ── Fetch user embedding via raw driver ───────────────────────────────────
    // profile.recommendationEmbedding has select:false on a nested sub-schema.
    // The Mongoose + prefix override does not propagate through nested schemas,
    // so we go directly to the MongoDB driver to read it.
    let userEmbedding: number[] | null = null;
    try {
      const rawUser = await User.collection.findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { "profile.recommendationEmbedding": 1 } },
      );
      const candidate = (rawUser as any)?.profile?.recommendationEmbedding;
      if (Array.isArray(candidate) && candidate.length > 0) {
        userEmbedding = candidate as number[];
      }
    } catch {
      // Embedding fetch failure must not block recommendations
      userEmbedding = null;
    }

    // ── Hybrid scoring ────────────────────────────────────────────────────────
    // scoreProjectHybrid falls back to rule-based when either embedding is absent.
    // enriched projects keep all lean() fields including recommendationEmbedding
    // because we fetched with +recommendationEmbedding above.
    const isDebug =
      process.env.NODE_ENV !== "production" && req.query.debug === "true";

    const allScored = enriched
      .map((p) => {
        const projectEmbed = (p as any).recommendationEmbedding as number[] | undefined;
        return scoreProjectHybrid(p, profile, userEmbedding, projectEmbed);
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage || b.matchScore - a.matchScore);

    // Prefer projects with at least 1% match; fall back to all scored if none qualify
    const matched = allScored.filter((s) => s.matchPercentage > 0);
    const scored = (matched.length > 0 ? matched : allScored).slice(0, MAX_RESULTS);

    const projects = scored.map(({ project, matchScore, matchPercentage, ruleBasedPercentage, semanticPercentage, rawCosineSimilarity, matchedSkills, matchedRoles, recommendationReasons }) => {
      const card = toCardShape(project, {
        matchPercentage,
        matchedSkills,
        matchedRoles,
        recommendationReasons,
      });

      if (!isDebug) return card;

      const projectEmbed = (project as any).recommendationEmbedding;
      const debugFields: DebugFields = {
        _debug: {
          matchScore,
          ruleBasedPercentage,
          semanticPercentage,
          cosineSimilarity: rawCosineSimilarity !== undefined
            ? Math.round(rawCosineSimilarity * 1000) / 1000
            : undefined,
          hasUserEmbedding: userEmbedding !== null,
          hasProjectEmbedding: Array.isArray(projectEmbed) && projectEmbed.length > 0,
        },
      };
      return { ...card, ...debugFields };
    });

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

/**
 * GET /api/recommendations/projects/debug-quality
 *
 * Development-only: structured scoring breakdown for the logged-in user.
 * Shows profile signals, embedding status, and per-project hybrid scoring
 * detail so recommendation quality can be validated without changing the
 * main endpoint.
 *
 * - Disabled in production (returns 404).
 * - Requires authentication.
 * - Never returns raw embedding arrays.
 */
export const getRecommendationDebugQuality = async (req: AuthRequest, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  try {
    const userId = req.userId!;

    // ── Load user profile signals ─────────────────────────────────────────────
    const user = await User.findById(userId, "profile").lean();
    const profile = user?.profile;

    const profileSignals = {
      skills: profile?.skills ?? [],
      preferredRoles: profile?.preferredRoles ?? [],
      domainInterests: profile?.domainInterests ?? [],
      techStack: profile?.techStack ?? [],
      expertiseSkills: profile?.expertiseSkills ?? [],
    };

    const hasSignals = Object.values(profileSignals).some((arr) => arr.length > 0);

    // ── Load user embedding via raw driver ────────────────────────────────────
    let userEmbedding: number[] | null = null;
    try {
      const rawUser = await User.collection.findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { "profile.recommendationEmbedding": 1 } },
      );
      const candidate = (rawUser as any)?.profile?.recommendationEmbedding;
      if (Array.isArray(candidate) && candidate.length > 0) {
        userEmbedding = candidate as number[];
      }
    } catch {
      userEmbedding = null;
    }

    // ── Load all open projects with embeddings ────────────────────────────────
    const rawProjects = await Project.find({ status: "Open" })
      .select("+recommendationEmbedding")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await enrichWithOwner(rawProjects);

    const totalOpenProjects = enriched.length;
    const projectsWithEmbeddings = enriched.filter(
      (p) => Array.isArray((p as any).recommendationEmbedding) && (p as any).recommendationEmbedding.length > 0,
    ).length;
    const projectsWithoutEmbeddings = totalOpenProjects - projectsWithEmbeddings;

    // ── Score every project ───────────────────────────────────────────────────
    const scored = enriched
      .map((p) => {
        const projectEmbed = (p as any).recommendationEmbedding as number[] | undefined;
        const result = hasSignals && profile
          ? scoreProjectHybrid(p, profile, userEmbedding, projectEmbed)
          : null;

        const hasProjectEmbedding = Array.isArray(projectEmbed) && projectEmbed.length > 0;

        // Determine which scoring path was taken
        const scoringMode =
          result && userEmbedding && hasProjectEmbedding
            ? "hybrid"
            : result
              ? "rule-based"
              : "no-profile";

        return {
          projectId: (p as any)._id?.toString() ?? (p as any).id,
          title: p.title as string,
          domain: p.domain as string,
          technologies: (p.technologies ?? []) as string[],
          roles: ((p.roles ?? []) as any[]).map((r: any) => r.title as string),
          // Full skill signals including from roles — helps trace why a skill matched
          projectSkillSignals: {
            technologies: (p.technologies ?? []) as string[],
            roleRequiredSkills: ((p.roles ?? []) as any[]).flatMap((r: any) => r.requiredSkills ?? []) as string[],
            roleNiceToHaveSkills: ((p.roles ?? []) as any[]).flatMap((r: any) => r.niceToHaveSkills ?? []) as string[],
          },
          matchPercentage: result?.matchPercentage ?? 0,
          semanticPercentage: result?.semanticPercentage ?? null,
          cosineSimilarity: result?.rawCosineSimilarity !== undefined
            ? Math.round(result.rawCosineSimilarity * 1000) / 1000
            : null,
          ruleBasedPercentage: result?.ruleBasedPercentage ?? 0,
          matchedSkills: result?.matchedSkills ?? [],
          matchedRoles: result?.matchedRoles ?? [],
          recommendationReasons: result?.recommendationReasons ?? [],
          hasProjectEmbedding,
          scoringMode,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({
      success: true,
      data: {
        userId,
        profileSignals,
        hasUserEmbedding: userEmbedding !== null,
        totalOpenProjects,
        projectsWithEmbeddings,
        projectsWithoutEmbeddings,
        scoredProjects: scored,
      },
    });
  } catch (error) {
    console.error("[debug-quality] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate debug quality report" });
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
