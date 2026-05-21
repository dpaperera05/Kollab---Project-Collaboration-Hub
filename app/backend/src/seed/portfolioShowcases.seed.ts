import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { PortfolioItem } from "../models/portfolio.model";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Environment Guard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (process.env.ALLOW_SHOWCASE_SEED !== "true") {
  console.error("❌ ALLOW_SHOWCASE_SEED must be set to true before running this script.");
  process.exit(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Seeded Member Emails
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEEDED_MEMBER_EMAILS = [
  "maya.silva@kollabmail.test",
  "arjun.mehra@kollabmail.test",
  "sofia.martinez@kollabmail.test",
  "liam.anderson@kollabmail.test",
  "aisha.khan@kollabmail.test",
  "noah.wilson@kollabmail.test",
  "emma.schneider@kollabmail.test",
  "kenji.tanaka@kollabmail.test",
  "amara.okafor@kollabmail.test",
  "lucas.moreau@kollabmail.test",
  "nora.ibrahim@kollabmail.test",
  "ethan.carter@kollabmail.test",
  "kavindu.perera@kollabmail.test",
  "priya.nair@kollabmail.test",
  "olivia.brown@kollabmail.test",
  "daniel.kim@kollabmail.test",
  "fatima.hassan@kollabmail.test",
  "mateo.garcia@kollabmail.test",
  "hannah.clarke@kollabmail.test",
  "ryan.murphy@kollabmail.test",
  "lina.chen@kollabmail.test",
  "omar.farouk@kollabmail.test",
  "isabella.rossi@kollabmail.test",
  "thomas.nguyen@kollabmail.test",
  "sara.patel@kollabmail.test",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Allowed Values
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ALLOWED_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "Product Manager",
  "Security Analyst",
  "Embedded Developer",
  "Robotics Engineer",
  "Blockchain Developer",
  "Game Developer",
  "Data Analyst",
  "Technical Writer",
  "3D Developer",
];

const ALLOWED_TECH_STACK = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "FastAPI",
  "Spring Boot",
  "Kotlin",
  "Swift",
  "React Native",
  "Flutter",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Kafka",
  "GraphQL",
  "gRPC",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "Tailwind CSS",
  "Vite",
];

const FORBIDDEN_WORDS = ["demo", "seed", "fake", "sample", "dummy", "placeholder"];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Generic Image URLs (Safe for Reuse)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=600&fit=crop",
];

