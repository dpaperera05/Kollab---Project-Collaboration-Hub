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

export const mockEvents: EventItem[] = [
  {
    id: "ev1",
    title: "AI Innovation Hackathon 2026",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-15T09:00:00Z",
    locationType: "City",
    city: "San Francisco, CA",
    tags: ["AI", "Machine Learning", "Python", "TensorFlow", "Innovation"],
    daysLeft: 19,
    externalUrl: "https://example.com/ai-hackathon",
    featured: true,
    description: "48-hour hackathon focused on building AI-powered solutions for real-world problems.",
  },
  {
    id: "ev2",
    title: "React Advanced Patterns Workshop",
    type: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-08T14:00:00Z",
    locationType: "Virtual",
    tags: ["React", "TypeScript", "Frontend", "Web Dev"],
    daysLeft: 12,
    externalUrl: "https://example.com/react-workshop",
    description: "Deep dive into advanced React patterns including compound components, render props, and hooks.",
  },
  {
    id: "ev3",
    title: "The Future of Quantum Computing",
    type: "Talk",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-05T18:00:00Z",
    locationType: "Virtual",
    tags: ["Quantum Computing", "Research", "Physics"],
    daysLeft: 9,
    externalUrl: "https://example.com/quantum-talk",
    description: "An expert panel discussion on the latest breakthroughs in quantum computing.",
  },
  {
    id: "ev4",
    title: "DevOps & Cloud Infrastructure Bootcamp",
    type: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-20T10:00:00Z",
    locationType: "City",
    city: "Austin, TX",
    tags: ["DevOps", "AWS", "Docker", "Kubernetes", "CI/CD"],
    daysLeft: 24,
    externalUrl: "https://example.com/devops-bootcamp",
    featured: true,
    description: "Hands-on bootcamp covering modern DevOps practices and cloud infrastructure.",
  },
  {
    id: "ev5",
    title: "Women in Tech Leadership Summit",
    type: "Webinar",
    coverImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-12T16:00:00Z",
    locationType: "Virtual",
    tags: ["Leadership", "Diversity", "Career", "Networking"],
    daysLeft: 16,
    externalUrl: "https://example.com/wit-summit",
    description: "Join industry leaders discussing pathways to leadership in technology.",
  },
  {
    id: "ev6",
    title: "Blockchain & Web3 Buildathon",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-04-01T08:00:00Z",
    locationType: "City",
    city: "Miami, FL",
    tags: ["Blockchain", "Web3", "Solidity", "DeFi", "Smart Contracts"],
    daysLeft: 36,
    externalUrl: "https://example.com/web3-buildathon",
    description: "Build decentralized applications and compete for prizes in this 3-day event.",
  },
  {
    id: "ev7",
    title: "UX Research Methods Masterclass",
    type: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-10T13:00:00Z",
    locationType: "Virtual",
    tags: ["UX", "Research", "Design", "Figma", "User Testing"],
    daysLeft: 14,
    externalUrl: "https://example.com/ux-masterclass",
    description: "Learn practical UX research techniques from seasoned professionals.",
  },
  {
    id: "ev8",
    title: "Cybersecurity Capture the Flag",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-22T12:00:00Z",
    locationType: "Virtual",
    tags: ["Cybersecurity", "CTF", "Networking", "Linux", "Ethical Hacking"],
    daysLeft: 26,
    externalUrl: "https://example.com/ctf-event",
    featured: true,
    description: "Test your cybersecurity skills in this competitive capture-the-flag challenge.",
  },
  {
    id: "ev9",
    title: "Data Engineering with Apache Spark",
    type: "Webinar",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-07T17:00:00Z",
    locationType: "Virtual",
    tags: ["Data Engineering", "Apache Spark", "Big Data", "Python"],
    daysLeft: 11,
    externalUrl: "https://example.com/spark-webinar",
    description: "An introduction to building scalable data pipelines with Apache Spark.",
  },
  {
    id: "ev10",
    title: "Mobile App Dev: Flutter vs React Native",
    type: "Talk",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-18T19:00:00Z",
    locationType: "City",
    city: "New York, NY",
    tags: ["Mobile Dev", "Flutter", "React Native", "Cross-Platform"],
    daysLeft: 22,
    externalUrl: "https://example.com/mobile-talk",
    description: "A head-to-head comparison of the two leading cross-platform frameworks.",
  },
  {
    id: "ev11",
    title: "Open Source Contribution Sprint",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-04-05T10:00:00Z",
    locationType: "Virtual",
    tags: ["Open Source", "Git", "GitHub", "Community", "Beginner-friendly"],
    daysLeft: 40,
    externalUrl: "https://example.com/oss-sprint",
    description: "Contribute to popular open source projects with mentorship and guidance.",
  },
  {
    id: "ev12",
    title: "Product Management Essentials",
    type: "Webinar",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    startDateTimeUTC: "2026-03-25T15:00:00Z",
    locationType: "Virtual",
    tags: ["Product Management", "Agile", "Strategy", "Career"],
    daysLeft: 29,
    externalUrl: "https://example.com/pm-webinar",
    description: "Learn the fundamentals of product management from experienced PMs.",
  },
];

export const EVENT_TYPES = ["Hackathon", "Workshop", "Talk", "Webinar"] as const;
export const EVENT_TAGS = [
  "AI", "Machine Learning", "React", "TypeScript", "Python", "DevOps", "Docker",
  "Blockchain", "Web3", "UX", "Design", "Cybersecurity", "Data Engineering",
  "Mobile Dev", "Open Source", "Career", "Leadership", "Agile", "Cloud",
  "Frontend", "Web Dev", "Research", "Beginner-friendly", "Networking",
];
export const EVENT_LOCATIONS = ["Virtual", "City"] as const;
export const EVENT_SORT = ["Newest", "Soonest", "Furthest"] as const;
