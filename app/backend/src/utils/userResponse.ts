import { IUser } from "../models/user.model";

export const toUserResponse = (user: IUser) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    isEmailVerified: user.isEmailVerified,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    onboardingStep: user.onboardingStep,
    profile: user.profile
      ? {
          name: user.profile.name,
          bio: user.profile.bio,
          timezone: user.profile.timezone,
          location: user.profile.location,
          preferredRoles: user.profile.preferredRoles,
          skills: user.profile.skills,
          techStack: user.profile.techStack,
          expertiseSkills: user.profile.expertiseSkills,
          links: user.profile.links,
          availabilityHoursPerWeek: user.profile.availabilityHoursPerWeek,
          domainInterests: user.profile.domainInterests,
          avatar: user.profile.avatar,
        }
      : undefined,
  };
};
