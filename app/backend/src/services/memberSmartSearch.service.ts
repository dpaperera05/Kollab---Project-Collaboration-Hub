/**
 * memberSmartSearch.service.ts
 *
 * AI-powered member search combining:
 *   - Semantic similarity: query embedding vs stored profile.recommendationEmbedding
 *   - Keyword scoring: weighted token-overlap against all searchable member fields
 *
 * Final score formula:
 *   finalSmartScore = round(semanticScore * 0.70 + keywordScore * 0.30)
 *
 * Calibration (same constants as smartSearch.service.ts / recommendation.service.ts):
 *   cosine ≤ 0.35 → semanticScore = 0
 *   cosine ≥ 0.75 → semanticScore = 100
 *   otherwise:   semanticScore = clamp(round(((cosine - 0.35) / 0.40) * 100), 0, 100)
 *
 * Members without stored embeddings receive semanticScore = 0 and are ranked
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

// ── Relevance thresholds — a member must pass at least one ────────────────────
const FINAL_SCORE_THRESHOLD = 30;
const SEMANTIC_THRESHOLD    = 40;
const KEYWORD_THRESHOLD     = 25;

// ── Public types ──────────────────────────────────────────────────────────────

export type MemberSmartSearchMode = "smart-search" | "keyword-fallback";

/**
 * Raw member (User) data as fetched from MongoDB (lean).
 * profile.recommendationEmbedding must be explicitly selected with
 *   .select("+profile.recommendationEmbedding")
 * because it has select:false in the embedded profileSchema.
 */
export interface RawMemberDoc {
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
 * Public member shape returned by the smart search endpoint.
 * Mirrors the toUserResponse() output shape so the existing frontend
 * people mapper can consume it without changes.
 *
 * Embedding fields (recommendationEmbedding, recommendationEmbeddingText,
 * recommendationEmbeddingModel, recommendationEmbeddingUpdatedAt) are
 * NEVER included here.
 */
export interface MemberSmartSearchScored {
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
  /** Short user-friendly explanations of why this member was returned */
  searchReasons: string[];

