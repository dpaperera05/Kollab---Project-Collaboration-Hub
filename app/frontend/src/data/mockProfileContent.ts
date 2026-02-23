// Mock data for profile tabs — session-only, no localStorage

export interface MockApplicant {
  id: string;
  name: string;
  role: string;
  motivation: string;
  links: { github?: string; linkedin?: string };
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface MockOwnedProject {
  id: string;
  title: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
  roles: string[];
  postedAt: string;
  applicants: MockApplicant[];
}

export interface MockJoinedProject {
  id: string;
  title: string;
  owner: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
  role: string;
}

export interface MockBooking {
  id: string;
  mentorId?: string;
  mentorName?: string;
  memberId?: string;
  memberName?: string;
  date: string;
  time: string;
  agenda: string;
  summary: string;
  notes: string;
  status: "Pending" | "Accepted" | "Rejected";
  rejectionReason?: string;
}

export interface MockBlog {
  id: string;
  title: string;
  coverImage: string;
  excerpt: string;
  content: string;
  createdAt: string;
}

export interface MockEvent {
  id: string;
  title: string;
  coverImage: string;
  type: "Hackathon" | "Talk" | "Workshop" | "Webinar";
  dateTime: string; // ISO UTC
  location: string;
  tags: string[];
  externalLink: string;
  postedBy: string;
  description: string;
}

export interface MockChat {
  id: string;
  participantName: string;
  messages: { id: string; senderId: "me" | "them"; text: string; timestamp: string }[];
}

// ── Owned Projects ──────────────────────────────────────
export const mockOwnedProjects: MockOwnedProject[] = [
  {
    id: "op1", title: "AI Resume Builder", status: "Open", roles: ["Frontend Dev", "ML Engineer"], postedAt: "2025-12-01",
    applicants: [
      { id: "a1", name: "Nimal Perera", role: "Frontend Dev", motivation: "Passionate about React and AI-driven interfaces. Have built 3 similar tools.", links: { github: "https://github.com/nimal", linkedin: "https://linkedin.com/in/nimal" }, status: "pending" },
      { id: "a2", name: "Kavinda Silva", role: "ML Engineer", motivation: "ML research background with NLP focus. Keen to apply transformers to resume parsing.", links: { github: "https://github.com/kavinda" }, status: "pending" },
      { id: "a3", name: "Amaya Fernando", role: "Frontend Dev", motivation: "2 years of production React experience. Love clean UI/UX.", links: { linkedin: "https://linkedin.com/in/amaya" }, status: "pending" },
    ],
  },
  {
    id: "op2", title: "Campus Event Tracker", status: "Ongoing", roles: ["Backend Dev", "Designer"], postedAt: "2025-11-15",
    applicants: [
      { id: "a4", name: "Dilan Jayawardena", role: "Designer", motivation: "UI/UX designer with Figma expertise.", links: { linkedin: "https://linkedin.com/in/dilan" }, status: "approved" },
    ],
  },
  {
    id: "op3", title: "Peer Code Review Platform", status: "Filled", roles: ["Full Stack"], postedAt: "2025-10-20",
    applicants: [],
  },
];

// ── Joined Projects ──────────────────────────────────────
export const mockJoinedProjects: MockJoinedProject[] = [
  { id: "jp1", title: "Smart Library System", owner: "Ruwan Bandara", status: "Ongoing", role: "Backend Dev" },
  { id: "jp2", title: "Fitness Tracker App", owner: "Sanduni Wijesinghe", status: "Open", role: "UI Designer" },
];

// ── Member Bookings ──────────────────────────────────────
export const mockBookingsMember: MockBooking[] = [
  { id: "bm1", mentorId: "m1", mentorName: "Dr. Anika Perera", date: "2026-03-05", time: "10:00 AM", agenda: "Portfolio review", summary: "Need feedback on my project showcases before job applications.", notes: "", status: "Accepted" },
  { id: "bm2", mentorId: "m3", mentorName: "Tharindu Jayasinghe", date: "2026-03-10", time: "2:00 PM", agenda: "Career guidance", summary: "Transitioning from backend to full-stack. Need roadmap advice.", notes: "Interested in React ecosystem.", status: "Pending" },
  { id: "bm3", mentorId: "m5", mentorName: "Nishantha Silva", date: "2025-12-20", time: "4:00 PM", agenda: "Mock interview", summary: "Preparing for senior dev interviews.", notes: "", status: "Rejected" },
  { id: "bm4", mentorId: "m2", mentorName: "Prof. Kumara Wijesekara", date: "2025-11-15", time: "11:00 AM", agenda: "Research discussion", summary: "Discuss potential for AI thesis topic.", notes: "", status: "Accepted" },
];

// ── Mentor Bookings ──────────────────────────────────────
export const mockBookingsMentor: MockBooking[] = [
  { id: "bt1", memberId: "u1", memberName: "Sachini Rathnayake", date: "2026-03-08", time: "10:00 AM", agenda: "React project help", summary: "Building a dashboard and stuck on state management patterns.", notes: "Has used Redux before.", status: "Pending" },
  { id: "bt2", memberId: "u2", memberName: "Lahiru Gamage", date: "2026-03-12", time: "3:00 PM", agenda: "Career pivot advice", summary: "Switching from QA to DevOps. Needs learning path.", notes: "", status: "Pending" },
  { id: "bt3", memberId: "u3", memberName: "Dinusha Karunaratne", date: "2026-02-28", time: "1:00 PM", agenda: "Code review", summary: "Review REST API project before deployment.", notes: "", status: "Accepted" },
  { id: "bt4", memberId: "u4", memberName: "Isuru Bandara", date: "2025-12-10", time: "9:00 AM", agenda: "Portfolio feedback", summary: "Get feedback on portfolio site design.", notes: "", status: "Rejected", rejectionReason: "Schedule conflict — please rebook for January." },
];

// ── Blogs ──────────────────────────────────────
export const mockBlogs: MockBlog[] = [
  { id: "b1", title: "Getting Started with TypeScript in 2026", coverImage: "", excerpt: "A comprehensive guide to setting up TypeScript for modern web development...", content: "TypeScript has become the standard for professional web development. In this guide, we'll walk through setting up a modern TypeScript project from scratch, covering tsconfig best practices, ESLint integration, and common patterns that will save you hours of debugging.", createdAt: "2026-01-15" },
  { id: "b2", title: "My Journey Building AI-Powered Tools", coverImage: "", excerpt: "How I leveraged GPT APIs to build productivity tools during my final year...", content: "During my final year at university, I decided to explore the intersection of AI and developer tooling. This blog documents my journey from initial idea to a working prototype that helps developers write better documentation using GPT-4.", createdAt: "2026-02-01" },
  { id: "b3", title: "5 Lessons from My First Open Source Contribution", coverImage: "", excerpt: "What I learned contributing to a popular React library for the first time...", content: "Contributing to open source can be intimidating. Here are the five key lessons I learned when I submitted my first PR to a React component library with over 10k GitHub stars.", createdAt: "2025-12-20" },
];

// ── Events ──────────────────────────────────────
export const mockEvents: MockEvent[] = [
  { id: "e1", title: "React Sri Lanka Meetup #12", coverImage: "", type: "Talk", dateTime: "2026-03-20T14:00:00Z", location: "Virtual", tags: ["React", "Frontend", "Community"], externalLink: "https://meetup.com/react-sl", postedBy: "You", description: "Monthly community meetup for React developers in Sri Lanka." },
  { id: "e2", title: "HackForGood 2026", coverImage: "", type: "Hackathon", dateTime: "2026-04-10T08:00:00Z", location: "Colombo, Sri Lanka", tags: ["Hackathon", "Social Impact", "AI"], externalLink: "https://hackforgood.lk", postedBy: "You", description: "A 48-hour hackathon focused on building technology solutions for social good." },
  { id: "e3", title: "Intro to Docker Workshop", coverImage: "", type: "Workshop", dateTime: "2026-02-15T10:00:00Z", location: "Virtual", tags: ["Docker", "DevOps", "Beginner"], externalLink: "", postedBy: "You", description: "Hands-on workshop covering Docker fundamentals." },
];

// ── Chats ──────────────────────────────────────
export const mockChats: MockChat[] = [
  {
    id: "c1", participantName: "Ruwan Bandara",
    messages: [
      { id: "m1", senderId: "them", text: "Hey! Are you available for the sprint planning tomorrow?", timestamp: "2026-02-20T09:00:00Z" },
      { id: "m2", senderId: "me", text: "Yes, I'll be there. What time works?", timestamp: "2026-02-20T09:05:00Z" },
      { id: "m3", senderId: "them", text: "Let's do 10 AM. I'll send a calendar invite.", timestamp: "2026-02-20T09:08:00Z" },
    ],
  },
  {
    id: "c2", participantName: "Sanduni Wijesinghe",
    messages: [
      { id: "m4", senderId: "them", text: "The new design mockups are ready for review.", timestamp: "2026-02-19T15:00:00Z" },
      { id: "m5", senderId: "me", text: "Great! I'll check them tonight and leave feedback.", timestamp: "2026-02-19T15:30:00Z" },
    ],
  },
  {
    id: "c3", participantName: "Dr. Anika Perera",
    messages: [
      { id: "m6", senderId: "me", text: "Thank you for the session yesterday! Very helpful.", timestamp: "2026-02-18T17:00:00Z" },
      { id: "m7", senderId: "them", text: "Glad to help! Don't hesitate to reach out if you need more guidance.", timestamp: "2026-02-18T18:00:00Z" },
    ],
  },
];

// ── Event tag suggestions ──────────────────────────────────────
export const EVENT_TAG_OPTIONS = [
  "React", "TypeScript", "AI", "ML", "Python", "DevOps", "Cloud", "Docker",
  "Frontend", "Backend", "Full Stack", "Mobile", "Web3", "Blockchain", "IoT",
  "Cybersecurity", "Data Science", "UI/UX", "Community", "Networking",
  "Career", "Hackathon", "Social Impact", "Open Source", "Beginner",
];
