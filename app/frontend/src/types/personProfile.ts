export interface PinnedShowcase {
  id: string;
  title: string;
  summary: string;
  techStack: string[];
  tags: string[];
  coverImage?: string;
}

export interface ActivityItem {
  id: string;
  type: "showcase" | "project" | "simulation" | "badge";
  text: string;
  date: string;
}

export interface PersonProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  headline?: string;
  preferredRoles: string[];
  skills: string[];
  techStack: string[];
  domainInterests: string[];
  availabilityHoursPerWeek: number;
  isProfilePublic: boolean;
  stats: {
    projectsCount: number;
    showcasesCount: number;
  };
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  skillEvidenceScores?: Record<string, number>;
  pinnedShowcases?: PinnedShowcase[];
  activity?: ActivityItem[];
}
