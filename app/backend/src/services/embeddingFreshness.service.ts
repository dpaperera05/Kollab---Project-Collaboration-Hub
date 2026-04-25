/**
 * embeddingFreshness.service.ts
 *
 * Lightweight helpers that decide whether an embedding needs to be regenerated
 * after a create/update, and fire-and-forget wrappers that trigger generation
 * without blocking the HTTP response.
 *
 * All public functions are "failure-safe" — they log errors but never throw,
 * so that a caller's response path is never interrupted.
 */

import { generateAndStoreProjectEmbedding } from "./projectEmbedding.service";
import { generateAndStoreUserRecommendationEmbedding } from "./userEmbedding.service";

// ── Field-change detectors ─────────────────────────────────────────────────────

/**
 * Returns true if any field that contributes to the project embedding text
 * has changed between `before` and `after`.
 *
 * Fields monitored:
 *   title, summary, problemStatement, domain, technologies, tags,
 *   difficulty, duration, roles (compared by JSON snapshot)
 */
export function shouldRegenerateProjectEmbedding(
  before: Record<string, any>,
  after: Record<string, any>,
): boolean {
  const SCALAR_FIELDS = [
    "title",
    "summary",
    "problemStatement",
    "domain",
    "difficulty",
    "duration",
  ] as const;

  for (const field of SCALAR_FIELDS) {
    if ((before[field] ?? "") !== (after[field] ?? "")) return true;
  }

  // Array / object fields — compare via JSON snapshot
  const ARRAY_FIELDS = ["technologies", "tags", "roles"] as const;

  for (const field of ARRAY_FIELDS) {
    const bVal = JSON.stringify(before[field] ?? []);
    const aVal = JSON.stringify(after[field] ?? []);
    if (bVal !== aVal) return true;
  }

  return false;
}

/**
 * Returns true if any field that contributes to the user recommendation
 * embedding text has changed between `before` and `after`.
 *
 * Fields monitored:
 *   skills, preferredRoles, domainInterests, techStack, expertiseSkills
 */
export function shouldRegenerateUserRecommendationEmbedding(
  before: Record<string, any>,
  after: Record<string, any>,
): boolean {
  const FIELDS = [
    "skills",
    "preferredRoles",
    "domainInterests",
    "techStack",
    "expertiseSkills",
  ] as const;

  for (const field of FIELDS) {
    const bVal = JSON.stringify(before[field] ?? []);
    const aVal = JSON.stringify(after[field] ?? []);
    if (bVal !== aVal) return true;
  }

  return false;
}

// ── Fire-and-forget wrappers ───────────────────────────────────────────────────

/**
 * Trigger project embedding generation in the background.
 *
 * - Never blocks the caller (void promise).
 * - Logs success / failure without re-throwing.
 *
 * @param projectId  MongoDB ObjectId string of the project
 * @param reason     Short label for log context ("created" | "updated" | …)
 */
export function triggerProjectEmbedding(projectId: string, reason: string): void {
  generateAndStoreProjectEmbedding(projectId)
    .then((summary) => {
      console.log(
        `[embeddingFreshness] Project embedding ${reason} — "${summary.title}" (${projectId}) ` +
          `dims=${summary.dimensions} textLen=${summary.textLength}`,
      );
    })
    .catch((err: any) => {
      console.error(
        `[embeddingFreshness] Project embedding ${reason} failed for ${projectId}: ` +
          (err?.message ?? String(err)),
      );
    });
}

/**
 * Trigger user recommendation embedding generation in the background.
 *
 * - Never blocks the caller (void promise).
 * - Logs success / failure without re-throwing.
 * - Silently skips if the profile has insufficient data (that is expected
 *   during onboarding before the profile is complete).
 *
 * @param userId  MongoDB ObjectId string of the user
 * @param reason  Short label for log context ("profile_updated" | "onboarding" | …)
 */
export function triggerUserRecommendationEmbedding(userId: string, reason: string): void {
  generateAndStoreUserRecommendationEmbedding(userId)
    .then((summary) => {
      console.log(
        `[embeddingFreshness] User embedding ${reason} — userId=${userId} ` +
          `dims=${summary.dimensions} textLen=${summary.textLength}`,
      );
    })
    .catch((err: any) => {
      const msg: string = err?.message ?? String(err);
      // "not enough recommendation data" is expected during early onboarding — downgrade to debug
      if (msg.includes("not contain enough recommendation data")) {
        console.debug(
          `[embeddingFreshness] User embedding ${reason} skipped — profile incomplete: ${userId}`,
        );
      } else {
        console.error(
          `[embeddingFreshness] User embedding ${reason} failed for ${userId}: ${msg}`,
        );
      }
    });
}
