export interface BlogAuthor {
  id: string;
  name: string;
  type: "member" | "mentor";
}

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "quote"; text: string; cite?: string };

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string;
  contentBlocks: ContentBlock[];
}

export const BLOG_SORT_OPTIONS = ["Newest", "Oldest", "Popular"] as const;

const defaultContent: ContentBlock[] = [
  { type: "paragraph", text: "This article explores key concepts and practical approaches that every developer should know. Whether you're just starting out or looking to level up, there's something here for you." },
  { type: "heading", text: "Why This Matters" },
  { type: "paragraph", text: "In the rapidly evolving tech landscape, staying current with best practices isn't just nice to have — it's essential. The tools and patterns we use today will shape the products of tomorrow." },
  { type: "quote", text: "The best way to learn is by doing. Build something, break it, then build it better.", cite: "A wise developer" },
  { type: "heading", text: "Getting Started" },
  { type: "paragraph", text: "Before diving into the code, let's establish a solid foundation. Understanding the underlying principles will make everything else click into place." },
  { type: "list", items: [
    "Set up your development environment with the latest stable versions",
    "Familiarize yourself with the core documentation",
    "Start with a small project to build confidence",
    "Join the community — ask questions and share what you learn",
  ]},
  { type: "paragraph", text: "Once you have the basics down, you can start exploring more advanced patterns and optimizations. The key is to iterate and keep building." },
  { type: "heading", text: "Practical Tips" },
  { type: "paragraph", text: "Here are some battle-tested tips from real-world projects that will save you time and headaches:" },
  { type: "list", items: [
    "Always write tests for critical paths — your future self will thank you",
    "Use semantic naming conventions for better code readability",
    "Document your decisions, not just your code",
    "Review pull requests thoroughly — it's one of the best learning opportunities",
  ]},
  { type: "image", src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80", alt: "Developer workspace with code on screen" },
  { type: "heading", text: "Wrapping Up" },
  { type: "paragraph", text: "Learning is a continuous journey. The most important thing is to stay curious, keep experimenting, and share your knowledge with others. The tech community thrives when we lift each other up." },
];

const tsContent: ContentBlock[] = [
  { type: "paragraph", text: "TypeScript has become the de facto standard for professional web development. If you're still on the fence about adopting it, this guide will show you why 2026 is the perfect time to make the switch." },
  { type: "heading", text: "Why TypeScript in 2026?" },
  { type: "paragraph", text: "The ecosystem has matured significantly. Every major framework — React, Vue, Svelte, Angular — offers first-class TypeScript support. The developer experience improvements alone justify the learning curve." },
  { type: "quote", text: "TypeScript is JavaScript that scales. Once you go typed, you never go back.", cite: "Anders Hejlsberg" },
  { type: "heading", text: "Setting Up Your Project" },
  { type: "paragraph", text: "Modern tooling makes TypeScript setup almost effortless. Here's what a clean 2026 setup looks like with Vite:" },
  { type: "list", items: [
    "Use Vite's built-in TypeScript template: npm create vite@latest my-app -- --template react-ts",
    "Configure strict mode in tsconfig.json for maximum type safety",
    "Set up path aliases with @/ for cleaner imports",
    "Add ESLint with typescript-eslint for consistent code quality",
  ]},
  { type: "image", src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80", alt: "TypeScript code on a modern IDE" },
  { type: "heading", text: "Essential Patterns" },
  { type: "paragraph", text: "Once your project is set up, these patterns will help you write cleaner, more maintainable TypeScript code:" },
  { type: "list", items: [
    "Use discriminated unions for complex state management",
    "Leverage utility types like Partial, Pick, and Omit",
    "Create branded types for domain-specific values (e.g., UserId, Email)",
    "Use const assertions for literal type inference",
  ]},
  { type: "heading", text: "Common Pitfalls" },
  { type: "paragraph", text: "Even experienced developers fall into these traps. Watch out for overusing 'any', not leveraging generics when you should, and forgetting that type narrowing is your best friend for handling union types safely." },
  { type: "heading", text: "Final Thoughts" },
  { type: "paragraph", text: "TypeScript isn't just about catching bugs — it's about communicating intent. Types are documentation that never goes stale. Invest the time to learn it well, and your code (and your teammates) will thank you." },
];

export const mockBlogs: BlogItem[] = [
  {
    id: "b1",
    title: "Getting Started with TypeScript in 2026: A Modern Guide",
    excerpt: "A comprehensive walkthrough of setting up TypeScript for modern web development, covering tsconfig best practices, ESLint integration, and patterns that will save you hours of debugging.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    tags: ["TypeScript", "Web Development", "Beginner Friendly"],
    author: { id: "u1", name: "Sachini Rathnayake", type: "member" },
    publishedAt: "2026-02-20",
    contentBlocks: tsContent,
  },
  {
    id: "b2",
    title: "Building AI-Powered Developer Tools with GPT APIs",
    excerpt: "How I leveraged GPT APIs to build productivity tools during my final year — from initial idea to a working prototype that helps developers write better documentation.",
    coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    tags: ["AI/ML", "APIs", "Python"],
    author: { id: "m1", name: "Dr. Anika Perera", type: "mentor" },
    publishedAt: "2026-02-15",
    contentBlocks: defaultContent,
  },
  {
    id: "b3",
    title: "5 Lessons from My First Open Source Contribution",
    excerpt: "Contributing to open source can be intimidating. Here are the five key lessons I learned when I submitted my first PR to a React component library with 10k+ stars.",
    coverImage: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80",
    tags: ["Open Source", "React", "Career Advice"],
    author: { id: "u2", name: "Lahiru Gamage", type: "member" },
    publishedAt: "2026-02-10",
    contentBlocks: defaultContent,
  },
  {
    id: "b4",
    title: "Docker for Students: From Zero to Deployment",
    excerpt: "A beginner-friendly guide to containerizing your projects with Docker. Learn images, volumes, and docker-compose through practical examples.",
    coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
    tags: ["Docker", "DevOps", "Beginner Friendly"],
    author: { id: "m2", name: "Prof. Kumara Wijesekara", type: "mentor" },
    publishedAt: "2026-02-05",
    contentBlocks: defaultContent,
  },
  {
    id: "b5",
    title: "Designing for Dark Mode: A Practical CSS Guide",
    excerpt: "Dark mode is more than inverting colors. Learn how to build a robust theming system using CSS custom properties and semantic design tokens.",
    coverImage: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80",
    tags: ["UI/UX", "Web Development", "Figma"],
    author: { id: "u3", name: "Dinusha Karunaratne", type: "member" },
    publishedAt: "2026-01-28",
    contentBlocks: defaultContent,
  },
  {
    id: "b6",
    title: "System Design Interviews: What I Wish I Knew Earlier",
    excerpt: "After 15 interviews, here's my framework for tackling system design questions — covering load balancers, caching, database sharding, and more.",
    coverImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
    tags: ["System Design", "Interviews", "Career Advice"],
    author: { id: "m3", name: "Tharindu Jayasinghe", type: "mentor" },
    publishedAt: "2026-01-22",
    contentBlocks: defaultContent,
  },
  {
    id: "b7",
    title: "Building a Real-Time Chat App with WebSockets and React",
    excerpt: "A step-by-step tutorial on building a fully functional real-time chat application using Socket.io, React, and Node.js with typing indicators.",
    coverImage: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80",
    tags: ["React", "Node.js", "APIs"],
    author: { id: "u4", name: "Isuru Bandara", type: "member" },
    publishedAt: "2026-01-18",
    contentBlocks: defaultContent,
  },
  {
    id: "b8",
    title: "Introduction to Rust for Web Developers",
    excerpt: "Curious about Rust? This post covers ownership, borrowing, and how to build a simple REST API with Actix-web — all from a web developer's perspective.",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910auj0?w=800&q=80",
    tags: ["Rust", "APIs", "Web Development"],
    author: { id: "u5", name: "Kavinda Silva", type: "member" },
    publishedAt: "2026-01-12",
    contentBlocks: defaultContent,
  },
  {
    id: "b9",
    title: "How I Built My Portfolio with Evidence-Based Showcases",
    excerpt: "Learn how I structured my portfolio to demonstrate real skills with evidence — not just screenshots and descriptions, but metrics and outcomes.",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    tags: ["Portfolios", "Career Advice", "UI/UX"],
    author: { id: "u6", name: "Amaya Fernando", type: "member" },
    publishedAt: "2026-01-05",
    contentBlocks: defaultContent,
  },
  {
    id: "b10",
    title: "GraphQL vs REST: When to Use What in 2026",
    excerpt: "A practical comparison of GraphQL and REST APIs, covering performance trade-offs, developer experience, and when each approach shines.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    tags: ["GraphQL", "APIs", "System Design"],
    author: { id: "m4", name: "Nishantha Silva", type: "mentor" },
    publishedAt: "2025-12-28",
    contentBlocks: defaultContent,
  },
  {
    id: "b11",
    title: "Getting Into Cybersecurity as a Student Developer",
    excerpt: "A roadmap for students interested in cybersecurity — from CTF competitions and bug bounties to certifications and career paths.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    tags: ["Cybersecurity", "Career Advice", "Beginner Friendly"],
    author: { id: "m5", name: "Ruwan Bandara", type: "mentor" },
    publishedAt: "2025-12-20",
    contentBlocks: defaultContent,
  },
  {
    id: "b12",
    title: "Why Every Developer Should Learn Figma",
    excerpt: "Figma isn't just for designers. Here's how learning basic Figma skills made me a better frontend developer and improved my team communication.",
    coverImage: "https://images.unsplash.com/photo-1581291518633-83b4eef1d2f1?w=800&q=80",
    tags: ["Figma", "UI/UX", "Productivity"],
    author: { id: "u7", name: "Sanduni Wijesinghe", type: "member" },
    publishedAt: "2025-12-15",
    contentBlocks: defaultContent,
  },
  {
    id: "b13",
    title: "TensorFlow.js: Running ML Models in the Browser",
    excerpt: "Explore how to load pre-trained ML models and run inference directly in the browser using TensorFlow.js — no backend required.",
    coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
    tags: ["AI/ML", "TensorFlow", "Web Development"],
    author: { id: "m1", name: "Dr. Anika Perera", type: "mentor" },
    publishedAt: "2025-12-08",
    contentBlocks: defaultContent,
  },
];
