/**
 * smartSearch.service.ts
 *
 * AI-powered project search that combines:
 *   - Semantic similarity: query embedding vs stored project.recommendationEmbedding
 *   - Keyword scoring: lightweight token-overlap against all searchable fields
 *
 * Final score formula:
 *   finalSmartScore = round(semanticScore * 0.70 + keywordScore * 0.30)
 *
 * Calibration (same constants as the recommendation feature):
 *   cosine ≤ 0.35 → semanticScore = 0
 *   cosine ≥ 0.75 → semanticScore = 100
 *   otherwise:   semanticScore = clamp(round(((cosine - 0.35) / 0.40) * 100), 0, 100)
 *
 * Projects without stored embeddings receive semanticScore = 0 and are ranked
 * by keyword score only — they appear below projects with strong semantic matches
 * unless their keyword score is high.
 *
 * Embedding failures are caught; the service falls back to keyword-only scoring
 * for the entire batch and sets mode = "keyword-fallback".
 *
 * Raw embedding arrays are never returned to callers.
 */

import { EMBEDDING_DIMENSIONS } from "../config/embedding";
import { generateEmbedding } from "./embeddingClient.service";
import { cosineSimilarity } from "./recommendation.service";

// ── Calibration constants (must match recommendation.service.ts) ───────────────
const COSINE_MIN = 0.35;
const COSINE_MAX = 0.75;

// ── Relevance thresholds — a project must pass at least one ──────────────────
const FINAL_SCORE_THRESHOLD = 30;
const SEMANTIC_THRESHOLD    = 40;
const KEYWORD_THRESHOLD     = 25;

// ── Public types ──────────────────────────────────────────────────────────────

export type SmartSearchMode = "smart-search" | "keyword-fallback";

/**
 * Raw project data as fetched from MongoDB (lean).
 * We accept `any` for the recommendationEmbedding so callers can pass .lean() docs.
 */
export interface RawProjectDoc {
  _id: unknown;
  id?: string;
  title?: string;
  summary?: string;
  problemStatement?: string;
  domain?: string;
  difficulty?: string;
  status?: string;
  technologies?: string[];
  tags?: string[];
  createdAt?: Date | string;
  postedAt?: Date | string;
  compensation?: string;
  weeklyHours?: number;
  duration?: string;
  posterImage?: string;
  roles?: Array<{
    title?: string;
    status?: string;
    seats?: number;
    requiredSkills?: string[];
    niceToHaveSkills?: string[];
    level?: string;
  }>;
  /** Explicitly selected via .select("+recommendationEmbedding") — hidden by default */
  recommendationEmbedding?: number[];
  /** Injected after owner enrichment */
  owner?: {
    id?: unknown;
    name?: string;
    avatar?: string;
    title?: string;
    rating?: number;
  };
}

export interface SmartSearchScored {
  // ── Public card fields (same shape as listPublicProjects enriched response) ──
  /** String version of _id — mirrors listPublicProjects so the frontend can use p._id */
  _id: string;
  id: string;
  title: string;
  summary: string;
  problemStatement?: string;
  domain: string;
  difficulty: string;
  status: string;
  technologies: string[];
  tags: string[];
  postedAt: string;
  compensation?: string;
  weeklyHours?: number;
  duration?: string;
  posterImage?: string;
  posterName: string;
  posterAvatar?: string;
  roles: Array<{
    title: string;
    status?: string;
    total?: number;
    filled?: number;
  }>;
  /** 0–100 relevance score shown to the user */
  smartScore: number;
  /** Short user-friendly explanations of why this project was returned */
  searchReasons: string[];

  // ── Internal scoring (stripped before API response, exposed only in debug mode) ──
  _scoring?: {
    cosineSimilarity: number | null;
    semanticScore: number;
    keywordScore: number;
    finalSmartScore: number;
    hasProjectEmbedding: boolean;
    passedThreshold: boolean;
    thresholdReason: string;
  };
}

