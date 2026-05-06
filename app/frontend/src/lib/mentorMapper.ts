import type { Mentor } from "@/types/mentor";
import type { KollabUser } from "@/lib/authStore";

export const formatSlot = (slot: { date: string; startTime: string; endTime: string; timezone?: string }) => {
  const dateStr = slot.date ? new Date(slot.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : slot.date;
  return `${dateStr} · ${slot.startTime} - ${slot.endTime}${slot.timezone ? ` (${slot.timezone})` : ""}`;
};

/**
 * Maps a KollabUser (from the normal listing or smart search endpoint) to a Mentor.
 * Smart search results extend KollabUser with smartScore and searchReasons at the
 * top level — these are passed through when present.
 */
export const mapUserToMentor = (user: KollabUser & { smartScore?: number; searchReasons?: string[] }): Mentor => {
  const profile = user.profile || {};
  const availabilitySlots = (profile as any).availabilitySlots as Mentor["availabilitySlots"];
  const avatarName = profile.name || user.name || "M";
  const rawLinks = ((profile as any).links || {}) as Record<string, unknown>;
  const links: Mentor["links"] | undefined = {
    github:
      (typeof rawLinks.github === "string" && rawLinks.github.trim()) ||
      ((profile as any).github as string | undefined),
    linkedin:
      (typeof rawLinks.linkedin === "string" && rawLinks.linkedin.trim()) ||
      (typeof rawLinks.linkedIn === "string" && rawLinks.linkedIn.trim()) ||
      ((profile as any).linkedin as string | undefined) ||
      ((profile as any).linkedIn as string | undefined),
    portfolio:
      (typeof rawLinks.portfolio === "string" && rawLinks.portfolio.trim()) ||
      ((profile as any).portfolio as string | undefined) ||
      ((profile as any).portfolioUrl as string | undefined),
  };
  const hasAnyLink = Boolean(links.github || links.linkedin || links.portfolio);

  return {
    id: user.id,
    name: profile.name || user.name || "Mentor",
    email: user.email,
    avatar: avatarName.charAt(0),
    avatarUrl: (profile as any).avatarUrl,
    headline: (profile as any).headline || "Mentor",
    location: (profile as any).location,
    timezone: (profile as any).timezone,
    expertiseTags: profile.expertiseSkills || profile.skills || [],
    domainTags: profile.domainInterests || [],
    languages: (profile as any).languages || [],
    links: hasAnyLink ? links : undefined,
    rating: 5,
    reviewsCount: 0,
    rate: profile.rateType === "paid" ? (profile.rateNote || "Paid session") : "Free",
    timeSlots: availabilitySlots?.map((s) => formatSlot(s)) || [],
    availabilitySlots: availabilitySlots || [],
    bio: profile.bio || "This mentor hasn't added a bio yet.",
    reviews: [],
    smartScore: user.smartScore,
    searchReasons: user.searchReasons,
  };
};