const SCREENSHOT_IMAGES = [
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&h=500&fit=crop",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Showcase Data Builder
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const buildShowcases = (userMap: Map<string, any>) => {
  const showcases: any[] = [];

  // Maya Silva - 3 showcases (Frontend Developer)
  if (userMap.has("maya.silva@kollabmail.test")) {
    const user = userMap.get("maya.silva@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Interactive Data Visualization Dashboard",
      role: "Frontend Developer",
      summary: "Built a responsive analytics dashboard with real-time charts and filtering capabilities for business intelligence insights.",
      problem: "Stakeholders struggled to interpret complex data from multiple sources without a unified visual interface.",
      solution: "Developed a React-based dashboard with modular chart components, customizable filters, and export functionality.",
      responsibilities: "Designed component architecture, implemented chart integrations, optimized rendering performance, and ensured cross-browser compatibility.",
      outcomes: "Reduced report generation time by 40% and increased stakeholder engagement with data-driven insights.",
      techStack: ["React", "Vite", "Tailwind CSS", "GraphQL"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/analytics-dashboard" },
        { label: "Live Preview", url: "https://analytics-dashboard.kollabmail.test" },
      ],
      collaborators: ["Alex Rivera"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[0],
      specialNotes: "Focused on accessibility standards and responsive design principles throughout development.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "E-Commerce Product Comparison Tool",
      role: "Frontend Developer",
      summary: "Created a product comparison interface with side-by-side feature analysis and price tracking for online shoppers.",
      problem: "Users found it difficult to compare multiple products across different categories and make informed purchase decisions.",
      solution: "Built a comparison grid with dynamic filtering, sorting, and visual indicators for feature differences.",
      responsibilities: "Implemented responsive layouts, integrated API calls, developed custom hooks for state management, and optimized image loading.",
      outcomes: "Improved user decision-making speed by 35% and increased conversion rates on comparison pages.",
      techStack: ["React", "Next.js", "Tailwind CSS", "Redis"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/product-compare" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/product-compare" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[1],
      specialNotes: "Implemented lazy loading and memoization to handle large product catalogs efficiently.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Collaborative Whiteboard Application",
      role: "Frontend Developer",
      summary: "Developed a real-time collaborative drawing tool with multi-user support and persistent canvas state.",
      problem: "Remote teams lacked an intuitive visual collaboration space for brainstorming and ideation sessions.",
      solution: "Created a canvas-based application with WebSocket integration for real-time synchronization and drawing tools.",
      responsibilities: "Built canvas rendering logic, implemented WebSocket client, designed UI controls, and handled conflict resolution.",
      outcomes: "Enabled seamless collaboration for distributed teams with latency under 100ms for drawing updates.",
      techStack: ["React", "Node.js", "MongoDB", "Vite"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/collab-whiteboard" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/whiteboard-tech" },
      ],
      collaborators: ["Jordan Lee", "Sam Chen"],
      screenshots: [SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[2],
      specialNotes: "Optimized drawing performance using canvas debouncing and batch update strategies.",
      isPublished: true,
    });
  }

  // Arjun Mehra - 2 showcases (Backend Developer)
  if (userMap.has("arjun.mehra@kollabmail.test")) {
    const user = userMap.get("arjun.mehra@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "API Gateway for Microservices Architecture",
      role: "Backend Developer",
      summary: "Designed and implemented a centralized API gateway to manage routing, authentication, and rate limiting across distributed services.",
      problem: "Multiple microservices lacked unified authentication and rate limiting, leading to security gaps and inconsistent client experiences.",
      solution: "Built a gateway layer with JWT authentication, request throttling, and service discovery integration.",
      responsibilities: "Architected routing logic, implemented middleware for auth and logging, configured load balancing, and wrote comprehensive API documentation.",
      outcomes: "Reduced authentication overhead by 50% and improved API response consistency across all services.",
      techStack: ["Node.js", "Express", "Redis", "Docker", "Kafka"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/api-gateway" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/api-gateway" },
      ],
      collaborators: ["Priya Sharma"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[3],
      specialNotes: "Implemented circuit breaker patterns to handle downstream service failures gracefully.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Real-Time Notification Service",
      role: "Backend Developer",
      summary: "Developed a scalable notification system supporting email, push, and in-app channels with delivery tracking.",
      problem: "Users missed critical updates due to unreliable notification delivery and lack of multi-channel support.",
      solution: "Created a notification service with message queues, retry logic, and delivery confirmation across multiple channels.",
      responsibilities: "Designed message queue architecture, integrated third-party notification providers, implemented retry mechanisms, and built analytics endpoints.",
      outcomes: "Achieved 99.5% delivery success rate and reduced notification latency to under 2 seconds.",
      techStack: ["Node.js", "Kafka", "MongoDB", "Redis", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/notification-service" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/notifications" },
      ],
      collaborators: ["Maya Silva"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[4],
      specialNotes: "Handled peak loads of 10,000 messages per minute using horizontal scaling and queue partitioning.",
      isPublished: true,
    });
  }

  // Sofia Martinez - 3 showcases (Full Stack Developer)
  if (userMap.has("sofia.martinez@kollabmail.test")) {
    const user = userMap.get("sofia.martinez@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Event Registration Platform",
      role: "Full Stack Developer",
      summary: "Built an end-to-end event management system with registration, payment processing, and attendee tracking.",
      problem: "Event organizers managed registrations manually through spreadsheets, leading to errors and poor attendee experience.",
      solution: "Developed a web application with automated registration workflows, payment integration, and real-time capacity tracking.",
      responsibilities: "Designed database schema, built REST APIs, implemented frontend registration forms, integrated payment gateway, and deployed on cloud infrastructure.",
      outcomes: "Processed over 500 registrations with zero payment errors and reduced organizer workload by 70%.",
      techStack: ["React", "Node.js", "Express", "PostgreSQL", "AWS", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/event-registration" },
        { label: "Live Preview", url: "https://events.kollabmail.test" },
      ],
      collaborators: ["Liam Anderson"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[5],
      specialNotes: "Implemented secure payment handling following PCI compliance guidelines and data encryption standards.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Task Management Board with Team Collaboration",
      role: "Full Stack Developer",
      summary: "Created a Kanban-style task board with drag-and-drop functionality, team assignments, and progress tracking.",
      problem: "Project teams struggled to visualize task dependencies and track progress across multiple concurrent initiatives.",
      solution: "Built a collaborative task board with real-time updates, role-based permissions, and customizable workflows.",
      responsibilities: "Implemented drag-and-drop UI, designed RESTful APIs, built notification system, configured WebSocket connections, and deployed CI/CD pipeline.",
      outcomes: "Improved team coordination efficiency by 45% and reduced missed deadlines by 30%.",
      techStack: ["React", "Node.js", "MongoDB", "GraphQL", "Docker", "Kubernetes"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/task-board" },
        { label: "Live Preview", url: "https://tasks.kollabmail.test" },
        { label: "Design Review", url: "https://case-study.kollabmail.test/task-board-design" },
      ],
      collaborators: ["Noah Wilson", "Emma Schneider"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[6],
      specialNotes: "Optimized database queries to support boards with 1000+ tasks without performance degradation.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Knowledge Base Search Portal",
      role: "Full Stack Developer",
      summary: "Developed a searchable documentation portal with version control, content categorization, and contributor management.",
      problem: "Internal documentation was scattered across multiple platforms with no unified search or version tracking.",
      solution: "Created a centralized knowledge base with full-text search, markdown support, and role-based content editing.",
      responsibilities: "Built search indexing service, designed content management APIs, implemented markdown editor, integrated version control, and configured deployment infrastructure.",
      outcomes: "Reduced documentation lookup time by 60% and increased content contribution rate by 80%.",
      techStack: ["Next.js", "Node.js", "PostgreSQL", "Redis", "AWS"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/knowledge-portal" },
        { label: "Live Preview", url: "https://docs.kollabmail.test" },
      ],
      collaborators: ["Ethan Carter"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[7],
      specialNotes: "Implemented intelligent search ranking based on content relevance, recency, and user feedback.",
      isPublished: true,
    });
  }

  // Liam Anderson - 2 showcases (UI/UX Designer)
  if (userMap.has("liam.anderson@kollabmail.test")) {
    const user = userMap.get("liam.anderson@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Design System Documentation Hub",
      role: "UI/UX Designer",
      summary: "Created a comprehensive design system with reusable components, accessibility guidelines, and interactive documentation.",
      problem: "Design inconsistencies across products led to fragmented user experiences and increased development time.",
      solution: "Built a unified design system with documented components, usage examples, and accessibility standards.",
      responsibilities: "Designed component library, wrote usage guidelines, conducted accessibility audits, created interactive examples, and collaborated with developers on implementation.",
      outcomes: "Reduced design-to-development handoff time by 50% and improved accessibility compliance across all products.",
      techStack: ["React", "Vite", "Tailwind CSS"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/design-system" },
        { label: "Live Preview", url: "https://design.kollabmail.test" },
        { label: "Design Review", url: "https://case-study.kollabmail.test/design-system" },
      ],
      collaborators: ["Isabella Rossi"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[0],
      specialNotes: "Ensured WCAG 2.1 AA compliance for all components with comprehensive keyboard navigation support.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Mobile-First Onboarding Experience",
      role: "UI/UX Designer",
      summary: "Designed an intuitive onboarding flow with progressive disclosure and personalized user paths.",
      problem: "New users experienced high drop-off rates during onboarding due to information overload and unclear navigation.",
      solution: "Created a step-by-step onboarding journey with contextual help, progress indicators, and adaptive content.",
      responsibilities: "Conducted user research, designed wireframes and prototypes, performed usability testing, iterated based on feedback, and delivered final designs.",
      outcomes: "Increased onboarding completion rate by 65% and reduced time-to-first-action by 40%.",
      techStack: ["React", "Tailwind CSS", "Vite"],
      links: [
        { label: "Case Study", url: "https://case-study.kollabmail.test/onboarding-redesign" },
        { label: "Design Review", url: "https://case-study.kollabmail.test/onboarding-process" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[3], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[1],
      specialNotes: "Applied behavioral psychology principles to reduce cognitive load and guide user decision-making.",
      isPublished: true,
    });
  }

  // Aisha Khan - 2 showcases (Mobile Developer)
  if (userMap.has("aisha.khan@kollabmail.test")) {
    const user = userMap.get("aisha.khan@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Habit Tracking Mobile Application",
      role: "Mobile Developer",
      summary: "Developed a cross-platform habit tracker with streak tracking, reminders, and progress visualization.",
      problem: "Users struggled to maintain consistent habits without visual feedback and timely reminders.",
      solution: "Built a mobile app with daily check-ins, visual progress charts, customizable reminders, and motivational insights.",
      responsibilities: "Designed app architecture, implemented local data persistence, built notification scheduling, created UI components, and integrated analytics.",
      outcomes: "Achieved 4.5-star rating with users reporting 70% improvement in habit consistency.",
      techStack: ["React Native", "MongoDB", "Node.js"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/habit-tracker" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/habit-tracker" },
      ],
      collaborators: ["Daniel Kim"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[2],
      specialNotes: "Optimized battery usage by implementing smart notification batching and background task scheduling.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Learning Companion Mobile App",
      role: "Mobile Developer",
      summary: "Created an educational mobile app with spaced repetition, progress tracking, and personalized learning paths.",
      problem: "Learners lacked structured practice schedules and personalized content recommendations for effective skill development.",
      solution: "Built a mobile application with adaptive learning algorithms, progress dashboards, and content curation.",
      responsibilities: "Implemented spaced repetition algorithm, designed intuitive navigation, integrated content APIs, built offline support, and optimized performance.",
      outcomes: "Supported over 200 active learners with 85% retention rate after 30 days.",
      techStack: ["Flutter", "FastAPI", "PostgreSQL", "Redis"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/learning-companion" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/learning-app" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[3],
      specialNotes: "Implemented intelligent content prefetching to ensure smooth offline learning experiences.",
      isPublished: true,
    });
  }

  // Noah Wilson - 3 showcases (ML Engineer)
  if (userMap.has("noah.wilson@kollabmail.test")) {
    const user = userMap.get("noah.wilson@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Project Recommendation Engine",
      role: "ML Engineer",
      summary: "Built an intelligent recommendation system to match students with relevant collaborative projects based on skills and interests.",
      problem: "Students struggled to discover projects aligned with their learning goals and skill development needs.",
      solution: "Developed a recommendation engine using collaborative filtering and content-based matching algorithms.",
      responsibilities: "Designed feature extraction pipeline, implemented recommendation algorithms, built API endpoints, evaluated model performance, and optimized inference latency.",
      outcomes: "Improved project match relevance by 75% and increased project team formation rate by 50%.",
      techStack: ["FastAPI", "MongoDB", "Redis", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/project-recommender" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/recommendation-engine" },
      ],
      collaborators: ["Sofia Martinez"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[4],
      specialNotes: "Achieved sub-50ms inference time by implementing efficient vector similarity search with caching.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Smart Search Interface for Mentorship Platform",
      role: "ML Engineer",
      summary: "Created an intelligent search system combining semantic understanding with keyword matching for mentor discovery.",
      problem: "Traditional keyword search failed to capture nuanced matching between mentee needs and mentor expertise.",
      solution: "Implemented hybrid search combining semantic embeddings with keyword scoring for improved relevance.",
      responsibilities: "Built embedding generation pipeline, designed scoring algorithm, integrated search API, conducted A/B testing, and monitored search quality metrics.",
      outcomes: "Increased successful mentor matches by 60% and reduced search time by 40%.",
      techStack: ["FastAPI", "MongoDB", "Redis", "AWS"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/smart-search" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/smart-search" },
      ],
      collaborators: ["Priya Nair"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[5],
      specialNotes: "Optimized embedding generation to process 10,000 profiles in under 5 minutes using batch processing.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Automated Code Review Assistant",
      role: "ML Engineer",
      summary: "Developed an AI-powered code review tool providing automated feedback on code quality, style, and potential bugs.",
      problem: "Manual code reviews were time-consuming and inconsistent, delaying development cycles.",
      solution: "Built an automated review assistant analyzing code patterns and providing actionable suggestions.",
      responsibilities: "Trained classification models, designed feedback generation pipeline, integrated with version control systems, evaluated accuracy metrics, and refined suggestion quality.",
      outcomes: "Reduced review time by 35% while maintaining code quality standards and catching 80% of common issues.",
      techStack: ["FastAPI", "MongoDB", "Docker", "Kubernetes"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/code-review-ai" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/code-review" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[6],
      specialNotes: "Continuously improved model accuracy through active learning from reviewer feedback.",
      isPublished: true,
    });
  }

  // Emma Schneider - 2 showcases (Data Analyst)
  if (userMap.has("emma.schneider@kollabmail.test")) {
    const user = userMap.get("emma.schneider@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Business Intelligence Analytics Dashboard",
      role: "Data Analyst",
      summary: "Created an executive dashboard aggregating key performance metrics with drill-down capabilities and trend analysis.",
      problem: "Leadership lacked real-time visibility into critical business metrics across multiple departments.",
      solution: "Built a centralized analytics dashboard with automated data pipelines and interactive visualizations.",
      responsibilities: "Designed data models, built ETL pipelines, created visualization templates, implemented drill-down features, and delivered training documentation.",
      outcomes: "Enabled data-driven decision making with 90% reduction in manual reporting effort.",
      techStack: ["React", "FastAPI", "PostgreSQL", "Redis", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/bi-dashboard" },
        { label: "Live Preview", url: "https://analytics.kollabmail.test" },
      ],
      collaborators: ["Daniel Kim"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[7],
      specialNotes: "Implemented efficient query optimization to handle datasets with millions of records.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Data Quality Monitoring Platform",
      role: "Data Analyst",
      summary: "Developed a monitoring system to detect data quality issues, track metrics, and alert stakeholders in real-time.",
      problem: "Data quality issues went undetected until they impacted downstream analytics and decision-making.",
      solution: "Created automated quality checks with configurable rules, anomaly detection, and notification workflows.",
      responsibilities: "Defined quality metrics, implemented validation rules, built alerting system, designed monitoring dashboard, and documented data quality standards.",
      outcomes: "Reduced data quality incidents by 70% and improved stakeholder trust in analytics outputs.",
      techStack: ["FastAPI", "PostgreSQL", "Kafka", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/data-quality" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/data-quality" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[0],
      specialNotes: "Integrated with existing data pipelines using modular plugin architecture for easy extensibility.",
      isPublished: true,
    });
  }

  // Amara Okafor - 2 showcases (DevOps Engineer)
  if (userMap.has("amara.okafor@kollabmail.test")) {
    const user = userMap.get("amara.okafor@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Cloud Infrastructure Monitoring Dashboard",
      role: "DevOps Engineer",
      summary: "Built a comprehensive monitoring solution tracking cloud resource usage, costs, and performance metrics.",
      problem: "Cloud costs were unpredictable and teams lacked visibility into resource utilization patterns.",
      solution: "Developed a monitoring dashboard with cost forecasting, usage alerts, and optimization recommendations.",
      responsibilities: "Configured monitoring agents, built data aggregation pipeline, created visualization dashboards, implemented alerting rules, and documented cost optimization strategies.",
      outcomes: "Reduced cloud costs by 30% through improved resource allocation and proactive optimization.",
      techStack: ["React", "FastAPI", "PostgreSQL", "AWS", "Terraform"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/cloud-monitor" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/cloud-monitoring" },
      ],
      collaborators: ["Priya Nair"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[1],
      specialNotes: "Automated resource tagging and cost allocation across multiple teams and projects.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Automated Deployment Pipeline",
      role: "DevOps Engineer",
      summary: "Designed and implemented a CI/CD pipeline with automated testing, security scanning, and deployment orchestration.",
      problem: "Manual deployment processes were error-prone and slowed down release cycles significantly.",
      solution: "Created automated pipeline with infrastructure-as-code, containerization, and multi-stage deployment workflows.",
      responsibilities: "Configured CI/CD tools, wrote deployment scripts, implemented security scanning, set up staging environments, and documented deployment procedures.",
      outcomes: "Reduced deployment time from 4 hours to 15 minutes and decreased deployment failures by 85%.",
      techStack: ["Docker", "Kubernetes", "Terraform", "AWS", "MongoDB"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/cicd-pipeline" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/deployment-automation" },
      ],
      collaborators: ["Kavindu Perera"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[2],
      specialNotes: "Implemented blue-green deployment strategy for zero-downtime releases.",
      isPublished: true,
    });
  }

  // Nora Ibrahim - 2 showcases (Product Manager)
  if (userMap.has("nora.ibrahim@kollabmail.test")) {
    const user = userMap.get("nora.ibrahim@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Project Collaboration Platform Redesign",
      role: "Product Manager",
      summary: "Led the redesign of a collaboration platform resulting in improved user engagement and feature adoption.",
      problem: "Users found the existing platform cluttered and difficult to navigate, leading to low feature utilization.",
      solution: "Conducted user research, prioritized features based on impact, and guided the design team through iterative improvements.",
      responsibilities: "Defined product vision, gathered user feedback, created feature specifications, coordinated with engineering and design teams, and tracked success metrics.",
      outcomes: "Increased daily active users by 55% and improved feature discovery rate by 70%.",
      techStack: ["React", "Node.js", "MongoDB", "AWS"],
      links: [
        { label: "Case Study", url: "https://case-study.kollabmail.test/platform-redesign" },
        { label: "Design Review", url: "https://case-study.kollabmail.test/redesign-process" },
      ],
      collaborators: ["Liam Anderson", "Sofia Martinez"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[3],
      specialNotes: "Applied Jobs-to-be-Done framework to identify and prioritize user needs effectively.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Mentorship Booking System Enhancement",
      role: "Product Manager",
      summary: "Improved mentorship booking experience through streamlined scheduling, automated reminders, and feedback collection.",
      problem: "Mentors and mentees experienced scheduling conflicts and missed sessions due to poor reminder systems.",
      solution: "Enhanced booking flow with calendar integration, automated notifications, and post-session feedback loops.",
      responsibilities: "Gathered stakeholder requirements, defined success criteria, wrote user stories, coordinated feature releases, and analyzed usage metrics.",
      outcomes: "Reduced missed sessions by 60% and increased mentor satisfaction scores by 40%.",
      techStack: ["React", "Node.js", "PostgreSQL", "Redis"],
      links: [
        { label: "Case Study", url: "https://case-study.kollabmail.test/booking-enhancement" },
      ],
      collaborators: ["Emma Schneider"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[4],
      specialNotes: "Implemented timezone-aware scheduling to support global mentor-mentee pairings.",
      isPublished: true,
    });
  }

  // Kavindu Perera - 2 showcases (Backend Developer)
  if (userMap.has("kavindu.perera@kollabmail.test")) {
    const user = userMap.get("kavindu.perera@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Database Performance Optimization Initiative",
      role: "Backend Developer",
      summary: "Optimized database queries and schema design resulting in significant performance improvements across critical endpoints.",
      problem: "Slow database queries caused API response times to exceed 5 seconds during peak usage.",
      solution: "Analyzed query patterns, added strategic indexes, refactored schema design, and implemented caching layers.",
      responsibilities: "Profiled database performance, identified bottlenecks, designed index strategies, optimized query logic, and validated improvements.",
      outcomes: "Reduced average query time by 80% and improved API response times to under 500ms.",
      techStack: ["MongoDB", "Node.js", "Redis", "Express"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/db-optimization" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/db-performance" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[5],
      specialNotes: "Documented indexing strategies and query optimization patterns for team reference.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "GraphQL API Development",
      role: "Backend Developer",
      summary: "Migrated REST API to GraphQL, enabling clients to request exactly the data they need with improved efficiency.",
      problem: "REST endpoints returned excessive data, causing performance issues and requiring multiple round trips.",
      solution: "Designed GraphQL schema, implemented resolvers with efficient data loading, and added query optimization.",
      responsibilities: "Defined GraphQL types and queries, built resolver logic, implemented DataLoader for batching, documented API usage, and migrated existing clients.",
      outcomes: "Reduced data transfer by 60% and decreased client-side complexity with single-query data fetching.",
      techStack: ["GraphQL", "Node.js", "MongoDB", "Express"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/graphql-api" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/graphql-migration" },
      ],
      collaborators: ["Arjun Mehra"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[6],
      specialNotes: "Implemented field-level authorization to ensure secure data access across nested queries.",
      isPublished: true,
    });
  }

  // Priya Nair - 2 showcases (DevOps Engineer)
  if (userMap.has("priya.nair@kollabmail.test")) {
    const user = userMap.get("priya.nair@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Kubernetes Cluster Management",
      role: "DevOps Engineer",
      summary: "Set up and managed production Kubernetes cluster with autoscaling, monitoring, and disaster recovery capabilities.",
      problem: "Application scaling was manual and slow, leading to performance issues during traffic spikes.",
      solution: "Deployed Kubernetes with horizontal pod autoscaling, resource quotas, and automated health checks.",
      responsibilities: "Configured cluster infrastructure, set up monitoring and logging, implemented autoscaling policies, documented operational procedures, and trained team members.",
      outcomes: "Achieved 99.9% uptime and reduced manual scaling interventions by 95%.",
      techStack: ["Kubernetes", "Docker", "AWS", "Terraform", "MongoDB"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/k8s-cluster" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/kubernetes-setup" },
      ],
      collaborators: ["Amara Okafor"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[7],
      specialNotes: "Implemented multi-zone deployment for high availability and fault tolerance.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Infrastructure as Code Migration",
      role: "DevOps Engineer",
      summary: "Migrated manual infrastructure provisioning to code-based approach using Terraform for reproducibility and version control.",
      problem: "Infrastructure changes were undocumented and difficult to replicate across environments.",
      solution: "Converted all infrastructure to Terraform modules with automated provisioning workflows.",
      responsibilities: "Audited existing infrastructure, wrote Terraform configurations, set up state management, implemented change review process, and documented module usage.",
      outcomes: "Reduced infrastructure provisioning time from days to hours and eliminated configuration drift.",
      techStack: ["Terraform", "AWS", "Docker", "Kubernetes"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/terraform-infra" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/iac-migration" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[0],
      specialNotes: "Implemented remote state locking to prevent concurrent infrastructure modifications.",
      isPublished: true,
    });
  }

  // Olivia Brown - 2 showcases (Frontend Developer)
  if (userMap.has("olivia.brown@kollabmail.test")) {
    const user = userMap.get("olivia.brown@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Performance Optimization for Large Data Tables",
      role: "Frontend Developer",
      summary: "Optimized table rendering performance to handle thousands of rows with smooth scrolling and filtering.",
      problem: "Application became unresponsive when displaying large datasets due to inefficient rendering.",
      solution: "Implemented virtualization, memoization, and debounced filtering to handle large data efficiently.",
      responsibilities: "Profiled rendering performance, implemented virtual scrolling, optimized re-render logic, added progressive loading, and measured improvements.",
      outcomes: "Reduced rendering time by 90% and enabled smooth interaction with tables containing 10,000+ rows.",
      techStack: ["React", "Vite", "Tailwind CSS"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/table-performance" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/table-optimization" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[1],
      specialNotes: "Applied React.memo and useMemo strategically to prevent unnecessary component re-renders.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Accessible Form Component Library",
      role: "Frontend Developer",
      summary: "Created a reusable form component library with built-in validation, accessibility, and error handling.",
      problem: "Forms across the application had inconsistent validation behavior and poor accessibility.",
      solution: "Built a composable form library with standardized validation rules and ARIA compliance.",
      responsibilities: "Designed component API, implemented validation logic, ensured accessibility standards, wrote documentation and examples, and integrated with existing forms.",
      outcomes: "Reduced form development time by 60% and improved form accessibility compliance to 100%.",
      techStack: ["React", "Tailwind CSS", "Vite"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/form-library" },
        { label: "Live Preview", url: "https://forms.kollabmail.test" },
      ],
      collaborators: ["Liam Anderson"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[2],
      specialNotes: "Included comprehensive keyboard navigation and screen reader support for all form components.",
      isPublished: true,
    });
  }

  // Daniel Kim - 2 showcases (Data Scientist)
  if (userMap.has("daniel.kim@kollabmail.test")) {
    const user = userMap.get("daniel.kim@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "User Behavior Analysis Pipeline",
      role: "Data Scientist",
      summary: "Built an analytics pipeline to track user behavior patterns and generate actionable insights for product improvements.",
      problem: "Product decisions were based on intuition rather than data-driven insights about user behavior.",
      solution: "Created an end-to-end analytics pipeline with event tracking, analysis scripts, and visualization dashboards.",
      responsibilities: "Designed event tracking schema, built data processing pipeline, performed statistical analysis, created visualization reports, and presented findings to stakeholders.",
      outcomes: "Identified 3 high-impact feature improvements that increased user retention by 35%.",
      techStack: ["FastAPI", "PostgreSQL", "MongoDB", "Redis"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/behavior-analysis" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/user-analytics" },
      ],
      collaborators: ["Emma Schneider"],
      screenshots: [SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[3],
      specialNotes: "Implemented privacy-preserving analysis techniques to protect user data while generating insights.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Predictive Modeling for User Engagement",
      role: "Data Scientist",
      summary: "Developed predictive models to identify users at risk of disengagement and enable proactive retention strategies.",
      problem: "User churn was detected too late, missing opportunities for proactive engagement interventions.",
      solution: "Built predictive models using historical engagement data to forecast user retention likelihood.",
      responsibilities: "Collected and cleaned training data, engineered features, trained classification models, validated accuracy, and deployed prediction API.",
      outcomes: "Achieved 82% prediction accuracy enabling targeted retention campaigns that reduced churn by 25%.",
      techStack: ["FastAPI", "PostgreSQL", "Redis", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/engagement-prediction" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/predictive-modeling" },
      ],
      collaborators: ["Noah Wilson"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[4],
      specialNotes: "Applied feature importance analysis to identify key engagement drivers for product strategy.",
      isPublished: true,
    });
  }

  // Lina Chen - 2 showcases (Backend Developer)
  if (userMap.has("lina.chen@kollabmail.test")) {
    const user = userMap.get("lina.chen@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "API Documentation Portal",
      role: "Backend Developer",
      summary: "Created an interactive API documentation portal with live examples, request builders, and version management.",
      problem: "Developers struggled to understand API usage due to outdated and incomplete documentation.",
      solution: "Built an automated documentation portal with interactive examples and up-to-date endpoint references.",
      responsibilities: "Designed documentation structure, implemented auto-generation from code annotations, built interactive playground, added versioning support, and maintained documentation quality.",
      outcomes: "Reduced API integration time by 50% and decreased support requests by 65%.",
      techStack: ["Node.js", "Express", "React", "MongoDB"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/api-docs" },
        { label: "Live Preview", url: "https://api-docs.kollabmail.test" },
      ],
      collaborators: ["Ethan Carter"],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[5],
      specialNotes: "Integrated automated testing to ensure documentation examples remain accurate with code changes.",
      isPublished: true,
    });

    showcases.push({
      userId: user._id.toString(),
      title: "Rate Limiting and Throttling Service",
      role: "Backend Developer",
      summary: "Implemented a distributed rate limiting service to protect APIs from abuse and ensure fair resource allocation.",
      problem: "APIs were vulnerable to excessive requests causing service degradation for legitimate users.",
      solution: "Built a rate limiting service with configurable policies, distributed state management, and graceful degradation.",
      responsibilities: "Designed rate limiting algorithms, implemented distributed counters using Redis, created configuration interface, added monitoring dashboards, and documented usage policies.",
      outcomes: "Prevented service outages during traffic spikes and improved API availability to 99.8%.",
      techStack: ["Node.js", "Express", "Redis", "Kafka", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/rate-limiter" },
        { label: "Technical Overview", url: "https://case-study.kollabmail.test/rate-limiting" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[6],
      specialNotes: "Implemented sliding window algorithm for accurate rate limiting without request bursting.",
      isPublished: true,
    });
  }

  // Omar Farouk - 1 showcase (Full Stack Developer)
  if (userMap.has("omar.farouk@kollabmail.test")) {
    const user = userMap.get("omar.farouk@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Minimum Viable Product Development",
      role: "Full Stack Developer",
      summary: "Rapidly prototyped and launched a web application MVP within 3 weeks to validate product-market fit.",
      problem: "Long development cycles delayed market validation and consumed resources before confirming user demand.",
      solution: "Built a focused MVP with core features only, using rapid iteration and user feedback loops.",
      responsibilities: "Defined MVP scope, designed database schema, built frontend and backend, integrated third-party services, deployed infrastructure, and gathered user feedback.",
      outcomes: "Validated product concept with 100 early users and secured stakeholder buy-in for full development.",
      techStack: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/mvp-launch" },
        { label: "Live Preview", url: "https://mvp.kollabmail.test" },
        { label: "Case Study", url: "https://case-study.kollabmail.test/mvp-approach" },
      ],
      collaborators: [],
      screenshots: [SCREENSHOT_IMAGES[1], SCREENSHOT_IMAGES[4]],
      coverImage: COVER_IMAGES[7],
      specialNotes: "Prioritized features using MoSCoW method to deliver maximum value within tight timeline.",
      isPublished: true,
    });
  }

  // Isabella Rossi - 1 showcase (UI/UX Designer)
  if (userMap.has("isabella.rossi@kollabmail.test")) {
    const user = userMap.get("isabella.rossi@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Responsive Design System Implementation",
      role: "UI/UX Designer",
      summary: "Designed and implemented a responsive design system ensuring consistent experiences across desktop, tablet, and mobile devices.",
      problem: "Inconsistent layouts and broken experiences across different screen sizes frustrated users and increased support burden.",
      solution: "Created a mobile-first responsive design system with adaptive components and flexible grid layouts.",
      responsibilities: "Conducted device usage analysis, designed breakpoint strategy, created responsive components, tested across devices, and documented responsive patterns.",
      outcomes: "Improved mobile user satisfaction by 50% and reduced layout-related support tickets by 75%.",
      techStack: ["React", "Tailwind CSS", "Vite"],
      links: [
        { label: "Case Study", url: "https://case-study.kollabmail.test/responsive-design" },
        { label: "Design Review", url: "https://case-study.kollabmail.test/responsive-system" },
      ],
      collaborators: ["Liam Anderson"],
      screenshots: [SCREENSHOT_IMAGES[0], SCREENSHOT_IMAGES[2]],
      coverImage: COVER_IMAGES[0],
      specialNotes: "Applied fluid typography and spacing scales for seamless transitions across all device sizes.",
      isPublished: true,
    });
  }

  // Sara Patel - 1 showcase (Full Stack Developer)
  if (userMap.has("sara.patel@kollabmail.test")) {
    const user = userMap.get("sara.patel@kollabmail.test");
    showcases.push({
      userId: user._id.toString(),
      title: "Team Collaboration Dashboard",
      role: "Full Stack Developer",
      summary: "Built a centralized dashboard for team communication, file sharing, and progress tracking with real-time updates.",
      problem: "Teams used fragmented tools for communication and file sharing, leading to lost information and duplicated effort.",
      solution: "Created an integrated dashboard with messaging, file management, and activity feeds in one interface.",
      responsibilities: "Designed system architecture, implemented real-time messaging, built file upload functionality, created activity tracking, and deployed application.",
      outcomes: "Consolidated 5 separate tools into one platform and improved team coordination efficiency by 40%.",
      techStack: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
      links: [
        { label: "GitHub Repository", url: "https://github.com/kollab-users/team-dashboard" },
        { label: "Live Preview", url: "https://collaboration.kollabmail.test" },
      ],
      collaborators: ["Sofia Martinez"],
      screenshots: [SCREENSHOT_IMAGES[2], SCREENSHOT_IMAGES[3]],
      coverImage: COVER_IMAGES[1],
      specialNotes: "Implemented role-based access control to protect sensitive project information.",
      isPublished: true,
    });
  }

  return showcases;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const validateShowcases = (showcases: any[], userMap: Map<string, any>) => {
  const errors: string[] = [];

  showcases.forEach((showcase, index) => {
    const prefix = `Showcase ${index + 1} ("${showcase.title}")`;

    // Check required fields
    if (!showcase.userId) errors.push(`${prefix}: Missing userId`);
    if (!showcase.title) errors.push(`${prefix}: Missing title`);
    if (showcase.isPublished !== true) errors.push(`${prefix}: isPublished must be true`);

    // Check role
    if (!ALLOWED_ROLES.includes(showcase.role)) {
      errors.push(`${prefix}: Invalid role "${showcase.role}"`);
    }

    // Check techStack
    if (!Array.isArray(showcase.techStack) || showcase.techStack.length < 3 || showcase.techStack.length > 8) {
      errors.push(`${prefix}: techStack must have 3-8 items (has ${showcase.techStack?.length || 0})`);
    }
    showcase.techStack?.forEach((tech: string) => {
      if (!ALLOWED_TECH_STACK.includes(tech)) {
        errors.push(`${prefix}: Invalid techStack value "${tech}"`);
      }
    });

    // Check images
    if (!showcase.coverImage) {
      errors.push(`${prefix}: Missing coverImage`);
    }
    if (!Array.isArray(showcase.screenshots) || showcase.screenshots.length < 1 || showcase.screenshots.length > 5) {
      errors.push(`${prefix}: screenshots must have 1-5 items (has ${showcase.screenshots?.length || 0})`);
    }

    // Check links
    if (!Array.isArray(showcase.links) || showcase.links.length < 1) {
      errors.push(`${prefix}: Must have at least 1 link`);
    }

    // Check forbidden words in visible text (excluding allowed @kollabmail.test domain)
    const visibleText = [
      showcase.title,
      showcase.summary,
      showcase.problem,
      showcase.solution,
      showcase.responsibilities,
      showcase.outcomes,
      showcase.specialNotes,
    ].join(" ").toLowerCase();

    // Remove allowed domain patterns before checking
    const sanitizedText = visibleText.replace(/@kollabmail\.test/gi, "").replace(/kollabmail\.test/gi, "");

    FORBIDDEN_WORDS.forEach((word) => {
      if (sanitizedText.includes(word)) {
        errors.push(`${prefix}: Contains forbidden word "${word}" in visible text`);
      }
    });
  });

  if (errors.length > 0) {
    console.error("\n❌ Validation failed:\n");
    errors.forEach((err) => console.error(`   - ${err}`));
    throw new Error(`Validation failed with ${errors.length} error(s)`);
  }

  console.log("✅ All showcases passed validation\n");
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Seed Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const run = async () => {
  const isReset = process.argv.includes("--reset");
  let exitCode = 0;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Portfolio Showcase Seed Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Reset mode: ${isReset ? "✅ Enabled (will delete & recreate)" : "❌ Disabled (will upsert only)"}`);
  console.log(`Target showcases: ~34`);
  console.log("");

  try {
    // ── Connect to database ───────────────────────────────────────────────────
    await connectDB();

    // ── Find seeded members ───────────────────────────────────────────────────
    console.log("🔍 Looking up seeded members...");
    const seededMembers = await User.find({
      userType: "member",
      email: { $in: SEEDED_MEMBER_EMAILS },
    })
      .select("_id email name profile")
      .lean();

    if (seededMembers.length < 25) {
      throw new Error(
        `Expected 25 seeded members, found only ${seededMembers.length}. Please run: npm run seed:members`
      );
    }

    console.log(`   Found ${seededMembers.length} seeded members\n`);

    // Build user map
    const userMap = new Map(seededMembers.map((user) => [user.email, user]));

    // ── Build showcases ───────────────────────────────────────────────────────
    const showcases = buildShowcases(userMap);
    console.log(`📦 Built ${showcases.length} showcases\n`);

    // ── Validate showcases ────────────────────────────────────────────────────
    console.log("🔍 Validating showcases...");
    validateShowcases(showcases, userMap);

    // ── Reset: delete existing seeded showcases ───────────────────────────────
    let deletedCount = 0;
    if (isReset) {
      console.log("🗑️  Deleting existing seeded showcases...");
      const seededMemberIds = seededMembers.map((m) => m._id.toString());
      const deleteFilter = {
        userId: { $in: seededMemberIds },
      };
      const deleteResult = await PortfolioItem.deleteMany(deleteFilter);
      deletedCount = deleteResult.deletedCount ?? 0;
      console.log(`   Deleted ${deletedCount} existing showcases\n`);
    }

    // ── Upsert showcases ──────────────────────────────────────────────────────
    console.log("💾 Upserting showcases...\n");

    let upsertedCount = 0;
    let modifiedCount = 0;
    let matchedCount = 0;
    let failedCount = 0;

    for (const showcase of showcases) {
      try {
        const result = await PortfolioItem.updateOne(
          {
            userId: showcase.userId,
            title: showcase.title,
          },
          {
            $set: showcase,
          },
          { upsert: true }
        );

        matchedCount += result.matchedCount ?? 0;
        modifiedCount += result.modifiedCount ?? 0;
        upsertedCount += result.upsertedCount ?? 0;

        const userEmail = seededMembers.find((u) => u._id.toString() === showcase.userId)?.email || "unknown";
        console.log(`   ✓ ${showcase.title} (${userEmail})`);
      } catch (showcaseErr) {
        failedCount += 1;
        console.error(`   ✗ Failed: ${showcase.title}`, showcaseErr);
      }
    }

    if (failedCount > 0) {
      throw new Error(`${failedCount} showcase(s) failed to seed`);
    }

    // ── Final summary ─────────────────────────────────────────────────────────
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Portfolio Showcase Seed Complete");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Total intended: ${showcases.length}`);
    console.log(`Upserted: ${upsertedCount}`);
    console.log(`Matched: ${matchedCount}`);
    console.log(`Modified: ${modifiedCount}`);
    if (failedCount > 0) {
      console.log(`Failed: ${failedCount}`);
    }
    if (isReset) {
      console.log(`Reset deleted: ${deletedCount}`);
    }
    console.log("");
    console.log("Next steps:");
    console.log("1. Verify showcases in MongoDB Atlas");
    console.log("2. Login with any seeded member email");
    console.log("3. Navigate to member profile pages to see pinned showcases");
    console.log("4. Check skill evidence scores reflect showcase techStack data");
    console.log("");
  } catch (err) {
    exitCode = 1;
    console.error("❌ Portfolio showcase seed failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
};

run();
