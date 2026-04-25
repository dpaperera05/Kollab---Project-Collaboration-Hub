import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { scoreProject } from "../services/recommendation.service";
import { generateEmbedding } from "../services/embeddingClient.service";

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