export interface SmartSearchResult {
  mode: SmartSearchMode;
  query: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  projects: SmartSearchScored[];
  /** Set when no projects pass the relevance threshold */
  message?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert raw cosine similarity to a 0–100 calibrated semantic score. */
function calibrateSemanticScore(cosine: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(((cosine - COSINE_MIN) / (COSINE_MAX - COSINE_MIN)) * 100)),
  );
}

/**
 * Tokenise a string into lowercase words for keyword matching.
 * Splits on non-alphanumeric characters, filters empty tokens.
 */
function tokenise(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9.#+]+/)
    .filter((t) => t.length > 0);
}

/**
 * Compute a keyword overlap score (0–100) between the query tokens and the
 * searchable text extracted from a project.
 *
 * Weighted by field importance:
 *   title              × 3.0
 *   domain             × 2.0
 *   technologies[]     × 2.0
 *   roles[].title      × 2.0
 *   roles[].required   × 1.5
 *   tags[]             × 1.5
 *   summary            × 1.0
 *   problemStatement   × 1.0
 *   roles[].niceToHave × 1.0
 *
 * Score = weighted hits / (queryTokens.length * maxWeightSum) — capped at 100.
 */
function computeKeywordScore(
  queryTokens: string[],
  project: RawProjectDoc,
): { score: number; matchedTokens: Set<string> } {
  if (queryTokens.length === 0) return { score: 0, matchedTokens: new Set() };

  type WeightedField = { tokens: string[]; weight: number };
  const fields: WeightedField[] = [
    { tokens: tokenise(project.title ?? ""),             weight: 3.0 },
    { tokens: tokenise(project.domain ?? ""),            weight: 2.0 },
    { tokens: (project.technologies ?? []).flatMap(tokenise), weight: 2.0 },
    { tokens: (project.roles ?? []).map((r) => r.title ?? "").flatMap(tokenise), weight: 2.0 },
    { tokens: (project.roles ?? []).flatMap((r) => (r.requiredSkills ?? []).flatMap(tokenise)), weight: 1.5 },
    { tokens: (project.tags ?? []).flatMap(tokenise),    weight: 1.5 },
    { tokens: tokenise(project.summary ?? ""),           weight: 1.0 },
    { tokens: tokenise(project.problemStatement ?? ""),  weight: 1.0 },
    { tokens: (project.roles ?? []).flatMap((r) => (r.niceToHaveSkills ?? []).flatMap(tokenise)), weight: 1.0 },
  ];

  // Build per-field token sets (no double-counting within a single field)
  const matchedTokens = new Set<string>();
  let weightedHits = 0;
  let maxPossible = 0;

  // Max possible is: each query token could hit in the highest-weight field
  const maxFieldWeight = Math.max(...fields.map((f) => f.weight));
  maxPossible = queryTokens.length * maxFieldWeight;

  for (const { tokens, weight } of fields) {
    const fieldSet = new Set(tokens);
    for (const qt of queryTokens) {
      // Exact token match or prefix match (e.g. "react" matches "reactjs")
      if (fieldSet.has(qt) || [...fieldSet].some((t) => t.startsWith(qt) && qt.length >= 3)) {
        weightedHits += weight;
        matchedTokens.add(qt);
      }
    }
  }

  const rawScore = maxPossible > 0 ? (weightedHits / maxPossible) * 100 : 0;
  return { score: Math.min(100, Math.round(rawScore)), matchedTokens };
}

/**
 * Build short user-facing reasons explaining the relevance of a project.
 */
function buildSearchReasons(
  project: RawProjectDoc,
  matchedTokens: Set<string>,
  semanticScore: number,
): string[] {
  const reasons: string[] = [];

  // Domain match
  if (project.domain) {
    const domainTokens = tokenise(project.domain);
    if (domainTokens.some((t) => matchedTokens.has(t))) {
      reasons.push(`Matches ${project.domain} domain`);
    }
  }

  // Technology matches (up to 2)
  const techMatches = (project.technologies ?? []).filter((tech) =>
    tokenise(tech).some((t) => matchedTokens.has(t)),
  );
  if (techMatches.length > 0) {
    reasons.push(`Matches ${techMatches.slice(0, 2).join(" and ")} technology`);
  }

  // Role matches
  const roleMatches = (project.roles ?? [])
    .map((r) => r.title ?? "")
    .filter((title) => title && tokenise(title).some((t) => matchedTokens.has(t)));
  if (roleMatches.length > 0) {
    reasons.push(`Matches ${roleMatches.slice(0, 2).join(" and ")} role`);
  }

  // Semantic fallback reason
  if (semanticScore >= 60 && reasons.length < 2) {
    reasons.push("Semantically related to your search");
  }

  // Generic fallback
  if (reasons.length === 0) {
    reasons.push("Relevant to your search query");
  }

  return reasons;
}

