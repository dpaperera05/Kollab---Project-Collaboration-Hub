/**
 * mentorSmartSearch.service.ts
 *
 * AI-powered mentor search combining:
 *   - Semantic similarity: query embedding vs stored profile.recommendationEmbedding
 *   - Keyword scoring: weighted token-overlap against all searchable mentor fields
 *
 * Final score formula:
 *   finalSmartScore = round(semanticScore * 0.70 + keywordScore * 0.30)
 *
 * Calibration (same constants as smartSearch.service.ts / recommendation.service.ts):
 *   cosine ≤ 0.35 → semanticScore = 0
 *   cosine ≥ 0.75 → semanticScore = 100
 *   otherwise:   semanticScore = clamp(round(((cosine - 0.35) / 0.40) * 100), 0, 100)
 *
 * Mentors without stored embeddings receive semanticScore = 0 and are ranked
 * by keyword score only.
 *
 * Embedding failures are caught; the service falls back to keyword-only scoring
 * and sets mode = "keyword-fallback".
 *
 * Raw embedding arrays are never returned to callers.
 */

import { EMBEDDING_DIMENSIONS } from "../config/embedding";
import { generateEmbedding } from "./embeddingClient.service";
import { cosineSimilarity } from "./recommendation.service";

// ── Calibration constants (must match recommendation.service.ts) ───────────────
const COSINE_MIN = 0.35;
const COSINE_MAX = 0.75;

// ── Relevance thresholds — a mentor must pass at least one ────────────────────
const FINAL_SCORE_THRESHOLD = 30;
const SEMANTIC_THRESHOLD    = 40;
const KEYWORD_THRESHOLD     = 25;

// ── Public types ──────────────────────────────────────────────────────────────

export type MentorSmartSearchMode = "smart-search" | "keyword-fallback";

/**
 * Raw mentor (User) data as fetched from MongoDB (lean).
 * profile.recommendationEmbedding must be explicitly selected with
 *   .select("+profile.recommendationEmbedding")
 * because it has select:false in the embedded profileSchema.
 */
export interface RawMentorDoc {
  _id: unknown;
  /** Lean docs may expose id as a string getter; we handle both */
  id?: string;
  name?: string;
  email?: string;
  userType?: string;
  isEmailVerified?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: string;
  isProfilePublic?: boolean;
  createdAt?: Date | string;
  profile?: {
    name?: string;
    bio?: string;
    timezone?: string;
    location?: string;
    avatarUrl?: string;
    avatarKey?: string;
    preferredRoles?: string[];
    skills?: string[];
    techStack?: string[];
    expertiseSkills?: string[];
    headline?: string;
    languages?: string[];
    rateType?: "free" | "paid";
    rateNote?: string;
    links?: { github?: string; linkedin?: string; portfolio?: string };
    availabilityHoursPerWeek?: number;
    domainInterests?: string[];
    availabilitySlots?: Array<{
      date: string;
      startTime: string;
      endTime: string;
      timezone?: string;
      note?: string;
    }>;
    /** Explicitly selected — hidden by default */
    recommendationEmbedding?: number[];
  };
}

/**
 * Public mentor shape returned by the smart search endpoint.
 * Mirrors the toUserResponse() output shape so the existing frontend
 * mentor mapper can consume it without changes.
 *
 * Embedding fields (recommendationEmbedding, recommendationEmbeddingText,
 * recommendationEmbeddingModel, recommendationEmbeddingUpdatedAt) are
 * NEVER included here.
 */
export interface MentorSmartSearchScored {
  id: string;
  name?: string;
  email?: string;
  userType?: string;
  isEmailVerified?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: string;
  isProfilePublic?: boolean;
  profile?: {
    name?: string;
    bio?: string;
    timezone?: string;
    location?: string;
    avatarUrl?: string;
    avatarKey?: string;
    preferredRoles?: string[];
    skills?: string[];
    techStack?: string[];
    expertiseSkills?: string[];
    headline?: string;
    languages?: string[];
    rateType?: "free" | "paid";
    rateNote?: string;
    links?: { github?: string; linkedin?: string; portfolio?: string };
    availabilityHoursPerWeek?: number;
    domainInterests?: string[];
    availabilitySlots?: Array<{
      date: string;
      startTime: string;
      endTime: string;
      timezone?: string;
      note?: string;
    }>;
    // embedding fields intentionally omitted
  };
  /** 0–100 relevance score shown to the user */
  smartScore: number;
  /** Short user-friendly explanations of why this mentor was returned */
  searchReasons: string[];

