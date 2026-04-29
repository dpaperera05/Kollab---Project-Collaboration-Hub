/**
 * seedRecommendationProjects.ts
 *
 * Development-only seed script that inserts 18 diverse, realistic projects into
 * MongoDB so the hybrid recommendation engine can be tested across a wide range
 * of domains, technologies, and role types.
 *
 * Usage:
 *   npm run seed:recommendation-projects           # insert missing only
 *   npm run seed:recommendation-projects -- --reset  # delete & reinsert all
 *
 * Safety:
 *   - Every seeded project carries the tag "Recommendation Test".
 *   - Duplicate check: skips projects where title + tag already exist.
 *   - --reset only deletes documents that carry the "Recommendation Test" tag.
 *   - Never touches other projects.
 *   - Does NOT generate embeddings (run POST /api/recommendations/projects/generate-missing-embeddings after seeding).
 */

import "dotenv/config";
import { connectDB } from "../config/db";
import { Project, IProjectRole } from "../models/project.model";
import { User } from "../models/user.model";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEED_TAG = "Recommendation Test";

const role = (
  title: string,
  level: IProjectRole["level"],
  requiredSkills: string[],
  niceToHaveSkills: string[],
  responsibilities: string[],
  seats = 1,
): IProjectRole => ({
  id: `seed-${title.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`,
  title,
  level,
  requiredSkills,
  niceToHaveSkills,
  responsibilities,
  seats,
  status: "Open",
});

// ── Seed data ─────────────────────────────────────────────────────────────────

