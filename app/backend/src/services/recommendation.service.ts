import { IUserProfile } from "../models/user.model";
import { IProject, IProjectRole } from "../models/project.model";
import { EMBEDDING_DIMENSIONS } from "../config/embedding";
import {
  expandRecommendationTerms,
  weightedOverlap,
  sumWeights,
  matchDisplayLabel,
  TermMatch,
} from "./recommendationAliases";

export interface ScoredProject {
  project: IProject & { id: string; owner?: Record<string, unknown> };
  matchScore: number;
  matchPercentage: number;
  /** Rule-based percentage before any semantic blending (0–100). */
  ruleBasedPercentage: number;
  /** Semantic cosine similarity converted to 0–100. Undefined if embeddings were unavailable. */
  semanticPercentage?: number;
  /** Raw cosine similarity in [-1, 1]. Only present when both embeddings were available. Never expose directly in API responses. */
  rawCosineSimilarity?: number;
  matchedSkills: string[];
  matchedRoles: string[];
  recommendationReasons: string[];
  /** Debug: exact-tier skill/tech matches. Never exposed in public API responses. */
  exactSkillMatches: TermMatch[];
  /** Debug: alias+related-tier skill/tech matches. Never exposed in public API responses. */
  relatedSkillMatches: TermMatch[];
}

// ── Overlap helpers ────────────────────────────────────────────────────────────

/** Normalise strings to lowercase-trimmed for comparison. */
const normalise = (arr: (string | undefined | null)[]): string[] =>
  arr.filter((s): s is string => typeof s === "string" && s.length > 0).map((s) => s.toLowerCase().trim());

// ── Percentage formula ─────────────────────────────────────────────────────────

/**
 * Compute a weighted match percentage (0–100) from three sub-scores.
 *
 * Weights:
 *   45% – skill / technology match
 *   30% – preferred role match
 *   25% – domain / tag interest match
 *
 * Each sub-score is a value 0–1 calculated as:
 *   weightedMatchCount / min(available project signals, cap)
 * where `cap` avoids penalising projects with very large tech stacks.
 * Related matches contribute fractional counts via their tier weights (0.7 or 0.4).
 */
const computeMatchPercentage = (
  skillWeightedCount: number,
  roleMatches: number,
  domainMatches: number,
  projectTechCount: number,
  projectRoleCount: number,
  projectDomainTagCount: number,
): number => {
  const skillDenominator = Math.max(Math.min(projectTechCount, 5), 1);
  const roleDenominator = Math.max(Math.min(projectRoleCount, 3), 1);
  const domainDenominator = Math.max(Math.min(projectDomainTagCount, 3), 1);

  const skillScore = Math.min(skillWeightedCount / skillDenominator, 1);
  const roleScore = Math.min(roleMatches / roleDenominator, 1);
  const domainScore = Math.min(domainMatches / domainDenominator, 1);

  return Math.min(Math.round(skillScore * 45 + roleScore * 30 + domainScore * 25), 100);
};

// ── Main scoring function ──────────────────────────────────────────────────────

/**
 * Score a single project against a user profile.
 *
 * Returns both a raw `matchScore` (for sorting) and a `matchPercentage`
 * (for display), along with formatted labels and human-readable reasons.
 */
