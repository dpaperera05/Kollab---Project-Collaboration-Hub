import { Request, Response } from "express";
import { User } from "../models/user.model";
import { toUserResponse } from "../utils/userResponse";
import {
  shouldRegenerateUserRecommendationEmbedding,
  triggerUserRecommendationEmbedding,
} from "../services/embeddingFreshness.service";

const ALLOWED_ONBOARDING_STEPS = [
  "/onboarding/role",
  "/onboarding/basics",
  "/onboarding/skills",
  "/onboarding/links",
  "/onboarding/availability",
  "/onboarding/interests",
];

const sanitizeStringArray = (value?: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
  return cleaned.length ? cleaned : undefined;
};

const sanitizeLinks = (value?: unknown) => {
  if (!value || typeof value !== "object") return undefined;
  const linksValue = value as Record<string, unknown>;
  const github = typeof linksValue.github === "string" ? linksValue.github.trim() : undefined;
  const linkedin = typeof linksValue.linkedin === "string" ? linksValue.linkedin.trim() : undefined;
  const portfolio = typeof linksValue.portfolio === "string" ? linksValue.portfolio.trim() : undefined;
  const links = { github, linkedin, portfolio };
  const hasAny = github || linkedin || portfolio;
  return hasAny ? links : undefined;
};

export const getOnboardingProfile = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({ success: true, data: { user: toUserResponse(user) } });
};

export const updateOnboardingProfile = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const {
    name,
    bio,
    timezone,
    location,
    preferredRoles,
    skills,
    techStack,
    expertiseSkills,
    links,
    availabilityHoursPerWeek,
    domainInterests,
    headline,
    languages,
    rateType,
    rateNote,
    isProfilePublic,
    onboardingStep,
  } = req.body as Record<string, unknown>;

  const profile = user.profile && typeof (user.profile as any).toObject === "function"
    ? (user.profile as any).toObject()
    : { ...(user.profile || {}) };

  // Snapshot recommendation-relevant fields before mutation
  const beforeEmbedSnapshot = {
    skills: profile.skills,
    preferredRoles: profile.preferredRoles,
    domainInterests: profile.domainInterests,
    techStack: profile.techStack,
    expertiseSkills: profile.expertiseSkills,
  };

  const cleanedProfile = {
    ...profile,
    name: typeof name === "string" ? name.trim() : profile.name,
    bio: typeof bio === "string" ? bio.trim() : profile.bio,
    timezone: typeof timezone === "string" ? timezone.trim() : profile.timezone,
    location: typeof location === "string" ? location.trim() : profile.location,
    preferredRoles: sanitizeStringArray(preferredRoles) ?? profile.preferredRoles,
    skills: sanitizeStringArray(skills) ?? profile.skills,
    techStack: sanitizeStringArray(techStack) ?? profile.techStack,
    expertiseSkills: sanitizeStringArray(expertiseSkills) ?? profile.expertiseSkills,
    headline: typeof headline === "string" ? headline.trim() : profile.headline,
    languages: sanitizeStringArray(languages) ?? profile.languages,
    rateType:
      typeof rateType === "string" && ["free", "paid"].includes(rateType)
        ? (rateType as "free" | "paid")
        : profile.rateType,
    rateNote: typeof rateNote === "string" ? rateNote.trim() : profile.rateNote,
    links: sanitizeLinks(links) ?? profile.links,
    availabilityHoursPerWeek:
      typeof availabilityHoursPerWeek === "number"
        ? availabilityHoursPerWeek
        : typeof availabilityHoursPerWeek === "string" && availabilityHoursPerWeek.trim()
          ? Number(availabilityHoursPerWeek)
          : profile.availabilityHoursPerWeek,
    domainInterests: sanitizeStringArray(domainInterests) ?? profile.domainInterests,
  };

  if (
    cleanedProfile.availabilityHoursPerWeek !== undefined &&
    (Number.isNaN(cleanedProfile.availabilityHoursPerWeek) || cleanedProfile.availabilityHoursPerWeek < 1)
  ) {
    return res.status(400).json({ success: false, message: "Availability hours must be a positive number" });
  }

  user.profile = cleanedProfile;

  if (cleanedProfile.name) {
    user.name = cleanedProfile.name;
  }

  if (typeof isProfilePublic === "boolean") {
    user.isProfilePublic = isProfilePublic;
  }

  if (typeof onboardingStep === "string") {
    if (!ALLOWED_ONBOARDING_STEPS.includes(onboardingStep)) {
      return res.status(400).json({ success: false, message: "Invalid onboarding step" });
    }
    user.onboardingStep = onboardingStep;
  }

  await user.save();

  // Regenerate user recommendation embedding if relevant profile fields changed
  const afterEmbedSnapshot = {
    skills: cleanedProfile.skills,
    preferredRoles: cleanedProfile.preferredRoles,
    domainInterests: cleanedProfile.domainInterests,
    techStack: cleanedProfile.techStack,
    expertiseSkills: cleanedProfile.expertiseSkills,
  };
  if (shouldRegenerateUserRecommendationEmbedding(beforeEmbedSnapshot, afterEmbedSnapshot)) {
    triggerUserRecommendationEmbedding(userId, "onboarding_updated");
  }

  return res.json({ success: true, data: { user: toUserResponse(user) } });
};

export const completeOnboarding = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.onboardingCompleted = true;
  user.onboardingStep = undefined;
  await user.save();

  return res.json({ success: true, data: { user: toUserResponse(user) } });
};