/**
 * Shape a RawProjectDoc into the SmartSearchScored output format.
 * Never exposes raw embedding arrays.
 */
function shapeProject(
  project: RawProjectDoc,
  semanticScore: number,
  cosineSim: number | null,
  keywordScore: number,
  matchedTokens: Set<string>,
  finalSmartScore: number,
): SmartSearchScored {
  const hasProjectEmbedding = Array.isArray(project.recommendationEmbedding) &&
    project.recommendationEmbedding.length === EMBEDDING_DIMENSIONS;

  // project.id is set as a string by enrichProjectsWithOwner (primary, reliable).
  // String(project._id) is the ObjectId hex string (fallback).
  // This guarantees a non-empty string ID regardless of the _id unknown type.
  const id: string = (project.id as string) || String(project._id) || "";

  const thresholdReason =
    finalSmartScore >= FINAL_SCORE_THRESHOLD
      ? `finalSmartScore=${finalSmartScore} >= ${FINAL_SCORE_THRESHOLD}`
      : semanticScore >= SEMANTIC_THRESHOLD
        ? `semanticScore=${semanticScore} >= ${SEMANTIC_THRESHOLD}`
        : `keywordScore=${keywordScore} >= ${KEYWORD_THRESHOLD}`;

  return {
    id,
    _id: id,   // same string as id — lets the frontend use p._id exactly like listPublicProjects
    title: project.title ?? "",
    summary: project.summary ?? "",
    problemStatement: project.problemStatement,
    domain: project.domain ?? "",
    difficulty: project.difficulty ?? "",
    status: project.status ?? "",
    technologies: project.technologies ?? [],
    tags: project.tags ?? [],
    postedAt: (() => {
      const d = (project.postedAt ?? project.createdAt);
      return d ? new Date(d).toISOString() : new Date().toISOString();
    })(),
    compensation: project.compensation,
    weeklyHours: project.weeklyHours,
    duration: project.duration,
    posterImage: project.posterImage,
    posterName: project.owner?.name ?? "Project Owner",
    posterAvatar: project.owner?.avatar,
    roles: (project.roles ?? []).map((r) => ({
      title: r.title ?? "",
      status: r.status,
      total: r.seats,    // raw lean doc still has `seats` — already pre-enrichment
      filled: r.status === "Filled" ? r.seats : 0,
    })),
    smartScore: finalSmartScore,
    searchReasons: buildSearchReasons(project, matchedTokens, semanticScore),
    _scoring: {
      cosineSimilarity: cosineSim,
      semanticScore,
      keywordScore,
      finalSmartScore,
      hasProjectEmbedding,
      passedThreshold: true,
      thresholdReason,
    },
  };
}

// ── Sort helper ────────────────────────────────────────────────────────────────

function sortProjects(projects: SmartSearchScored[], sortBy?: string): SmartSearchScored[] {
  const sorted = [...projects];
  if (!sortBy || sortBy === "Most Relevant") {
    // Primary: finalSmartScore DESC; secondary: smartScore ties broken by createdAt
    sorted.sort((a, b) => (b._scoring!.finalSmartScore - a._scoring!.finalSmartScore));
  } else if (sortBy === "Newest") {
    sorted.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  } else if (sortBy === "Oldest") {
    sorted.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
  } else {
    // "Top Rated" or any unknown → fall back to score DESC
    sorted.sort((a, b) => (b._scoring!.finalSmartScore - a._scoring!.finalSmartScore));
  }
  return sorted;
}

