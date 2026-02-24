// Workspace mock data — projects, members, chats, tasks

export interface WorkspaceMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOwner?: boolean;
}

export interface WorkspaceChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string; // ISO
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null; // member id or null
  status: "todo" | "in-progress" | "done";
}

export interface WorkspaceProject {
  id: string;
  title: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
  domain: string[];
  members: WorkspaceMember[];
  chatMessages: WorkspaceChatMessage[];
  tasks: WorkspaceTask[];
}

const now = new Date();
const today = (h: number, m: number) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const yesterday = (h: number, m: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const daysAgo = (days: number, h: number, m: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const membersA: WorkspaceMember[] = [
  { id: "u-owner", name: "You", avatar: "", role: "Project Owner", isOwner: true },
  { id: "u1", name: "Nimal Perera", avatar: "", role: "Frontend Dev" },
  { id: "u2", name: "Kavinda Silva", avatar: "", role: "ML Engineer" },
  { id: "u3", name: "Amaya Fernando", avatar: "", role: "Frontend Dev" },
  { id: "u4", name: "Dilan Jayawardena", avatar: "", role: "Designer" },
];

const membersB: WorkspaceMember[] = [
  { id: "u-owner", name: "You", avatar: "", role: "Project Owner", isOwner: true },
  { id: "u5", name: "Ruwan Bandara", avatar: "", role: "Backend Dev" },
  { id: "u6", name: "Sanduni Wijesinghe", avatar: "", role: "UI Designer" },
  { id: "u7", name: "Lahiru Gamage", avatar: "", role: "Full Stack" },
];

const membersC: WorkspaceMember[] = [
  { id: "u-owner", name: "You", avatar: "", role: "Project Owner", isOwner: true },
  { id: "u8", name: "Sachini Rathnayake", avatar: "", role: "Backend Dev" },
  { id: "u9", name: "Dinusha Karunaratne", avatar: "", role: "DevOps" },
  { id: "u10", name: "Isuru Bandara", avatar: "", role: "Frontend Dev" },
  { id: "u11", name: "Tharindu Wijeratne", avatar: "", role: "QA Engineer" },
  { id: "u12", name: "Malini Senanayake", avatar: "", role: "Designer" },
];

export const workspaceProjects: WorkspaceProject[] = [
  {
    id: "op1",
    title: "AI Resume Builder",
    status: "Open",
    domain: ["AI/ML", "Web Dev"],
    members: membersA,
    chatMessages: [
      { id: "cm1", senderId: "u1", senderName: "Nimal Perera", senderAvatar: "", text: "Hey team! I've set up the Vite project. Check the repo.", timestamp: daysAgo(2, 10, 0) },
      { id: "cm2", senderId: "u2", senderName: "Kavinda Silva", senderAvatar: "", text: "Nice work! I'll start on the ML pipeline today.", timestamp: daysAgo(2, 10, 15) },
      { id: "cm3", senderId: "u-owner", senderName: "You", senderAvatar: "", text: "Great progress everyone. Let's sync at 3 PM.", timestamp: daysAgo(2, 11, 0) },
      { id: "cm4", senderId: "u4", senderName: "Dilan Jayawardena", senderAvatar: "", text: "I've uploaded the first design mockups to Figma.", timestamp: yesterday(9, 30) },
      { id: "cm5", senderId: "u3", senderName: "Amaya Fernando", senderAvatar: "", text: "The mockups look great! I'll start implementing the landing page.", timestamp: yesterday(10, 0) },
      { id: "cm6", senderId: "u1", senderName: "Nimal Perera", senderAvatar: "", text: "Can someone review my PR for the auth module?", timestamp: today(9, 0) },
      { id: "cm7", senderId: "u-owner", senderName: "You", senderAvatar: "", text: "I'll review it after lunch. Let's also discuss the API schema.", timestamp: today(9, 15) },
      { id: "cm8", senderId: "u2", senderName: "Kavinda Silva", senderAvatar: "", text: "The resume parser is working with basic templates now 🎉", timestamp: today(11, 30) },
    ],
    tasks: [
      { id: "t1", title: "Set up project repository", description: "Initialize Vite + React project with TypeScript and Tailwind.", assignedTo: "u1", status: "done" },
      { id: "t2", title: "Design system setup", description: "Create base components and color tokens.", assignedTo: "u4", status: "done" },
      { id: "t3", title: "Build resume parser", description: "Implement NLP pipeline for parsing resume PDFs.", assignedTo: "u2", status: "in-progress" },
      { id: "t4", title: "Auth module", description: "JWT-based authentication with login and register.", assignedTo: "u1", status: "in-progress" },
      { id: "t5", title: "Landing page UI", description: "Implement hero section, features, and CTA.", assignedTo: "u3", status: "in-progress" },
      { id: "t6", title: "Resume template editor", description: "Drag-and-drop template customization.", assignedTo: null, status: "todo" },
      { id: "t7", title: "PDF export", description: "Generate downloadable PDF from resume data.", assignedTo: null, status: "todo" },
      { id: "t8", title: "User dashboard", description: "Dashboard showing saved resumes and history.", assignedTo: "u3", status: "todo" },
    ],
  },
  {
    id: "op2",
    title: "Campus Event Tracker",
    status: "Ongoing",
    domain: ["Web Dev", "Mobile"],
    members: membersB,
    chatMessages: [
      { id: "cm10", senderId: "u5", senderName: "Ruwan Bandara", senderAvatar: "", text: "API endpoints for events CRUD are ready.", timestamp: yesterday(14, 0) },
      { id: "cm11", senderId: "u6", senderName: "Sanduni Wijesinghe", senderAvatar: "", text: "I'll wire up the frontend to those endpoints today.", timestamp: yesterday(14, 30) },
      { id: "cm12", senderId: "u-owner", senderName: "You", senderAvatar: "", text: "Don't forget to add filtering by date and category.", timestamp: today(8, 0) },
      { id: "cm13", senderId: "u7", senderName: "Lahiru Gamage", senderAvatar: "", text: "Working on the notification service. Should be done by EOD.", timestamp: today(10, 0) },
    ],
    tasks: [
      { id: "t10", title: "Events API", description: "REST endpoints for CRUD operations on events.", assignedTo: "u5", status: "done" },
      { id: "t11", title: "Event list page", description: "Display upcoming events with filters.", assignedTo: "u6", status: "in-progress" },
      { id: "t12", title: "Notification service", description: "Push notifications for upcoming events.", assignedTo: "u7", status: "in-progress" },
      { id: "t13", title: "Calendar integration", description: "Sync events with Google Calendar.", assignedTo: null, status: "todo" },
      { id: "t14", title: "Event detail page", description: "Detail view with RSVP and sharing.", assignedTo: "u6", status: "todo" },
      { id: "t15", title: "Admin panel", description: "Manage and approve submitted events.", assignedTo: "u5", status: "todo" },
    ],
  },
  {
    id: "op3",
    title: "Peer Code Review Platform",
    status: "Filled",
    domain: ["DevOps", "Education"],
    members: membersC,
    chatMessages: [
      { id: "cm20", senderId: "u8", senderName: "Sachini Rathnayake", senderAvatar: "", text: "Backend for submission queue is deployed.", timestamp: daysAgo(3, 16, 0) },
      { id: "cm21", senderId: "u9", senderName: "Dinusha Karunaratne", senderAvatar: "", text: "CI/CD pipeline is green ✅", timestamp: daysAgo(2, 9, 0) },
      { id: "cm22", senderId: "u10", senderName: "Isuru Bandara", senderAvatar: "", text: "Code diff viewer component is looking solid.", timestamp: yesterday(11, 0) },
      { id: "cm23", senderId: "u11", senderName: "Tharindu Wijeratne", senderAvatar: "", text: "I've written test cases for the review workflow.", timestamp: yesterday(15, 0) },
      { id: "cm24", senderId: "u12", senderName: "Malini Senanayake", senderAvatar: "", text: "Updated the badge system design. Check Figma.", timestamp: today(9, 45) },
      { id: "cm25", senderId: "u-owner", senderName: "You", senderAvatar: "", text: "Looks great team! Let's aim for beta launch next week.", timestamp: today(10, 0) },
    ],
    tasks: [
      { id: "t20", title: "Submission queue backend", description: "Queue system for code submissions.", assignedTo: "u8", status: "done" },
      { id: "t21", title: "CI/CD pipeline", description: "Automated testing and deployment.", assignedTo: "u9", status: "done" },
      { id: "t22", title: "Code diff viewer", description: "Side-by-side code comparison component.", assignedTo: "u10", status: "done" },
      { id: "t23", title: "Review workflow tests", description: "End-to-end tests for review process.", assignedTo: "u11", status: "in-progress" },
      { id: "t24", title: "Badge system UI", description: "Gamification badges for reviewers.", assignedTo: "u12", status: "in-progress" },
      { id: "t25", title: "Feedback analytics", description: "Dashboard for review quality metrics.", assignedTo: null, status: "todo" },
      { id: "t26", title: "Mobile responsive pass", description: "Ensure all views work on mobile.", assignedTo: "u10", status: "todo" },
    ],
  },
];

export function getWorkspaceProject(id: string): WorkspaceProject | undefined {
  return workspaceProjects.find((p) => p.id === id);
}
