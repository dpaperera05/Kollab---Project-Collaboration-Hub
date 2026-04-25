/**
 * embeddingText.service.ts
 *
 * Builds clean, structured plain-text representations of projects and user
 * profiles that will be sent to the embedding service for vectorisation.
 *
 * These strings are designed to be semantically rich while remaining compact.
 * They are stored alongside the embedding vectors so we can re-check whether
 * the source data has changed and the embedding needs refreshing.
 *
 * Security note: No private or sensitive user data (email, password, tokens,
 * phone numbers, contact details) is ever included in these strings.
 */

import { IProject, IProjectRole } from "../models/project.model";
import { IUser } from "../models/user.model";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Join an array into a comma-separated string, or return a fallback. */
const join = (arr: string[] | undefined, fallback = "None"): string =>
  arr && arr.length > 0 ? arr.join(", ") : fallback;

/** Return a trimmed string or a fallback if it is blank. */
const str = (s: string | undefined | null, fallback = "Not specified"): string =>
  s?.trim() || fallback;

// ── Project embedding text ────────────────────────────────────────────────────

/**
 * Builds a structured plain-text block from a project document.
 *
 * The text is designed to capture the semantic meaning of the project so that
 * it can be compared with a user-profile embedding via cosine similarity.
 *
 * Fields used:
 *   title, summary, problemStatement, domain, technologies, tags,
 *   difficulty, duration, roles[].title, roles[].requiredSkills,
 *   roles[].niceToHaveSkills, roles[].level
 *
 * Fields deliberately excluded:
 *   ownerId, applicants, members, compensation, posterImage, weeklyHours,
 *   postedAt, status — these do not carry semantic meaning for matching.
 */
export function buildProjectEmbeddingText(
  project: Pick<
    IProject,
    | "title"
    | "summary"
    | "problemStatement"
    | "domain"
    | "technologies"
    | "tags"
    | "difficulty"
    | "duration"
    | "roles"
  >,
): string {
  const roles = (project.roles as IProjectRole[]) ?? [];

  // Collect all role titles
  const roleTitles = roles.map((r) => r.title).filter(Boolean);

  // Collect all required skills across all roles (deduplicated)
  const allRequiredSkills = [
    ...new Set(roles.flatMap((r) => r.requiredSkills ?? [])),
  ];

  // Collect all nice-to-have skills across all roles (deduplicated)
  const allNiceToHaveSkills = [
    ...new Set(roles.flatMap((r) => r.niceToHaveSkills ?? [])),
  ];

  // Collect unique experience levels mentioned across roles
  const roleLevels = [...new Set(roles.map((r) => r.level).filter(Boolean))];

  const lines: string[] = [
    `Project title: ${str(project.title)}.`,
    `Summary: ${str(project.summary)}.`,
  ];

  if (project.problemStatement?.trim()) {
    lines.push(`Problem statement: ${project.problemStatement.trim()}.`);
  }

  lines.push(
    `Domain: ${str(project.domain)}.`,
    `Technologies: ${join(project.technologies)}.`,
    `Difficulty: ${str(project.difficulty)}.`,
    `Duration: ${str(project.duration)}.`,
  );

  if (roleTitles.length > 0) {
    lines.push(`Roles: ${roleTitles.join(", ")}.`);
  }

  if (allRequiredSkills.length > 0) {
    lines.push(`Required skills: ${allRequiredSkills.join(", ")}.`);
  }

  if (allNiceToHaveSkills.length > 0) {
    lines.push(`Nice to have skills: ${allNiceToHaveSkills.join(", ")}.`);
  }

  if (roleLevels.length > 0) {
    lines.push(`Experience levels sought: ${roleLevels.join(", ")}.`);
  }

  if (project.tags && project.tags.length > 0) {
    lines.push(`Tags: ${join(project.tags)}.`);
  }

  return lines.join("\n");
}

// ── User profile embedding text ───────────────────────────────────────────────

/**
 * Builds a structured plain-text block from a user's profile that represents
 * their professional interests and skill set for recommendation matching.
 *
 * Fields used (existing profile fields only):
 *   profile.skills, profile.techStack, profile.expertiseSkills,
 *   profile.preferredRoles, profile.domainInterests,
 *   profile.headline, profile.languages
 *
 * Fields deliberately excluded (sensitive / private):
 *   email, password, tokens, phone, location, bio (personal narrative),
 *   links (github/linkedin/portfolio), availabilitySlots, rateType, rateNote
 */
export function buildUserRecommendationEmbeddingText(user: IUser): string {
  const profile = user.profile;

  if (!profile) {
    return "";
  }

  const lines: string[] = [];

  if (profile.headline?.trim()) {
    lines.push(`Professional headline: ${profile.headline.trim()}.`);
  }

  if (profile.skills && profile.skills.length > 0) {
    lines.push(`Skills: ${join(profile.skills)}.`);
  }

  if (profile.techStack && profile.techStack.length > 0) {
    lines.push(`Tech stack: ${join(profile.techStack)}.`);
  }

  if (profile.expertiseSkills && profile.expertiseSkills.length > 0) {
    lines.push(`Expertise skills: ${join(profile.expertiseSkills)}.`);
  }

  if (profile.preferredRoles && profile.preferredRoles.length > 0) {
    lines.push(`Preferred roles: ${join(profile.preferredRoles)}.`);
  }

  if (profile.domainInterests && profile.domainInterests.length > 0) {
    lines.push(`Domain interests: ${join(profile.domainInterests)}.`);
  }

  if (profile.languages && profile.languages.length > 0) {
    lines.push(`Languages: ${join(profile.languages)}.`);
  }

  return lines.join("\n");
}