export function scoreProject(
  project: IProject & { id: string; owner?: Record<string, unknown> },
  profile: IUserProfile,
): ScoredProject {
  // ── User signals ──────────────────────────────────────────────────────────
  const rawUserSkills = [
    ...(profile.skills ?? []),
    ...(profile.techStack ?? []),
    ...(profile.expertiseSkills ?? []),
  ];
  const userSkillsExpanded = expandRecommendationTerms(rawUserSkills);
  const userRolesExpanded = expandRecommendationTerms(profile.preferredRoles ?? []);
  const userDomainsExpanded = expandRecommendationTerms(profile.domainInterests ?? []);

  // ── Project signals ───────────────────────────────────────────────────────
  const projectTechRaw = [
    ...(project.technologies ?? []),
    ...((project.roles as IProjectRole[]) ?? []).flatMap((r) => [
      ...(r.requiredSkills ?? []),
      ...(r.niceToHaveSkills ?? []),
    ]),
  ];
  const projectRoleTitlesRaw = ((project.roles as IProjectRole[]) ?? []).map((r) => r.title);
  const projectDomainAndTagsRaw = [
    project.domain,
    ...(project.tags ?? []),
  ].filter((s): s is string => typeof s === "string");

  // ── Weighted overlaps ─────────────────────────────────────────────────────
  const skillMatches = weightedOverlap(userSkillsExpanded, projectTechRaw);
  const roleMatches = weightedOverlap(userRolesExpanded, [
    ...projectRoleTitlesRaw,
    ...projectDomainAndTagsRaw,
  ]);
  const domainMatches = weightedOverlap(userDomainsExpanded, projectDomainAndTagsRaw);

  const exactSkillMatches = skillMatches.filter((m) => m.tier === "exact");
  const relatedSkillMatches = skillMatches.filter((m) => m.tier !== "exact");

  // ── Weighted counts ───────────────────────────────────────────────────────
  const skillWeightedCount = sumWeights(skillMatches);
  const roleWeightedCount = sumWeights(roleMatches);
  const domainWeightedCount = sumWeights(domainMatches);

  // ── Raw score (sort stability) ────────────────────────────────────────────
  const matchScore = skillWeightedCount * 2 + roleWeightedCount * 3 + domainWeightedCount * 2;

  // ── Percentage ────────────────────────────────────────────────────────────
  const projectTechNorm = normalise(projectTechRaw);
  const projectRoleNorm = normalise(projectRoleTitlesRaw);
  const projectDomainNorm = normalise(projectDomainAndTagsRaw);

  const matchPercentage = computeMatchPercentage(
    skillWeightedCount,
    roleWeightedCount,
    domainWeightedCount,
    projectTechNorm.length,
    projectRoleNorm.length,
    projectDomainNorm.length,
  );

  // ── Display labels ────────────────────────────────────────────────────────
  const matchedSkillLabels = [...new Set(exactSkillMatches.map((m) => matchDisplayLabel(m)))];
  const matchedRoleLabels = [...new Set(roleMatches.filter((m) => m.tier === "exact").map((m) => matchDisplayLabel(m)))];

  // ── Recommendation reasons ────────────────────────────────────────────────
  // Priority: exact skills → exact roles → exact domains → related skills → related roles
  const reasons: string[] = [];

  if (exactSkillMatches.length > 0) {
    reasons.push(`Matches your ${matchedSkillLabels.slice(0, 2).join(" and ")} skills`);
  }

  if (matchedRoleLabels.length > 0 && reasons.length < 2) {
    reasons.push(`Fits your preferred ${matchedRoleLabels.slice(0, 2).join(" and ")} role`);
  }

  const exactDomainMatches = domainMatches.filter((m) => m.tier === "exact");
  if (exactDomainMatches.length > 0 && reasons.length < 2) {
    const top = [...new Set(exactDomainMatches.map((m) => matchDisplayLabel(m)))].slice(0, 2).join(" and ");
    reasons.push(`Related to your ${top} interest`);
  }

  if (relatedSkillMatches.length > 0 && reasons.length < 2) {
    const top = relatedSkillMatches[0];
    const projectLabel = top.projectTerm.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    reasons.push(`Related to your ${matchDisplayLabel(top)} skills through ${projectLabel}`);
  }

  const relatedRoleMatches = roleMatches.filter((m) => m.tier !== "exact");
  if (relatedRoleMatches.length > 0 && reasons.length < 2) {
    const top = relatedRoleMatches[0];
    const projectLabel = top.projectTerm.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    reasons.push(`Related to your ${matchDisplayLabel(top)} preference through ${projectLabel}`);
  }

  return {
    project,
    matchScore,
    matchPercentage,
    ruleBasedPercentage: matchPercentage,
    matchedSkills: matchedSkillLabels,
    matchedRoles: matchedRoleLabels,
    recommendationReasons: reasons,
    exactSkillMatches,
    relatedSkillMatches,
  };
}

// ── Cosine similarity ──────────────────────────────────────────────────────────

