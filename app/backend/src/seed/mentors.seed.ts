import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";

// ── Safety guards ─────────────────────────────────────────────────────────────

const SEEDED_MENTOR_EMAILS = [
  "sarah.chen@kollabmail.test",
  "james.okonkwo@kollabmail.test",
  "maria.gonzalez@kollabmail.test",
  "rajesh.kumar@kollabmail.test",
  "emily.thompson@kollabmail.test",
  "hana.kobayashi@kollabmail.test",
  "ahmed.nasser@kollabmail.test",
  "clara.meyer@kollabmail.test",
  "thabo.dlamini@kollabmail.test",
  "priya.menon@kollabmail.test",
  "marcus.reed@kollabmail.test",
  "lina.alvarez@kollabmail.test",
  "daniel.foster@kollabmail.test",
  "amina.diallo@kollabmail.test",
  "chen.wei@kollabmail.test",
];

// ── Validation constants ──────────────────────────────────────────────────────

const ALLOWED_EXPERTISE_SKILLS = [
  "System Design",
  "API Design",
  "Database Design",
  "Data Modeling",
  "Testing & QA",
  "Debugging",
  "Performance Tuning",
  "Security / Threat Modeling",
  "DevOps & CI/CD",
  "Cloud Architecture",
  "Observability",
  "Product Thinking",
  "Project Management",
  "Mentoring & Leadership",
  "Technical Writing",
  "UX Collaboration",
];