const buildProjects = (ownerId: string) => [
  // ── 1. Software Engineering ──────────────────────────────────────────────
  {
    ownerId,
    title: "Peer Code Review Platform",
    summary:
      "A collaborative web platform that streamlines peer code review for engineering teams and bootcamp students. Reviewers can leave inline comments, assign severity levels, and track improvement over time.",
    problemStatement:
      "Developers learning in bootcamps or early-career engineers lack structured peer feedback loops. Existing tools like GitHub PRs are too heavyweight for quick learning exercises.",
    deliverables: [
      "Real-time inline comment editor",
      "Review assignment queue",
      "Progress dashboard per reviewer",
      "Notification system",
    ],
    projectType: "Web Application",
    domain: "Software Engineering",
    technologies: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Socket.io"],
    difficulty: "Intermediate",
    duration: "3 months",
    weeklyHours: 12,
    compensation: "Equity",
    tags: ["Code Review", "Developer Tools", "Education", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "CSS"],
        ["Socket.io", "Monaco Editor"],
        ["Build inline comment editor", "Implement review assignment UI"],
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "Express", "MongoDB"],
        ["Socket.io", "Redis"],
        ["Design REST API", "Implement real-time notifications"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 2. Data Science ──────────────────────────────────────────────────────
  {
    ownerId,
    title: "Job Market Trend Visualizer",
    summary:
      "An interactive dashboard that scrapes and visualises job posting trends across tech sectors, showing in-demand skills, salary ranges, and geographic hot-spots for developers.",
    problemStatement:
      "Job seekers and career changers lack a single tool to understand real-time hiring trends without manual research across multiple job boards.",
    deliverables: [
      "Web scraper / ETL pipeline",
      "Interactive chart dashboard",
      "Skill demand heatmap",
      "Weekly trend email digest",
    ],
    projectType: "Data Platform",
    domain: "Data Science",
    technologies: ["Python", "FastAPI", "React", "PostgreSQL", "Pandas", "Plotly"],
    difficulty: "Intermediate",
    duration: "4 months",
    weeklyHours: 10,
    compensation: "Paid",
    tags: ["Data Visualisation", "Career Tools", "Web Scraping", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Data Engineer",
        "Intermediate",
        ["Python", "Pandas", "PostgreSQL"],
        ["Airflow", "dbt"],
        ["Build ETL pipeline", "Design data schema"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "Plotly"],
        ["D3.js"],
        ["Build interactive charts", "Implement filter controls"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 3. AI & ML ────────────────────────────────────────────────────────────
  {
    ownerId,
    title: "Student Wellness AI Companion",
    summary:
      "A conversational AI companion designed to support university students with mental health check-ins, stress management tips, and guided breathing exercises, powered by NLP.",
    problemStatement:
      "University counselling services are overwhelmed. Students need an accessible, stigma-free first point of contact for mental health support.",
    deliverables: [
      "Conversational chatbot interface",
      "Sentiment analysis module",
      "Daily mood tracking dashboard",
      "Crisis escalation pathway",
    ],
    projectType: "AI Application",
    domain: "AI & ML",
    technologies: ["Python", "FastAPI", "React", "TensorFlow", "HuggingFace Transformers", "MongoDB"],
    difficulty: "Advanced",
    duration: "5 months",
    weeklyHours: 15,
    compensation: "Equity",
    tags: ["Mental Health", "NLP", "AI", "EdTech", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Senior",
        ["Python", "TensorFlow", "NLP"],
        ["HuggingFace Transformers", "PyTorch"],
        ["Fine-tune sentiment model", "Design conversation flow engine"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        ["Framer Motion"],
        ["Build chat UI", "Implement mood tracker visualisations"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 4. Mobile App ────────────────────────────────────────────────────────
  {
    ownerId,
    title: "Campus Events & Social App",
    summary:
      "A mobile-first app for university students to discover, RSVP, and share campus events. Includes social features like event groups, shared photo albums, and post-event reviews.",
    problemStatement:
      "University event discovery is fragmented across email newsletters, physical posters, and multiple social media channels.",
    deliverables: [
      "iOS and Android app",
      "Event discovery feed",
      "RSVP and calendar sync",
      "Social groups per event",
    ],
    projectType: "Mobile Application",
    domain: "Mobile Apps",
    technologies: ["Flutter", "Dart", "Firebase", "Node.js"],
    difficulty: "Intermediate",
    duration: "4 months",
    weeklyHours: 10,
    compensation: "Revenue Share",
    tags: ["Mobile", "Social", "Campus Life", "Events", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Flutter Developer",
        "Intermediate",
        ["Flutter", "Dart", "Firebase"],
        ["Riverpod", "GetX"],
        ["Build event discovery UI", "Integrate push notifications"],
        2,
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "Firebase"],
        ["Express"],
        ["Design Firestore data model", "Build API endpoints"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 5. Robotics ──────────────────────────────────────────────────────────
  {
    ownerId,
    title: "Autonomous Greenhouse Monitor",
    summary:
      "A Raspberry Pi–based IoT system that monitors temperature, humidity, and soil moisture in a greenhouse, adjusting irrigation and ventilation automatically via actuators.",
    problemStatement:
      "Small-scale urban farmers cannot afford commercial greenhouse management systems but need reliable environmental automation to reduce crop losses.",
    deliverables: [
      "Sensor data collection daemon",
      "Actuator control library",
      "Web dashboard for real-time monitoring",
      "Alert system for out-of-range readings",
    ],
    projectType: "IoT / Embedded System",
    domain: "Robotics",
    technologies: ["Python", "Raspberry Pi", "MQTT", "React", "InfluxDB"],
    difficulty: "Intermediate",
    duration: "3 months",
    weeklyHours: 8,
    compensation: "None",
    tags: ["IoT", "Robotics", "Agriculture", "Embedded Systems", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Embedded Systems Developer",
        "Intermediate",
        ["Python", "Raspberry Pi", "MQTT"],
        ["C++", "Arduino"],
        ["Write sensor drivers", "Implement actuator control logic"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        ["Chart.js"],
        ["Build real-time monitoring dashboard"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 6. Game Development ──────────────────────────────────────────────────
  {
    ownerId,
    title: "Multiplayer Puzzle Game — Escape Room",
    summary:
      "A browser-based multiplayer escape room game where teams of 2–4 players solve logic puzzles and hidden-object challenges in real time, with a custom level editor.",
    problemStatement:
      "Remote teams lack engaging, browser-native multiplayer games that can be played without installation and support cooperative problem solving.",
    deliverables: [
      "Multiplayer real-time game engine",
      "5 initial room levels",
      "Level editor tool",
      "Leaderboard and replay system",
    ],
    projectType: "Game",
    domain: "Game Development",
    technologies: ["TypeScript", "Three.js", "Node.js", "Socket.io", "MongoDB"],
    difficulty: "Advanced",
    duration: "6 months",
    weeklyHours: 15,
    compensation: "Revenue Share",
    tags: ["Game Development", "3D", "Multiplayer", "Browser Game", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Game Developer",
        "Senior",
        ["TypeScript", "Three.js"],
        ["WebGL", "Babylon.js"],
        ["Build game engine", "Implement puzzle mechanics"],
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "Socket.io"],
        ["Redis"],
        ["Build real-time room state management", "Design leaderboard API"],
      ),
      role(
        "UI/UX Designer",
        "Junior",
        ["Figma"],
        ["CSS animations"],
        ["Design level editor UI", "Create room visual assets"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 7. Cybersecurity ─────────────────────────────────────────────────────
  {
    ownerId,
    title: "Open Source Vulnerability Scanner",
    summary:
      "A CLI and web dashboard tool that scans Node.js and Python project dependencies for known CVEs, suggests patch paths, and integrates with CI pipelines.",
    problemStatement:
      "Developers often ship applications with unpatched vulnerable dependencies. Existing paid solutions are inaccessible for open-source projects.",
    deliverables: [
      "CLI scanner supporting npm and pip",
      "CVE database sync job",
      "Web dashboard for scan history",
      "GitHub Actions integration",
    ],
    projectType: "Security Tool",
    domain: "Cybersecurity",
    technologies: ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
    difficulty: "Advanced",
    duration: "4 months",
    weeklyHours: 12,
    compensation: "None",
    tags: ["Cybersecurity", "Open Source", "DevSecOps", "CLI Tools", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Security Engineer",
        "Senior",
        ["Python", "CVE databases", "Docker"],
        ["Trivy", "Snyk API"],
        ["Design CVE ingestion pipeline", "Build CLI scanner"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        ["Tailwind CSS"],
        ["Build scan history dashboard", "Implement CVE detail views"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 8. Cloud / DevOps ────────────────────────────────────────────────────
  {
    ownerId,
    title: "Self-Hosted CI/CD Pipeline Builder",
    summary:
      "A lightweight, self-hostable CI/CD platform built for small teams who want GitHub Actions–like pipelines without vendor lock-in, running on Kubernetes or bare Docker.",
    problemStatement:
      "Small teams running private code repositories cannot afford GitHub Actions minutes at scale or GitLab CI without a paid plan.",
    deliverables: [
      "Pipeline YAML definition engine",
      "Docker-based runner agent",
      "Web dashboard for pipeline status",
      "Webhook triggers for Git providers",
    ],
    projectType: "DevOps Tool",
    domain: "Cloud / DevOps",
    technologies: ["Go", "Docker", "Kubernetes", "React", "PostgreSQL", "Redis"],
    difficulty: "Advanced",
    duration: "5 months",
    weeklyHours: 15,
    compensation: "Equity",
    tags: ["DevOps", "CI/CD", "Kubernetes", "Docker", "Open Source", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "DevOps Engineer",
        "Senior",
        ["Docker", "Kubernetes", "Go"],
        ["Helm", "Terraform"],
        ["Build runner agent", "Design pipeline execution engine"],
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Go", "PostgreSQL", "Redis"],
        ["gRPC"],
        ["Build pipeline API", "Implement webhook handler"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        [],
        ["Build pipeline status dashboard"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 9. UI/UX Design ──────────────────────────────────────────────────────
  {
    ownerId,
    title: "Accessibility Audit & Redesign Tool",
    summary:
      "A browser extension and web app that audits websites for WCAG accessibility compliance, generates a visual report, and provides a side-by-side redesign suggestion powered by AI.",
    problemStatement:
      "Most websites fail basic WCAG 2.1 accessibility standards. Developers lack fast, actionable tooling to identify and fix issues during design and development.",
    deliverables: [
      "Browser extension scanner",
      "WCAG violation report generator",
      "AI-powered fix suggestion module",
      "Design token exporter for accessible colour palettes",
    ],
    projectType: "Design Tool",
    domain: "UI/UX Design",
    technologies: ["TypeScript", "React", "Chrome Extension API", "Python", "OpenAI API", "Figma Plugin API"],
    difficulty: "Intermediate",
    duration: "4 months",
    weeklyHours: 10,
    compensation: "Revenue Share",
    tags: ["Accessibility", "UI/UX", "Browser Extension", "Design Tools", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "UI/UX Designer",
        "Senior",
        ["Figma", "WCAG", "Design Systems"],
        ["Accessibility Testing"],
        ["Define audit criteria", "Design accessible redesign templates"],
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["TypeScript", "React", "Chrome Extension API"],
        ["Playwright"],
        ["Build browser extension", "Implement DOM accessibility scanner"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 10. E-commerce ───────────────────────────────────────────────────────
  {
    ownerId,
    title: "Sustainable Furniture Marketplace",
    summary:
      "A peer-to-peer e-commerce platform for buying and selling second-hand and sustainably made furniture, with 3D room visualisation using AR so buyers can preview items in their space.",
    problemStatement:
      "Furniture contributes significantly to landfill waste. Consumers lack a dedicated, trustworthy platform for second-hand furniture with immersive product previews.",
    deliverables: [
      "Product listing and search",
      "AR room preview (WebXR)",
      "Secure payments with Stripe",
      "Seller dashboard and analytics",
    ],
    projectType: "E-commerce Platform",
    domain: "E-commerce",
    technologies: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Stripe", "Three.js"],
    difficulty: "Intermediate",
    duration: "4 months",
    weeklyHours: 12,
    compensation: "Revenue Share",
    tags: ["E-commerce", "Sustainability", "AR", "Marketplace", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Frontend Developer",
        "Intermediate",
        ["Next.js", "TypeScript", "Three.js"],
        ["WebXR", "Framer Motion"],
        ["Build product listing UI", "Implement AR room preview"],
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "MongoDB", "Stripe"],
        ["Redis"],
        ["Build payment flow", "Design seller dashboard API"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 11. IoT ──────────────────────────────────────────────────────────────
  {
    ownerId,
    title: "Smart Home Energy Tracker",
    summary:
      "An IoT system that monitors per-appliance electricity consumption via smart plugs, aggregates data into a React dashboard, and uses ML to forecast monthly bills and suggest savings.",
    problemStatement:
      "Households lack granular, real-time visibility into energy consumption at the appliance level, making it hard to reduce energy bills or carbon footprints.",
    deliverables: [
      "Smart plug data ingestion service",
      "Real-time energy dashboard",
      "ML-based bill forecasting model",
      "Mobile push alerts for anomalies",
    ],
    projectType: "IoT Application",
    domain: "IoT",
    technologies: ["Python", "MQTT", "React", "InfluxDB", "TensorFlow", "Node.js"],
    difficulty: "Advanced",
    duration: "5 months",
    weeklyHours: 12,
    compensation: "None",
    tags: ["IoT", "Energy", "Machine Learning", "Smart Home", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "IoT Developer",
        "Intermediate",
        ["Python", "MQTT", "InfluxDB"],
        ["Grafana", "Node-RED"],
        ["Build smart plug integration", "Design time-series data pipeline"],
      ),
      role(
        "ML Engineer",
        "Intermediate",
        ["Python", "TensorFlow"],
        ["Scikit-learn"],
        ["Train bill forecasting model", "Build anomaly detection module"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        ["Chart.js"],
        ["Build real-time dashboard"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 12. EdTech ───────────────────────────────────────────────────────────
  {
    ownerId,
    title: "Adaptive Quiz Learning Platform",
    summary:
      "An EdTech platform that uses spaced repetition and adaptive difficulty algorithms to help students prepare for exams. Teachers can create question banks; the AI selects questions based on each student's weak areas.",
    problemStatement:
      "Traditional static quizzes do not adapt to individual learner progress. Students waste time revising topics they already know and under-revise areas where they need more practice.",
    deliverables: [
      "Student adaptive quiz engine",
      "Teacher question bank builder",
      "Performance analytics dashboard",
      "Spaced repetition scheduler",
    ],
    projectType: "Web Application",
    domain: "Education Technology",
    technologies: ["Next.js", "TypeScript", "Python", "FastAPI", "MongoDB", "Redis"],
    difficulty: "Intermediate",
    duration: "4 months",
    weeklyHours: 10,
    compensation: "Equity",
    tags: ["EdTech", "Adaptive Learning", "Education", "AI", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Frontend Developer",
        "Intermediate",
        ["Next.js", "TypeScript"],
        ["Framer Motion"],
        ["Build quiz UI", "Implement adaptive difficulty visualisations"],
      ),
      role(
        "ML Engineer",
        "Junior",
        ["Python", "FastAPI"],
        ["scikit-learn"],
        ["Implement spaced repetition algorithm", "Build weak-area classifier"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 13. AI & ML (Computer Vision) ────────────────────────────────────────
  {
    ownerId,
    title: "Real-Time Sign Language Interpreter",
    summary:
      "A web application that uses a webcam feed and a computer vision model to recognise ASL hand signs in real time and display live transcription, making digital communication more accessible.",
    problemStatement:
      "Deaf and hard-of-hearing individuals face barriers in real-time digital communication. Automated sign language recognition remains largely inaccessible to end users.",
    deliverables: [
      "Hand landmark detection model",
      "ASL gesture classifier (A–Z + common phrases)",
      "Live transcription overlay",
      "Sentence building with auto-correction",
    ],
    projectType: "AI Application",
    domain: "AI & ML",
    technologies: ["Python", "PyTorch", "OpenCV", "MediaPipe", "React", "FastAPI"],
    difficulty: "Advanced",
    duration: "5 months",
    weeklyHours: 15,
    compensation: "None",
    tags: ["Computer Vision", "Accessibility", "Machine Learning", "NLP", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Senior",
        ["Python", "PyTorch", "OpenCV"],
        ["MediaPipe", "TensorFlow"],
        ["Train gesture classifier", "Optimise real-time inference pipeline"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        ["WebRTC"],
        ["Build webcam capture UI", "Display live transcription overlay"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 14. Mobile App (iOS) ─────────────────────────────────────────────────
  {
    ownerId,
    title: "Personal Finance Tracker — iOS",
    summary:
      "A native iOS personal finance app with automatic transaction categorisation, budget goal tracking, and a conversational AI assistant that answers spending questions using natural language.",
    problemStatement:
      "Existing finance apps require tedious manual categorisation. Users want an intelligent assistant that understands their spending patterns without manual input.",
    deliverables: [
      "Bank connection via Plaid API",
      "Automatic transaction categorisation",
      "Budget goal UI",
      "AI spending assistant",
    ],
    projectType: "Mobile Application",
    domain: "Mobile Apps",
    technologies: ["Swift", "SwiftUI", "CoreData", "Python", "FastAPI", "OpenAI API"],
    difficulty: "Senior",
    duration: "6 months",
    weeklyHours: 12,
    compensation: "Revenue Share",
    tags: ["iOS", "Finance", "AI Assistant", "Swift", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "iOS Developer",
        "Senior",
        ["Swift", "SwiftUI", "CoreData"],
        ["Combine", "WidgetKit"],
        ["Build full iOS app", "Integrate Plaid SDK"],
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Python", "FastAPI"],
        ["OpenAI API", "PostgreSQL"],
        ["Build categorisation engine", "Implement conversational AI layer"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 15. Cloud / DevOps ───────────────────────────────────────────────────
  {
    ownerId,
    title: "Multi-Cloud Cost Optimiser",
    summary:
      "A SaaS dashboard that connects to AWS, Azure, and GCP accounts to identify idle resources, right-sizing opportunities, and reserved instance savings. Generates automated savings recommendations.",
    problemStatement:
      "Engineering teams overspend on cloud infrastructure due to idle resources and suboptimal instance sizing. Manual cost reviews are time-consuming and error-prone.",
    deliverables: [
      "Multi-cloud API connector",
      "Resource utilisation analyser",
      "Savings recommendation engine",
      "Weekly cost report email",
    ],
    projectType: "SaaS Platform",
    domain: "Cloud / DevOps",
    technologies: ["Python", "FastAPI", "React", "PostgreSQL", "AWS SDK", "Azure SDK", "Terraform"],
    difficulty: "Advanced",
    duration: "5 months",
    weeklyHours: 15,
    compensation: "Equity",
    tags: ["Cloud", "AWS", "Azure", "Cost Optimisation", "DevOps", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Cloud Engineer",
        "Senior",
        ["AWS", "Azure", "Python"],
        ["GCP", "Terraform", "Kubernetes"],
        ["Build multi-cloud API connectors", "Design cost analysis algorithms"],
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript"],
        ["Recharts", "Tailwind CSS"],
        ["Build cost dashboard", "Implement recommendations UI"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 16. Data Science (NLP) ───────────────────────────────────────────────
  {
    ownerId,
    title: "Open Research Paper Summariser",
    summary:
      "A web app that ingests arXiv, PubMed, or any PDF research paper and produces a structured summary with key findings, methodology, and implications in plain English using fine-tuned NLP models.",
    problemStatement:
      "Researchers and students are overwhelmed by the volume of academic papers. Reading full papers to assess relevance is time-consuming.",
    deliverables: [
      "PDF and URL ingestion pipeline",
      "Fine-tuned summarisation model",
      "Structured summary output (JSON + HTML)",
      "User library with bookmarks",
    ],
    projectType: "AI Application",
    domain: "Data Science",
    technologies: ["Python", "FastAPI", "HuggingFace Transformers", "React", "PostgreSQL", "Redis"],
    difficulty: "Advanced",
    duration: "4 months",
    weeklyHours: 12,
    compensation: "None",
    tags: ["NLP", "Research Tools", "AI", "Summarisation", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Senior",
        ["Python", "HuggingFace Transformers", "NLP"],
        ["PyTorch", "LangChain"],
        ["Fine-tune summarisation model", "Build PDF parsing pipeline"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "TypeScript"],
        ["Tailwind CSS"],
        ["Build paper library UI", "Implement structured summary viewer"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 17. Cybersecurity ────────────────────────────────────────────────────
  {
    ownerId,
    title: "Phishing Detection Browser Extension",
    summary:
      "A browser extension that analyses URLs and page content in real time to detect phishing attempts using a combination of heuristic rules and a lightweight ML classifier.",
    problemStatement:
      "Phishing attacks remain one of the most common causes of data breaches. Browser-native protection lags behind attacker sophistication.",
    deliverables: [
      "URL reputation checker",
      "DOM content analyser",
      "ML phishing classifier",
      "User warning overlay",
    ],
    projectType: "Security Tool",
    domain: "Cybersecurity",
    technologies: ["TypeScript", "Chrome Extension API", "Python", "scikit-learn", "FastAPI"],
    difficulty: "Intermediate",
    duration: "3 months",
    weeklyHours: 10,
    compensation: "None",
    tags: ["Cybersecurity", "Phishing", "Machine Learning", "Browser Extension", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Security Engineer",
        "Intermediate",
        ["Python", "scikit-learn", "FastAPI"],
        ["TensorFlow Lite"],
        ["Build phishing classifier", "Design URL reputation heuristics"],
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["TypeScript", "Chrome Extension API"],
        [],
        ["Build extension popup UI", "Implement page content DOM scanner"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },

  // ── 18. Game Development ─────────────────────────────────────────────────
  {
    ownerId,
    title: "2D Pixel Roguelike Game",
    summary:
      "A Unity-based 2D roguelike dungeon crawler with procedurally generated levels, permadeath, crafting systems, and online leaderboards. Built for PC and WebGL browser export.",
    problemStatement:
      "Indie roguelike games are popular but many lack polished procedural generation. This project aims to build a highly replayable roguelike using modern Unity tooling.",
    deliverables: [
      "Procedural dungeon generator",
      "Player progression and crafting system",
      "5 distinct enemy types with AI",
      "Online leaderboard and run history",
    ],
    projectType: "Game",
    domain: "Game Development",
    technologies: ["Unity", "C#", "Node.js", "MongoDB"],
    difficulty: "Intermediate",
    duration: "6 months",
    weeklyHours: 10,
    compensation: "Revenue Share",
    tags: ["Game Development", "Unity", "Roguelike", "2D", "Indie Game", SEED_TAG],
    status: "Open" as const,
    roles: [
      role(
        "Unity Developer",
        "Intermediate",
        ["Unity", "C#"],
        ["Shader Graph", "Cinemachine"],
        ["Build dungeon generator", "Implement enemy AI", "Create crafting system"],
        2,
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "MongoDB"],
        ["Express"],
        ["Build leaderboard API", "Design run history storage"],
      ),
    ],
    postedAt: new Date().toISOString(),
    applicants: [],
    members: [],
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────

const run = async () => {
  const isReset = process.argv.includes("--reset");

  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // ── Pick owner ────────────────────────────────────────────────────────
    // Prefer mentor, then any user — project schema has no admin userType.
    const mentor = await User.findOne({ userType: "mentor" }).lean();
    const anyUser = await User.findOne({}).lean();
    const owner = mentor ?? anyUser;

    if (!owner) {
      console.error(
        "No users found. Create at least one user before seeding projects.",
      );
      process.exit(1);
    }

    const ownerId = owner._id.toString();
    console.log(
      `Using owner: ${owner.name ?? ownerId} (${(owner as any).userType ?? "user"} — ${ownerId})`,
    );

    // ── Reset mode ────────────────────────────────────────────────────────
    if (isReset) {
      const { deletedCount } = await Project.deleteMany({ tags: SEED_TAG });
      console.log(`--reset: Deleted ${deletedCount} existing "${SEED_TAG}" projects.`);
    }

    // ── Insert ────────────────────────────────────────────────────────────
    const projects = buildProjects(ownerId);

    let inserted = 0;
    let skipped = 0;

    for (const p of projects) {
      const exists = await Project.exists({ title: p.title, tags: SEED_TAG });
      if (exists) {
        console.log(`  SKIP  "${p.title}" — already exists`);
        skipped++;
        continue;
      }
      await Project.create(p);
      console.log(`  INSERT "${p.title}" [${p.domain}]`);
      inserted++;
    }

    console.log("\n─────────────────────────────────────────");
    console.log(`Done. Inserted: ${inserted}  |  Skipped: ${skipped}  |  Total seed: ${projects.length}`);
    console.log(`\nNext step: POST /api/recommendations/projects/generate-missing-embeddings`);
    console.log("─────────────────────────────────────────");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

void run();
