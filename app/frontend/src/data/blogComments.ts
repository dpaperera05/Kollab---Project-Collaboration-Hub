export interface BlogComment {
  id: string;
  blogId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export const mockBlogComments: BlogComment[] = [
  { id: "c1", blogId: "b1", authorName: "Dilan Jayawardena", text: "Great introduction! The section on discriminated unions was exactly what I needed. I've been struggling with complex state types in my project.", createdAt: "2026-02-21T10:30:00Z" },
  { id: "c2", blogId: "b1", authorName: "Amaya Fernando", text: "The path alias tip saved me so much time. Clean imports make such a difference in readability.", createdAt: "2026-02-21T14:15:00Z" },
  { id: "c3", blogId: "b1", authorName: "Kavinda Silva", text: "Would love to see a follow-up on advanced generics and conditional types!", createdAt: "2026-02-22T09:00:00Z" },
  { id: "c4", blogId: "b2", authorName: "Lahiru Gamage", text: "This is inspiring! I'm working on a similar tool for code comments. Any tips on prompt engineering for developer-facing tools?", createdAt: "2026-02-16T08:45:00Z" },
  { id: "c5", blogId: "b2", authorName: "Isuru Bandara", text: "The prototype looks amazing. Would be great to see a video walkthrough of the tool in action.", createdAt: "2026-02-17T11:20:00Z" },
  { id: "c6", blogId: "b3", authorName: "Sachini Rathnayake", text: "Lesson #3 about reading existing code before writing new code really resonated with me. That's how I learned React patterns.", createdAt: "2026-02-11T16:00:00Z" },
  { id: "c7", blogId: "b3", authorName: "Sanduni Wijesinghe", text: "Thank you for sharing! This gave me the confidence to submit my first PR this week.", createdAt: "2026-02-12T10:30:00Z" },
  { id: "c8", blogId: "b4", authorName: "Nimal Perera", text: "The docker-compose example for a full-stack app was super helpful. Finally got my dev environment reproducible!", createdAt: "2026-02-06T13:00:00Z" },
  { id: "c9", blogId: "b5", authorName: "Tharindu Jayasinghe", text: "Semantic design tokens are the way to go. Great explanation of the HSL approach.", createdAt: "2026-01-29T09:30:00Z" },
  { id: "c10", blogId: "b6", authorName: "Dinusha Karunaratne", text: "The framework for approaching system design questions is gold. Wish I had this before my last interview!", createdAt: "2026-01-23T15:00:00Z" },
  { id: "c11", blogId: "b6", authorName: "Lahiru Gamage", text: "Could you do a deep dive on database sharding strategies? That's where I always get stuck.", createdAt: "2026-01-24T08:20:00Z" },
];