  // ── Internal scoring (stripped before API response, exposed only in debug) ──
  _scoring?: {
    cosineSimilarity: number | null;
    semanticScore: number;
    keywordScore: number;
    finalSmartScore: number;
    hasMentorEmbedding: boolean;
    passedThreshold: boolean;
    thresholdReason: string;
  };
}

/** Aggregate statistics included only when debug=true is requested */
export interface MentorSmartSearchDebugSummary {
  query: string;
  totalCandidateMentors: number;
  totalRelevantMentors: number;
  mentorsWithEmbeddings: number;
  mentorsWithoutEmbeddings: number;
  mode: MentorSmartSearchMode;
}

export interface MentorSmartSearchResult {
  mode: MentorSmartSearchMode;
  query: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  mentors: MentorSmartSearchScored[];
  /** Set when no mentors pass the relevance threshold */
  message?: string;
  /** Populated only when debug mode is requested */
  debugSummary?: MentorSmartSearchDebugSummary;
}

export interface MentorSmartSearchOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  /** When true, attach debugSummary and per-mentor _scoring to the result */
  debug?: boolean;
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
 * Compute a keyword overlap score (0–100) between query tokens and the
 * searchable fields extracted from a mentor's User document.
 *
 * Weighted by field importance:
 *   name / profile.name    × 3.0
 *   profile.headline       × 2.5
 *   profile.expertiseSkills[] × 2.0
 *   profile.skills[]       × 1.5
 *   profile.techStack[]    × 1.5
 *   profile.domainInterests[] × 1.5
 *   profile.bio            × 1.0
 *   profile.languages[]    × 1.0
 *
 * Score = weighted hits / (queryTokens.length × maxFieldWeight) — capped at 100.
 */
