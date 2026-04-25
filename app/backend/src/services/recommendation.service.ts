import { IUserProfile } from "../models/user.model";
import { IProject, IProjectRole } from "../models/project.model";

export interface ScoredProject {
  project: IProject & { id: string; owner?: Record<string, unknown> };
  matchScore: number;
  matchPercentage: number;
  matchedSkills: string[];
  matchedRoles: string[];
  recommendationReasons: string[];
}

// ── Display-name formatting ────────────────────────────────────────────────────

/**
 * Terms that should always appear in a specific casing.
 * Keys are lowercase; values are the canonical display form.
 */
const SPECIAL_CASES: Record<string, string> = {
  "node.js": "Node.js",
  "react.js": "React.js",
  "vue.js": "Vue.js",
  "next.js": "Next.js",
  "nuxt.js": "Nuxt.js",
  "express.js": "Express.js",
  "three.js": "Three.js",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
  "graphql": "GraphQL",
  "mongodb": "MongoDB",
  "postgresql": "PostgreSQL",
  "mysql": "MySQL",
  "github": "GitHub",
  "gitlab": "GitLab",
  "devops": "DevOps",
  "tailwindcss": "TailwindCSS",
  "tailwind css": "Tailwind CSS",
};

/** Words that should be rendered entirely in uppercase. */
const ACRONYMS = new Set([
  "ai", "ml", "ui", "ux", "api", "qa", "css", "html", "sql",
  "orm", "sdk", "ios", "aws", "gcp", "ci", "cd", "rest", "http",
  "https", "jwt", "dto", "orm", "db",
]);

/**
 * Format a raw skill/role/domain string into a clean display name.
 * Handles acronyms, special technology names, and standard title-casing.
 */
const formatDisplayName = (s: string): string => {
  const lower = s.toLowerCase().trim();
  if (SPECIAL_CASES[lower]) return SPECIAL_CASES[lower];
  return s
    .trim()
    .split(/\s+/)
    .map((word) => {
      const lw = word.toLowerCase();
      if (ACRONYMS.has(lw)) return lw.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const dedupFormat = (arr: string[]): string[] => [...new Set(arr)].map(formatDisplayName);

// ── Overlap helpers ────────────────────────────────────────────────────────────

/** Normalise strings to lowercase-trimmed for comparison. */
const normalise = (arr: (string | undefined | null)[]): string[] =>
  arr.filter((s): s is string => typeof s === "string" && s.length > 0).map((s) => s.toLowerCase().trim());

/** Elements of `a` that also appear in `b` (both pre-normalised). */
const overlap = (a: string[], b: string[]): string[] => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

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
 *   matched / min(available project signals, cap)
 * where `cap` avoids penalising projects with very large tech stacks.
 */
const computeMatchPercentage = (
  skillMatches: number,
  roleMatches: number,
  domainMatches: number,
  projectTechCount: number,
  projectRoleCount: number,
  projectDomainTagCount: number,
): number => {
  const skillDenominator = Math.max(Math.min(projectTechCount, 5), 1);
  const roleDenominator = Math.max(Math.min(projectRoleCount, 3), 1);
  const domainDenominator = Math.max(Math.min(projectDomainTagCount, 3), 1);

  const skillScore = Math.min(skillMatches / skillDenominator, 1);
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
  const userSkills = normalise([
    ...(profile.skills ?? []),
    ...(profile.techStack ?? []),
    ...(profile.expertiseSkills ?? []),
  ]);
  const userRoles = normalise(profile.preferredRoles ?? []);
  const userDomains = normalise(profile.domainInterests ?? []);

  // ── Project signals ───────────────────────────────────────────────────────
  const projectTech = normalise([
    ...(project.technologies ?? []),
    ...((project.roles as IProjectRole[]) ?? []).flatMap((r) => [
      ...(r.requiredSkills ?? []),
      ...(r.niceToHaveSkills ?? []),
    ]),
  ]);
  const projectRoleTitles = normalise(
    ((project.roles as IProjectRole[]) ?? []).map((r) => r.title),
  );
  const projectDomain = normalise([project.domain]);
  const projectTags = normalise(project.tags ?? []);
  const projectDomainAndTags = [...new Set([...projectDomain, ...projectTags])];

  // ── Overlaps ──────────────────────────────────────────────────────────────
  const skillMatches = overlap(userSkills, [...projectTech, ...projectTags]);
  const roleMatches = overlap(userRoles, projectRoleTitles);
  const domainMatches = overlap(userDomains, projectDomainAndTags);

  // ── Raw score (used for sort stability when percentages tie) ──────────────
  const matchScore =
    skillMatches.length * 2 +
    roleMatches.length * 3 +
    domainMatches.length * 2;

  // ── Percentage (used for display) ─────────────────────────────────────────
  const matchPercentage = computeMatchPercentage(
    skillMatches.length,
    roleMatches.length,
    domainMatches.length,
    projectTech.length,
    projectRoleTitles.length,
    projectDomainAndTags.length,
  );

  // ── Human-readable display labels ─────────────────────────────────────────
  const matchedSkills = dedupFormat(skillMatches);
  const matchedRoles = dedupFormat(roleMatches);

  // ── Recommendation reasons ────────────────────────────────────────────────
  const reasons: string[] = [];

  if (matchedSkills.length > 0) {
    const topSkills = matchedSkills.slice(0, 2).join(" and ");
    reasons.push(`Matches your ${topSkills} skills`);
  }

  if (matchedRoles.length > 0) {
    const topRoles = matchedRoles.slice(0, 2).join(" and ");
    reasons.push(`Fits your preferred ${topRoles} role`);
  }

  if (domainMatches.length > 0) {
    const topDomains = dedupFormat(domainMatches).slice(0, 2).join(" and ");
    reasons.push(`Related to your ${topDomains} interest`);
  }

  return {
    project,
    matchScore,
    matchPercentage,
    matchedSkills,
    matchedRoles,
    recommendationReasons: reasons,
  };
}