const ALLOWED_SKILLS = [
  "System Design",
  "API Design",
  "Database Design",
  "Data Modeling",
  "Testing & QA",
  "Debugging",
  "Performance Tuning",
  "Security / Threat Modeling",
  "DevOps & CI/CD",
  "Cloud Architecture",
  "Observability",
  "Product Thinking",
  "Project Management",
  "Mentoring & Leadership",
  "Technical Writing",
  "UX Collaboration",
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

const ALLOWED_DOMAINS = [
  "AI & ML",
  "Web Dev",
  "Mobile Dev",
  "Data Science",
  "Cybersecurity",
  "Robotics",
  "IoT",
  "Software Engineering",
];

const FORBIDDEN_WORDS = ["demo", "seed", "fake", "sample", "dummy", "placeholder"];

if (process.env.ALLOW_MENTOR_SEED !== "true") {
  console.error("❌ ALLOW_MENTOR_SEED must be set to true before running this script.");
  console.error("   Set ALLOW_MENTOR_SEED=true in your .env file and try again.");
  process.exit(1);
}

if (!process.env.SEED_USER_PASSWORD) {
  console.error("❌ SEED_USER_PASSWORD is required.");
  console.error("   Set SEED_USER_PASSWORD in your .env file and try again.");
  process.exit(1);
}

// ── Validation function ───────────────────────────────────────────────────────

const validateMentors = (mentors: any[]) => {
  const errors: string[] = [];

  mentors.forEach((mentor, index) => {
    const mentorLabel = `Mentor ${index + 1} (${mentor.email})`;

    // Email validation
    if (!SEEDED_MENTOR_EMAILS.includes(mentor.email)) {
      errors.push(`${mentorLabel}: email not in SEEDED_MENTOR_EMAILS allowlist`);
    }

    // Root fields
    if (mentor.userType !== "mentor") {
      errors.push(`${mentorLabel}: userType must be "mentor"`);
    }
    if (mentor.isEmailVerified !== true) {
      errors.push(`${mentorLabel}: isEmailVerified must be true`);
    }
    if (mentor.onboardingCompleted !== true) {
      errors.push(`${mentorLabel}: onboardingCompleted must be true`);
    }
    if (mentor.isProfilePublic !== true) {
      errors.push(`${mentorLabel}: isProfilePublic must be true`);
    }

    // Profile validation
    const profile = mentor.profile;
    if (!profile) {
      errors.push(`${mentorLabel}: missing profile`);
      return;
    }

    // Expertise skills (3-7)
    if (!profile.expertiseSkills || profile.expertiseSkills.length < 3 || profile.expertiseSkills.length > 7) {
      errors.push(`${mentorLabel}: expertiseSkills must have 3-7 items`);
    } else {
      profile.expertiseSkills.forEach((skill: string) => {
        if (!ALLOWED_EXPERTISE_SKILLS.includes(skill)) {
          errors.push(`${mentorLabel}: invalid expertiseSkill "${skill}"`);
        }
      });
    }

    // Skills (2-5)
    if (!profile.skills || profile.skills.length < 2 || profile.skills.length > 5) {
      errors.push(`${mentorLabel}: skills must have 2-5 items`);
    } else {
      profile.skills.forEach((skill: string) => {
        if (!ALLOWED_SKILLS.includes(skill)) {
          errors.push(`${mentorLabel}: invalid skill "${skill}"`);
        }
      });
    }

    // Tech stack (3-7)
    if (!profile.techStack || profile.techStack.length < 3 || profile.techStack.length > 7) {
      errors.push(`${mentorLabel}: techStack must have 3-7 items`);
    } else {
      profile.techStack.forEach((tech: string) => {
        if (!ALLOWED_TECH_STACK.includes(tech)) {
          errors.push(`${mentorLabel}: invalid techStack "${tech}"`);
        }
      });
    }

    // Domain interests (2-4)
    if (!profile.domainInterests || profile.domainInterests.length < 2 || profile.domainInterests.length > 4) {
      errors.push(`${mentorLabel}: domainInterests must have 2-4 items`);
    } else {
      profile.domainInterests.forEach((domain: string) => {
        if (!ALLOWED_DOMAINS.includes(domain)) {
          errors.push(`${mentorLabel}: invalid domain "${domain}"`);
        }
      });
    }

    // Languages (1-3)
    if (!profile.languages || profile.languages.length < 1 || profile.languages.length > 3) {
      errors.push(`${mentorLabel}: languages must have 1-3 items`);
    }

    // Rate type
    if (!profile.rateType || !["free", "paid"].includes(profile.rateType)) {
      errors.push(`${mentorLabel}: rateType must be "free" or "paid"`);
    }

    // Rate note
    if (!profile.rateNote || typeof profile.rateNote !== "string") {
      errors.push(`${mentorLabel}: rateNote is required`);
    }

    // Availability hours (4-12)
    if (!profile.availabilityHoursPerWeek || profile.availabilityHoursPerWeek < 4 || profile.availabilityHoursPerWeek > 12) {
      errors.push(`${mentorLabel}: availabilityHoursPerWeek must be between 4 and 12`);
    }

    // Availability slots (2-4)
    if (!profile.availabilitySlots || profile.availabilitySlots.length < 2 || profile.availabilitySlots.length > 4) {
      errors.push(`${mentorLabel}: availabilitySlots must have 2-4 items`);
    }

    // Check for embedding fields (should not be present)
    if (profile.recommendationEmbedding) {
      errors.push(`${mentorLabel}: must not include recommendationEmbedding`);
    }
    if (profile.recommendationEmbeddingText) {
      errors.push(`${mentorLabel}: must not include recommendationEmbeddingText`);
    }
    if (profile.recommendationEmbeddingModel) {
      errors.push(`${mentorLabel}: must not include recommendationEmbeddingModel`);
    }
    if (profile.recommendationEmbeddingUpdatedAt) {
      errors.push(`${mentorLabel}: must not include recommendationEmbeddingUpdatedAt`);
    }

    // Check for avatarUrl/avatarKey (should not be present)
    if (profile.avatarUrl) {
      errors.push(`${mentorLabel}: must not include avatarUrl`);
    }
    if (profile.avatarKey) {
      errors.push(`${mentorLabel}: must not include avatarKey`);
    }

    // Check for forbidden words in visible text
    const visibleText = [
      mentor.name,
      profile.name,
      profile.headline,
      profile.bio,
      profile.location,
      ...(profile.expertiseSkills || []),
      ...(profile.skills || []),
      ...(profile.techStack || []),
      ...(profile.domainInterests || []),
      ...(profile.languages || []),
      profile.rateNote,
      ...(profile.availabilitySlots || []).map((s: any) => s.note || ""),
    ].join(" ").toLowerCase();

    // Exception: allow 'test' in @kollabmail.test domain
    const textWithoutTestDomain = visibleText.replace(/@kollabmail\.test/g, "");

    FORBIDDEN_WORDS.forEach((word) => {
      if (textWithoutTestDomain.includes(word)) {
        errors.push(`${mentorLabel}: contains forbidden word "${word}" in visible text`);
      }
    });
  });

  if (errors.length > 0) {
    console.error("\n❌ Validation failed:\n");
    errors.forEach((err) => console.error(`   • ${err}`));
    console.error("");
    throw new Error(`Validation failed with ${errors.length} error(s)`);
  }

  console.log("✅ Validation passed: all 15 mentors are valid\n");
};

// ── Build mentor data ─────────────────────────────────────────────────────────

const buildMentors = async () => {
  const hashedPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD!, 10);

  return [
    {
      name: "Sarah Chen",
      email: "sarah.chen@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Sarah Chen",
        headline: "AI/ML Research Mentor | Deep Learning & Computer Vision Specialist | 10+ Years Experience",
        bio: "Research scientist specializing in computer vision and deep learning. I help students and early-career professionals navigate AI/ML projects, research methodology, and career development in machine learning. My focus is on practical application of cutting-edge techniques with strong theoretical foundations.",
        location: "Singapore",
        timezone: "Asia/Singapore",
        expertiseSkills: ["Data Modeling", "System Design", "Performance Tuning", "Mentoring & Leadership", "Technical Writing"],
        skills: ["API Design", "Cloud Architecture", "Database Design"],
        techStack: ["FastAPI", "PostgreSQL", "Docker", "Kubernetes", "AWS"],
        domainInterests: ["AI & ML", "Data Science", "Software Engineering"],
        languages: ["English", "Mandarin"],
        rateType: "paid" as const,
        rateNote: "$60/hour",
        links: {
          github: "https://github.com/kollab-mentors/sarah-chen",
          linkedin: "https://www.linkedin.com/in/sarah-chen",
          portfolio: "https://sarah-chen.kollabmail.test",
        },
        availabilityHoursPerWeek: 8,
        availabilitySlots: [
          {
            date: "2026-05-26",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Asia/Singapore",
            note: "AI/ML consultation sessions",
          },
          {
            date: "2026-05-28",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Singapore",
            note: "Research methodology mentoring",
          },
          {
            date: "2026-05-30",
            startTime: "15:00",
            endTime: "17:00",
            timezone: "Asia/Singapore",
            note: "Model architecture reviews",
          },
        ],
      },
    },
    {
      name: "James Okonkwo",
      email: "james.okonkwo@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "James Okonkwo",
        headline: "DevOps Engineer | Cloud Architecture & CI/CD Expert | AWS & Kubernetes Specialist",
        bio: "DevOps engineer passionate about automation and cloud infrastructure. I mentor students and professionals on deployment strategies, cloud architecture, and building scalable systems. My goal is to help you ship reliable software faster and understand modern DevOps practices.",
        location: "Nairobi, Kenya",
        timezone: "Africa/Nairobi",
        expertiseSkills: ["DevOps & CI/CD", "Cloud Architecture", "System Design", "Observability"],
        skills: ["Database Design", "Performance Tuning", "Security / Threat Modeling"],
        techStack: ["Docker", "Kubernetes", "AWS", "Terraform", "MongoDB", "Redis"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English", "Swahili"],
        rateType: "free" as const,
        rateNote: "Open mentoring for student project guidance",
        links: {
          github: "https://github.com/kollab-mentors/james-okonkwo",
          linkedin: "https://www.linkedin.com/in/james-okonkwo",
          portfolio: "https://james-okonkwo.kollabmail.test",
        },
        availabilityHoursPerWeek: 6,
        availabilitySlots: [
          {
            date: "2026-05-25",
            startTime: "16:00",
            endTime: "18:00",
            timezone: "Africa/Nairobi",
            note: "Cloud infrastructure planning",
          },
          {
            date: "2026-05-27",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Africa/Nairobi",
            note: "CI/CD pipeline reviews",
          },
        ],
      },
    },
    {
      name: "Maria Gonzalez",
      email: "maria.gonzalez@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Maria Gonzalez",
        headline: "Product Designer | UX/UI Specialist | Frontend Collaboration Advocate",
        bio: "Product designer with a strong understanding of frontend development. I help students and early-career designers bridge the gap between design and code, create user-centered experiences, and collaborate effectively with engineering teams. Let's build products people love.",
        location: "Madrid, Spain",
        timezone: "Europe/Madrid",
        expertiseSkills: ["UX Collaboration", "Product Thinking", "Technical Writing", "Mentoring & Leadership"],
        skills: ["System Design", "Project Management"],
        techStack: ["React", "Next.js", "Tailwind CSS", "Vite", "GraphQL"],
        domainInterests: ["Web Dev", "Software Engineering"],
        languages: ["English", "Spanish"],
        rateType: "free" as const,
        rateNote: "Free mentoring for aspiring product designers",
        links: {
          github: "https://github.com/kollab-mentors/maria-gonzalez",
          linkedin: "https://www.linkedin.com/in/maria-gonzalez",
          portfolio: "https://maria-gonzalez.kollabmail.test",
        },
        availabilityHoursPerWeek: 5,
        availabilitySlots: [
          {
            date: "2026-05-26",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Europe/Madrid",
            note: "UX reviews and design critiques",
          },
          {
            date: "2026-05-29",
            startTime: "17:00",
            endTime: "19:00",
            timezone: "Europe/Madrid",
            note: "Product thinking workshops",
          },
        ],
      },
    },
    {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Rajesh Kumar",
        headline: "Backend Engineer | API Design & Database Architecture Expert | Scalable Systems Builder",
        bio: "Backend engineer focused on building robust APIs and scalable database architectures. I mentor students on backend fundamentals, API design patterns, database modeling, and system design. Whether you're building your first REST API or optimizing complex queries, I'm here to help.",
        location: "Bangalore, India",
        timezone: "Asia/Kolkata",
        expertiseSkills: ["API Design", "Database Design", "System Design", "Performance Tuning", "Data Modeling"],
        skills: ["Testing & QA", "Debugging"],
        techStack: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker"],
        domainInterests: ["Software Engineering", "Web Dev", "Data Science"],
        languages: ["English", "Hindi"],
        rateType: "paid" as const,
        rateNote: "$35/hour",
        links: {
          github: "https://github.com/kollab-mentors/rajesh-kumar",
          linkedin: "https://www.linkedin.com/in/rajesh-kumar",
          portfolio: "https://rajesh-kumar.kollabmail.test",
        },
        availabilityHoursPerWeek: 10,
        availabilitySlots: [
          {
            date: "2026-05-24",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Kolkata",
            note: "API design consultations",
          },
          {
            date: "2026-05-26",
            startTime: "15:00",
            endTime: "17:00",
            timezone: "Asia/Kolkata",
            note: "Database architecture reviews",
          },
          {
            date: "2026-05-29",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Kolkata",
            note: "System design discussions",
          },
        ],
      },
    },
    {
      name: "Emily Thompson",
      email: "emily.thompson@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Emily Thompson",
        headline: "Full-Stack Developer | Career Development Mentor | Technical Interview Coach",
        bio: "Full-stack developer passionate about helping students and early-career engineers navigate their career paths. I provide guidance on building strong portfolios, preparing for technical interviews, and making strategic career decisions. Let's work together to land your dream role.",
        location: "London, United Kingdom",
        timezone: "Europe/London",
        expertiseSkills: ["Mentoring & Leadership", "System Design", "Technical Writing", "Project Management"],
        skills: ["API Design", "UX Collaboration"],
        techStack: ["React", "Node.js", "Express", "PostgreSQL", "AWS", "Docker"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English"],
        rateType: "free" as const,
        rateNote: "Career mentoring for students and junior engineers",
        links: {
          github: "https://github.com/kollab-mentors/emily-thompson",
          linkedin: "https://www.linkedin.com/in/emily-thompson",
          portfolio: "https://emily-thompson.kollabmail.test",
        },
        availabilityHoursPerWeek: 7,
        availabilitySlots: [
          {
            date: "2026-05-25",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Europe/London",
            note: "Career planning sessions",
          },
          {
            date: "2026-05-28",
            startTime: "19:00",
            endTime: "21:00",
            timezone: "Europe/London",
            note: "Technical interview practice",
          },
          {
            date: "2026-05-31",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Europe/London",
            note: "Portfolio reviews",
          },
        ],
      },
    },
    {
      name: "Hana Kobayashi",
      email: "hana.kobayashi@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Hana Kobayashi",
        headline: "Mobile Developer | React Native & Flutter Expert | Cross-Platform App Specialist",
        bio: "Mobile developer specializing in cross-platform development with React Native and Flutter. I mentor students on mobile app architecture, performance optimization, and shipping quality apps. Whether you're building your first mobile app or optimizing an existing one, I can guide you through the journey.",
        location: "Tokyo, Japan",
        timezone: "Asia/Tokyo",
        expertiseSkills: ["Performance Tuning", "Testing & QA", "Debugging", "System Design"],
        skills: ["API Design", "UX Collaboration"],
        techStack: ["React Native", "Flutter", "Node.js", "MongoDB", "AWS"],
        domainInterests: ["Mobile Dev", "Software Engineering"],
        languages: ["English", "Japanese"],
        rateType: "paid" as const,
        rateNote: "$45/hour",
        links: {
          github: "https://github.com/kollab-mentors/hana-kobayashi",
          linkedin: "https://www.linkedin.com/in/hana-kobayashi",
          portfolio: "https://hana-kobayashi.kollabmail.test",
        },
        availabilityHoursPerWeek: 6,
        availabilitySlots: [
          {
            date: "2026-05-27",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Tokyo",
            note: "Mobile app architecture reviews",
          },
          {
            date: "2026-05-29",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Asia/Tokyo",
            note: "Performance optimization sessions",
          },
        ],
      },
    },
    {
      name: "Ahmed Nasser",
      email: "ahmed.nasser@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Ahmed Nasser",
        headline: "Cybersecurity Engineer | Secure API Design | Threat Modeling & Vulnerability Assessment",
        bio: "Cybersecurity engineer focused on secure software development and threat modeling. I help students and developers build security into their applications from the start, understand common vulnerabilities, and implement secure API designs. Security shouldn't be an afterthought.",
        location: "Dubai, United Arab Emirates",
        timezone: "Asia/Dubai",
        expertiseSkills: ["Security / Threat Modeling", "API Design", "System Design", "Testing & QA"],
        skills: ["Database Design", "Performance Tuning"],
        techStack: ["Node.js", "Express", "PostgreSQL", "Docker", "Kubernetes"],
        domainInterests: ["Cybersecurity", "Software Engineering", "Web Dev"],
        languages: ["English", "Arabic"],
        rateType: "paid" as const,
        rateNote: "$50/hour",
        links: {
          github: "https://github.com/kollab-mentors/ahmed-nasser",
          linkedin: "https://www.linkedin.com/in/ahmed-nasser",
          portfolio: "https://ahmed-nasser.kollabmail.test",
        },
        availabilityHoursPerWeek: 8,
        availabilitySlots: [
          {
            date: "2026-05-25",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Asia/Dubai",
            note: "Security architecture consultations",
          },
          {
            date: "2026-05-27",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Dubai",
            note: "Threat modeling workshops",
          },
          {
            date: "2026-05-30",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Asia/Dubai",
            note: "Secure API design reviews",
          },
        ],
      },
    },
    {
      name: "Clara Meyer",
      email: "clara.meyer@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Clara Meyer",
        headline: "Data Analyst | Data Modeling & Visualization Expert | Analytics Dashboard Specialist",
        bio: "Data analyst who transforms raw data into actionable insights. I mentor students on data modeling, building analytics dashboards, and telling compelling stories with data. Whether you're learning SQL or building your first visualization, I can help you develop strong data analysis skills.",
        location: "Berlin, Germany",
        timezone: "Europe/Berlin",
        expertiseSkills: ["Data Modeling", "Database Design", "Technical Writing", "Product Thinking"],
        skills: ["System Design", "API Design"],
        techStack: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker"],
        domainInterests: ["Data Science", "Software Engineering"],
        languages: ["English", "German"],
        rateType: "free" as const,
        rateNote: "Free mentoring for students exploring data analytics",
        links: {
          github: "https://github.com/kollab-mentors/clara-meyer",
          linkedin: "https://www.linkedin.com/in/clara-meyer",
          portfolio: "https://clara-meyer.kollabmail.test",
        },
        availabilityHoursPerWeek: 5,
        availabilitySlots: [
          {
            date: "2026-05-26",
            startTime: "17:00",
            endTime: "19:00",
            timezone: "Europe/Berlin",
            note: "Data modeling sessions",
          },
          {
            date: "2026-05-29",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Europe/Berlin",
            note: "Analytics dashboard reviews",
          },
        ],
      },
    },
    {
      name: "Thabo Dlamini",
      email: "thabo.dlamini@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Thabo Dlamini",
        headline: "Project Manager | Agile Delivery Expert | Team Collaboration Coach",
        bio: "Project manager passionate about agile methodologies and effective team collaboration. I mentor students on project planning, agile practices, stakeholder management, and delivering software iteratively. Learn how to run successful projects and work effectively in cross-functional teams.",
        location: "Cape Town, South Africa",
        timezone: "Africa/Johannesburg",
        expertiseSkills: ["Project Management", "Product Thinking", "Mentoring & Leadership", "UX Collaboration"],
        skills: ["System Design", "Technical Writing"],
        techStack: ["MongoDB", "Docker", "AWS", "Kafka"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English", "Zulu"],
        rateType: "free" as const,
        rateNote: "Project management mentoring for students",
        links: {
          github: "https://github.com/kollab-mentors/thabo-dlamini",
          linkedin: "https://www.linkedin.com/in/thabo-dlamini",
          portfolio: "https://thabo-dlamini.kollabmail.test",
        },
        availabilityHoursPerWeek: 6,
        availabilitySlots: [
          {
            date: "2026-05-24",
            startTime: "09:00",
            endTime: "11:00",
            timezone: "Africa/Johannesburg",
            note: "Agile planning sessions",
          },
          {
            date: "2026-05-28",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Africa/Johannesburg",
            note: "Team collaboration workshops",
          },
        ],
      },
    },
    {
      name: "Priya Menon",
      email: "priya.menon@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Priya Menon",
        headline: "Cloud Platform Engineer | Observability & Monitoring Expert | Scalable Systems Architect",
        bio: "Cloud platform engineer specializing in observability, monitoring, and building scalable cloud-native systems. I mentor students and engineers on cloud architecture patterns, monitoring strategies, and operational excellence. Let's build systems that are reliable, observable, and ready for production.",
        location: "Singapore",
        timezone: "Asia/Singapore",
        expertiseSkills: ["Cloud Architecture", "Observability", "System Design", "DevOps & CI/CD", "Performance Tuning"],
        skills: ["Database Design", "API Design"],
        techStack: ["AWS", "GCP", "Kubernetes", "Docker", "Terraform", "MongoDB"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English", "Tamil"],
        rateType: "paid" as const,
        rateNote: "$55/hour",
        links: {
          github: "https://github.com/kollab-mentors/priya-menon",
          linkedin: "https://www.linkedin.com/in/priya-menon",
          portfolio: "https://priya-menon.kollabmail.test",
        },
        availabilityHoursPerWeek: 9,
        availabilitySlots: [
          {
            date: "2026-05-25",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Singapore",
            note: "Cloud architecture consultations",
          },
          {
            date: "2026-05-27",
            startTime: "15:00",
            endTime: "17:00",
            timezone: "Asia/Singapore",
            note: "Observability strategy sessions",
          },
          {
            date: "2026-05-30",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Singapore",
            note: "Scalable systems design",
          },
        ],
      },
    },
    {
      name: "Marcus Reed",
      email: "marcus.reed@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Marcus Reed",
        headline: "Frontend Engineer | Performance Optimization Specialist | Design Systems Advocate",
        bio: "Frontend engineer focused on performance optimization and design systems. I mentor students on modern frontend development, React patterns, performance tuning, and building accessible user interfaces. Whether you're learning React or optimizing bundle sizes, I'm here to help you level up.",
        location: "Toronto, Canada",
        timezone: "America/Toronto",
        expertiseSkills: ["Performance Tuning", "UX Collaboration", "System Design", "Technical Writing"],
        skills: ["API Design", "Testing & QA"],
        techStack: ["React", "Next.js", "Tailwind CSS", "Vite", "GraphQL"],
        domainInterests: ["Web Dev", "Software Engineering"],
        languages: ["English", "French"],
        rateType: "free" as const,
        rateNote: "Frontend mentoring for aspiring developers",
        links: {
          github: "https://github.com/kollab-mentors/marcus-reed",
          linkedin: "https://www.linkedin.com/in/marcus-reed",
          portfolio: "https://marcus-reed.kollabmail.test",
        },
        availabilityHoursPerWeek: 6,
        availabilitySlots: [
          {
            date: "2026-05-26",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "America/Toronto",
            note: "React architecture reviews",
          },
          {
            date: "2026-05-29",
            startTime: "19:00",
            endTime: "21:00",
            timezone: "America/Toronto",
            note: "Performance optimization workshops",
          },
        ],
      },
    },
    {
      name: "Lina Alvarez",
      email: "lina.alvarez@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Lina Alvarez",
        headline: "Technical Writer | API Documentation Expert | Developer Experience Advocate",
        bio: "Technical writer who makes complex systems accessible through clear documentation. I mentor students on creating effective technical documentation, writing API references, and improving developer experience. Good documentation is key to successful software adoption.",
        location: "Dublin, Ireland",
        timezone: "Europe/Dublin",
        expertiseSkills: ["Technical Writing", "API Design", "UX Collaboration", "Product Thinking"],
        skills: ["System Design", "Project Management"],
        techStack: ["Node.js", "Express", "GraphQL", "React", "Next.js"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English", "Spanish"],
        rateType: "free" as const,
        rateNote: "Documentation mentoring for open-source contributors",
        links: {
          github: "https://github.com/kollab-mentors/lina-alvarez",
          linkedin: "https://www.linkedin.com/in/lina-alvarez",
          portfolio: "https://lina-alvarez.kollabmail.test",
        },
        availabilityHoursPerWeek: 5,
        availabilitySlots: [
          {
            date: "2026-05-27",
            startTime: "17:00",
            endTime: "19:00",
            timezone: "Europe/Dublin",
            note: "Documentation strategy sessions",
          },
          {
            date: "2026-05-30",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Europe/Dublin",
            note: "API documentation reviews",
          },
        ],
      },
    },
    {
      name: "Daniel Foster",
      email: "daniel.foster@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Daniel Foster",
        headline: "QA Engineer | Testing Strategy Expert | Debugging & Quality Assurance Specialist",
        bio: "QA engineer dedicated to ensuring software reliability through comprehensive testing strategies. I mentor students on test-driven development, debugging techniques, automated testing, and quality assurance best practices. Learn how to catch bugs before users do and ship with confidence.",
        location: "Melbourne, Australia",
        timezone: "Australia/Melbourne",
        expertiseSkills: ["Testing & QA", "Debugging", "System Design", "Technical Writing"],
        skills: ["API Design", "Performance Tuning"],
        techStack: ["Node.js", "Docker", "Express", "PostgreSQL", "Kubernetes"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English"],
        rateType: "free" as const,
        rateNote: "QA mentoring for quality-focused developers",
        links: {
          github: "https://github.com/kollab-mentors/daniel-foster",
          linkedin: "https://www.linkedin.com/in/daniel-foster",
          portfolio: "https://daniel-foster.kollabmail.test",
        },
        availabilityHoursPerWeek: 6,
        availabilitySlots: [
          {
            date: "2026-05-26",
            startTime: "09:00",
            endTime: "11:00",
            timezone: "Australia/Melbourne",
            note: "Testing strategy consultations",
          },
          {
            date: "2026-05-28",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Australia/Melbourne",
            note: "Debugging workshops",
          },
        ],
      },
    },
    {
      name: "Amina Diallo",
      email: "amina.diallo@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Amina Diallo",
        headline: "Product Manager | UX Strategy Expert | Early-Stage Product Planning Specialist",
        bio: "Product manager passionate about building user-centered products from the ground up. I mentor students on product strategy, user research, feature prioritization, and working effectively with design and engineering teams. Learn how to validate ideas and ship products that solve real problems.",
        location: "Amsterdam, Netherlands",
        timezone: "Europe/Amsterdam",
        expertiseSkills: ["Product Thinking", "UX Collaboration", "Project Management", "Mentoring & Leadership"],
        skills: ["Technical Writing", "System Design"],
        techStack: ["React", "Node.js", "PostgreSQL", "AWS"],
        domainInterests: ["Software Engineering", "Web Dev"],
        languages: ["English", "French"],
        rateType: "free" as const,
        rateNote: "Product management mentoring for students",
        links: {
          github: "https://github.com/kollab-mentors/amina-diallo",
          linkedin: "https://www.linkedin.com/in/amina-diallo",
          portfolio: "https://amina-diallo.kollabmail.test",
        },
        availabilityHoursPerWeek: 5,
        availabilitySlots: [
          {
            date: "2026-05-25",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Europe/Amsterdam",
            note: "Product strategy sessions",
          },
          {
            date: "2026-05-28",
            startTime: "19:00",
            endTime: "21:00",
            timezone: "Europe/Amsterdam",
            note: "Feature prioritization workshops",
          },
        ],
      },
    },
    {
      name: "Chen Wei",
      email: "chen.wei@kollabmail.test",
      password: hashedPassword,
      userType: "mentor" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Chen Wei",
        headline: "IoT Engineer | Embedded Systems Specialist | Robotics Software Integration Expert",
        bio: "IoT engineer specializing in embedded systems and robotics software integration. I mentor students on building IoT applications, working with embedded devices, and integrating hardware with software systems. Whether you're working on your first Arduino project or building complex robotics systems, I can guide you.",
        location: "Kuala Lumpur, Malaysia",
        timezone: "Asia/Kuala_Lumpur",
        expertiseSkills: ["System Design", "Performance Tuning", "Debugging", "Testing & QA"],
        skills: ["API Design", "Database Design"],
        techStack: ["Node.js", "MongoDB", "Redis", "Docker", "AWS"],
        domainInterests: ["IoT", "Robotics", "Software Engineering"],
        languages: ["English", "Mandarin", "Malay"],
        rateType: "free" as const,
        rateNote: "IoT and robotics mentoring for students",
        links: {
          github: "https://github.com/kollab-mentors/chen-wei",
          linkedin: "https://www.linkedin.com/in/chen-wei",
          portfolio: "https://chen-wei.kollabmail.test",
        },
        availabilityHoursPerWeek: 7,
        availabilitySlots: [
          {
            date: "2026-05-26",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Asia/Kuala_Lumpur",
            note: "IoT architecture consultations",
          },
          {
            date: "2026-05-28",
            startTime: "10:00",
            endTime: "12:00",
            timezone: "Asia/Kuala_Lumpur",
            note: "Embedded systems programming",
          },
          {
            date: "2026-05-31",
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Asia/Kuala_Lumpur",
            note: "Robotics software integration",
          },
        ],
      },
    },
  ];
};

