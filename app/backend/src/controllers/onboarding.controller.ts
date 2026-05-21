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

  // Build atomic update object - only include fields explicitly provided in request
  const update: Record<string, unknown> = {};

  // Profile fields
  if (typeof name === "string") {
    const trimmedName = name.trim();
    update["profile.name"] = trimmedName;
    update["name"] = trimmedName;
  }

  if (typeof bio === "string") {
    update["profile.bio"] = bio.trim();
  }

  if (typeof timezone === "string") {
    update["profile.timezone"] = timezone.trim();
  }

  if (typeof location === "string") {
    update["profile.location"] = location.trim();
  }

  if (typeof headline === "string") {
    update["profile.headline"] = headline.trim();
  }

  const cleanedPreferredRoles = sanitizeStringArray(preferredRoles);
  if (cleanedPreferredRoles !== undefined) {
    update["profile.preferredRoles"] = cleanedPreferredRoles;
  }

  const cleanedSkills = sanitizeStringArray(skills);
  if (cleanedSkills !== undefined) {
    update["profile.skills"] = cleanedSkills;
  }

  const cleanedTechStack = sanitizeStringArray(techStack);
  if (cleanedTechStack !== undefined) {
    update["profile.techStack"] = cleanedTechStack;
  }

  const cleanedExpertiseSkills = sanitizeStringArray(expertiseSkills);
  if (cleanedExpertiseSkills !== undefined) {
    update["profile.expertiseSkills"] = cleanedExpertiseSkills;
  }

  const cleanedLanguages = sanitizeStringArray(languages);
  if (cleanedLanguages !== undefined) {
    update["profile.languages"] = cleanedLanguages;
  }

  const cleanedDomainInterests = sanitizeStringArray(domainInterests);
  if (cleanedDomainInterests !== undefined) {
    update["profile.domainInterests"] = cleanedDomainInterests;
  }

  const cleanedLinks = sanitizeLinks(links);
  if (cleanedLinks !== undefined) {
    update["profile.links"] = cleanedLinks;
  }

  if (typeof rateType === "string" && ["free", "paid"].includes(rateType)) {
    update["profile.rateType"] = rateType;
  }

  if (typeof rateNote === "string") {
    update["profile.rateNote"] = rateNote.trim();
  }

  if (typeof availabilityHoursPerWeek === "number") {
    if (Number.isNaN(availabilityHoursPerWeek) || availabilityHoursPerWeek < 1) {
      return res.status(400).json({ success: false, message: "Availability hours must be a positive number" });
    }
    update["profile.availabilityHoursPerWeek"] = availabilityHoursPerWeek;
  } else if (typeof availabilityHoursPerWeek === "string" && availabilityHoursPerWeek.trim()) {
    const parsed = Number(availabilityHoursPerWeek);
    if (Number.isNaN(parsed) || parsed < 1) {
      return res.status(400).json({ success: false, message: "Availability hours must be a positive number" });
    }
    update["profile.availabilityHoursPerWeek"] = parsed;
  }

  // Root-level fields
  if (typeof isProfilePublic === "boolean") {
    update["isProfilePublic"] = isProfilePublic;
  }

  if (typeof onboardingStep === "string") {
    if (!ALLOWED_ONBOARDING_STEPS.includes(onboardingStep)) {
      return res.status(400).json({ success: false, message: "Invalid onboarding step" });
    }
    update["onboardingStep"] = onboardingStep;
  }

  // Fetch current user to check for embedding regeneration needs
  const userBefore = await User.findById(userId).select(
    "profile.skills profile.preferredRoles profile.domainInterests profile.techStack profile.expertiseSkills"
  );
  if (!userBefore) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const beforeEmbedSnapshot = {
    skills: userBefore.profile?.skills,
    preferredRoles: userBefore.profile?.preferredRoles,
    domainInterests: userBefore.profile?.domainInterests,
    techStack: userBefore.profile?.techStack,
    expertiseSkills: userBefore.profile?.expertiseSkills,
  };

  // Perform atomic update - only fields in $set are modified
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Regenerate user recommendation embedding if relevant profile fields changed
  const afterEmbedSnapshot = {
    skills: updatedUser.profile?.skills,
    preferredRoles: updatedUser.profile?.preferredRoles,
    domainInterests: updatedUser.profile?.domainInterests,
    techStack: updatedUser.profile?.techStack,
    expertiseSkills: updatedUser.profile?.expertiseSkills,
  };

  if (shouldRegenerateUserRecommendationEmbedding(beforeEmbedSnapshot, afterEmbedSnapshot)) {
    triggerUserRecommendationEmbedding(userId, "onboarding_updated");
  }

  return res.json({ success: true, data: { user: toUserResponse(updatedUser) } });
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