// ── Main export ────────────────────────────────────────────────────────────────

export interface SmartSearchOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

/**
 * Score an array of enriched project documents against a search query.
 *
 * @param query     The user's natural-language search query
 * @param projects  Lean project documents (must include +recommendationEmbedding if available)
 * @param opts      Pagination / sort options
 *
 * @returns SmartSearchResult — raw embedding arrays are stripped from all projects
 */
export async function smartSearchProjects(
  query: string,
  projects: RawProjectDoc[],
  opts: SmartSearchOptions = {},
): Promise<SmartSearchResult> {
  const page = Math.max(opts.page ?? 1, 1);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 9, 1), 50);
  const sortBy = opts.sortBy;

  const queryTokens = tokenise(query);
  let mode: SmartSearchMode = "smart-search";
  let queryEmbedding: number[] | null = null;

  // ── Try to generate query embedding ─────────────────────────────────────────
  try {
    const result = await generateEmbedding(query);
    queryEmbedding = result.embedding;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[smartSearch] Embedding service unavailable — falling back to keyword search. Reason: ${message}`);
    mode = "keyword-fallback";
  }

  // ── Intermediate scoring ─────────────────────────────────────────────────────
  interface ScoredIntermediate {
    project: RawProjectDoc;
    keywordScore: number;
    matchedTokens: Set<string>;
    semanticScore: number;
    cosineSim: number | null;
    finalSmartScore: number;
  }

  const allScored: ScoredIntermediate[] = projects.map((project) => {
    const { score: keywordScore, matchedTokens } = computeKeywordScore(queryTokens, project);

    let semanticScore = 0;
    let cosineSim: number | null = null;

    if (
      queryEmbedding !== null &&
      Array.isArray(project.recommendationEmbedding) &&
      project.recommendationEmbedding.length === EMBEDDING_DIMENSIONS
    ) {
      cosineSim = cosineSimilarity(queryEmbedding, project.recommendationEmbedding);
      if (cosineSim !== null) {
        semanticScore = calibrateSemanticScore(cosineSim);
      }
    }

    const finalSmartScore = Math.round(semanticScore * 0.7 + keywordScore * 0.3);
    return { project, keywordScore, matchedTokens, semanticScore, cosineSim, finalSmartScore };
  });

  // ── Filter by relevance threshold ────────────────────────────────────────────
  // A project passes if at least one condition holds:
  //   finalSmartScore >= 30  |  semanticScore >= 40  |  keywordScore >= 25
  // In keyword-fallback mode, additionally require at least one keyword match.
  const passing = allScored.filter(({ keywordScore, semanticScore, finalSmartScore, matchedTokens }) => {
    const meetsThreshold =
      finalSmartScore >= FINAL_SCORE_THRESHOLD ||
      semanticScore   >= SEMANTIC_THRESHOLD    ||
      keywordScore    >= KEYWORD_THRESHOLD;
    if (mode === "keyword-fallback") {
      return meetsThreshold && matchedTokens.size > 0;
    }
    return meetsThreshold;
  });

  // ── No results — return clean empty payload ──────────────────────────────────
  if (passing.length === 0) {
    return {
      mode,
      query,
      page,
      pageSize,
      total: 0,
      totalPages: 0,
      projects: [],
      message: "No relevant projects found for this search.",
    };
  }

  // ── Shape passing projects ───────────────────────────────────────────────────
  const scored: SmartSearchScored[] = passing.map(
    ({ project, keywordScore, matchedTokens, semanticScore, cosineSim, finalSmartScore }) =>
      shapeProject(project, semanticScore, cosineSim, keywordScore, matchedTokens, finalSmartScore),
  );

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const sortedAll = sortProjects(scored, sortBy);

  // ── Total is based on filtered (passing) results, not all candidates ─────────
  const total = scored.length;
  const totalPages = Math.ceil(total / pageSize);

  // ── Paginate ─────────────────────────────────────────────────────────────────
  const paginated = sortedAll.slice((page - 1) * pageSize, page * pageSize);

  return { mode, query, page, pageSize, total, totalPages, projects: paginated };
}