function computeKeywordScore(
  queryTokens: string[],
  mentor: RawMentorDoc,
): { score: number; matchedTokens: Set<string> } {
  if (queryTokens.length === 0) return { score: 0, matchedTokens: new Set() };

  const p = mentor.profile ?? {};
  const displayName = p.name || mentor.name || "";

  type WeightedField = { tokens: string[]; weight: number };
  const fields: WeightedField[] = [
    { tokens: tokenise(displayName),                                  weight: 3.0 },
    { tokens: tokenise(p.headline ?? ""),                             weight: 2.5 },
    { tokens: (p.expertiseSkills ?? []).flatMap(tokenise),            weight: 2.0 },
    { tokens: (p.skills ?? []).flatMap(tokenise),                     weight: 1.5 },
    { tokens: (p.techStack ?? []).flatMap(tokenise),                  weight: 1.5 },
    { tokens: (p.domainInterests ?? []).flatMap(tokenise),            weight: 1.5 },
    { tokens: tokenise(p.bio ?? ""),                                  weight: 1.0 },
    { tokens: (p.languages ?? []).flatMap(tokenise),                  weight: 1.0 },
  ];

  const matchedTokens = new Set<string>();
  let weightedHits = 0;

  const maxFieldWeight = Math.max(...fields.map((f) => f.weight));
  const maxPossible = queryTokens.length * maxFieldWeight;

  for (const { tokens, weight } of fields) {
    const fieldSet = new Set(tokens);
    for (const qt of queryTokens) {
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
 * Build short user-facing reasons explaining the relevance of a mentor result.
 */
function buildSearchReasons(
  mentor: RawMentorDoc,
  matchedTokens: Set<string>,
  semanticScore: number,
): string[] {
  const reasons: string[] = [];
  const p = mentor.profile ?? {};

  // Expertise tag matches (up to 2)
  const allSkills = [...(p.expertiseSkills ?? []), ...(p.skills ?? [])];
  const matchedSkills = allSkills.filter((skill) =>
    tokenise(skill).some((t) => matchedTokens.has(t)),
  );
  if (matchedSkills.length > 0) {
    reasons.push(`Matches ${matchedSkills.slice(0, 2).join(" and ")} expertise`);
  }

  // Domain matches
  const matchedDomains = (p.domainInterests ?? []).filter((domain) =>
    tokenise(domain).some((t) => matchedTokens.has(t)),
  );
  if (matchedDomains.length > 0) {
    reasons.push(`Matches ${matchedDomains.slice(0, 2).join(" and ")} domain`);
  }

  // Language matches
  const matchedLanguages = (p.languages ?? []).filter((lang) =>
    tokenise(lang).some((t) => matchedTokens.has(t)),
  );
  if (matchedLanguages.length > 0) {
    reasons.push(`Matches ${matchedLanguages[0]} language preference`);
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
 * Shape a RawMentorDoc into the MentorSmartSearchScored output format.
 * Never exposes raw embedding arrays or internal embedding metadata.
 */
function shapeMentor(
  mentor: RawMentorDoc,
  semanticScore: number,
  cosineSim: number | null,
  keywordScore: number,
  matchedTokens: Set<string>,
  finalSmartScore: number,
): MentorSmartSearchScored {
  const hasMentorEmbedding =
    Array.isArray(mentor.profile?.recommendationEmbedding) &&
    (mentor.profile!.recommendationEmbedding!.length === EMBEDDING_DIMENSIONS);

  const id: string = (mentor.id as string) || String(mentor._id) || "";

  const thresholdReason =
    finalSmartScore >= FINAL_SCORE_THRESHOLD
      ? `finalSmartScore=${finalSmartScore} >= ${FINAL_SCORE_THRESHOLD}`
      : semanticScore >= SEMANTIC_THRESHOLD
        ? `semanticScore=${semanticScore} >= ${SEMANTIC_THRESHOLD}`
        : `keywordScore=${keywordScore} >= ${KEYWORD_THRESHOLD}`;

  const p = mentor.profile ?? {};

  return {
    id,
    name: mentor.name,
    email: mentor.email,
    userType: mentor.userType,
    isEmailVerified: mentor.isEmailVerified,
    onboardingCompleted: Boolean(mentor.onboardingCompleted),
    onboardingStep: mentor.onboardingStep,
    isProfilePublic: mentor.isProfilePublic,
    profile: {
      name: p.name,
      bio: p.bio,
      timezone: p.timezone,
      location: p.location,
      avatarUrl: p.avatarUrl,
      avatarKey: p.avatarKey,
      preferredRoles: p.preferredRoles,
      skills: p.skills,
      techStack: p.techStack,
      expertiseSkills: p.expertiseSkills,
      headline: p.headline,
      languages: p.languages,
      rateType: p.rateType,
      rateNote: p.rateNote,
      links: p.links,
      availabilityHoursPerWeek: p.availabilityHoursPerWeek,
      domainInterests: p.domainInterests,
      availabilitySlots: p.availabilitySlots,
      // recommendationEmbedding and related fields intentionally omitted
    },
    smartScore: finalSmartScore,
    searchReasons: buildSearchReasons(mentor, matchedTokens, semanticScore),
    _scoring: {
      cosineSimilarity: cosineSim,
      semanticScore,
      keywordScore,
      finalSmartScore,
      hasMentorEmbedding,
      passedThreshold: true,
      thresholdReason,
    },
  };
}

// ── Sort helper ────────────────────────────────────────────────────────────────

function sortMentors(
  mentors: MentorSmartSearchScored[],
  sortBy?: string,
): MentorSmartSearchScored[] {
  const sorted = [...mentors];
  if (!sortBy || sortBy === "Most Relevant") {
    sorted.sort((a, b) => b._scoring!.finalSmartScore - a._scoring!.finalSmartScore);
  } else if (sortBy === "Newest") {
    // createdAt is not in the scored shape; fall back to smartScore DESC for "Newest"
    // (createdAt is available on RawMentorDoc but stripped during shaping — handled in controller)
    sorted.sort((a, b) => b._scoring!.finalSmartScore - a._scoring!.finalSmartScore);
  } else if (sortBy === "Oldest") {
    sorted.sort((a, b) => a._scoring!.finalSmartScore - b._scoring!.finalSmartScore);
  } else {
    sorted.sort((a, b) => b._scoring!.finalSmartScore - a._scoring!.finalSmartScore);
  }
  return sorted;
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Score an array of lean mentor User documents against a search query.
 *
 * @param query    The user's natural-language search query
 * @param mentors  Lean User documents (must include +profile.recommendationEmbedding)
 * @param opts     Pagination / sort / debug options
 *
 * @returns MentorSmartSearchResult — raw embedding arrays are stripped from all mentors
 */
export async function smartSearchMentors(
  query: string,
  mentors: RawMentorDoc[],
  opts: MentorSmartSearchOptions = {},
): Promise<MentorSmartSearchResult> {
  const page = Math.max(opts.page ?? 1, 1);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 9, 1), 50);
  const sortBy = opts.sortBy;
  const debug = opts.debug ?? false;

  const queryTokens = tokenise(query);
  let mode: MentorSmartSearchMode = "smart-search";
  let queryEmbedding: number[] | null = null;

  // ── Try to generate query embedding ─────────────────────────────────────────
  try {
    const result = await generateEmbedding(query);
    queryEmbedding = result.embedding;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[mentorSmartSearch] Embedding service unavailable — falling back to keyword search. Reason: ${message}`,
    );
    mode = "keyword-fallback";
  }

  // ── Intermediate scoring ─────────────────────────────────────────────────────
  interface ScoredIntermediate {
    mentor: RawMentorDoc;
    keywordScore: number;
    matchedTokens: Set<string>;
    semanticScore: number;
    cosineSim: number | null;
    finalSmartScore: number;
  }

  const allScored: ScoredIntermediate[] = mentors.map((mentor) => {
    const { score: keywordScore, matchedTokens } = computeKeywordScore(queryTokens, mentor);

    let semanticScore = 0;
    let cosineSim: number | null = null;

    if (
      queryEmbedding !== null &&
      Array.isArray(mentor.profile?.recommendationEmbedding) &&
      mentor.profile!.recommendationEmbedding!.length === EMBEDDING_DIMENSIONS
    ) {
      cosineSim = cosineSimilarity(queryEmbedding, mentor.profile!.recommendationEmbedding!);
      if (cosineSim !== null) {
        semanticScore = calibrateSemanticScore(cosineSim);
      }
    }

    const finalSmartScore = Math.round(semanticScore * 0.7 + keywordScore * 0.3);
    return { mentor, keywordScore, matchedTokens, semanticScore, cosineSim, finalSmartScore };
  });

  // ── Filter by relevance threshold ────────────────────────────────────────────
  // A mentor passes if at least one condition holds:
  //   finalSmartScore >= 30  |  semanticScore >= 40  |  keywordScore >= 25
  // In keyword-fallback mode, also require at least one keyword match.
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

  // ── Debug summary ────────────────────────────────────────────────────────────
  const mentorsWithEmbeddings = allScored.filter(
    ({ mentor }) =>
      Array.isArray(mentor.profile?.recommendationEmbedding) &&
      mentor.profile!.recommendationEmbedding!.length === EMBEDDING_DIMENSIONS,
  ).length;

  const debugSummary: MentorSmartSearchDebugSummary = {
    query,
    totalCandidateMentors: allScored.length,
    totalRelevantMentors: passing.length,
    mentorsWithEmbeddings,
    mentorsWithoutEmbeddings: allScored.length - mentorsWithEmbeddings,
    mode,
  };

  // ── No results ───────────────────────────────────────────────────────────────
  if (passing.length === 0) {
    return {
      mode,
      query,
      page,
      pageSize,
      total: 0,
      totalPages: 0,
      mentors: [],
      message: "No relevant mentors found for this search.",
      ...(debug ? { debugSummary } : {}),
    };
  }

  // ── Shape passing mentors ────────────────────────────────────────────────────
  const scored: MentorSmartSearchScored[] = passing.map(
    ({ mentor, keywordScore, matchedTokens, semanticScore, cosineSim, finalSmartScore }) =>
      shapeMentor(mentor, semanticScore, cosineSim, keywordScore, matchedTokens, finalSmartScore),
  );

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const sortedAll = sortMentors(scored, sortBy);

  // ── Paginate ─────────────────────────────────────────────────────────────────
  const total = scored.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = sortedAll.slice((page - 1) * pageSize, page * pageSize);

  return {
    mode,
    query,
    page,
    pageSize,
    total,
    totalPages,
    mentors: paginated,
    ...(debug ? { debugSummary } : {}),
  };
}
