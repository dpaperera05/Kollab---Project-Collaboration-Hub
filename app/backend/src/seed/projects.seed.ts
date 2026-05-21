/**
 * projects.seed.ts
 *
 * Safe seed script that inserts 20 high-quality, realistic projects into MongoDB
 * Atlas for final year viva/presentation demonstration. Each of the 10 owners
 * receives exactly 2 projects.
 *
 * Usage:
 *   ALLOW_PROJECT_SEED=true npm run seed:projects
 *   ALLOW_PROJECT_SEED=true npm run seed:projects -- --reset
 *
 * Safety:
 *   - Requires ALLOW_PROJECT_SEED=true environment variable
 *   - Validates all 10 owners exist in database before seeding
 *   - Uses upsert with stable filter (ownerId + title)
 *   - --reset only deletes projects matching exact owner IDs and exact titles
 *   - Never touches projects outside the allowlist
 *   - Does NOT set poster images or manual embeddings
 *   - Embeddings auto-generate via embeddingFreshness service after upsert
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { Project } from "../models/project.model";

// ── Environment guard ──────────────────────────────────────────────────────────

if (process.env.ALLOW_PROJECT_SEED !== "true") {
  console.error("\n❌ ALLOW_PROJECT_SEED must be set to true before running this script.\n");
  process.exit(1);
}

// ── Owner allowlist ────────────────────────────────────────────────────────────

const PROJECT_OWNERS = [
  {
    email: "pineeakarsha@gmail.com",
    userId: "69ca75d524f6d0e071425a18",
    name: "Pinee Akarsha",
  },
  {
    email: "maya.silva@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52e8",
    name: "Maya Silva",
  },
  {
    email: "arjun.mehra@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52e9",
    name: "Arjun Mehra",
  },
  {
    email: "sofia.martinez@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52ea",
    name: "Sofia Martinez",
  },
  {
    email: "liam.anderson@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52eb",
    name: "Liam Anderson",
  },
  {
    email: "aisha.khan@kollabmail.test",
    userId: "6a0e821d65aa34cb0ecd52ec",
    name: "Aisha Khan",
  },
  {
    email: "emma.schneider@kollabmail.test",
    userId: "6a0e821d65aa34cb0ecd52ee",
    name: "Emma Schneider",
  },
  {
    email: "sarah.chen@kollabmail.test",
    userId: "6a0ea2c565aa34cb0ecd5685",
    name: "Sarah Chen",
  },
  {
    email: "james.okonkwo@kollabmail.test",
    userId: "6a0ea2c565aa34cb0ecd5686",
    name: "James Okonkwo",
  },
  {
    email: "maria.gonzalez@kollabmail.test",
    userId: "6a0ea2c565aa34cb0ecd5687",
    name: "Maria Gonzalez",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const role = (
  title: string,
  level: "Junior" | "Intermediate" | "Senior",
  requiredSkills: string[],
  niceToHaveSkills: string[],
  responsibilities: string[],
  seats = 1
) => ({
  id: `role-${title.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`,
  title,
  level,
  requiredSkills,
  niceToHaveSkills,
  responsibilities,
  seats,
  status: "Open" as const,
});

// ── Build projects ─────────────────────────────────────────────────────────────

const buildProjects = () => [
  // ── OWNER 1: Pinee Akarsha ──────────────────────────────────────────────────
  {
    ownerId: "69ca75d524f6d0e071425a18",
    title: "AI-Powered Nutrition Coach for Athletes",
    summary:
      "A mobile app that uses computer vision to analyze meal photos and provides personalized nutrition recommendations for student athletes based on their training schedules, goals, and dietary restrictions.",
    problemStatement:
      "Student athletes struggle to maintain optimal nutrition due to limited access to professional dietitians. Existing nutrition apps provide generic advice that doesn't account for training intensity, recovery needs, or budget constraints faced by college students.",
    deliverables: [
      "Cross-platform mobile app (iOS/Android) with camera-based meal tracking",
      "ML model for food recognition and calorie estimation with 85%+ accuracy",
      "RESTful API for nutrition data, recommendations, and user profile management",
      "Admin dashboard for nutritionists to review and refine AI recommendations",
      "Integration with Strava and Apple Health for training data synchronization",
    ],
    projectType: "Startup / Product Idea",
    domain: "AI & ML",
    technologies: ["React Native", "FastAPI", "Python", "TensorFlow", "MongoDB", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 15,
    compensation: "Paid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Actively Hiring",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Startup Potential",
      "Remote",
      "Innovative",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Intermediate",
        ["Python", "TensorFlow", "Computer Vision", "FastAPI", "Model Deployment"],
        ["PyTorch", "Docker", "AWS SageMaker", "Data Augmentation", "Transfer Learning"],
        [
          "Train and optimize food recognition model using transfer learning from existing vision models",
          "Build calorie estimation pipeline from meal photos with confidence scoring",
          "Implement recommendation engine based on user profile, goals, and training data",
          "Deploy models to production with FastAPI backend and implement A/B testing",
          "Monitor model performance and retrain with new data collected from user feedback",
        ],
        1
      ),
      role(
        "Mobile Developer",
        "Intermediate",
        ["React Native", "TypeScript", "React", "Mobile UI/UX", "REST APIs"],
        ["Firebase", "Native iOS/Android", "Animation", "Offline-First", "Push Notifications"],
        [
          "Build cross-platform mobile UI with React Native and TypeScript",
          "Integrate camera and photo capture workflows with real-time preview",
          "Implement real-time nutrition tracking dashboard with interactive charts",
          "Connect with Strava and Apple Health APIs for seamless training data sync",
          "Optimize app performance and implement offline-first data persistence",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Docker", "AWS", "Testing frameworks", "Redis", "Authentication"],
        [
          "Design MongoDB schema for user profiles, meal history, and nutrition goals",
          "Build RESTful API for mobile app and admin dashboard with proper error handling",
          "Implement JWT-based authentication and authorization with role-based access",
          "Set up automated testing (unit, integration) and CI/CD pipeline with GitHub Actions",
          "Monitor API performance and optimize database queries for scalability",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "69ca75d524f6d0e071425a18",
    title: "Developer Portfolio Intelligence Platform",
    summary:
      "An AI-powered platform that analyzes developers' GitHub repositories, project documentation, and contributions to generate intelligent portfolio insights, skill assessments, and personalized project recommendations.",
    problemStatement:
      "Developers struggle to showcase their skills effectively beyond basic GitHub stats. Recruiters spend hours manually reviewing portfolios. There's no automated way to assess technical depth, project quality, or skill progression over time.",
    deliverables: [
      "Web dashboard for developers to connect GitHub and visualize portfolio intelligence",
      "AI-powered code analysis engine that evaluates project complexity and code quality",
      "Natural language project summary generator using LLM-based documentation analysis",
      "Skill progression timeline showing technology adoption and mastery patterns",
      "API for recruiters to access verified skill assessments and portfolio highlights",
    ],
    projectType: "Product MVP",
    domain: "Software Engineering",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "FastAPI", "LangChain", "Docker"],
    difficulty: "Intermediate",
    duration: "long-term",
    weeklyHours: 12,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Open for Contributions",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Innovative",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Full Stack Developer",
        "Intermediate",
        ["React", "Node.js", "Express.js", "MongoDB", "TypeScript"],
        ["Docker", "GitHub API", "OAuth", "Data Visualization", "Testing"],
        [
          "Build responsive web dashboard with React and TypeScript for portfolio visualization",
          "Implement GitHub OAuth integration and repository data fetching via GitHub API",
          "Design MongoDB schema for storing developer profiles, repositories, and analytics",
          "Create RESTful API endpoints for portfolio data, insights, and skill assessments",
          "Implement real-time data updates and optimize frontend performance with lazy loading",
        ],
        1
      ),
      role(
        "AI Integration Developer",
        "Intermediate",
        ["Python", "FastAPI", "LangChain", "REST APIs"],
        ["OpenAI API", "Hugging Face", "Docker", "Vector Databases", "Prompt Engineering"],
        [
          "Build AI-powered code analysis engine using LangChain and LLM APIs",
          "Implement natural language project summary generation from README and code comments",
          "Create skill extraction pipeline that identifies technologies from code and dependencies",
          "Design and optimize prompts for accurate code quality and complexity assessment",
          "Integrate FastAPI service with main backend and handle rate limiting for LLM calls",
        ],
        1
      ),
      role(
        "UI/UX Designer",
        "Junior",
        ["Figma", "UI Design", "User Research"],
        ["React", "Tailwind CSS", "Prototyping", "Accessibility", "Design Systems"],
        [
          "Design user-friendly dashboard layouts that clearly communicate portfolio insights",
          "Create interactive data visualizations for skill progression and project timelines",
          "Conduct user research with developers to validate design decisions and iterate",
          "Build reusable component library in Figma with consistent design tokens",
          "Ensure accessibility compliance (WCAG 2.1) and responsive design across devices",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 2: Maya Silva ────────────────────────────────────────────────────
  {
    ownerId: "6a0e821c65aa34cb0ecd52e8",
    title: "Smart Campus Energy Optimisation Platform",
    summary:
      "An IoT-powered platform that monitors real-time energy consumption across university buildings, uses predictive analytics to optimize HVAC and lighting systems, and provides actionable insights for sustainability teams.",
    problemStatement:
      "University campuses waste 20-30% of energy due to inefficient building management systems that operate on fixed schedules rather than actual occupancy and environmental conditions. Facilities managers lack real-time visibility and predictive insights.",
    deliverables: [
      "IoT sensor network deployment guide and data collection infrastructure",
      "Real-time energy monitoring dashboard with building-level and room-level granularity",
      "Predictive analytics engine for energy consumption forecasting and anomaly detection",
      "Automated optimization recommendations for HVAC schedules based on occupancy patterns",
      "REST API for integration with existing building management systems and sustainability reporting",
    ],
    projectType: "Research / Innovation Project",
    domain: "IoT",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Python", "Pandas", "AWS", "Docker"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 14,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Industry Relevant",
      "Startup Potential",
      "Remote",
      "Innovative",
    ],
    status: "Open" as const,
    roles: [
      role(
        "IoT Backend Developer",
        "Senior",
        ["Node.js", "Express.js", "MongoDB", "IoT Protocols", "REST APIs"],
        ["MQTT", "WebSockets", "Time-Series Databases", "AWS IoT Core", "Docker"],
        [
          "Design scalable backend architecture for ingesting high-frequency IoT sensor data",
          "Implement real-time data processing pipeline with efficient time-series storage in MongoDB",
          "Build RESTful API for dashboard and third-party integrations with proper authentication",
          "Set up AWS IoT Core for secure device communication and data ingestion at scale",
          "Optimize database queries and implement caching for fast dashboard performance",
        ],
        1
      ),
      role(
        "Data Analyst",
        "Intermediate",
        ["Python", "Pandas", "Data Analysis", "Statistical Modeling"],
        ["Scikit-learn", "Time-Series Forecasting", "SQL", "Jupyter", "Data Visualization"],
        [
          "Analyze historical energy consumption data to identify patterns and inefficiencies",
          "Build predictive models for energy forecasting using time-series analysis techniques",
          "Implement anomaly detection algorithms to identify equipment malfunctions or unusual usage",
          "Create automated reporting scripts for sustainability metrics and carbon footprint tracking",
          "Collaborate with facilities team to validate insights and refine optimization algorithms",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Data Visualization", "REST APIs"],
        ["Tailwind CSS", "Chart.js", "Real-Time Updates", "Responsive Design", "Testing"],
        [
          "Build interactive energy monitoring dashboard with real-time data updates",
          "Implement advanced data visualizations for energy consumption trends and comparisons",
          "Create building floor plan views with color-coded energy usage heatmaps",
          "Design mobile-responsive layouts for on-the-go monitoring by facilities staff",
          "Optimize frontend performance for handling large datasets and frequent updates",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0e821c65aa34cb0ecd52e8",
    title: "Accessibility Testing Dashboard for Web Teams",
    summary:
      "An automated accessibility testing dashboard that scans web applications for WCAG compliance issues, provides detailed remediation guidance, and tracks accessibility improvements over time with visual regression testing.",
    problemStatement:
      "Web development teams struggle to ensure accessibility compliance. Manual testing is time-consuming and inconsistent. Existing tools provide reports but lack actionable guidance and integration with development workflows.",
    deliverables: [
      "Chrome extension and CLI tool for automated WCAG 2.1 compliance scanning",
      "Web dashboard for visualizing accessibility issues across multiple projects and pages",
      "Detailed remediation guides with code examples for each identified issue",
      "CI/CD integration for automated accessibility checks in pull requests",
      "Progress tracking and reporting for compliance improvements over time",
    ],
    projectType: "Open Source Tool",
    domain: "Web Dev",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
    difficulty: "Intermediate",
    duration: "short-term",
    weeklyHours: 10,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Short-Term",
      "Open for Contributions",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Remote",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Tailwind CSS", "Chrome Extension APIs"],
        ["Testing Library", "Accessibility Testing", "Webpack", "State Management", "UI/UX"],
        [
          "Build web dashboard for visualizing accessibility scan results with filtering and sorting",
          "Develop Chrome extension for in-browser accessibility testing and real-time issue highlighting",
          "Create interactive issue cards with severity levels, WCAG criteria, and remediation steps",
          "Implement progress tracking visualizations showing compliance improvements over time",
          "Ensure the dashboard itself is fully accessible and WCAG 2.1 AA compliant",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Docker", "CI/CD", "Testing", "Authentication", "GitHub API"],
        [
          "Build RESTful API for storing scan results, projects, and user accounts",
          "Design MongoDB schema for accessibility issues, projects, and historical scan data",
          "Implement CLI tool for automated scanning and integration with CI/CD pipelines",
          "Create webhook endpoints for GitHub/GitLab integration to comment on pull requests",
          "Set up automated testing and deployment pipeline for the backend service",
        ],
        1
      ),
      role(
        "QA Engineer",
        "Junior",
        ["Accessibility Testing", "WCAG Guidelines", "Testing Strategies"],
        ["Axe-core", "Manual Testing", "Screen Readers", "Assistive Technologies", "Documentation"],
        [
          "Research and document WCAG 2.1 success criteria and common accessibility patterns",
          "Test the tool itself for accuracy by comparing results with manual accessibility audits",
          "Create comprehensive remediation guides with code examples for identified issues",
          "Validate tool recommendations with actual screen reader and keyboard navigation testing",
          "Develop test cases and quality benchmarks for the accessibility scanning engine",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 3: Arjun Mehra ───────────────────────────────────────────────────
  {
    ownerId: "6a0e821c65aa34cb0ecd52e9",
    title: "Secure API Gateway for Small SaaS Teams",
    summary:
      "A lightweight, open-source API gateway designed for small SaaS teams, providing rate limiting, authentication, request transformation, and security monitoring without the complexity of enterprise solutions.",
    problemStatement:
      "Small SaaS startups need API gateway functionality (rate limiting, auth, monitoring) but enterprise solutions like Kong or AWS API Gateway are over-engineered and expensive. Simple tools lack essential security features.",
    deliverables: [
      "Containerized API gateway service with plugin architecture for extensibility",
      "Web-based admin console for configuring routes, rate limits, and auth policies",
      "Built-in JWT and API key authentication with role-based access control",
      "Real-time monitoring dashboard for API traffic, errors, and security events",
      "Deployment guides for Docker, Kubernetes, and cloud platforms (AWS, Azure)",
    ],
    projectType: "Startup / Product Idea",
    domain: "Cybersecurity",
    technologies: ["Node.js", "Express.js", "NestJS", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 15,
    compensation: "Paid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Actively Hiring",
      "Industry Relevant",
      "Startup Potential",
      "Remote",
      "Innovative",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Backend Developer",
        "Senior",
        ["Node.js", "NestJS", "PostgreSQL", "Redis", "REST APIs"],
        ["Microservices", "gRPC", "Message Queues", "Performance Optimization", "Testing"],
        [
          "Design and implement core API gateway routing engine with request/response transformation",
          "Build plugin architecture allowing developers to extend gateway with custom middleware",
          "Implement high-performance rate limiting using Redis with sliding window algorithm",
          "Create admin API for managing routes, policies, and configurations dynamically",
          "Optimize gateway performance to handle 10,000+ requests/second with minimal latency",
        ],
        1
      ),
      role(
        "Security Engineer",
        "Senior",
        ["Authentication", "Authorization", "Security Protocols", "Cryptography"],
        ["OAuth 2.0", "JWT", "TLS/SSL", "API Security", "Threat Modeling", "Penetration Testing"],
        [
          "Implement JWT and API key authentication with secure token generation and validation",
          "Design role-based access control (RBAC) system with granular permission management",
          "Build security monitoring to detect and prevent common API attacks (DDoS, injection, brute force)",
          "Conduct security audits and penetration testing to identify vulnerabilities",
          "Create security best practices documentation for deployment and configuration",
        ],
        1
      ),
      role(
        "DevOps Engineer",
        "Intermediate",
        ["Docker", "Kubernetes", "AWS", "CI/CD"],
        ["Terraform", "Helm", "Monitoring", "Logging", "Performance Tuning"],
        [
          "Create Docker images and Kubernetes manifests for simplified deployment",
          "Set up CI/CD pipelines for automated testing, building, and deployment",
          "Implement monitoring and logging with Prometheus, Grafana, and centralized log aggregation",
          "Write deployment documentation and automation scripts for AWS and Azure",
          "Optimize infrastructure for high availability and auto-scaling based on traffic",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0e821c65aa34cb0ecd52e9",
    title: "Local Business Inventory and Demand Forecasting Platform",
    summary:
      "A data-driven platform that helps small local businesses optimize inventory management using sales history analysis, seasonal trend detection, and demand forecasting to reduce waste and improve profitability.",
    problemStatement:
      "Small retail businesses over-stock or under-stock products due to lack of data analytics tools. They rely on intuition rather than data, leading to wasted inventory, stockouts, and lost revenue. Enterprise solutions are too complex and expensive.",
    deliverables: [
      "Web dashboard for uploading sales data and viewing inventory recommendations",
      "Machine learning model for demand forecasting based on historical sales and seasonality",
      "Automated alerts for low stock, overstocking risks, and optimal reorder points",
      "Visual analytics showing sales trends, product performance, and seasonal patterns",
      "Mobile-responsive interface for on-the-go inventory checks and order management",
    ],
    projectType: "Product MVP",
    domain: "Data Science",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Python", "Pandas", "Scikit-learn"],
    difficulty: "Intermediate",
    duration: "long-term",
    weeklyHours: 12,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Startup Potential",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Data Analyst",
        "Intermediate",
        ["Python", "Pandas", "Scikit-learn", "Data Analysis"],
        ["Time-Series Forecasting", "Statistical Modeling", "SQL", "Data Visualization", "Jupyter"],
        [
          "Analyze sales data to identify trends, seasonality, and product performance patterns",
          "Build demand forecasting models using time-series analysis and regression techniques",
          "Implement inventory optimization algorithms to calculate reorder points and quantities",
          "Create automated reporting for inventory insights and business performance metrics",
          "Validate model accuracy and refine algorithms based on real-world business feedback",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Data Processing", "CSV Parsing", "Authentication", "Testing", "Docker"],
        [
          "Build RESTful API for uploading sales data, managing products, and retrieving forecasts",
          "Design MongoDB schema for sales transactions, inventory, and forecast results",
          "Implement CSV import pipeline with data validation and error handling",
          "Create scheduled jobs for automated daily forecast updates and alert generation",
          "Set up user authentication and multi-tenant data isolation for business accounts",
        ],
        2
      ),
      role(
        "Frontend Developer",
        "Junior",
        ["React", "JavaScript", "REST APIs", "Data Visualization"],
        ["TypeScript", "Tailwind CSS", "Chart.js", "Responsive Design", "Testing"],
        [
          "Build responsive dashboard for visualizing inventory data and forecast results",
          "Implement CSV file upload interface with drag-and-drop and progress tracking",
          "Create interactive charts showing sales trends, forecasts, and inventory levels",
          "Design mobile-friendly views for quick inventory checks and order management",
          "Implement client-side validation and user-friendly error messaging",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 4: Sofia Martinez ────────────────────────────────────────────────
  {
    ownerId: "6a0e821c65aa34cb0ecd52ea",
    title: "Skill-Based Team Formation Engine",
    summary:
      "An AI-powered platform that analyzes project requirements and team member skills to automatically suggest optimal team compositions, predict collaboration success, and identify skill gaps for hackathons and project courses.",
    problemStatement:
      "Hackathons and project-based courses struggle with team formation. Manual matching is time-consuming and often results in imbalanced teams. Students end up in teams lacking critical skills or with conflicting work styles.",
    deliverables: [
      "Web platform for organizers to define projects and collect participant skill profiles",
      "AI-powered team formation algorithm that balances skills, experience, and preferences",
      "Team compatibility scoring system based on skill complementarity and historical data",
      "Dashboard for participants to view team assignments and skill gap recommendations",
      "Analytics for organizers showing team distribution, skill coverage, and diversity metrics",
    ],
    projectType: "AI-Powered Platform",
    domain: "Software Engineering",
    technologies: ["React", "FastAPI", "Python", "MongoDB", "Hugging Face", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 14,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Open for Contributions",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Innovative",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Senior",
        ["Python", "Machine Learning", "Optimization Algorithms", "FastAPI"],
        ["Hugging Face", "NLP", "Graph Algorithms", "Model Deployment", "A/B Testing"],
        [
          "Design and implement team formation algorithm using constraint optimization and graph theory",
          "Build skill embedding model to measure semantic similarity between project needs and member skills",
          "Implement compatibility scoring system considering skill balance, experience levels, and preferences",
          "Create FastAPI endpoints for team formation requests with real-time progress updates",
          "Validate algorithm effectiveness through simulation and A/B testing with historical data",
        ],
        1
      ),
      role(
        "Full Stack Developer",
        "Intermediate",
        ["React", "TypeScript", "Python", "FastAPI", "MongoDB"],
        ["Docker", "REST APIs", "State Management", "Testing", "UI/UX"],
        [
          "Build web platform for project and participant profile management with intuitive UX",
          "Implement real-time team formation visualization showing algorithm progress",
          "Design MongoDB schema for projects, participants, teams, and formation history",
          "Create RESTful API for organizer and participant interactions with proper authorization",
          "Develop analytics dashboard showing team distribution and skill coverage metrics",
        ],
        1
      ),
      role(
        "Product Designer",
        "Intermediate",
        ["Figma", "UI/UX Design", "User Research"],
        ["Prototyping", "Design Systems", "Accessibility", "User Testing", "Data Visualization"],
        [
          "Conduct user research with hackathon organizers and students to understand pain points",
          "Design user flows for project creation, profile building, and team viewing",
          "Create wireframes and high-fidelity mockups for organizer and participant interfaces",
          "Develop interactive visualizations for team compatibility and skill gap analysis",
          "Test designs with users and iterate based on feedback for optimal usability",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0e821c65aa34cb0ecd52ea",
    title: "Disaster Response Resource Coordination System",
    summary:
      "A real-time platform for coordinating disaster response efforts by tracking volunteer availability, resource inventory (food, medical supplies, shelter), and matching needs with available help during emergencies.",
    problemStatement:
      "During natural disasters, response coordination is chaotic. Organizations struggle to track available resources, match volunteers to urgent needs, and avoid duplication of efforts. Communication delays cost lives.",
    deliverables: [
      "Real-time web dashboard for emergency coordinators to view resource availability and needs",
      "Mobile-responsive volunteer portal for sign-ups, task assignments, and status updates",
      "Geolocation-based matching system connecting nearby volunteers to urgent requests",
      "Inventory management for tracking donations, supplies, and distribution points",
      "SMS and push notification system for urgent alerts and task assignments",
    ],
    projectType: "Social Impact Platform",
    domain: "Web Dev",
    technologies: ["React", "Node.js", "Express.js", "PostgreSQL", "Redis", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 16,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Industry Relevant",
      "Remote",
      "Innovative",
      "Portfolio Project",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Backend Developer",
        "Senior",
        ["Node.js", "Express.js", "PostgreSQL", "Redis", "REST APIs"],
        ["WebSockets", "Geolocation", "Message Queues", "Scalability", "Testing"],
        [
          "Design scalable backend architecture for handling high concurrent user loads during emergencies",
          "Implement real-time resource tracking with WebSockets for live dashboard updates",
          "Build geolocation-based matching algorithm connecting volunteers to nearby needs",
          "Create RESTful API for volunteer management, task assignments, and inventory tracking",
          "Set up Redis for caching and session management to ensure fast response times",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Real-Time Updates", "Geolocation APIs"],
        ["Tailwind CSS", "PWA", "Offline-First", "Responsive Design", "Testing"],
        [
          "Build real-time coordinator dashboard with live resource availability and task status",
          "Implement mobile-responsive volunteer portal with location-based task suggestions",
          "Create interactive map view showing volunteer locations, needs, and distribution points",
          "Develop offline-first PWA to ensure functionality during internet outages",
          "Optimize frontend performance for low-bandwidth scenarios common in disaster areas",
        ],
        1
      ),
      role(
        "Product Manager",
        "Intermediate",
        ["Product Strategy", "User Research", "Requirements Gathering"],
        ["Agile", "Stakeholder Management", "Documentation", "Prioritization", "Communication"],
        [
          "Research disaster response workflows and coordinate with NGOs to validate requirements",
          "Define product roadmap prioritizing features most critical during emergencies",
          "Create user stories and acceptance criteria for coordinator and volunteer features",
          "Conduct usability testing with disaster response organizations and gather feedback",
          "Document deployment and training guides for emergency response teams",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 5: Liam Anderson ─────────────────────────────────────────────────
  {
    ownerId: "6a0e821c65aa34cb0ecd52eb",
    title: "Mental Wellness Companion for University Students",
    summary:
      "A mobile app providing daily mental wellness check-ins, mood tracking, stress management resources, peer support forums, and crisis intervention pathways tailored for university students facing academic and social pressures.",
    problemStatement:
      "University students experience high rates of anxiety and depression but face barriers accessing mental health services (stigma, cost, waitlists). Existing apps lack student-specific features and peer support integration.",
    deliverables: [
      "Cross-platform mobile app with daily mood check-ins and wellness tracking",
      "Personalized stress management resource library (breathing exercises, meditation, articles)",
      "Anonymous peer support forums moderated by trained student volunteers",
      "Crisis intervention pathways with emergency contact information and counselor connections",
      "Privacy-first data architecture ensuring student confidentiality and GDPR compliance",
    ],
    projectType: "Social Impact Product",
    domain: "Mobile Dev",
    technologies: ["React Native", "Firebase", "Node.js", "Express.js", "MongoDB", "Figma"],
    difficulty: "Intermediate",
    duration: "long-term",
    weeklyHours: 10,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Mentor Needed",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Remote",
      "Innovative",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Mobile Developer",
        "Intermediate",
        ["React Native", "JavaScript", "Mobile UI/UX", "Firebase"],
        ["TypeScript", "Push Notifications", "Offline-First", "Animation", "Testing"],
        [
          "Build cross-platform mobile app with React Native for iOS and Android",
          "Implement daily mood check-in interface with customizable prompts and reminders",
          "Create mood tracking visualizations showing trends over days, weeks, and months",
          "Integrate Firebase for real-time data sync, authentication, and push notifications",
          "Ensure app accessibility for students with disabilities (screen reader support, high contrast)",
        ],
        1
      ),
      role(
        "UI/UX Designer",
        "Intermediate",
        ["Figma", "UI Design", "UX Research", "Mobile Design"],
        ["Prototyping", "User Testing", "Accessibility", "Design Systems", "Psychology"],
        [
          "Conduct user research with university students to understand mental wellness needs",
          "Design calming, stigma-free interface that encourages daily engagement",
          "Create intuitive navigation for accessing resources, forums, and crisis support",
          "Develop visual language that promotes positive mental health without trivializing struggles",
          "Test designs with students and iterate based on feedback and usability metrics",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Firebase Admin SDK", "Authentication", "Privacy", "Testing", "Documentation"],
        [
          "Build RESTful API for wellness resources, forum posts, and user profiles",
          "Design MongoDB schema with privacy-first architecture (anonymized data, encryption)",
          "Implement user authentication with Firebase and role-based access for moderators",
          "Create moderation dashboard for trained volunteers to review forum content",
          "Develop automated content flagging system for crisis-related posts requiring immediate attention",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0e821c65aa34cb0ecd52eb",
    title: "Ethical AI Resume Screening Toolkit",
    summary:
      "An open-source toolkit for HR teams to screen resumes using AI while ensuring fairness, transparency, and bias detection. Includes explainability features showing why candidates were ranked and audit trails for compliance.",
    problemStatement:
      "AI-powered resume screening tools save time but introduce bias risks (gender, race, age). HR teams lack transparency into AI decisions. Existing tools are black boxes without explainability or fairness auditing.",
    deliverables: [
      "Open-source Python library for resume parsing, skill extraction, and candidate ranking",
      "Bias detection module identifying potential discrimination in ranking algorithms",
      "Web dashboard for HR teams to upload resumes, view rankings, and understand AI decisions",
      "Explainability reports showing which resume features influenced candidate scores",
      "Compliance documentation and audit trails for GDPR and equal opportunity regulations",
    ],
    projectType: "Research / Innovation Project",
    domain: "AI & ML",
    technologies: ["React", "FastAPI", "Python", "Hugging Face", "PostgreSQL", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 12,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Industry Relevant",
      "Portfolio Project",
      "Resume Booster",
      "Innovative",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Senior",
        ["Python", "NLP", "Hugging Face", "Machine Learning", "Fairness in AI"],
        ["PyTorch", "BERT", "Model Explainability", "SHAP", "Bias Auditing"],
        [
          "Build resume parsing pipeline using NLP models to extract skills, experience, and education",
          "Implement candidate ranking algorithm with explainability (SHAP or LIME for feature importance)",
          "Design bias detection module analyzing ranking outcomes across demographic groups",
          "Research and implement fairness constraints to mitigate discrimination in AI rankings",
          "Create comprehensive documentation on model architecture and ethical considerations",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Data Visualization", "REST APIs"],
        ["Tailwind CSS", "Chart.js", "Accessibility", "Testing", "UI/UX"],
        [
          "Build HR dashboard for uploading resumes and viewing AI-generated candidate rankings",
          "Create explainability visualizations showing which resume features influenced scores",
          "Implement bias audit reports with demographic breakdowns and fairness metrics",
          "Design intuitive interface for HR teams to review candidates and override AI decisions",
          "Ensure WCAG 2.1 accessibility compliance for all dashboard features",
        ],
        1
      ),
      role(
        "Research Analyst",
        "Intermediate",
        ["Research Methods", "Fairness in AI", "Ethics", "Technical Writing"],
        ["Statistical Analysis", "Python", "Literature Review", "Documentation", "Compliance"],
        [
          "Conduct literature review on bias in resume screening and fairness in AI systems",
          "Validate bias detection algorithms through testing with synthetic and real-world datasets",
          "Document ethical guidelines for using AI in hiring and compliance with regulations",
          "Create training materials for HR teams on interpreting AI rankings responsibly",
          "Develop audit trails and reporting templates for GDPR and equal opportunity compliance",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 6: Aisha Khan ────────────────────────────────────────────────────
  {
    ownerId: "6a0e821d65aa34cb0ecd52ec",
    title: "Mobile Learning Companion for Skill Bootcamps",
    summary:
      "A mobile app designed for coding bootcamp students to track learning progress, complete daily coding challenges, access video tutorials offline, and connect with study partners for peer learning.",
    problemStatement:
      "Bootcamp students struggle to stay organized and motivated. They juggle multiple platforms for videos, exercises, and community. There's no unified mobile-first tool for on-the-go learning and progress tracking.",
    deliverables: [
      "Cross-platform mobile app with course progress tracking and daily challenge reminders",
      "Offline-first video player for downloading tutorials and watching without internet",
      "Interactive coding challenges with syntax highlighting and instant feedback",
      "Study partner matching system connecting students with similar learning goals",
      "Gamification features (streaks, badges, leaderboards) to boost motivation",
    ],
    projectType: "Product MVP",
    domain: "Mobile Dev",
    technologies: ["React Native", "Flutter", "Firebase", "Node.js", "MongoDB"],
    difficulty: "Intermediate",
    duration: "long-term",
    weeklyHours: 10,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Portfolio Project",
      "Resume Booster",
      "Remote",
      "Skill Building",
      "Innovative",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Mobile Developer",
        "Intermediate",
        ["React Native", "Flutter", "Mobile Development", "Firebase"],
        ["Offline-First", "Video Playback", "Push Notifications", "Animation", "Testing"],
        [
          "Build cross-platform mobile app with React Native or Flutter for iOS and Android",
          "Implement offline-first architecture for downloading and caching video content",
          "Create interactive coding challenge interface with syntax highlighting and error checking",
          "Integrate Firebase for user authentication, real-time data sync, and cloud storage",
          "Optimize app performance and battery usage for extended learning sessions",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Firebase Admin SDK", "Video Processing", "Authentication", "Testing", "Documentation"],
        [
          "Build RESTful API for course content, challenges, and user progress tracking",
          "Design MongoDB schema for courses, users, progress, and study partner connections",
          "Implement study partner matching algorithm based on learning goals and availability",
          "Create gamification system tracking streaks, badges, and leaderboard rankings",
          "Set up content management endpoints for bootcamp instructors to add challenges and videos",
        ],
        1
      ),
      role(
        "UI/UX Designer",
        "Junior",
        ["Figma", "Mobile UI Design", "UX Research"],
        ["Prototyping", "User Testing", "Design Systems", "Accessibility", "Motion Design"],
        [
          "Design mobile-first interface optimized for one-handed use and small screens",
          "Create intuitive navigation for accessing courses, challenges, and study partners",
          "Develop gamification UI elements (badges, progress bars, streak counters) that motivate learning",
          "Conduct usability testing with bootcamp students and iterate based on feedback",
          "Ensure design accessibility for learners with visual impairments and diverse needs",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0e821d65aa34cb0ecd52ec",
    title: "Community Volunteering Coordination Platform",
    summary:
      "A web platform connecting community volunteers with local organizations, enabling volunteer sign-ups, shift scheduling, impact tracking, and recognition programs to boost civic engagement.",
    problemStatement:
      "Local non-profits struggle to recruit and coordinate volunteers. Volunteers lack visibility into opportunities. Manual sign-ups and scheduling via email/spreadsheets are inefficient and error-prone.",
    deliverables: [
      "Web platform for organizations to post volunteer opportunities with detailed descriptions",
      "Volunteer portal for browsing opportunities, signing up for shifts, and tracking hours",
      "Automated email and SMS reminders for upcoming volunteer shifts",
      "Impact dashboard showing total volunteer hours, events attended, and community achievements",
      "Recognition system with certificates, badges, and volunteer spotlight features",
    ],
    projectType: "Social Impact Platform",
    domain: "Web Dev",
    technologies: ["React", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
    difficulty: "Beginner",
    duration: "short-term",
    weeklyHours: 8,
    compensation: "Unpaid",
    tags: [
      "Beginner Friendly",
      "Team Project",
      "Looking for Team",
      "Short-Term",
      "Portfolio Project",
      "Skill Building",
      "Remote",
      "Industry Relevant",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Frontend Developer",
        "Junior",
        ["React", "HTML", "CSS", "JavaScript"],
        ["Tailwind CSS", "REST APIs", "Responsive Design", "Form Validation", "Testing"],
        [
          "Build responsive web interface for browsing volunteer opportunities and signing up",
          "Create organization dashboard for posting events and managing volunteer registrations",
          "Implement volunteer profile page showing upcoming shifts, past events, and impact metrics",
          "Design mobile-responsive layouts ensuring usability on phones and tablets",
          "Add client-side form validation and user-friendly error messaging",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Authentication", "Email/SMS", "Scheduling", "Testing", "Documentation"],
        [
          "Build RESTful API for volunteer opportunities, registrations, and user profiles",
          "Design MongoDB schema for organizations, events, volunteers, and sign-ups",
          "Implement user authentication with email/password and role-based access (org vs volunteer)",
          "Create automated email and SMS reminder system for upcoming volunteer shifts",
          "Develop impact tracking logic calculating total hours and generating certificates",
        ],
        1
      ),
      role(
        "Product Coordinator",
        "Junior",
        ["Product Management", "User Research", "Documentation"],
        ["Agile", "Stakeholder Communication", "Requirements Gathering", "Testing", "Project Planning"],
        [
          "Conduct user research with local non-profits and volunteers to validate features",
          "Create user stories and prioritize backlog for frontend and backend development",
          "Coordinate with development team to ensure timely delivery of MVP features",
          "Test platform features and gather feedback from pilot organizations and volunteers",
          "Document user guides and onboarding materials for organizations and volunteers",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 7: Emma Schneider ────────────────────────────────────────────────
  {
    ownerId: "6a0e821d65aa34cb0ecd52ee",
    title: "Real-Time Agriculture Disease Monitoring Dashboard",
    summary:
      "A computer vision-powered platform that analyzes drone and smartphone photos of crops to detect diseases early, provides treatment recommendations, and tracks disease spread across farms in real-time.",
    problemStatement:
      "Farmers detect crop diseases too late, leading to widespread crop loss. Manual field inspections are time-consuming and miss early symptoms. Existing tools require expensive equipment and lack real-time monitoring.",
    deliverables: [
      "Mobile app for farmers to upload crop photos and receive instant disease diagnosis",
      "Computer vision model trained on crop disease datasets with 90%+ accuracy",
      "Web dashboard for agricultural advisors to monitor disease spread across regions",
      "Treatment recommendation system providing pesticide and organic remedy suggestions",
      "Historical disease tracking showing patterns over seasons and geographic areas",
    ],
    projectType: "Research / Innovation Project",
    domain: "Data Science",
    technologies: ["React", "Python", "FastAPI", "OpenCV", "TensorFlow", "PostgreSQL", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 14,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Industry Relevant",
      "Startup Potential",
      "Remote",
      "Innovative",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Data Scientist",
        "Senior",
        ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
        ["PyTorch", "Computer Vision", "Model Deployment", "Data Augmentation", "Transfer Learning"],
        [
          "Collect and curate crop disease image dataset from public sources and field data",
          "Train deep learning model for multi-class crop disease classification using CNNs",
          "Implement data augmentation techniques to improve model robustness to field conditions",
          "Optimize model for mobile deployment with quantization and pruning for fast inference",
          "Validate model performance through field testing and continuous improvement with new data",
        ],
        1
      ),
      role(
        "ML Engineer",
        "Intermediate",
        ["Python", "FastAPI", "TensorFlow", "Model Deployment"],
        ["Docker", "AWS", "REST APIs", "Monitoring", "Performance Optimization"],
        [
          "Build FastAPI service for image upload, preprocessing, and disease classification",
          "Deploy trained model to production with Docker and AWS for scalable inference",
          "Implement confidence scoring and fallback mechanisms for uncertain predictions",
          "Create model monitoring system tracking prediction accuracy and drift over time",
          "Optimize API performance for fast response times on mobile networks",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Data Visualization", "REST APIs"],
        ["Tailwind CSS", "Maps", "Charts", "Responsive Design", "Testing"],
        [
          "Build web dashboard for agricultural advisors with disease spread visualization",
          "Create interactive maps showing disease hotspots and geographic distribution",
          "Implement time-series charts for tracking disease trends over weeks and seasons",
          "Design mobile-responsive interface for viewing diagnosis history and treatment guides",
          "Develop export functionality for generating reports on disease outbreaks",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0e821d65aa34cb0ecd52ee",
    title: "Carbon Footprint Tracker for Campus Communities",
    summary:
      "A web app that helps university students and staff track their carbon footprint through transportation, dining, and energy choices, provides personalized reduction tips, and fosters campus-wide sustainability competitions.",
    problemStatement:
      "University communities want to reduce carbon emissions but lack tools to measure individual impact. Generic carbon calculators don't account for campus-specific data (dining hall choices, shuttle usage, dorm energy).",
    deliverables: [
      "Web app for tracking daily carbon footprint from transportation, food, and energy use",
      "Campus-specific carbon calculation formulas using university dining and shuttle data",
      "Personalized reduction tips based on user behavior and realistic campus alternatives",
      "Social features enabling dorms and student groups to compete in carbon reduction challenges",
      "Analytics dashboard for university sustainability offices showing aggregate campus impact",
    ],
    projectType: "Sustainability Product",
    domain: "Data Science",
    technologies: ["React", "Node.js", "Express.js", "PostgreSQL", "Pandas", "AWS"],
    difficulty: "Intermediate",
    duration: "short-term",
    weeklyHours: 10,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Short-Term",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Remote",
      "Innovative",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Data Analyst",
        "Intermediate",
        ["Python", "Pandas", "Data Analysis", "Carbon Accounting"],
        ["Statistical Modeling", "SQL", "Data Visualization", "Research", "Excel"],
        [
          "Research carbon emission factors for transportation, food, and energy consumption",
          "Build carbon calculation formulas using campus-specific data (dining menus, shuttle routes)",
          "Analyze user behavior patterns to generate personalized reduction recommendations",
          "Create carbon reduction challenge algorithms for dorms and student group competitions",
          "Validate calculation accuracy through comparison with established carbon accounting methods",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "JavaScript", "Data Visualization", "REST APIs"],
        ["TypeScript", "Tailwind CSS", "Chart.js", "Responsive Design", "Testing"],
        [
          "Build web app with daily carbon tracking interface (transport, food, energy choices)",
          "Create interactive visualizations showing user's carbon footprint trends over time",
          "Implement leaderboard and challenge features for dorm and student group competitions",
          "Design mobile-responsive layouts for quick daily logging on phones",
          "Develop onboarding flow explaining how to use the app and interpret carbon metrics",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "Express.js", "PostgreSQL", "REST APIs"],
        ["Authentication", "Data Processing", "Testing", "Documentation", "Deployment"],
        [
          "Build RESTful API for user tracking, carbon calculations, and challenge management",
          "Design PostgreSQL schema for users, daily logs, challenges, and aggregate analytics",
          "Implement user authentication and campus affiliation verification (email domain)",
          "Create analytics endpoints for sustainability office dashboard showing campus trends",
          "Set up automated daily summary emails with carbon footprint updates and tips",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 8: Sarah Chen ────────────────────────────────────────────────────
  {
    ownerId: "6a0ea2c565aa34cb0ecd5685",
    title: "AI Study Planner for University Students",
    summary:
      "An AI-powered study planner that analyzes students' course syllabi, exam schedules, and learning pace to generate personalized study plans, recommend optimal study times, and adapt schedules based on progress.",
    problemStatement:
      "University students struggle to create effective study schedules that balance multiple courses, assignments, and exams. Generic planners don't account for individual learning pace, course difficulty, or energy levels.",
    deliverables: [
      "Web app for uploading syllabi and generating AI-powered personalized study plans",
      "AI algorithm analyzing course workload, deadlines, and user learning patterns",
      "Adaptive scheduling that adjusts study plans based on completed tasks and quiz performance",
      "Study session reminders and focus mode with distraction blocking suggestions",
      "Progress analytics showing time spent studying, topics mastered, and upcoming deadlines",
    ],
    projectType: "AI-Powered Platform",
    domain: "AI & ML",
    technologies: ["React", "FastAPI", "Python", "LangChain", "MongoDB", "Docker"],
    difficulty: "Intermediate",
    duration: "long-term",
    weeklyHours: 12,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Mentor Needed",
      "Portfolio Project",
      "Resume Booster",
      "AI-Powered",
      "Remote",
    ],
    status: "Open" as const,
    roles: [
      role(
        "AI Integration Developer",
        "Intermediate",
        ["Python", "FastAPI", "LangChain", "REST APIs"],
        ["OpenAI API", "NLP", "Prompt Engineering", "Docker", "Model Integration"],
        [
          "Build syllabus parsing pipeline using LangChain to extract courses, topics, and deadlines",
          "Implement AI-powered study plan generation considering workload, difficulty, and user pace",
          "Create adaptive scheduling algorithm that adjusts plans based on user progress and feedback",
          "Design prompt engineering strategies for extracting structured data from unstructured syllabi",
          "Integrate FastAPI service with frontend and handle LLM API rate limiting and retries",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "REST APIs", "Data Visualization"],
        ["Tailwind CSS", "Calendar UI", "Chart.js", "Responsive Design", "Testing"],
        [
          "Build web app for uploading syllabi and viewing generated study plans",
          "Create interactive calendar view showing study sessions, deadlines, and progress",
          "Implement drag-and-drop interface for manually adjusting study plan schedules",
          "Design progress dashboard with visualizations for time studied and topics mastered",
          "Develop focus mode with timer and distraction blocking reminders",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Junior",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["Authentication", "Data Processing", "Testing", "Documentation", "Deployment"],
        [
          "Build RESTful API for syllabus uploads, study plans, and user progress tracking",
          "Design MongoDB schema for courses, study plans, user preferences, and session logs",
          "Implement user authentication and secure storage of uploaded syllabus documents",
          "Create scheduled jobs for sending study session reminders via email and push notifications",
          "Develop analytics endpoints for tracking study patterns and plan adherence over time",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0ea2c565aa34cb0ecd5685",
    title: "Remote Healthcare Triage Assistant",
    summary:
      "An AI-powered telemedicine assistant that conducts preliminary patient symptom assessments, prioritizes cases based on urgency, connects patients to appropriate care providers, and maintains HIPAA-compliant medical records.",
    problemStatement:
      "Healthcare clinics are overwhelmed with non-urgent cases. Patients struggle to assess symptom severity and choose appropriate care levels (ER vs urgent care vs telehealth). Manual triage is time-consuming and error-prone.",
    deliverables: [
      "Web and mobile app for patients to input symptoms and receive triage recommendations",
      "AI-powered symptom assessment engine using medical decision trees and NLP",
      "Urgency classification system (emergency, urgent care, primary care, self-care)",
      "Secure messaging platform connecting patients with doctors for telehealth consultations",
      "HIPAA-compliant data storage and audit logging for patient privacy protection",
    ],
    projectType: "Healthcare Innovation",
    domain: "AI & ML",
    technologies: ["React", "FastAPI", "Python", "PostgreSQL", "Hugging Face", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 16,
    compensation: "Paid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Industry Relevant",
      "Startup Potential",
      "Innovative",
      "AI-Powered",
      "Remote",
    ],
    status: "Open" as const,
    roles: [
      role(
        "ML Engineer",
        "Senior",
        ["Python", "NLP", "Hugging Face", "Medical AI", "FastAPI"],
        ["BERT", "Model Fine-Tuning", "Healthcare Compliance", "Docker", "Model Deployment"],
        [
          "Build symptom assessment engine using medical decision trees and NLP models",
          "Fine-tune language models on medical datasets for accurate symptom understanding",
          "Implement urgency classification system with validated medical triage protocols",
          "Create confidence scoring to escalate uncertain cases to human medical professionals",
          "Ensure model compliance with healthcare regulations and clinical validation standards",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Senior",
        ["Python", "FastAPI", "PostgreSQL", "HIPAA Compliance", "Security"],
        ["Encryption", "Audit Logging", "Docker", "AWS", "Authentication"],
        [
          "Build HIPAA-compliant backend architecture with encryption at rest and in transit",
          "Design PostgreSQL schema for patient records, symptom assessments, and consultations",
          "Implement secure messaging system for doctor-patient communication with end-to-end encryption",
          "Create audit logging for all patient data access and model predictions for compliance",
          "Set up role-based access control for patients, doctors, and administrative staff",
        ],
        1
      ),
      role(
        "UI/UX Designer",
        "Intermediate",
        ["Figma", "UI Design", "UX Research", "Healthcare Design"],
        ["Prototyping", "User Testing", "Accessibility", "Mobile Design", "Design Systems"],
        [
          "Design patient-friendly symptom input interface that's clear and non-intimidating",
          "Create triage result screens explaining urgency levels and recommended next steps",
          "Develop doctor consultation interface optimized for fast patient review and messaging",
          "Conduct usability testing with patients and healthcare providers to validate designs",
          "Ensure accessibility compliance for elderly users and those with disabilities",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 9: James Okonkwo ─────────────────────────────────────────────────
  {
    ownerId: "6a0ea2c565aa34cb0ecd5686",
    title: "DevOps Deployment Monitoring Board",
    summary:
      "A centralized dashboard for engineering teams to monitor deployments across multiple environments, track rollback history, view real-time deployment status, and receive alerts for failed deployments or anomalies.",
    problemStatement:
      "Engineering teams deploy to multiple environments (dev, staging, production) using different CI/CD tools. Tracking deployment status, identifying failed deployments, and coordinating rollbacks is fragmented and error-prone.",
    deliverables: [
      "Web dashboard aggregating deployment data from GitHub Actions, GitLab CI, Jenkins",
      "Real-time deployment status view showing in-progress, successful, and failed deployments",
      "Rollback tracking with diff views showing code changes between deployments",
      "Alerting system for failed deployments with Slack and email notifications",
      "Deployment history analytics showing frequency, duration, and failure patterns",
    ],
    projectType: "Developer Tool",
    domain: "Software Engineering",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Docker", "Kubernetes", "AWS"],
    difficulty: "Intermediate",
    duration: "short-term",
    weeklyHours: 10,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Short-Term",
      "Open for Contributions",
      "Portfolio Project",
      "Resume Booster",
      "Industry Relevant",
      "Remote",
    ],
    status: "Open" as const,
    roles: [
      role(
        "DevOps Engineer",
        "Senior",
        ["Docker", "Kubernetes", "CI/CD", "GitHub Actions"],
        ["GitLab CI", "Jenkins", "AWS", "Monitoring", "Scripting"],
        [
          "Research and implement integrations with GitHub Actions, GitLab CI, and Jenkins APIs",
          "Design webhook endpoints for receiving real-time deployment events from CI/CD tools",
          "Build deployment status aggregation logic normalizing data from different CI/CD sources",
          "Create Slack and email notification system for failed deployments and anomalies",
          "Develop deployment rollback tracking showing git diffs between versions",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Node.js", "Express.js", "MongoDB", "REST APIs"],
        ["WebSockets", "Authentication", "Testing", "Documentation", "Docker"],
        [
          "Build RESTful API for deployment data, environment configuration, and alerting rules",
          "Design MongoDB schema for deployments, environments, CI/CD integrations, and alerts",
          "Implement WebSocket server for real-time deployment status updates to dashboard",
          "Create authentication system for teams with role-based access to different environments",
          "Develop analytics endpoints calculating deployment frequency and failure rates",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Real-Time Updates", "Data Visualization"],
        ["Tailwind CSS", "WebSockets", "Chart.js", "Responsive Design", "Testing"],
        [
          "Build real-time dashboard showing deployment status across all environments",
          "Create deployment history view with filtering, searching, and pagination",
          "Implement rollback diff viewer showing code changes between deployments",
          "Design alert configuration interface for setting up Slack and email notifications",
          "Develop deployment analytics charts showing trends and failure patterns over time",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0ea2c565aa34cb0ecd5686",
    title: "Smart Public Transport Delay Prediction System",
    summary:
      "A data-driven platform that predicts bus and train delays in real-time using historical transit data, weather conditions, traffic patterns, and special events, helping commuters plan journeys more effectively.",
    problemStatement:
      "Public transit delays frustrate commuters who lack accurate arrival predictions. Transit apps show scheduled times, not real-time delay forecasts. Weather, traffic, and events cause delays but aren't factored into ETAs.",
    deliverables: [
      "Mobile and web app showing real-time delay predictions for buses and trains",
      "Machine learning model forecasting delays using historical transit, weather, and traffic data",
      "Route suggestion engine recommending alternative routes during major delays",
      "Push notifications alerting users to significant delays on saved routes",
      "Historical delay analytics showing patterns by route, time of day, and weather conditions",
    ],
    projectType: "Smart City Product",
    domain: "Data Science",
    technologies: ["React", "Python", "FastAPI", "Pandas", "Scikit-learn", "PostgreSQL", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 14,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Industry Relevant",
      "Startup Potential",
      "Remote",
      "Innovative",
      "AI-Powered",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Data Scientist",
        "Senior",
        ["Python", "Pandas", "Scikit-learn", "Machine Learning", "Time-Series Analysis"],
        ["XGBoost", "Feature Engineering", "Statistical Modeling", "SQL", "Jupyter"],
        [
          "Collect and clean historical transit data from public APIs and government open data portals",
          "Build delay prediction model using time-series forecasting and regression techniques",
          "Integrate external data sources (weather APIs, traffic data, event calendars) as features",
          "Implement feature engineering to capture patterns like rush hour, day of week, holidays",
          "Validate model accuracy through backtesting with historical data and real-world deployment",
        ],
        1
      ),
      role(
        "Backend Developer",
        "Intermediate",
        ["Python", "FastAPI", "PostgreSQL", "REST APIs"],
        ["Data Processing", "Scheduled Jobs", "Docker", "AWS", "Monitoring"],
        [
          "Build FastAPI service for delay prediction requests and route recommendations",
          "Design PostgreSQL schema for transit routes, historical delays, and user preferences",
          "Implement scheduled jobs for fetching real-time transit data and updating predictions",
          "Create REST API endpoints for mobile app and web dashboard with caching for performance",
          "Set up monitoring and alerting for model performance and API uptime",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Maps", "Data Visualization"],
        ["Tailwind CSS", "Mapbox", "PWA", "Responsive Design", "Testing"],
        [
          "Build web app with interactive map showing real-time delay predictions for routes",
          "Create route search interface with delay forecasts and alternative route suggestions",
          "Implement user account features for saving favorite routes and receiving notifications",
          "Design mobile-responsive layouts optimized for quick commute checks on phones",
          "Develop PWA with offline support for viewing saved routes without internet",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  // ── OWNER 10: Maria Gonzalez ───────────────────────────────────────────────
  {
    ownerId: "6a0ea2c565aa34cb0ecd5687",
    title: "UI Pattern Library for Early-Stage Startups",
    summary:
      "An open-source design system and component library tailored for early-stage startups, providing pre-built React components, design tokens, and templates for common SaaS pages (landing, pricing, dashboard).",
    problemStatement:
      "Early-stage startups waste weeks building basic UI components from scratch. Generic design systems (Material UI, Chakra) look corporate. There's no startup-focused library with modern aesthetics and SaaS templates.",
    deliverables: [
      "Open-source React component library with 50+ components and TypeScript support",
      "Design token system (colors, typography, spacing) with light/dark mode variants",
      "Pre-built page templates for landing pages, pricing tables, and dashboard layouts",
      "Comprehensive documentation site with live component demos and code examples",
      "Figma design kit with matching components for design-to-code workflow",
    ],
    projectType: "Design System",
    domain: "Web Dev",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "Figma"],
    difficulty: "Intermediate",
    duration: "short-term",
    weeklyHours: 8,
    compensation: "Unpaid",
    tags: [
      "Intermediate",
      "Team Project",
      "Looking for Team",
      "Short-Term",
      "Open for Contributions",
      "Portfolio Project",
      "Resume Booster",
      "Remote",
      "Skill Building",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Tailwind CSS", "Component Libraries"],
        ["Vite", "Storybook", "Accessibility", "Testing", "npm Publishing"],
        [
          "Build reusable React components with TypeScript and Tailwind CSS styling",
          "Implement design token system with CSS variables for theming and dark mode",
          "Create component composition patterns following React best practices",
          "Set up Storybook for component documentation and live demos",
          "Package and publish library to npm with proper versioning and changelog",
        ],
        1
      ),
      role(
        "UI/UX Designer",
        "Intermediate",
        ["Figma", "Design Systems", "UI Design", "Component Design"],
        ["Prototyping", "Design Tokens", "Accessibility", "Responsive Design", "Documentation"],
        [
          "Design modern, startup-friendly UI components with clean aesthetics",
          "Create comprehensive Figma design kit matching React component library",
          "Develop design token system (colors, typography, spacing, shadows) with variants",
          "Design pre-built page templates for common SaaS pages (landing, pricing, dashboard)",
          "Ensure all components meet WCAG 2.1 accessibility standards",
        ],
        1
      ),
      role(
        "Technical Writer",
        "Junior",
        ["Technical Writing", "Documentation", "Markdown", "Web Content"],
        ["React", "JavaScript", "Web Development", "Examples", "SEO"],
        [
          "Write comprehensive documentation explaining component usage and props",
          "Create getting started guides for installing and using the library",
          "Develop code examples showing common use cases and composition patterns",
          "Build documentation website using static site generator (Docusaurus, VitePress)",
          "Write contributing guidelines encouraging open-source community participation",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },

  {
    ownerId: "6a0ea2c565aa34cb0ecd5687",
    title: "Robotics Warehouse Picking Assistant",
    summary:
      "A computer vision and robotics system that guides warehouse picking robots to identify, locate, and retrieve items from shelves using real-time object detection, depth sensing, and path planning algorithms.",
    problemStatement:
      "Warehouse automation requires expensive custom solutions. Small warehouses can't afford industrial picking robots. Open-source robotics tools exist but lack integrated vision systems for item recognition and retrieval.",
    deliverables: [
      "Computer vision pipeline for real-time object detection and localization on shelves",
      "Depth sensing integration using cameras to calculate 3D item positions",
      "Path planning algorithm for collision-free robot arm movement to target items",
      "Web-based control interface for monitoring picking operations and queuing tasks",
      "Integration guide for connecting with common warehouse management systems",
    ],
    projectType: "Research / Innovation Project",
    domain: "Robotics",
    technologies: ["Python", "React", "FastAPI", "OpenCV", "PostgreSQL", "Docker", "AWS"],
    difficulty: "Advanced",
    duration: "long-term",
    weeklyHours: 15,
    compensation: "Unpaid",
    tags: [
      "Advanced",
      "Team Project",
      "Looking for Team",
      "Long-Term",
      "Mentor Needed",
      "Industry Relevant",
      "Portfolio Project",
      "Innovative",
    ],
    status: "Open" as const,
    roles: [
      role(
        "Robotics Software Developer",
        "Senior",
        ["Python", "Robotics", "Computer Vision", "Path Planning"],
        ["ROS", "Motion Control", "Kinematics", "Simulation", "Hardware Integration"],
        [
          "Design object detection pipeline using OpenCV and deep learning for item recognition",
          "Implement depth sensing algorithms to calculate 3D positions of items on shelves",
          "Build path planning system for collision-free robot arm movement to target items",
          "Create control interface for sending pick commands and monitoring robot status",
          "Validate system through simulation and physical robot testing in warehouse scenarios",
        ],
        1
      ),
      role(
        "Computer Vision Engineer",
        "Senior",
        ["Python", "OpenCV", "Deep Learning", "Object Detection"],
        ["TensorFlow", "PyTorch", "3D Vision", "Camera Calibration", "Real-Time Processing"],
        [
          "Train object detection models on warehouse item datasets with varying shelf conditions",
          "Implement real-time video processing pipeline optimized for low-latency detection",
          "Develop depth estimation algorithms using stereo cameras or depth sensors",
          "Create camera calibration tools for accurate 3D position mapping",
          "Optimize computer vision pipeline for edge deployment on robot hardware",
        ],
        1
      ),
      role(
        "Frontend Developer",
        "Intermediate",
        ["React", "TypeScript", "Real-Time Updates", "Data Visualization"],
        ["Tailwind CSS", "WebSockets", "3D Visualization", "Responsive Design", "Testing"],
        [
          "Build web-based control interface for monitoring robot picking operations",
          "Create task queue management system for scheduling picking jobs",
          "Implement real-time video feed display showing robot camera view and detections",
          "Design 3D visualization showing robot arm position and planned movement path",
          "Develop analytics dashboard tracking picking success rates and cycle times",
        ],
        1
      ),
    ],
    members: [],
    applicants: [],
  },
];

// ── Validation ─────────────────────────────────────────────────────────────────

const ALLOWED_DOMAINS = [
  "Software Engineering",
  "AI & ML",
  "IoT",
  "Robotics",
  "Data Science",
  "Cybersecurity",
  "Web Dev",
  "Mobile Dev",
];

const ALLOWED_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const ALLOWED_DURATIONS = ["short-term", "long-term"];

const ALLOWED_TAGS = [
  "Beginner Friendly",
  "Intermediate",
  "Advanced",
  "Team Project",
  "Solo Project",
  "Looking for Team",
  "Mentor Needed",
  "Short-Term",
  "Long-Term",
  "Flexible",
  "In Progress",
  "Completed",
  "Actively Hiring",
  "Urgent Roles",
  "Open for Contributions",
  "Portfolio Project",
  "Resume Booster",
  "Industry Relevant",
  "Startup Potential",
  "Learning Project",
  "Skill Building",
  "Experimental",
  "Remote",
  "Hybrid",
  "In-Person",
  "Innovative",
  "AI-Powered",
];

const validateProjects = (projects: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check total count
  if (projects.length !== 20) {
    errors.push(`Expected 20 projects, got ${projects.length}`);
  }

  // Check owner distribution
  const ownerCounts = new Map<string, number>();
  for (const owner of PROJECT_OWNERS) {
    ownerCounts.set(owner.userId, 0);
  }
  for (const project of projects) {
    const count = ownerCounts.get(project.ownerId) || 0;
    ownerCounts.set(project.ownerId, count + 1);
  }
  for (const [ownerId, count] of ownerCounts.entries()) {
    if (count !== 2) {
      const owner = PROJECT_OWNERS.find((o) => o.userId === ownerId);
      errors.push(`Owner ${owner?.name} (${ownerId}) has ${count} projects, expected 2`);
    }
  }

  // Check unique titles
  const titles = new Set<string>();
  for (const project of projects) {
    if (titles.has(project.title)) {
      errors.push(`Duplicate title: ${project.title}`);
    }
    titles.add(project.title);
  }

  // Validate each project
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const prefix = `Project ${i + 1} (${p.title}):`;

    // Owner ID validation
    if (!PROJECT_OWNERS.some((o) => o.userId === p.ownerId)) {
      errors.push(`${prefix} Invalid ownerId ${p.ownerId}`);
    }

    // Title validation
    if (!p.title || p.title.trim().length === 0) {
      errors.push(`${prefix} Title is empty`);
    }
    if (/\d/.test(p.title)) {
      errors.push(`${prefix} Title contains numbers`);
    }

    // Required fields
    if (!p.summary || p.summary.trim().length === 0) {
      errors.push(`${prefix} Summary is empty`);
    }
    if (!p.problemStatement || p.problemStatement.trim().length === 0) {
      errors.push(`${prefix} Problem statement is empty`);
    }
    if (!Array.isArray(p.deliverables) || p.deliverables.length < 3) {
      errors.push(`${prefix} Deliverables must have at least 3 items`);
    }
    if (!p.projectType || p.projectType.trim().length === 0) {
      errors.push(`${prefix} Project type is empty`);
    }

    // Domain validation
    if (!ALLOWED_DOMAINS.includes(p.domain)) {
      errors.push(`${prefix} Invalid domain: ${p.domain}`);
    }

    // Difficulty validation
    if (!ALLOWED_DIFFICULTIES.includes(p.difficulty)) {
      errors.push(`${prefix} Invalid difficulty: ${p.difficulty}`);
    }

    // Duration validation
    if (!ALLOWED_DURATIONS.includes(p.duration)) {
      errors.push(`${prefix} Invalid duration: ${p.duration}`);
    }

    // Weekly hours validation
    if (typeof p.weeklyHours !== "number" || p.weeklyHours < 1 || p.weeklyHours > 80) {
      errors.push(`${prefix} weeklyHours must be 1-80, got ${p.weeklyHours}`);
    }

    // Compensation validation
    if (!p.compensation || p.compensation.trim().length === 0) {
      errors.push(`${prefix} Compensation is empty`);
    }

    // Tags validation
    if (Array.isArray(p.tags)) {
      for (const tag of p.tags) {
        if (!ALLOWED_TAGS.includes(tag)) {
          errors.push(`${prefix} Invalid tag: ${tag}`);
        }
      }
    }

    // Status validation
    if (p.status !== "Open") {
      errors.push(`${prefix} Status must be "Open", got ${p.status}`);
    }

    // Roles validation
    if (!Array.isArray(p.roles) || p.roles.length < 2 || p.roles.length > 4) {
      errors.push(`${prefix} Must have 2-4 roles, got ${p.roles?.length || 0}`);
    } else {
      for (let j = 0; j < p.roles.length; j++) {
        const r = p.roles[j];
        const rolePrefix = `${prefix} Role ${j + 1}:`;
        if (!r.title || r.title.trim().length === 0) {
          errors.push(`${rolePrefix} Title is empty`);
        }
        if (!Array.isArray(r.responsibilities) || r.responsibilities.length === 0) {
          errors.push(`${rolePrefix} Responsibilities is empty`);
        }
        if (!Array.isArray(r.requiredSkills) || r.requiredSkills.length === 0) {
          errors.push(`${rolePrefix} Required skills is empty`);
        }
        if (!["Junior", "Intermediate", "Senior"].includes(r.level)) {
          errors.push(`${rolePrefix} Invalid level: ${r.level}`);
        }
        if (typeof r.seats !== "number" || r.seats < 1) {
          errors.push(`${rolePrefix} Seats must be >= 1, got ${r.seats}`);
        }
        if (r.status !== "Open") {
          errors.push(`${rolePrefix} Status must be "Open", got ${r.status}`);
        }
      }
    }

    // Forbidden fields
    if (p.posterImage) {
      errors.push(`${prefix} Should not set posterImage`);
    }
    if (p.posterKey) {
      errors.push(`${prefix} Should not set posterKey`);
    }
    if (p.recommendationEmbedding) {
      errors.push(`${prefix} Should not set recommendationEmbedding`);
    }
    if (p.recommendationEmbeddingText) {
      errors.push(`${prefix} Should not set recommendationEmbeddingText`);
    }
    if (p.recommendationEmbeddingModel) {
      errors.push(`${prefix} Should not set recommendationEmbeddingModel`);
    }
    if (p.recommendationEmbeddingUpdatedAt) {
      errors.push(`${prefix} Should not set recommendationEmbeddingUpdatedAt`);
    }

    // Members and applicants
    if (!Array.isArray(p.members)) {
      errors.push(`${prefix} Members must be an array`);
    }
    if (!Array.isArray(p.applicants)) {
      errors.push(`${prefix} Applicants must be an array`);
    }
  }

  return { valid: errors.length === 0, errors };
};

// ── Main seed function ─────────────────────────────────────────────────────────

async function seedProjects() {
  let exitCode = 0;

  try {
    console.log("\n🌱 Starting project seeding...\n");

    // Check for reset flag
    const resetMode = process.argv.includes("--reset");
    console.log(`Reset mode: ${resetMode ? "✅ ENABLED" : "❌ DISABLED"}\n`);

    // Connect to database
    await connectDB();

    // ── Validate owners ────────────────────────────────────────────────────
    console.log("🔍 Validating project owners...\n");

    for (const owner of PROJECT_OWNERS) {
      const user = await User.findById(owner.userId).lean();
      if (!user) {
        console.error(`❌ Owner not found: ${owner.name} (${owner.email})`);
        exitCode = 1;
        return;
      }
      if (user.email !== owner.email) {
        console.error(
          `❌ Email mismatch for ${owner.name}: expected ${owner.email}, got ${user.email}`
        );
        exitCode = 1;
        return;
      }
      console.log(`✅ ${owner.name} (${owner.email})`);
    }

    console.log("\n✅ All owners validated.\n");

    // ── Build projects ─────────────────────────────────────────────────────
    const projects = buildProjects();

    // ── Validate projects ──────────────────────────────────────────────────
    console.log("🔍 Validating project data...\n");
    const validation = validateProjects(projects);
    if (!validation.valid) {
      console.error("❌ Validation failed:\n");
      for (const error of validation.errors) {
        console.error(`   ${error}`);
      }
      exitCode = 1;
      return;
    }
    console.log("✅ All projects validated.\n");

    // ── Reset if requested ─────────────────────────────────────────────────
    let deletedCount = 0;
    if (resetMode) {
      console.log("🗑️  Deleting existing seeded projects...\n");

      const ownerIds = PROJECT_OWNERS.map((o) => o.userId);
      const titles = projects.map((p) => p.title);

      const deleteResult = await Project.deleteMany({
        ownerId: { $in: ownerIds },
        title: { $in: titles },
      });
      deletedCount = deleteResult.deletedCount ?? 0;

      console.log(`   Deleted ${deletedCount} projects.\n`);
    }

    // ── Upsert projects ────────────────────────────────────────────────────
    console.log("💾 Upserting projects...\n");

    let upserted = 0;
    let matched = 0;
    let modified = 0;
    let failed = 0;

    for (const project of projects) {
      try {
        const result = await Project.updateOne(
          { ownerId: project.ownerId, title: project.title },
          { $set: project },
          { upsert: true }
        );

        if (result.upsertedCount > 0) upserted++;
        if (result.matchedCount > 0) matched++;
        if (result.modifiedCount > 0) modified++;

        const owner = PROJECT_OWNERS.find((o) => o.userId === project.ownerId);
        console.log(`   ✅ ${project.title} (${owner?.name})`);
      } catch (err) {
        failed++;
        const owner = PROJECT_OWNERS.find((o) => o.userId === project.ownerId);
        console.error(`   ❌ ${project.title} (${owner?.name}): ${err}`);
      }
    }

    // ── Summary ────────────────────────────────────────────────────────────
    console.log("\n📊 Seeding Summary:");
    console.log(`   Total projects: ${projects.length}`);
    console.log(`   Upserted: ${upserted}`);
    console.log(`   Matched: ${matched}`);
    console.log(`   Modified: ${modified}`);
    console.log(`   Failed: ${failed}`);
    if (resetMode) {
      console.log(`   Reset deleted: ${deletedCount}`);
    }

    console.log(
      "\n💡 Note: Project embeddings will be auto-generated by the embeddingFreshness service."
    );
    console.log("   If embeddings are needed immediately, run:");
    console.log("   POST /api/recommendations/projects/generate-missing-embeddings\n");

    if (failed > 0) {
      exitCode = 1;
    }
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.\n");
    process.exit(exitCode);
  }
}

// Run
seedProjects();