// ── Main execution ────────────────────────────────────────────────────────────

const run = async () => {
  let exitCode = 0;
  const isReset = process.argv.includes("--reset") || process.env.RESET === "true";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Mentor Seed Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Reset mode: ${isReset ? "✅ Enabled (will delete & recreate)" : "❌ Disabled (will upsert only)"}`);
  console.log(`Email domain: kollabmail.test`);
  console.log(`Target mentors: 15`);
  console.log("");

  try {
    // ── Validate before connecting ───────────────────────────────────────────
    const mentors = await buildMentors();
    validateMentors(mentors);

    await connectDB();
    let deletedCount = 0;

    // ── Reset: delete only seeded mentors ────────────────────────────────────
    if (isReset) {
      console.log("🗑️  Deleting existing seeded mentors...");
      const deleteFilter = {
        userType: "mentor",
        email: { $in: SEEDED_MENTOR_EMAILS },
      };
      const deleteResult = await User.deleteMany(deleteFilter);
      deletedCount = deleteResult.deletedCount ?? 0;
      console.log(`   Deleted ${deletedCount} existing seeded mentors\n`);
    }

    // ── Upsert mentors ────────────────────────────────────────────────────────
    console.log("💾 Upserting mentors...\n");

    let upsertedCount = 0;
    let modifiedCount = 0;
    let matchedCount = 0;
    let failedCount = 0;

    for (const mentor of mentors) {
      try {
        const result = await User.updateOne(
          { email: mentor.email },
          {
            $set: mentor,
            $unset: { onboardingStep: 1 },
          },
          { upsert: true }
        );

        matchedCount += result.matchedCount ?? 0;
        modifiedCount += result.modifiedCount ?? 0;
        upsertedCount += result.upsertedCount ?? 0;

        console.log(`   ✓ ${mentor.name} (${mentor.email})`);
      } catch (mentorErr) {
        failedCount += 1;
        console.error(`   ✗ Failed: ${mentor.name} (${mentor.email})`, mentorErr);
      }
    }

    if (failedCount > 0) {
      throw new Error(`${failedCount} mentor(s) failed to seed`);
    }

    // ── Final summary ─────────────────────────────────────────────────────────
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Mentor Seed Complete");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Total intended: ${mentors.length}`);
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
    console.log("1. Verify mentors in MongoDB Atlas");
    console.log("2. Login with any seeded mentor email and your SEED_USER_PASSWORD");
    console.log("3. Navigate to Mentors page to see all mentors");
    console.log("4. Test smart search and mentor booking");
    console.log("");
  } catch (err) {
    exitCode = 1;
    console.error("❌ Mentor seed failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
};

run();
