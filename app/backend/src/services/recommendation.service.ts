import { IUserProfile } from "../models/user.model";
import { IProject, IProjectRole } from "../models/project.model";

export interface ScoredProject {
  project: IProject & { id: string; owner?: Record<string, unknown> };
  matchScore: number;
  matchedSkills: string[];
  matchedRoles: string[];
  recommendationReasons: string[];
}

/** Normalise an array of possibly-undefined strings to lowercase trimmed values. */
const normalise = (arr: (string | undefined | null)[]): string[] =>
  arr.filter((s): s is string => typeof s === "string" && s.length > 0).map((s) => s.toLowerCase().trim());

/** Return elements of `a` that also appear in `b` (case-insensitive, pre-normalised). */
const overlap = (a: string[], b: string[]): string[] => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const dedupCapitalise = (arr: string[]): string[] => [...new Set(arr)].map(capitalise);

/**
 * Score a single project against a user profile using keyword overlap.
 *
 * Weights:
 *   - skill / technology overlap : 2 pts each
 *   - preferred role overlap      : 3 pts each
 *   - domain interest match       : 2 pts each
 *   - tag overlap                 : 1 pt each
 */
export function scoreProject(
  project: IProject & { id: string; owner?: Record<string, unknown> },
  profile: IUserProfile,
): ScoredProject {
  // ── User signals ─────────────────────────────────────────────────────────
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

  // ── Overlaps ──────────────────────────────────────────────────────────────
  const skillMatches = overlap(userSkills, [...projectTech, ...projectTags]);
  const roleMatches = overlap(userRoles, projectRoleTitles);
  const domainMatches = overlap(userDomains, [...projectDomain, ...projectTags]);
  // tag matches not in skillMatches already
  const extraTagMatches = overlap(
    [...userSkills, ...userDomains],
    projectTags,
  ).filter((t) => !skillMatches.includes(t) && !domainMatches.includes(t));

  // ── Score ─────────────────────────────────────────────────────────────────
  const matchScore =
    skillMatches.length * 2 +
    roleMatches.length * 3 +
    domainMatches.length * 2 +
    extraTagMatches.length * 1;

  // ── Human-readable matches for the card ───────────────────────────────────
  const matchedSkills = dedupCapitalise(skillMatches);
  const matchedRoles = dedupCapitalise(roleMatches);

  // ── Recommendation reasons (only include if data supports it) ─────────────
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
    const topDomains = dedupCapitalise(domainMatches).slice(0, 2).join(" and ");
    reasons.push(`Related to your ${topDomains} interest`);
  }

  return {
    project,
    matchScore,
    matchedSkills,
    matchedRoles,
    recommendationReasons: reasons,
  };
}
