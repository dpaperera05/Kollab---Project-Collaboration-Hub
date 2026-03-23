export interface EventItem {
  id: string;
  title: string;
  type: "Hackathon" | "Workshop" | "Talk" | "Webinar";
  coverImage: string;
  startDateTimeUTC: string;
  locationType: "Virtual" | "City";
  city?: string;
  tags: string[];
  daysLeft: number;
  externalUrl: string;
  featured?: boolean;
  description: string;
}

// Mock data removed; events now come from backend API.

export const EVENT_TYPES = ["Hackathon", "Workshop", "Talk", "Webinar"] as const;
export const EVENT_TAGS = [
  "AI", "Machine Learning", "React", "TypeScript", "Python", "DevOps", "Docker",
  "Blockchain", "Web3", "UX", "Design", "Cybersecurity", "Data Engineering",
  "Mobile Dev", "Open Source", "Career", "Leadership", "Agile", "Cloud",
  "Frontend", "Web Dev", "Research", "Beginner-friendly", "Networking",
];
export const EVENT_LOCATIONS = ["Virtual", "City"] as const;
export const EVENT_SORT = ["Newest", "Soonest", "Furthest"] as const;