  // ── Internal scoring (stripped before API response, exposed only in debug) ──
  _scoring?: {
    cosineSimilarity: number | null;
    semanticScore: number;
    keywordScore: number;
    finalSmartScore: number;
    hasMemberEmbedding: boolean;
    passedThreshold: boolean;
    thresholdReason: string;
    /** Preserved for createdAt-based sort in the controller */
    _createdAt?: Date | string;
  };
}

/** Aggregate statistics included only when debug=true is requested */
export interface MemberSmartSearchDebugSummary {
  query: string;
  totalCandidateMembers: number;
  totalRelevantMembers: number;
  membersWithEmbeddings: number;
  membersWithoutEmbeddings: number;
  mode: MemberSmartSearchMode;
}

export interface MemberSmartSearchResult {
  mode: MemberSmartSearchMode;
  query: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  members: MemberSmartSearchScored[];
  /** Set when no members pass the relevance threshold */
  message?: string;
  /** Populated only when debug mode is requested */
  debugSummary?: MemberSmartSearchDebugSummary;
}

export interface MemberSmartSearchOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  /** When true, attach debugSummary and per-member _scoring to the result */
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
 * searchable fields extracted from a member's User document.
 *
 * Weighted by field importance:
 *   name / profile.name         × 3.0  (strong)
 *   profile.headline            × 2.5  (strong)
 *   profile.preferredRoles[]    × 2.5  (strong — primary member identity)
 *   profile.skills[]            × 2.0  (strong)
 *   profile.techStack[]         × 2.0  (strong)
 *   profile.domainInterests[]   × 1.5  (medium)
 *   profile.expertiseSkills[]   × 1.5  (medium)
 *   profile.bio                 × 1.0  (medium)
 *   profile.languages[]         × 0.5  (low)
 *
 * Score = weighted hits / (queryTokens.length × maxFieldWeight) — capped at 100.
 */
function computeKeywordScore(
  queryTokens: string[],
  member: RawMemberDoc,
): { score: number; matchedTokens: Set<string> } {
  if (queryTokens.length === 0) return { score: 0, matchedTokens: new Set() };

  const p = member.profile ?? {};
  const displayName = p.name || member.name || "";

  type WeightedField = { tokens: string[]; weight: number };
  const fields: WeightedField[] = [
    { tokens: tokenise(displayName),                                  weight: 3.0 },
    { tokens: tokenise(p.headline ?? ""),                             weight: 2.5 },
    { tokens: (p.preferredRoles ?? []).flatMap(tokenise),             weight: 2.5 },
    { tokens: (p.skills ?? []).flatMap(tokenise),                     weight: 2.0 },
    { tokens: (p.techStack ?? []).flatMap(tokenise),                  weight: 2.0 },
    { tokens: (p.domainInterests ?? []).flatMap(tokenise),            weight: 1.5 },
    { tokens: (p.expertiseSkills ?? []).flatMap(tokenise),            weight: 1.5 },
    { tokens: tokenise(p.bio ?? ""),                                  weight: 1.0 },
    { tokens: (p.languages ?? []).flatMap(tokenise),                  weight: 0.5 },
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
 * Build short user-facing reasons explaining the relevance of a member result.
 */
function buildSearchReasons(
  member: RawMemberDoc,
  matchedTokens: Set<string>,
  semanticScore: number,
): string[] {
  const reasons: string[] = [];
  const p = member.profile ?? {};

  // Role matches (up to 2) — primary identity for members
  const matchedRoles = (p.preferredRoles ?? []).filter((role) =>
    tokenise(role).some((t) => matchedTokens.has(t)),
  );
  if (matchedRoles.length > 0) {
    reasons.push(`Matches ${matchedRoles.slice(0, 2).join(" and ")} role interest`);
  }

  // Skill matches (profile.skills, up to 2)
  const matchedSkills = (p.skills ?? []).filter((skill) =>
    tokenise(skill).some((t) => matchedTokens.has(t)),
  );
  if (matchedSkills.length > 0 && reasons.length < 3) {
    reasons.push(`Matches ${matchedSkills.slice(0, 2).join(" and ")} skill`);
  }

  // Tech stack matches (up to 2)
  const matchedTech = (p.techStack ?? []).filter((tech) =>
    tokenise(tech).some((t) => matchedTokens.has(t)),
  );
  if (matchedTech.length > 0 && reasons.length < 3) {
    reasons.push(`Matches ${matchedTech.slice(0, 2).join(" and ")} tech stack`);
  }

  // Domain interest matches
  const matchedDomains = (p.domainInterests ?? []).filter((domain) =>
    tokenise(domain).some((t) => matchedTokens.has(t)),
  );
  if (matchedDomains.length > 0 && reasons.length < 3) {
    reasons.push(`Matches ${matchedDomains.slice(0, 2).join(" and ")} domain interest`);
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
 * Shape a RawMemberDoc into the MemberSmartSearchScored output format.
 * Never exposes raw embedding arrays or internal embedding metadata.
 */
function shapeMember(
  member: RawMemberDoc,
  semanticScore: number,
  cosineSim: number | null,
  keywordScore: number,
  matchedTokens: Set<string>,
  finalSmartScore: number,
): MemberSmartSearchScored {
  const hasMemberEmbedding =
    Array.isArray(member.profile?.recommendationEmbedding) &&
    (member.profile!.recommendationEmbedding!.length === EMBEDDING_DIMENSIONS);

  const id: string = (member.id as string) || String(member._id) || "";

  const thresholdReason =
    finalSmartScore >= FINAL_SCORE_THRESHOLD
      ? `finalSmartScore=${finalSmartScore} >= ${FINAL_SCORE_THRESHOLD}`
      : semanticScore >= SEMANTIC_THRESHOLD
        ? `semanticScore=${semanticScore} >= ${SEMANTIC_THRESHOLD}`
        : `keywordScore=${keywordScore} >= ${KEYWORD_THRESHOLD}`;

  const p = member.profile ?? {};

  return {
    id,
    name: member.name,
    email: member.email,
    userType: member.userType,
    isEmailVerified: member.isEmailVerified,
    onboardingCompleted: Boolean(member.onboardingCompleted),
    onboardingStep: member.onboardingStep,
    isProfilePublic: member.isProfilePublic,
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
    searchReasons: buildSearchReasons(member, matchedTokens, semanticScore),
    _scoring: {
      cosineSimilarity: cosineSim,
      semanticScore,
      keywordScore,
      finalSmartScore,
      hasMemberEmbedding,
      passedThreshold: true,
      thresholdReason,
      _createdAt: member.createdAt,
    },
  };
}

// ── Sort helper ────────────────────────────────────────────────────────────────

function sortMembers(
  members: MemberSmartSearchScored[],
  sortBy?: string,
): MemberSmartSearchScored[] {
  const sorted = [...members];
  if (sortBy === "Newest") {
    sorted.sort((a, b) => {
      const aDate = a._scoring?._createdAt ? new Date(a._scoring._createdAt).getTime() : 0;
      const bDate = b._scoring?._createdAt ? new Date(b._scoring._createdAt).getTime() : 0;
      return bDate - aDate;
    });
  } else if (sortBy === "Oldest") {
    sorted.sort((a, b) => {
      const aDate = a._scoring?._createdAt ? new Date(a._scoring._createdAt).getTime() : 0;
      const bDate = b._scoring?._createdAt ? new Date(b._scoring._createdAt).getTime() : 0;
      return aDate - bDate;
    });
  } else {
    // "Most Relevant" or missing — sort by finalSmartScore descending
    sorted.sort((a, b) => b._scoring!.finalSmartScore - a._scoring!.finalSmartScore);
  }
  return sorted;
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Score an array of lean member User documents against a search query.
 *
 * @param query    The user's natural-language search query
 * @param members  Lean User documents (must include +profile.recommendationEmbedding)
 * @param opts     Pagination / sort / debug options
 *
 * @returns MemberSmartSearchResult — raw embedding arrays are stripped from all members
 */
export async function smartSearchMembers(
  query: string,
  members: RawMemberDoc[],
  opts: MemberSmartSearchOptions = {},
): Promise<MemberSmartSearchResult> {
  const page = Math.max(opts.page ?? 1, 1);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 9, 1), 50);
  const sortBy = opts.sortBy;
  const debug = opts.debug ?? false;

  const queryTokens = tokenise(query);
  let mode: MemberSmartSearchMode = "smart-search";
  let queryEmbedding: number[] | null = null;

  // ── Try to generate query embedding ─────────────────────────────────────────
  try {
    const result = await generateEmbedding(query);
    queryEmbedding = result.embedding;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[memberSmartSearch] Embedding service unavailable — falling back to keyword search. Reason: ${message}`,
    );
    mode = "keyword-fallback";
  }

  // ── Intermediate scoring ─────────────────────────────────────────────────────
  interface ScoredIntermediate {
    member: RawMemberDoc;
    keywordScore: number;
    matchedTokens: Set<string>;
    semanticScore: number;
    cosineSim: number | null;
    finalSmartScore: number;
  }

  const allScored: ScoredIntermediate[] = members.map((member) => {
    const { score: keywordScore, matchedTokens } = computeKeywordScore(queryTokens, member);

    let semanticScore = 0;
    let cosineSim: number | null = null;

    if (
      queryEmbedding !== null &&
      Array.isArray(member.profile?.recommendationEmbedding) &&
      member.profile!.recommendationEmbedding!.length === EMBEDDING_DIMENSIONS
    ) {
      cosineSim = cosineSimilarity(queryEmbedding, member.profile!.recommendationEmbedding!);
      if (cosineSim !== null) {
        semanticScore = calibrateSemanticScore(cosineSim);
      }
    }

    const finalSmartScore = Math.round(semanticScore * 0.7 + keywordScore * 0.3);
    return { member, keywordScore, matchedTokens, semanticScore, cosineSim, finalSmartScore };
  });

  // ── Filter by relevance threshold ────────────────────────────────────────────
  // A member passes if at least one condition holds:
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
  const membersWithEmbeddings = allScored.filter(
    ({ member }) =>
      Array.isArray(member.profile?.recommendationEmbedding) &&
      member.profile!.recommendationEmbedding!.length === EMBEDDING_DIMENSIONS,
  ).length;

  const debugSummary: MemberSmartSearchDebugSummary = {
    query,
    totalCandidateMembers: allScored.length,
    totalRelevantMembers: passing.length,
    membersWithEmbeddings,
    membersWithoutEmbeddings: allScored.length - membersWithEmbeddings,
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
      members: [],
      message: "No relevant members found for this search.",
      ...(debug ? { debugSummary } : {}),
    };
  }

  // ── Shape passing members ────────────────────────────────────────────────────
  const scored: MemberSmartSearchScored[] = passing.map(
    ({ member, keywordScore, matchedTokens, semanticScore, cosineSim, finalSmartScore }) =>
      shapeMember(member, semanticScore, cosineSim, keywordScore, matchedTokens, finalSmartScore),
  );

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const sortedAll = sortMembers(scored, sortBy);

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
    members: paginated,
    ...(debug ? { debugSummary } : {}),
  };
}
