import { IUser } from "../models/user.model";

export const toUserResponse = (user: IUser) => {
  return {
    id: user._id?.toString?.() ?? (user as any).id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    isEmailVerified: user.isEmailVerified,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    onboardingStep: user.onboardingStep,
    isProfilePublic: user.isProfilePublic,
    profile: user.profile
      ? {
          name: user.profile.name,
          bio: user.profile.bio,
          timezone: user.profile.timezone,
          location: user.profile.location,
          avatarUrl: user.profile.avatarUrl,
          avatarKey: (user.profile as any).avatarKey,
          preferredRoles: user.profile.preferredRoles,
          skills: user.profile.skills,
          techStack: user.profile.techStack,
          expertiseSkills: user.profile.expertiseSkills,
          headline: user.profile.headline,
          languages: user.profile.languages,
          rateType: user.profile.rateType,
          rateNote: user.profile.rateNote,
          links: user.profile.links,
          availabilityHoursPerWeek: user.profile.availabilityHoursPerWeek,
          domainInterests: user.profile.domainInterests,
          availabilitySlots: (user.profile as any).availabilitySlots,
        }
      : undefined,
  };
};