/**
 * Compute cosine similarity between two embedding vectors.
 *
 * Returns a value in [-1, 1], or null if either input is invalid:
 *   - not an array
 *   - different lengths
 *   - length !== EMBEDDING_DIMENSIONS
 *   - zero-magnitude vector
 */
export function cosineSimilarity(a: number[], b: number[]): number | null {
  if (!Array.isArray(a) || !Array.isArray(b)) return null;
  if (a.length !== b.length) return null;
  if (a.length !== EMBEDDING_DIMENSIONS) return null;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return null;

  return dot / magnitude;
}

// ── Hybrid scoring ─────────────────────────────────────────────────────────────

/**
 * Score a project using a hybrid of semantic similarity and rule-based matching.
 *
 * When both a user embedding and a project embedding are available:
 *   semanticPercentage  = clamp(round(((cosine + 1) / 2) * 100), 0, 100)
 *   finalMatchPercentage = round(semanticPercentage * 0.6 + ruleBasedPercentage * 0.4)
 *
 * When either embedding is missing the result is identical to scoreProject().
 *
 * @param project     Enriched (owner-joined) project document
 * @param profile     Logged-in user's profile
 * @param userEmbed   User's profile.recommendationEmbedding (optional)
 * @param projectEmbed  Project's recommendationEmbedding (optional)
 */
export function scoreProjectHybrid(
  project: IProject & { id: string; owner?: Record<string, unknown> },
  profile: IUserProfile,
  userEmbed?: number[] | null,
  projectEmbed?: number[] | null,
): ScoredProject {
  // Always run rule-based scoring first
  const ruleBased = scoreProject(project, profile);
  const ruleBasedPercentage = ruleBased.matchPercentage;

  // Try semantic scoring
  let semanticPercentage: number | undefined;
  let finalMatchPercentage = ruleBasedPercentage;
  const reasons = [...ruleBased.recommendationReasons];

  // Calibration constants: cosine ≤ COSINE_MIN scores 0%; cosine ≥ COSINE_MAX scores 100%.
  // Values in between are linearly interpolated. This deliberately discards weak/moderate
  // similarity so the semantic signal only contributes when the match is genuinely strong.
  const COSINE_MIN = 0.35;
  const COSINE_MAX = 0.75;

  let rawCosineSimilarity: number | undefined;

  if (
    Array.isArray(userEmbed) && userEmbed.length === EMBEDDING_DIMENSIONS &&
    Array.isArray(projectEmbed) && projectEmbed.length === EMBEDDING_DIMENSIONS
  ) {
    const similarity = cosineSimilarity(userEmbed, projectEmbed);
    if (similarity !== null) {
      rawCosineSimilarity = similarity;

      // Calibrated mapping: weak matches (≤ 0.35) → 0, strong matches (≥ 0.75) → 100
      semanticPercentage = Math.max(
        0,
        Math.min(100, Math.round(((similarity - COSINE_MIN) / (COSINE_MAX - COSINE_MIN)) * 100)),
      );

      // Hybrid blend: rule-based signals carry more weight (55%) because they are
      // concrete and explainable; semantic improves ranking but does not dominate.
      finalMatchPercentage = Math.round(semanticPercentage * 0.45 + ruleBasedPercentage * 0.55);

      // Floor rule: if there are no concrete matches and semantic signal is weak,
      // cap the score so these projects sort below anything with real skill/role matches.
      if (ruleBasedPercentage === 0 && semanticPercentage < 40) {
        finalMatchPercentage = Math.min(finalMatchPercentage, 15);
      }

      // Show semantic reason only when:
      //   1. There are fewer than 2 concrete reasons (skill/role/domain didn't already explain it).
      //   2. The semantic signal is genuinely strong (≥ 70% after calibration).
      if (semanticPercentage >= 70 && reasons.length < 2) {
        reasons.push("Semantically similar to your profile interests and skills");
      }
    }
  }

  return {
    ...ruleBased,
    matchPercentage: finalMatchPercentage,
    ruleBasedPercentage,
    semanticPercentage,
    rawCosineSimilarity,
    recommendationReasons: reasons,
    exactSkillMatches: ruleBased.exactSkillMatches,
    relatedSkillMatches: ruleBased.relatedSkillMatches,
  };
}
