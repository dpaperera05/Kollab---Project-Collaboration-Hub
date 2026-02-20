// ============= Full file contents =============

export type ProjectStatus = "Open" | "Ongoing" | "Filled" | "Finished";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Domain =
  | "AI & ML"
  | "Software Engineering"
  | "Robotics"
  | "IoT"
  | "Data Science"
  | "Cybersecurity"
  | "Web Dev"
  | "Mobile Dev";
export type RoleType = "Developer" | "Designer" | "Data Analyst" | "DevOps" | "PM" | "Researcher";
export type Duration = "short-term" | "long-term";
export type Location = "Remote" | "Hybrid" | "On-site";
export type Compensation = "None" | "Paid" | "Symbolic";
export type ProjectType = "Real-world" | "Coursework" | "Hackathon" | "Practice";

export interface ProjectRole {
  title: string;
  level: "Junior" | "Intermediate" | "Senior";
  skills: string[];
  niceToHave?: string[];
  responsibilities: string[];
  filled: number;
  total: number;
  status: "Open" | "Filled";
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface ProjectOwner {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  title: string;
  projectsPosted: number;
}

export interface Project {
  id: string;
  title: string;
  // Legacy fields kept for backward compatibility
  posterAvatar: string;
  posterName: string;
  posterRating: number;
  // Extended owner
  owner: ProjectOwner;
  domain: Domain;
  difficulty: Difficulty;
  status: ProjectStatus;
  projectType: ProjectType;
  summary: string;
  description: string;
  problemStatement: string;
  deliverables: string[];
  duration: Duration;
  timeCommitment: string;
  technologies: string[];
  location: Location;
  compensation: Compensation;
  roles: ProjectRole[];
  teamMembers: TeamMember[];
  relatedProjectIds: string[];
  mentorLinked: boolean;
  postedAt: string; // ISO date string
  tags: string[];
  posterImage: string;
}

// Poster image map by domain
const POSTER_MAP: Record<string, string> = {
  "1": "/src/assets/posters/poster-resume-ai.jpg",
  "2": "/src/assets/posters/poster-iot.jpg",
  "3": "/src/assets/posters/poster-code-review.jpg",
  "4": "/src/assets/posters/poster-robot-delivery.jpg",
  "5": "/src/assets/posters/poster-job-market.jpg",
  "6": "/src/assets/posters/poster-cybersecurity.jpg",
  "7": "/src/assets/posters/poster-elearning.jpg",
  "8": "/src/assets/posters/poster-blockchain.jpg",
  "9": "/src/assets/posters/poster-ar-campus.jpg",
  "10": "/src/assets/posters/poster-ai-sentiment.jpg",
  "11": "/src/assets/posters/poster-healthcare.jpg",
  "12": "/src/assets/posters/poster-robotics.jpg",
};

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI-Powered Resume Analyzer",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
    posterName: "Aria Chen",
    posterRating: 4.8,
    owner: {
      id: "owner-1",
      name: "Aria Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
      rating: 4.8,
      title: "ML Engineer & Founder",
      projectsPosted: 3,
    },
    domain: "AI & ML",
    difficulty: "Intermediate",
    status: "Open",
    projectType: "Real-world",
    summary:
      "Build a tool that parses resumes and suggests improvements based on job descriptions using NLP.",
    description:
      "This project aims to build a full-stack AI-powered resume analysis tool. Users upload a resume (PDF/DOCX), paste a target job description, and receive a structured analysis: missing keywords, tone suggestions, section rewrites, and an overall match score. The system will use OpenAI's API for language understanding and FastAPI for the backend, with a React frontend for the user interface. This is a real-world portfolio piece that directly targets the career-tech space.",
    problemStatement:
      "Students struggle to tailor resumes for specific roles, leading to low callback rates. Most resume advice is generic and not aligned with actual job postings. There's a need for a tool that uses job description parsing to give targeted, actionable feedback.",
    deliverables: [
      "Resume parsing module (PDF/DOCX support)",
      "Job description comparison engine with keyword matching",
      "AI-generated improvement suggestions per resume section",
      "Match score dashboard with visual breakdown",
      "User-facing React frontend with file upload & results view",
      "Deployed API with FastAPI (Docker-ready)",
    ],
    duration: "short-term",
    timeCommitment: "6–8 hrs/week",
    technologies: ["Python", "FastAPI", "React", "OpenAI", "TailwindCSS"],
    location: "Remote",
    compensation: "None",
    roles: [
      {
        title: "ML Engineer",
        level: "Intermediate",
        skills: ["Python", "NLP", "OpenAI API"],
        niceToHave: ["LangChain", "spaCy"],
        responsibilities: [
          "Build the resume parsing pipeline (PDF/DOCX → structured JSON)",
          "Integrate OpenAI API for section-level improvement suggestions",
          "Implement keyword matching logic against job descriptions",
        ],
        filled: 1,
        total: 2,
        status: "Open",
      },
      {
        title: "Frontend Developer",
        level: "Junior",
        skills: ["React", "TailwindCSS", "TypeScript"],
        niceToHave: ["Framer Motion", "React Hook Form"],
        responsibilities: [
          "Build the file upload and results dashboard UI",
          "Integrate with FastAPI REST endpoints",
          "Ensure responsive design across devices",
        ],
        filled: 0,
        total: 1,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-1", name: "Aria Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria", role: "ML Engineer" },
      { id: "tm-2", name: "Kai Park", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai", role: "Backend Dev" },
    ],
    relatedProjectIds: ["5", "10", "11"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["AI", "Career-Tech", "Beginner-friendly"],
    posterImage: POSTER_MAP["1"],
  },
  {
    id: "2",
    title: "Smart Campus IoT Dashboard",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi",
    posterName: "Ravi Kumar",
    posterRating: 4.5,
    owner: {
      id: "owner-2",
      name: "Ravi Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi",
      rating: 4.5,
      title: "IoT Systems Engineer",
      projectsPosted: 2,
    },
    domain: "IoT",
    difficulty: "Intermediate",
    status: "Ongoing",
    projectType: "Real-world",
    summary:
      "Real-time dashboard aggregating sensor data from campus devices — temperature, energy, occupancy.",
    description:
      "The Smart Campus IoT Dashboard connects to dozens of IoT sensors deployed across a university campus — measuring temperature, energy consumption, room occupancy, and air quality. Data is streamed via MQTT into InfluxDB, then visualized through a custom React dashboard using Grafana-like charts. The goal is to give campus administrators a single pane of glass for real-time and historical operational data.",
    problemStatement:
      "Campus administrators lack centralized monitoring for energy and space usage, leading to wasted resources and poor scheduling decisions. Siloed sensor systems make it hard to get a complete operational picture.",
    deliverables: [
      "MQTT broker configuration and message schema documentation",
      "InfluxDB schema design for time-series sensor data",
      "Real-time React dashboard with live charts and alerts",
      "Historical analytics view with date-range filtering",
      "Alert system for threshold breaches (e.g., temperature too high)",
    ],
    duration: "long-term",
    timeCommitment: "8–10 hrs/week",
    technologies: ["MQTT", "Node.js", "React", "InfluxDB", "Grafana"],
    location: "Hybrid",
    compensation: "Symbolic",
    roles: [
      {
        title: "Backend Developer",
        level: "Intermediate",
        skills: ["Node.js", "MQTT", "InfluxDB"],
        niceToHave: ["Docker", "Redis"],
        responsibilities: [
          "Set up MQTT broker and message ingestion pipeline",
          "Design and manage InfluxDB time-series schema",
          "Build REST/WebSocket API for frontend consumption",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
      {
        title: "Data Analyst",
        level: "Junior",
        skills: ["SQL", "InfluxDB", "Data Visualization"],
        niceToHave: ["Grafana", "Python"],
        responsibilities: [
          "Define KPIs and metrics for energy and occupancy tracking",
          "Create dashboard data models and query optimizations",
          "Write reports and alerts logic for anomaly detection",
        ],
        filled: 0,
        total: 1,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-3", name: "Ravi Kumar", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi", role: "Project Lead" },
      { id: "tm-4", name: "Soo-Min Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SooMin", role: "Backend Dev" },
      { id: "tm-5", name: "James O.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", role: "Frontend Dev" },
    ],
    relatedProjectIds: ["12", "4", "6"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["IoT", "Real-world", "Data"],
    posterImage: POSTER_MAP["2"],
  },
  {
    id: "3",
    title: "Peer Code Review Platform",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lena",
    posterName: "Lena Park",
    posterRating: 4.9,
    owner: {
      id: "owner-3",
      name: "Lena Park",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lena",
      rating: 4.9,
      title: "Full-Stack Developer",
      projectsPosted: 5,
    },
    domain: "Software Engineering",
    difficulty: "Beginner",
    status: "Open",
    projectType: "Hackathon",
    summary:
      "A GitHub-integrated platform where students submit PRs and get structured peer reviews with rubrics.",
    description:
      "Peer Code Review Platform enables students to submit their GitHub pull requests and receive structured, rubric-based feedback from peers. The platform integrates with the GitHub API to pull PR diffs and allow inline comments. A rubric system ensures reviewers evaluate code quality, documentation, readability, and logic — producing scores and written feedback. This project is ideal for beginner contributors looking to learn full-stack development and GitHub API integration.",
    problemStatement:
      "Code review culture is missing in student projects, leading to poor code quality habits. There's no structured platform where beginners can practice giving and receiving meaningful code reviews.",
    deliverables: [
      "GitHub OAuth integration and PR ingestion",
      "Rubric builder interface for educators",
      "Peer review submission and scoring UI",
      "Review history and analytics dashboard per student",
      "Notification system for review assignments and completions",
    ],
    duration: "short-term",
    timeCommitment: "4–6 hrs/week",
    technologies: ["React", "Node.js", "GitHub API", "PostgreSQL"],
    location: "Remote",
    compensation: "None",
    roles: [
      {
        title: "Frontend Developer",
        level: "Junior",
        skills: ["React", "TailwindCSS", "TypeScript"],
        niceToHave: ["React Query", "Zod"],
        responsibilities: [
          "Build the rubric builder UI and review submission forms",
          "Integrate GitHub PR diff viewer into the platform",
          "Implement review history and analytics dashboard views",
        ],
        filled: 2,
        total: 3,
        status: "Open",
      },
      {
        title: "Backend Developer",
        level: "Junior",
        skills: ["Node.js", "PostgreSQL", "REST APIs"],
        niceToHave: ["GitHub API", "WebSockets"],
        responsibilities: [
          "Build GitHub OAuth flow and API integration",
          "Design PostgreSQL schema for rubrics, reviews, and scores",
          "Implement notification system for review assignments",
        ],
        filled: 1,
        total: 2,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-6", name: "Lena Park", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lena", role: "Project Lead" },
      { id: "tm-7", name: "Dev Singh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", role: "Frontend Dev" },
      { id: "tm-8", name: "Nina Chu", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina", role: "Frontend Dev" },
      { id: "tm-9", name: "Aaron K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aaron", role: "Backend Dev" },
    ],
    relatedProjectIds: ["7", "1", "9"],
    mentorLinked: false,
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Hackathon", "Beginner-friendly", "Open Source"],
    posterImage: POSTER_MAP["3"],
  },
  {
    id: "4",
    title: "Autonomous Delivery Robot Sim",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
    posterName: "Omar Farouq",
    posterRating: 4.6,
    owner: {
      id: "owner-4",
      name: "Omar Farouq",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
      rating: 4.6,
      title: "Robotics Researcher",
      projectsPosted: 2,
    },
    domain: "Robotics",
    difficulty: "Advanced",
    status: "Open",
    projectType: "Real-world",
    summary:
      "Simulate a delivery robot navigating a campus map using pathfinding algorithms in ROS2.",
    description:
      "This project builds a high-fidelity simulation of an autonomous delivery robot navigating a university campus. Using ROS2 and Gazebo, participants will implement A* and Dijkstra pathfinding with obstacle avoidance, integrate a TensorFlow model for object detection, and simulate package delivery missions. The simulation produces metrics on delivery efficiency, collision avoidance rate, and path optimality — suitable for publication-level results.",
    problemStatement:
      "Real robot testing is expensive and time-consuming. A simulation environment accelerates algorithm iteration cycles and enables safe testing of edge cases, including obstacle collisions and dynamic re-routing scenarios.",
    deliverables: [
      "ROS2 workspace with campus map loaded in Gazebo",
      "Pathfinding module (A* + Dijkstra with benchmarks)",
      "Object detection model integration (TensorFlow, YOLO)",
      "Delivery mission orchestrator with task queue",
      "Performance metrics dashboard (delivery time, collision rate)",
      "Technical report suitable for research paper submission",
    ],
    duration: "long-term",
    timeCommitment: "10–12 hrs/week",
    technologies: ["ROS2", "Python", "Gazebo", "C++", "TensorFlow"],
    location: "On-site",
    compensation: "Paid",
    roles: [
      {
        title: "Robotics Engineer",
        level: "Senior",
        skills: ["ROS2", "C++", "Gazebo"],
        niceToHave: ["SLAM", "Nav2"],
        responsibilities: [
          "Build the ROS2 navigation stack and Gazebo simulation environment",
          "Implement and benchmark pathfinding algorithms",
          "Integrate obstacle detection and dynamic re-routing",
        ],
        filled: 1,
        total: 2,
        status: "Open",
      },
      {
        title: "ML Researcher",
        level: "Intermediate",
        skills: ["TensorFlow", "Python", "Computer Vision"],
        niceToHave: ["YOLO", "OpenCV"],
        responsibilities: [
          "Train object detection model for campus obstacle categories",
          "Integrate model inference into the ROS2 perception pipeline",
          "Evaluate and tune model performance for real-time inference",
        ],
        filled: 0,
        total: 1,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-10", name: "Omar Farouq", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar", role: "Project Lead" },
      { id: "tm-11", name: "Pita T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pita", role: "Robotics Eng." },
    ],
    relatedProjectIds: ["10", "2", "12"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Robotics", "Research", "Advanced"],
    posterImage: POSTER_MAP["4"],
  },
  {
    id: "5",
    title: "Job Market Trend Visualizer",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    posterName: "Sara Ng",
    posterRating: 4.7,
    owner: {
      id: "owner-5",
      name: "Sara Ng",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
      rating: 4.7,
      title: "Data Scientist",
      projectsPosted: 4,
    },
    domain: "Data Science",
    difficulty: "Beginner",
    status: "Open",
    projectType: "Practice",
    summary:
      "Scrape job postings and visualize in-demand skills, salary trends, and location heatmaps.",
    description:
      "The Job Market Trend Visualizer scrapes public job boards (LinkedIn, Indeed, Glassdoor) for software engineering roles, extracts structured data (required skills, salary ranges, location, seniority), and presents it through a rich interactive dashboard. Users can filter by role, location, and time period. The dashboard reveals which skills are trending, which are declining, and which markets pay the most — giving students actionable data to guide their skill development.",
    problemStatement:
      "Students don't know which skills employers actually want right now — skill guidance is often outdated or generic. Data-driven career guidance is missing from most educational platforms.",
    deliverables: [
      "Web scraper for 2+ job boards (rate-limit respectful, robots.txt compliant)",
      "Data cleaning pipeline with Pandas",
      "Interactive D3.js dashboard (skill trends, salary heatmap, location map)",
      "Skill demand ranking table with time-series sparklines",
      "Downloadable CSV export of aggregated data",
    ],
    duration: "short-term",
    timeCommitment: "5–7 hrs/week",
    technologies: ["Python", "Pandas", "D3.js", "Scrapy", "React"],
    location: "Remote",
    compensation: "None",
    roles: [
      {
        title: "Data Analyst",
        level: "Junior",
        skills: ["Python", "Pandas", "Data Cleaning"],
        niceToHave: ["Scrapy", "BeautifulSoup"],
        responsibilities: [
          "Build and maintain the scraping pipeline for job boards",
          "Clean, normalize, and structure raw job posting data",
          "Generate summary statistics and trend datasets",
        ],
        filled: 0,
        total: 2,
        status: "Open",
      },
      {
        title: "Frontend Developer",
        level: "Junior",
        skills: ["D3.js", "React", "Data Visualization"],
        niceToHave: ["Recharts", "Mapbox"],
        responsibilities: [
          "Build the interactive dashboard with D3.js charts",
          "Implement filtering, sorting, and date-range controls",
          "Design a salary heatmap and location-based visualization",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
    ],
    teamMembers: [
      { id: "tm-12", name: "Sara Ng", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara", role: "Data Lead" },
      { id: "tm-13", name: "Luca R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luca", role: "Frontend Dev" },
    ],
    relatedProjectIds: ["1", "10", "6"],
    mentorLinked: false,
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Data", "Career-Tech", "Beginner-friendly"],
    posterImage: POSTER_MAP["5"],
  },
  {
    id: "6",
    title: "Cybersecurity CTF Training Portal",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    posterName: "Alex Morin",
    posterRating: 4.4,
    owner: {
      id: "owner-6",
      name: "Alex Morin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      rating: 4.4,
      title: "Security Engineer",
      projectsPosted: 1,
    },
    domain: "Cybersecurity",
    difficulty: "Intermediate",
    status: "Ongoing",
    projectType: "Real-world",
    summary:
      "A Capture-the-Flag training platform with guided challenges for web, crypto, and forensics tracks.",
    description:
      "The Cybersecurity CTF Training Portal is a self-hosted platform (based on CTFd) extended with custom features: guided learning paths for beginners, hint systems, progress tracking, and a public leaderboard. Challenges span web exploitation, cryptography, reverse engineering, and digital forensics. The platform is designed to run via Docker, making it easy to deploy for university clubs and security courses.",
    problemStatement:
      "Students interested in cybersecurity have no structured practice environment. Existing CTF platforms are either too competitive for beginners or require heavy setup. There's a need for a guided, beginner-friendly security learning platform.",
    deliverables: [
      "Dockerized CTFd deployment with custom branding",
      "5+ original CTF challenges across web, crypto, forensics",
      "Guided learning path system with progressive hint unlocks",
      "Progress tracking dashboard per user",
      "Automated challenge verification system",
    ],
    duration: "long-term",
    timeCommitment: "8–10 hrs/week",
    technologies: ["Docker", "Python", "React", "PostgreSQL", "CTFd"],
    location: "Remote",
    compensation: "None",
    roles: [
      {
        title: "Backend Developer",
        level: "Intermediate",
        skills: ["Python", "Docker", "PostgreSQL"],
        niceToHave: ["CTFd", "Flask"],
        responsibilities: [
          "Extend CTFd with custom API endpoints for learning paths",
          "Build the automated challenge verification system",
          "Manage Docker-based deployment and security hardening",
        ],
        filled: 2,
        total: 2,
        status: "Filled",
      },
      {
        title: "Security Researcher",
        level: "Intermediate",
        skills: ["Penetration Testing", "CTF", "Cryptography"],
        niceToHave: ["Reverse Engineering", "Forensics"],
        responsibilities: [
          "Design and build original CTF challenges for each track",
          "Write guided walkthroughs and hint content",
          "Validate challenge difficulty and ensure no unintended solutions",
        ],
        filled: 1,
        total: 2,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-14", name: "Alex Morin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", role: "Security Lead" },
      { id: "tm-15", name: "Yuki T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki", role: "Backend Dev" },
      { id: "tm-16", name: "Maya L.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya", role: "Backend Dev" },
      { id: "tm-17", name: "Ethan B.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan", role: "Security Researcher" },
      { id: "tm-18", name: "Priya S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaS", role: "CTF Designer" },
    ],
    relatedProjectIds: ["8", "2", "5"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Security", "Real-world", "Competitive"],
    posterImage: POSTER_MAP["6"],
  },
  {
    id: "7",
    title: "Open Source E-Learning CMS",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mei",
    posterName: "Mei Liu",
    posterRating: 4.3,
    owner: {
      id: "owner-7",
      name: "Mei Liu",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mei",
      rating: 4.3,
      title: "Full-Stack Developer",
      projectsPosted: 2,
    },
    domain: "Web Dev",
    difficulty: "Beginner",
    status: "Open",
    projectType: "Practice",
    summary:
      "A lightweight CMS for instructors to publish courses, quizzes, and track student progress.",
    description:
      "Open Source E-Learning CMS is a minimalist, extensible content management system built for educators who need a free alternative to heavy LMS platforms. Instructors can create course modules, publish markdown-formatted lessons, embed quizzes, and track student completion via a lightweight progress tracker. The system is headless-ready, open source under MIT license, and deployable on any Node.js server.",
    problemStatement:
      "Many educators need free, customizable platforms — existing solutions are bloated, costly, or require heavy technical setup. A clean, developer-friendly CMS built for education could fill this gap.",
    deliverables: [
      "Course builder with module and lesson CRUD",
      "Markdown-based lesson editor with preview",
      "Quiz engine with auto-grading",
      "Student progress tracking and completion certificates",
      "Admin dashboard for instructor analytics",
      "Open source repository with CI/CD setup",
    ],
    duration: "long-term",
    timeCommitment: "6–8 hrs/week",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "TailwindCSS", "TypeScript"],
    location: "Remote",
    compensation: "None",
    roles: [
      {
        title: "Frontend Developer",
        level: "Junior",
        skills: ["Next.js", "TailwindCSS", "TypeScript"],
        niceToHave: ["React Hook Form", "MDX"],
        responsibilities: [
          "Build the course builder and lesson editor UI",
          "Implement student-facing course view and progress tracker",
          "Integrate quiz components with validation",
        ],
        filled: 1,
        total: 2,
        status: "Open",
      },
      {
        title: "Backend Developer",
        level: "Junior",
        skills: ["Prisma", "PostgreSQL", "REST APIs"],
        niceToHave: ["tRPC", "Zod"],
        responsibilities: [
          "Design Prisma schema for courses, lessons, quizzes, progress",
          "Build REST (or tRPC) API for all CMS operations",
          "Implement authentication and role-based access (instructor vs student)",
        ],
        filled: 0,
        total: 1,
        status: "Open",
      },
      {
        title: "UI/UX Designer",
        level: "Junior",
        skills: ["Figma", "UX Design", "Design Systems"],
        niceToHave: ["Motion Design", "Accessibility"],
        responsibilities: [
          "Design the complete CMS component library in Figma",
          "Create user flows for instructors and students",
          "Conduct usability reviews and iterate on feedback",
        ],
        filled: 0,
        total: 1,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-19", name: "Mei Liu", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mei", role: "Project Lead" },
      { id: "tm-20", name: "Carlos V.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", role: "Frontend Dev" },
    ],
    relatedProjectIds: ["3", "11", "9"],
    mentorLinked: false,
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Open Source", "EdTech", "Beginner-friendly"],
    posterImage: POSTER_MAP["7"],
  },
  {
    id: "8",
    title: "Blockchain Supply Chain Tracker",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jake",
    posterName: "Jake Torres",
    posterRating: 4.6,
    owner: {
      id: "owner-8",
      name: "Jake Torres",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jake",
      rating: 4.6,
      title: "Blockchain Developer",
      projectsPosted: 3,
    },
    domain: "Software Engineering",
    difficulty: "Advanced",
    status: "Filled",
    projectType: "Real-world",
    summary:
      "Track product journeys from manufacturer to consumer using Ethereum smart contracts.",
    description:
      "The Blockchain Supply Chain Tracker uses Ethereum smart contracts to record immutable product journey events — from raw material sourcing to final delivery. Each step (manufacture, quality check, shipping, customs, retail) is recorded on-chain. A React frontend allows consumers to scan a QR code and trace the full provenance of a product. IPFS stores batch documents and certificates. This is a full-stack Web3 project with real-world applicability in food safety, pharmaceuticals, and luxury goods.",
    problemStatement:
      "Supply chain fraud is rampant — counterfeit goods, origin mislabeling, and undocumented handling affect consumer safety. Blockchain can provide immutable, publicly auditable traceability without requiring trust in a central authority.",
    deliverables: [
      "Solidity smart contracts for product registration and event logging",
      "Hardhat test suite with >80% coverage",
      "React frontend with QR-code-based product tracing",
      "IPFS integration for batch document storage",
      "Deployed to Ethereum testnet (Sepolia) with documentation",
    ],
    duration: "long-term",
    timeCommitment: "10–12 hrs/week",
    technologies: ["Solidity", "Ethereum", "React", "IPFS", "Web3.js"],
    location: "Remote",
    compensation: "Paid",
    roles: [
      {
        title: "Smart Contract Developer",
        level: "Senior",
        skills: ["Solidity", "Ethereum", "Hardhat"],
        niceToHave: ["OpenZeppelin", "Foundry"],
        responsibilities: [
          "Write and audit Solidity smart contracts for supply chain events",
          "Build comprehensive Hardhat test suite",
          "Deploy to testnet and document contract ABI",
        ],
        filled: 2,
        total: 2,
        status: "Filled",
      },
      {
        title: "Frontend Developer",
        level: "Intermediate",
        skills: ["React", "Web3.js", "ethers.js"],
        niceToHave: ["WalletConnect", "IPFS"],
        responsibilities: [
          "Build the product tracing UI with QR code scanner",
          "Integrate wallet connection (MetaMask) and on-chain reads",
          "Handle IPFS document retrieval and display",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
    ],
    teamMembers: [
      { id: "tm-21", name: "Jake Torres", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jake", role: "Project Lead" },
      { id: "tm-22", name: "Amara D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amara", role: "Smart Contract Dev" },
      { id: "tm-23", name: "Ryan M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan", role: "Smart Contract Dev" },
      { id: "tm-24", name: "Sia B.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sia", role: "Frontend Dev" },
    ],
    relatedProjectIds: ["6", "4", "10"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Blockchain", "Real-world", "Paid"],
    posterImage: POSTER_MAP["8"],
  },
  {
    id: "9",
    title: "AR Campus Navigation App",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    posterName: "Priya Mehta",
    posterRating: 4.5,
    owner: {
      id: "owner-9",
      name: "Priya Mehta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      rating: 4.5,
      title: "Mobile Developer",
      projectsPosted: 2,
    },
    domain: "Mobile Dev",
    difficulty: "Intermediate",
    status: "Open",
    projectType: "Hackathon",
    summary:
      "Augmented reality mobile app to help new students navigate campus buildings and find resources.",
    description:
      "The AR Campus Navigation App uses React Native and ARCore/ARKit to overlay directional arrows and location markers onto the real-world camera view, guiding students to classrooms, labs, cafeterias, and support offices. The backend provides a campus graph with real-time updates (room bookings, closures). The app is designed to be installable by any university by uploading their campus map and POI data.",
    problemStatement:
      "New students waste time and experience anxiety finding classrooms and facilities on large campuses. Existing maps are 2D and static — AR navigation offers an intuitive, real-time alternative.",
    deliverables: [
      "React Native app with ARCore/ARKit integration",
      "Campus graph data model with POI management",
      "Node.js backend with real-time room status API",
      "AR waypoint rendering system with smooth pathfinding",
      "Onboarding flow for new users with accessibility options",
    ],
    duration: "short-term",
    timeCommitment: "8–10 hrs/week",
    technologies: ["React Native", "ARCore", "Node.js", "MongoDB", "Mapbox"],
    location: "Hybrid",
    compensation: "Symbolic",
    roles: [
      {
        title: "Mobile Developer",
        level: "Intermediate",
        skills: ["React Native", "ARCore", "TypeScript"],
        niceToHave: ["ARKit", "Expo"],
        responsibilities: [
          "Implement AR waypoint overlay using ARCore/ARKit",
          "Build the campus map navigation UI",
          "Integrate with backend POI and routing API",
        ],
        filled: 0,
        total: 2,
        status: "Open",
      },
      {
        title: "Backend Developer",
        level: "Junior",
        skills: ["Node.js", "MongoDB", "REST APIs"],
        niceToHave: ["GraphQL", "WebSockets"],
        responsibilities: [
          "Build campus POI and room status API",
          "Design MongoDB schema for campus graph data",
          "Implement real-time updates via WebSockets",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
    ],
    teamMembers: [
      { id: "tm-25", name: "Priya Mehta", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", role: "Project Lead" },
      { id: "tm-26", name: "Leo F.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo", role: "Backend Dev" },
    ],
    relatedProjectIds: ["3", "7", "2"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Mobile", "AR", "Hackathon"],
    posterImage: POSTER_MAP["9"],
  },
  {
    id: "10",
    title: "Federated Learning Research Tool",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
    posterName: "Chris Watts",
    posterRating: 4.9,
    owner: {
      id: "owner-10",
      name: "Chris Watts",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
      rating: 4.9,
      title: "AI Researcher",
      projectsPosted: 6,
    },
    domain: "AI & ML",
    difficulty: "Advanced",
    status: "Ongoing",
    projectType: "Real-world",
    summary:
      "Implement federated learning across distributed nodes for privacy-preserving model training.",
    description:
      "This research-grade project implements federated learning using the Flower (flwr) framework across a simulated distributed network. Each node trains a local PyTorch model on its private dataset; only model updates (gradients) are shared with the central aggregator. The project explores different aggregation strategies (FedAvg, FedProx), measures privacy leakage, and benchmarks communication overhead. Results will be structured for publication in a workshop paper.",
    problemStatement:
      "Centralized ML training raises data privacy and regulatory compliance concerns (GDPR, HIPAA). Federated learning approaches solve this by keeping data local, but implementation complexity is a barrier for researchers.",
    deliverables: [
      "Flower-based federated training framework with configurable nodes",
      "PyTorch model implementations for benchmark tasks (MNIST, CIFAR-10)",
      "Aggregation strategy modules (FedAvg, FedProx, custom)",
      "Privacy leakage measurement tooling",
      "Performance benchmarking dashboard",
      "Workshop-ready technical report",
    ],
    duration: "long-term",
    timeCommitment: "12–15 hrs/week",
    technologies: ["Python", "PyTorch", "Flower", "Docker", "Kubernetes"],
    location: "Remote",
    compensation: "Paid",
    roles: [
      {
        title: "ML Researcher",
        level: "Senior",
        skills: ["PyTorch", "Python", "Federated Learning"],
        niceToHave: ["Flower", "Differential Privacy"],
        responsibilities: [
          "Implement and evaluate federated aggregation strategies",
          "Measure privacy leakage using gradient inversion attacks",
          "Benchmark communication overhead across node counts",
        ],
        filled: 2,
        total: 3,
        status: "Open",
      },
      {
        title: "DevOps Engineer",
        level: "Intermediate",
        skills: ["Docker", "Kubernetes", "CI/CD"],
        niceToHave: ["Helm", "Terraform"],
        responsibilities: [
          "Set up distributed training infrastructure on Kubernetes",
          "Build CI/CD pipeline for experiment reproducibility",
          "Monitor node health and training job orchestration",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
    ],
    teamMembers: [
      { id: "tm-27", name: "Chris Watts", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris", role: "Research Lead" },
      { id: "tm-28", name: "Hana T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hana", role: "ML Researcher" },
      { id: "tm-29", name: "Marco A.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco", role: "ML Researcher" },
      { id: "tm-30", name: "Nia W.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nia", role: "DevOps Eng." },
    ],
    relatedProjectIds: ["1", "4", "8"],
    mentorLinked: true,
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Research", "AI", "Advanced"],
    posterImage: POSTER_MAP["10"],
  },
  {
    id: "11",
    title: "Community Mental Health Chatbot",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
    posterName: "Zoe Adams",
    posterRating: 4.7,
    owner: {
      id: "owner-11",
      name: "Zoe Adams",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
      rating: 4.7,
      title: "AI Product Designer",
      projectsPosted: 2,
    },
    domain: "AI & ML",
    difficulty: "Intermediate",
    status: "Open",
    projectType: "Real-world",
    summary:
      "A compassionate chatbot providing mental wellness check-ins and resource recommendations.",
    description:
      "The Community Mental Health Chatbot is an AI-powered conversational agent designed to provide empathetic check-ins, mood tracking, and curated mental health resource recommendations for students. Built on LangChain with OpenAI, it uses prompt engineering and guardrails to ensure safe, non-clinical responses. The chatbot integrates with a React frontend featuring a calming, accessible UI. A simple mood history dashboard helps users track their wellness over time.",
    problemStatement:
      "Students face rising mental health challenges with limited access to professional support. A stigma-reducing, always-available digital companion can provide first-level support and appropriate resource referrals.",
    deliverables: [
      "LangChain-based chatbot with safety guardrails",
      "Mood check-in flow with emoji-based input",
      "Resource recommendation engine (by topic/mood)",
      "Mood history dashboard with trend visualization",
      "Accessible, calming React UI (WCAG 2.1 AA)",
    ],
    duration: "short-term",
    timeCommitment: "6–8 hrs/week",
    technologies: ["Python", "LangChain", "React", "OpenAI", "Supabase"],
    location: "Remote",
    compensation: "None",
    roles: [
      {
        title: "AI Developer",
        level: "Intermediate",
        skills: ["Python", "LangChain", "OpenAI API"],
        niceToHave: ["Guardrails AI", "RLHF"],
        responsibilities: [
          "Build the LangChain conversation chain with memory and safety filters",
          "Implement resource recommendation logic by mood/topic",
          "Design prompt guardrails to prevent clinical advice generation",
        ],
        filled: 1,
        total: 2,
        status: "Open",
      },
      {
        title: "Frontend Developer",
        level: "Junior",
        skills: ["React", "TailwindCSS", "Accessibility"],
        niceToHave: ["Framer Motion", "WCAG"],
        responsibilities: [
          "Build the chat UI with accessibility-first design",
          "Implement the mood check-in flow and emoji picker",
          "Create the mood history dashboard with trend charts",
        ],
        filled: 0,
        total: 1,
        status: "Open",
      },
    ],
    teamMembers: [
      { id: "tm-31", name: "Zoe Adams", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe", role: "Project Lead" },
      { id: "tm-32", name: "Finn K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Finn", role: "AI Developer" },
    ],
    relatedProjectIds: ["1", "7", "5"],
    mentorLinked: false,
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Social Impact", "AI", "Beginner-friendly"],
    posterImage: POSTER_MAP["11"],
  },
  {
    id: "12",
    title: "Smart Greenhouse Automation",
    posterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    posterName: "Felix Hoang",
    posterRating: 4.2,
    owner: {
      id: "owner-12",
      name: "Felix Hoang",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      rating: 4.2,
      title: "IoT Hardware Engineer",
      projectsPosted: 1,
    },
    domain: "IoT",
    difficulty: "Beginner",
    status: "Finished",
    projectType: "Real-world",
    summary:
      "Automate greenhouse conditions — soil moisture, temperature, lighting — with IoT sensors and a mobile app.",
    description:
      "Smart Greenhouse Automation connects Arduino-based sensor nodes to a cloud backend via MQTT, enabling automated control of irrigation, lighting, and ventilation based on real-time sensor readings. A React Native mobile app allows greenhouse operators to monitor conditions, set thresholds, and override actuators remotely. This project has been successfully deployed in a university botany lab and serves as a reference implementation for similar IoT automation systems.",
    problemStatement:
      "Manual greenhouse management is error-prone and labor-intensive. Inconsistent watering and lighting schedules affect crop yield and quality. Automation can dramatically reduce human error and improve consistency.",
    deliverables: [
      "Arduino firmware for soil moisture, temperature, and light sensors",
      "MQTT message schema and broker configuration",
      "Node.js backend with actuator control API",
      "React Native mobile app with live monitoring dashboard",
      "Threshold-based automation rules engine",
      "Project deployment documentation and setup guide",
    ],
    duration: "short-term",
    timeCommitment: "5–7 hrs/week",
    technologies: ["Arduino", "MQTT", "React Native", "Node.js", "Firebase"],
    location: "On-site",
    compensation: "Symbolic",
    roles: [
      {
        title: "Hardware Developer",
        level: "Junior",
        skills: ["Arduino", "C++", "Sensors"],
        niceToHave: ["ESP32", "FreeRTOS"],
        responsibilities: [
          "Write Arduino firmware for sensor reading and actuator control",
          "Integrate MQTT client for cloud communication",
          "Test sensor calibration and reliability",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
      {
        title: "Mobile Developer",
        level: "Junior",
        skills: ["React Native", "Firebase", "TypeScript"],
        niceToHave: ["Expo", "Push Notifications"],
        responsibilities: [
          "Build real-time monitoring dashboard in React Native",
          "Implement actuator override controls with safety confirmations",
          "Integrate Firebase for real-time data sync",
        ],
        filled: 1,
        total: 1,
        status: "Filled",
      },
    ],
    teamMembers: [
      { id: "tm-33", name: "Felix Hoang", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", role: "Project Lead" },
      { id: "tm-34", name: "Grace O.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace", role: "Hardware Dev" },
      { id: "tm-35", name: "Tom N.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom", role: "Mobile Dev" },
    ],
    relatedProjectIds: ["2", "4", "9"],
    mentorLinked: false,
    postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["IoT", "Hardware", "Real-world"],
    posterImage: POSTER_MAP["12"],
  },
];
