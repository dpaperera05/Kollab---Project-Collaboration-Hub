import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";

// ── Safety guards ─────────────────────────────────────────────────────────────

const SEEDED_MEMBER_EMAIL_PATTERN = /^[a-z]+\.[a-z]+@kollabmail\.test$/;

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

// ── Validation constants ──────────────────────────────────────────────────────

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

if (process.env.ALLOW_MEMBER_SEED !== "true") {
  console.error("❌ ALLOW_MEMBER_SEED must be set to true before running this script.");
  console.error("   Set ALLOW_MEMBER_SEED=true in your .env file and try again.");
  process.exit(1);
}

if (!process.env.SEED_USER_PASSWORD) {
  console.error("❌ SEED_USER_PASSWORD is required.");
  console.error("   Set SEED_USER_PASSWORD in your .env file and try again.");
  process.exit(1);
}

// ── Validation function ───────────────────────────────────────────────────────

const validateMembers = (members: any[]) => {
  const errors: string[] = [];

  members.forEach((member, index) => {
    const memberLabel = `Member ${index + 1} (${member.email})`;

    // Email validation
    if (!SEEDED_MEMBER_EMAIL_PATTERN.test(member.email)) {
      errors.push(`${memberLabel}: email does not match seeded member email pattern`);
    }
    if (!SEEDED_MEMBER_EMAILS.includes(member.email)) {
      errors.push(`${memberLabel}: email not in SEEDED_MEMBER_EMAILS allowlist`);
    }

    // Root fields
    if (member.userType !== "member") {
      errors.push(`${memberLabel}: userType must be "member"`);
    }
    if (member.isEmailVerified !== true) {
      errors.push(`${memberLabel}: isEmailVerified must be true`);
    }
    if (member.onboardingCompleted !== true) {
      errors.push(`${memberLabel}: onboardingCompleted must be true`);
    }
    if (member.isProfilePublic !== true) {
      errors.push(`${memberLabel}: isProfilePublic must be true`);
    }

    // Profile validation
    const profile = member.profile;
    if (!profile) {
      errors.push(`${memberLabel}: missing profile`);
      return;
    }

    // Preferred roles (1-3)
    if (!profile.preferredRoles || profile.preferredRoles.length < 1 || profile.preferredRoles.length > 3) {
      errors.push(`${memberLabel}: preferredRoles must have 1-3 items`);
    } else {
      profile.preferredRoles.forEach((role: string) => {
        if (!ALLOWED_ROLES.includes(role)) {
          errors.push(`${memberLabel}: invalid role "${role}"`);
        }
      });
    }

    // Skills (4-7)
    if (!profile.skills || profile.skills.length < 4 || profile.skills.length > 7) {
      errors.push(`${memberLabel}: skills must have 4-7 items`);
    } else {
      profile.skills.forEach((skill: string) => {
        if (!ALLOWED_SKILLS.includes(skill)) {
          errors.push(`${memberLabel}: invalid skill "${skill}"`);
        }
      });
    }

    // Tech stack (4-7)
    if (!profile.techStack || profile.techStack.length < 4 || profile.techStack.length > 7) {
      errors.push(`${memberLabel}: techStack must have 4-7 items`);
    } else {
      profile.techStack.forEach((tech: string) => {
        if (!ALLOWED_TECH_STACK.includes(tech)) {
          errors.push(`${memberLabel}: invalid techStack "${tech}"`);
        }
      });
    }

    // Domain interests (2-4)
    if (!profile.domainInterests || profile.domainInterests.length < 2 || profile.domainInterests.length > 4) {
      errors.push(`${memberLabel}: domainInterests must have 2-4 items`);
    } else {
      profile.domainInterests.forEach((domain: string) => {
        if (!ALLOWED_DOMAINS.includes(domain)) {
          errors.push(`${memberLabel}: invalid domain "${domain}"`);
        }
      });
    }
  });

  if (errors.length > 0) {
    console.error("\n❌ Validation failed:\n");
    errors.forEach((err) => console.error(`   • ${err}`));
    console.error("");
    throw new Error(`Validation failed with ${errors.length} error(s)`);
  }

  console.log("✅ Validation passed: all 25 members are valid\n");
};

// ── Build member data ─────────────────────────────────────────────────────────

const buildMembers = async () => {
  const hashedPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD!, 10);

  return [
    {
      name: "Maya Silva",
      email: "maya.silva@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Maya Silva",
        headline: "Frontend Developer | React & Tailwind Enthusiast | UX-Focused",
        bio: "Passionate frontend developer who loves building intuitive user interfaces with React and modern CSS frameworks. I value accessibility and clean design collaboration.",
        location: "Colombo, Sri Lanka",
        timezone: "Asia/Colombo",
        preferredRoles: ["Frontend Developer", "UI/UX Designer"],
        skills: ["UX Collaboration", "Testing & QA", "Performance Tuning", "Technical Writing", "Debugging"],
        techStack: ["React", "Tailwind CSS", "Vite", "Next.js", "GraphQL"],
        domainInterests: ["Web Dev", "Software Engineering"],
        availabilityHoursPerWeek: 12,
        languages: ["English", "Sinhala"],
        links: {
          github: "https://github.com/kollab-users/maya-silva",
          linkedin: "https://www.linkedin.com/in/maya-silva",
          portfolio: "https://maya-silva.kollabmail.test",
        },
      },
    },
    {
      name: "Arjun Mehra",
      email: "arjun.mehra@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Arjun Mehra",
        headline: "Backend Developer | Node.js & Express Specialist | API Design",
        bio: "Backend engineer focused on building scalable REST APIs and microservices. I enjoy solving complex data modeling challenges and optimizing database queries.",
        location: "Bangalore, India",
        timezone: "Asia/Kolkata",
        preferredRoles: ["Backend Developer"],
        skills: ["API Design", "Database Design", "System Design", "Performance Tuning", "DevOps & CI/CD"],
        techStack: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Docker"],
        domainInterests: ["Software Engineering", "Web Dev"],
        availabilityHoursPerWeek: 15,
        languages: ["English", "Hindi"],
        links: {
          github: "https://github.com/kollab-users/arjun-mehra",
          linkedin: "https://www.linkedin.com/in/arjun-mehra",
          portfolio: "https://arjun-mehra.kollabmail.test",
        },
      },
    },
    {
      name: "Sofia Martinez",
      email: "sofia.martinez@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Sofia Martinez",
        headline: "Full Stack Developer | React & Node.js | Product-Minded Engineer",
        bio: "Full stack developer who bridges frontend and backend to deliver complete features. I prioritize user experience while ensuring robust backend architecture.",
        location: "Madrid, Spain",
        timezone: "Europe/Madrid",
        preferredRoles: ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
        skills: ["Product Thinking", "API Design", "Testing & QA", "Project Management", "UX Collaboration"],
        techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
        domainInterests: ["Web Dev", "Software Engineering"],
        availabilityHoursPerWeek: 18,
        languages: ["English", "Spanish"],
        links: {
          github: "https://github.com/kollab-users/sofia-martinez",
          linkedin: "https://www.linkedin.com/in/sofia-martinez",
          portfolio: "https://sofia-martinez.kollabmail.test",
        },
      },
    },
    {
      name: "Liam Anderson",
      email: "liam.anderson@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Liam Anderson",
        headline: "UI/UX Designer | Design Systems Advocate | Frontend Collaborator",
        bio: "UX designer with a strong understanding of frontend development. I create user-centered designs and enjoy collaborating with engineers to bring them to life.",
        location: "London, United Kingdom",
        timezone: "Europe/London",
        preferredRoles: ["UI/UX Designer", "Frontend Developer"],
        skills: ["UX Collaboration", "Technical Writing", "Product Thinking", "Testing & QA"],
        techStack: ["React", "Tailwind CSS", "Next.js", "Vite"],
        expertiseSkills: ["UX Collaboration", "Product Thinking"],
        domainInterests: ["Web Dev", "Software Engineering"],
        availabilityHoursPerWeek: 10,
        languages: ["English"],
        links: {
          github: "https://github.com/kollab-users/liam-anderson",
          linkedin: "https://www.linkedin.com/in/liam-anderson",
          portfolio: "https://liam-anderson.kollabmail.test",
        },
      },
    },
    {
      name: "Aisha Khan",
      email: "aisha.khan@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Aisha Khan",
        headline: "Mobile Developer | React Native & Flutter Expert | Cross-Platform",
        bio: "Mobile developer passionate about creating smooth cross-platform experiences. I focus on performance, native feel, and shipping quality mobile products quickly.",
        location: "Dubai, United Arab Emirates",
        timezone: "Asia/Dubai",
        preferredRoles: ["Mobile Developer", "Full Stack Developer"],
        skills: ["Product Thinking", "Performance Tuning", "Testing & QA", "API Design", "Debugging"],
        techStack: ["React Native", "Flutter", "MongoDB", "Redis", "AWS"],
        expertiseSkills: ["Performance Tuning", "Debugging"],
        domainInterests: ["Mobile Dev", "Software Engineering"],
        availabilityHoursPerWeek: 14,
        languages: ["English", "Urdu", "Arabic"],
        links: {
          github: "https://github.com/kollab-users/aisha-khan",
          linkedin: "https://www.linkedin.com/in/aisha-khan",
          portfolio: "https://aisha-khan.kollabmail.test",
        },
      },
    },
    {
      name: "Noah Wilson",
      email: "noah.wilson@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Noah Wilson",
        headline: "ML Engineer | FastAPI Specialist | AI Systems Builder",
        bio: "Machine learning engineer focused on deploying production-ready AI systems. I build APIs that make complex models accessible and reliable for end users.",
        location: "Toronto, Canada",
        timezone: "America/Toronto",
        preferredRoles: ["ML Engineer", "Data Scientist", "Backend Developer"],
        skills: ["API Design", "Data Modeling", "System Design", "Performance Tuning", "Cloud Architecture"],
        techStack: ["FastAPI", "PostgreSQL", "Docker", "AWS", "Kafka"],
        expertiseSkills: ["API Design", "Data Modeling"],
        domainInterests: ["AI & ML", "Data Science", "Software Engineering"],
        availabilityHoursPerWeek: 16,
        languages: ["English", "French"],
        links: {
          github: "https://github.com/kollab-users/noah-wilson",
          linkedin: "https://www.linkedin.com/in/noah-wilson",
          portfolio: "https://noah-wilson.kollabmail.test",
        },
      },
    },
    {
      name: "Emma Schneider",
      email: "emma.schneider@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Emma Schneider",
        headline: "Data Analyst | Data Modeling & Visualization Expert | Data Storyteller",
        bio: "Data analyst who transforms raw data into actionable insights. I specialize in building dashboards and crafting data narratives that drive business decisions.",
        location: "Berlin, Germany",
        timezone: "Europe/Berlin",
        preferredRoles: ["Data Analyst", "Data Scientist"],
        skills: ["Data Modeling", "Database Design", "Technical Writing", "Product Thinking"],
        techStack: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker"],
        expertiseSkills: ["Data Modeling", "Database Design"],
        domainInterests: ["Data Science", "Software Engineering"],
        availabilityHoursPerWeek: 12,
        languages: ["English", "German"],
        links: {
          github: "https://github.com/kollab-users/emma-schneider",
          linkedin: "https://www.linkedin.com/in/emma-schneider",
          portfolio: "https://emma-schneider.kollabmail.test",
        },
      },
    },
    {
      name: "Kenji Tanaka",
      email: "kenji.tanaka@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Kenji Tanaka",
        headline: "QA Engineer | Testing & Automation Specialist | API Validator",
        bio: "Quality assurance engineer dedicated to ensuring software reliability. I write comprehensive test suites and validate APIs to catch bugs before users do.",
        location: "Tokyo, Japan",
        timezone: "Asia/Tokyo",
        preferredRoles: ["Security Analyst", "Backend Developer"],
        skills: ["Testing & QA", "Debugging", "API Design", "Technical Writing", "Performance Tuning"],
        techStack: ["Node.js", "Docker", "Express", "PostgreSQL", "Kubernetes"],
        expertiseSkills: ["Testing & QA", "Debugging"],
        domainInterests: ["Software Engineering", "Cybersecurity"],
        availabilityHoursPerWeek: 10,
        languages: ["English", "Japanese"],
        links: {
          github: "https://github.com/kollab-users/kenji-tanaka",
          linkedin: "https://www.linkedin.com/in/kenji-tanaka",
          portfolio: "https://kenji-tanaka.kollabmail.test",
        },
      },
    },
    {
      name: "Amara Okafor",
      email: "amara.okafor@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Amara Okafor",
        headline: "DevOps Engineer | Docker & CI/CD Advocate | Cloud Infrastructure",
        bio: "DevOps engineer passionate about automation and observability. I build reliable deployment pipelines and maintain cloud infrastructure that scales smoothly.",
        location: "Nairobi, Kenya",
        timezone: "Africa/Nairobi",
        preferredRoles: ["DevOps Engineer", "Backend Developer"],
        skills: ["DevOps & CI/CD", "Cloud Architecture", "Observability", "System Design", "Database Design"],
        techStack: ["Docker", "Kubernetes", "AWS", "Terraform", "Redis"],
        expertiseSkills: ["DevOps & CI/CD", "Cloud Architecture"],
        domainInterests: ["Software Engineering", "Web Dev"],
        availabilityHoursPerWeek: 15,
        languages: ["English", "Swahili"],
        links: {
          github: "https://github.com/kollab-users/amara-okafor",
          linkedin: "https://www.linkedin.com/in/amara-okafor",
          portfolio: "https://amara-okafor.kollabmail.test",
        },
      },
    },
    {
      name: "Lucas Moreau",
      email: "lucas.moreau@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Lucas Moreau",
        headline: "Security Analyst | Secure Development Advocate | Threat Modeling",
        bio: "Security analyst focused on building secure software from the ground up. I conduct threat assessments and help teams adopt security best practices early.",
        location: "Paris, France",
        timezone: "Europe/Paris",
        preferredRoles: ["Security Analyst", "Backend Developer"],
        skills: ["Security / Threat Modeling", "Testing & QA", "API Design", "System Design", "Technical Writing"],
        techStack: ["Node.js", "PostgreSQL", "Docker", "Kubernetes", "AWS"],
        expertiseSkills: ["Security / Threat Modeling"],
        domainInterests: ["Cybersecurity", "Software Engineering"],
        availabilityHoursPerWeek: 12,
        languages: ["English", "French"],
        links: {
          github: "https://github.com/kollab-users/lucas-moreau",
          linkedin: "https://www.linkedin.com/in/lucas-moreau",
          portfolio: "https://lucas-moreau.kollabmail.test",
        },
      },
    },
    {
      name: "Nora Ibrahim",
      email: "nora.ibrahim@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Nora Ibrahim",
        headline: "Product Manager | Technical PM | User-Centric Product Builder",
        bio: "Product manager with a technical background who bridges user needs and engineering execution. I prioritize features based on impact and help teams ship iteratively.",
        location: "Cairo, Egypt",
        timezone: "Africa/Cairo",
        preferredRoles: ["Product Manager"],
        skills: ["Product Thinking", "Project Management", "UX Collaboration", "Technical Writing", "System Design"],
        techStack: ["PostgreSQL", "MongoDB", "Docker", "AWS", "Kafka"],
        expertiseSkills: ["Product Thinking", "Project Management"],
        domainInterests: ["Software Engineering", "Web Dev"],
        availabilityHoursPerWeek: 14,
        languages: ["English", "Arabic"],
        links: {
          github: "https://github.com/kollab-users/nora-ibrahim",
          linkedin: "https://www.linkedin.com/in/nora-ibrahim",
          portfolio: "https://nora-ibrahim.kollabmail.test",
        },
      },
    },
    {
      name: "Ethan Carter",
      email: "ethan.carter@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Ethan Carter",
        headline: "Technical Writer | Developer Documentation Specialist | Clear Communication",
        bio: "Technical writer who makes complex systems accessible through clear documentation. I work closely with engineers to create guides, API docs, and tutorials that developers love.",
        location: "Melbourne, Australia",
        timezone: "Australia/Melbourne",
        preferredRoles: ["Technical Writer", "Frontend Developer"],
        skills: ["Technical Writing", "UX Collaboration", "Product Thinking", "Testing & QA"],
        techStack: ["React", "Next.js", "Node.js", "Express", "GraphQL"],
        expertiseSkills: ["Technical Writing"],
        domainInterests: ["Software Engineering", "Web Dev"],
        availabilityHoursPerWeek: 10,
        languages: ["English"],
        links: {
          github: "https://github.com/kollab-users/ethan-carter",
          linkedin: "https://www.linkedin.com/in/ethan-carter",
          portfolio: "https://ethan-carter.kollabmail.test",
        },
      },
    },
    {
      name: "Kavindu Perera",
      email: "kavindu.perera@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Kavindu Perera",
        headline: "Backend Developer | Database Specialist | PostgreSQL & MongoDB Expert",
        bio: "Backend developer passionate about database design and optimization. I architect data layers that support application growth and ensure query performance at scale.",
        location: "Colombo, Sri Lanka",
        timezone: "Asia/Colombo",
        preferredRoles: ["Backend Developer", "Data Analyst"],
        skills: ["Database Design", "Data Modeling", "System Design", "Performance Tuning", "API Design"],
        techStack: ["PostgreSQL", "MongoDB", "Node.js", "Redis", "Docker"],
        expertiseSkills: ["Database Design", "Data Modeling"],
        domainInterests: ["Software Engineering", "Data Science"],
        availabilityHoursPerWeek: 16,
        languages: ["English", "Sinhala", "Tamil"],
        links: {
          github: "https://github.com/kollab-users/kavindu-perera",
          linkedin: "https://www.linkedin.com/in/kavindu-perera",
          portfolio: "https://kavindu-perera.kollabmail.test",
        },
      },
    },
    {
      name: "Priya Nair",
      email: "priya.nair@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Priya Nair",
        headline: "Cloud Engineer | AWS & Kubernetes Specialist | Platform Infrastructure",
        bio: "Cloud platform engineer who builds and maintains scalable infrastructure. I focus on observability, automation, and helping teams deploy with confidence.",
        location: "Bangalore, India",
        timezone: "Asia/Kolkata",
        preferredRoles: ["DevOps Engineer", "Backend Developer"],
        skills: ["Cloud Architecture", "DevOps & CI/CD", "Observability", "System Design", "Performance Tuning"],
        techStack: ["AWS", "Kubernetes", "Terraform", "Docker", "Redis"],
        expertiseSkills: ["Cloud Architecture", "Observability"],
        domainInterests: ["Software Engineering", "Web Dev"],
        availabilityHoursPerWeek: 18,
        languages: ["English", "Hindi", "Malayalam"],
        links: {
          github: "https://github.com/kollab-users/priya-nair",
          linkedin: "https://www.linkedin.com/in/priya-nair",
          portfolio: "https://priya-nair.kollabmail.test",
        },
      },
    },
    {
      name: "Olivia Brown",
      email: "olivia.brown@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Olivia Brown",
        headline: "Frontend Developer | Next.js & Performance Expert | Fast Web Experiences",
        bio: "Frontend developer obsessed with web performance and Core Web Vitals. I optimize bundle sizes, lazy-load intelligently, and deliver fast user experiences.",
        location: "Dublin, Ireland",
        timezone: "Europe/Dublin",
        preferredRoles: ["Frontend Developer", "Full Stack Developer"],
        skills: ["Performance Tuning", "System Design", "Testing & QA", "DevOps & CI/CD", "UX Collaboration"],
        techStack: ["Next.js", "React", "Vite", "Tailwind CSS", "GraphQL"],
        expertiseSkills: ["Performance Tuning"],
        domainInterests: ["Web Dev", "Software Engineering"],
        availabilityHoursPerWeek: 14,
        languages: ["English"],
        links: {
          github: "https://github.com/kollab-users/olivia-brown",
          linkedin: "https://www.linkedin.com/in/olivia-brown",
          portfolio: "https://olivia-brown.kollabmail.test",
        },
      },
    },
    {
      name: "Daniel Kim",
      email: "daniel.kim@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Daniel Kim",
        headline: "Data Scientist | ML Modeling & Backend APIs | Data-Driven Products",
        bio: "Data scientist who bridges analytics and engineering. I build predictive models and deploy them as APIs so teams can integrate machine learning into products.",
        location: "Singapore",
        timezone: "Asia/Singapore",
        preferredRoles: ["Data Scientist", "ML Engineer", "Backend Developer"],
        skills: ["Data Modeling", "API Design", "System Design", "Performance Tuning", "Technical Writing"],
        techStack: ["FastAPI", "PostgreSQL", "Docker", "MongoDB", "Kafka"],
        expertiseSkills: ["Data Modeling", "API Design"],
        domainInterests: ["Data Science", "AI & ML", "Software Engineering"],
        availabilityHoursPerWeek: 15,
        languages: ["English", "Korean"],
        links: {
          github: "https://github.com/kollab-users/daniel-kim",
          linkedin: "https://www.linkedin.com/in/daniel-kim",
          portfolio: "https://daniel-kim.kollabmail.test",
        },
      },
    },
    {
      name: "Fatima Hassan",
      email: "fatima.hassan@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Fatima Hassan",
        headline: "Embedded Developer | IoT Systems Builder | Cloud-Connected Devices",
        bio: "Embedded systems developer working at the intersection of hardware and cloud. I build IoT solutions that connect sensors to backend platforms reliably.",
        location: "Kuala Lumpur, Malaysia",
        timezone: "Asia/Kuala_Lumpur",
        preferredRoles: ["Embedded Developer", "Backend Developer"],
        skills: ["System Design", "API Design", "Cloud Architecture", "Testing & QA", "Performance Tuning"],
        techStack: ["Node.js", "MongoDB", "AWS", "Docker", "Kafka"],
        expertiseSkills: ["System Design"],
        domainInterests: ["IoT", "Software Engineering"],
        availabilityHoursPerWeek: 12,
        languages: ["English", "Malay", "Arabic"],
        links: {
          github: "https://github.com/kollab-users/fatima-hassan",
          linkedin: "https://www.linkedin.com/in/fatima-hassan",
          portfolio: "https://fatima-hassan.kollabmail.test",
        },
      },
    },
    {
      name: "Mateo Garcia",
      email: "mateo.garcia@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Mateo Garcia",
        headline: "Robotics Engineer | Automation & Software Integration Enthusiast",
        bio: "Robotics engineer focused on automation systems and software integration. I enjoy combining mechanical systems with intelligent software for real-world applications.",
        location: "Buenos Aires, Argentina",
        timezone: "America/Argentina/Buenos_Aires",
        preferredRoles: ["Robotics Engineer", "Embedded Developer"],
        skills: ["System Design", "Testing & QA", "API Design", "Performance Tuning"],
        techStack: ["Django", "PostgreSQL", "Docker", "Redis", "Kafka"],
        expertiseSkills: ["System Design"],
        domainInterests: ["Robotics", "Software Engineering"],
        availabilityHoursPerWeek: 10,
        languages: ["English", "Spanish"],
        links: {
          github: "https://github.com/kollab-users/mateo-garcia",
          linkedin: "https://www.linkedin.com/in/mateo-garcia",
          portfolio: "https://mateo-garcia.kollabmail.test",
        },
      },
    },
    {
      name: "Hannah Clarke",
      email: "hannah.clarke@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Hannah Clarke",
        headline: "Game Developer | Interactive Systems | 3D Development Enthusiast",
        bio: "Game developer passionate about creating immersive interactive experiences. I work with interactive systems and graphics to build engaging gameplay mechanics.",
        location: "Vancouver, Canada",
        timezone: "America/Vancouver",
        preferredRoles: ["Game Developer", "3D Developer"],
        skills: ["System Design", "Performance Tuning", "Testing & QA", "Technical Writing"],
        techStack: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
        expertiseSkills: ["Performance Tuning"],
        domainInterests: ["Software Engineering", "AI & ML"],
        availabilityHoursPerWeek: 12,
        languages: ["English"],
        links: {
          github: "https://github.com/kollab-users/hannah-clarke",
          linkedin: "https://www.linkedin.com/in/hannah-clarke",
          portfolio: "https://hannah-clarke.kollabmail.test",
        },
      },
    },
    {
      name: "Ryan Murphy",
      email: "ryan.murphy@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Ryan Murphy",
        headline: "Blockchain Developer | Smart Contracts & Secure Backend Integration",
        bio: "Blockchain developer building decentralized applications with secure backend integration. I focus on distributed systems and secure backend architecture.",
        location: "Amsterdam, Netherlands",
        timezone: "Europe/Amsterdam",
        preferredRoles: ["Blockchain Developer", "Backend Developer"],
        skills: ["Security / Threat Modeling", "API Design", "System Design", "Testing & QA", "Database Design"],
        techStack: ["Node.js", "PostgreSQL", "MongoDB", "Docker", "AWS"],
        expertiseSkills: ["Security / Threat Modeling"],
        domainInterests: ["Web Dev", "Cybersecurity"],
        availabilityHoursPerWeek: 14,
        languages: ["English", "Dutch"],
        links: {
          github: "https://github.com/kollab-users/ryan-murphy",
          linkedin: "https://www.linkedin.com/in/ryan-murphy",
          portfolio: "https://ryan-murphy.kollabmail.test",
        },
      },
    },
    {
      name: "Lina Chen",
      email: "lina.chen@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Lina Chen",
        headline: "Backend Engineer | GraphQL & gRPC Specialist | API Documentation",
        bio: "Backend engineer specializing in modern API technologies like GraphQL and gRPC. I create well-documented APIs that make frontend integration seamless.",
        location: "Singapore",
        timezone: "Asia/Singapore",
        preferredRoles: ["Backend Developer", "Full Stack Developer"],
        skills: ["API Design", "Technical Writing", "System Design", "Performance Tuning", "Database Design"],
        techStack: ["GraphQL", "gRPC", "Node.js", "PostgreSQL", "Docker"],
        expertiseSkills: ["API Design", "Technical Writing"],
        domainInterests: ["Software Engineering", "Web Dev"],
        availabilityHoursPerWeek: 16,
        languages: ["English", "Mandarin"],
        links: {
          github: "https://github.com/kollab-users/lina-chen",
          linkedin: "https://www.linkedin.com/in/lina-chen",
          portfolio: "https://lina-chen.kollabmail.test",
        },
      },
    },
    {
      name: "Omar Farouk",
      email: "omar.farouk@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Omar Farouk",
        headline: "Full Stack Developer | Startup Builder | Rapid MVP Prototyping",
        bio: "Full stack developer who loves building MVPs and shipping quickly. I thrive in startup environments where iteration speed and product validation matter most.",
        location: "Cape Town, South Africa",
        timezone: "Africa/Johannesburg",
        preferredRoles: ["Full Stack Developer", "Product Manager"],
        skills: ["Product Thinking", "System Design", "API Design", "Project Management", "DevOps & CI/CD"],
        techStack: ["React", "Node.js", "MongoDB", "Docker", "AWS"],
        expertiseSkills: ["Product Thinking"],
        domainInterests: ["Web Dev", "Software Engineering"],
        availabilityHoursPerWeek: 20,
        languages: ["English", "Arabic"],
        links: {
          github: "https://github.com/kollab-users/omar-farouk",
          linkedin: "https://www.linkedin.com/in/omar-farouk",
          portfolio: "https://omar-farouk.kollabmail.test",
        },
      },
    },
    {
      name: "Isabella Rossi",
      email: "isabella.rossi@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Isabella Rossi",
        headline: "Frontend Developer | Design Systems | UX-Focused Collaboration",
        bio: "Frontend developer passionate about building and maintaining design systems. I bridge design and engineering to create consistent, accessible user interfaces.",
        location: "Milan, Italy",
        timezone: "Europe/Rome",
        preferredRoles: ["Frontend Developer", "UI/UX Designer"],
        skills: ["UX Collaboration", "System Design", "Technical Writing", "Testing & QA", "Performance Tuning"],
        techStack: ["React", "Tailwind CSS", "Next.js", "Vite", "GraphQL"],
        expertiseSkills: ["UX Collaboration", "System Design"],
        domainInterests: ["Web Dev", "Software Engineering"],
        availabilityHoursPerWeek: 14,
        languages: ["English", "Italian"],
        links: {
          github: "https://github.com/kollab-users/isabella-rossi",
          linkedin: "https://www.linkedin.com/in/isabella-rossi",
          portfolio: "https://isabella-rossi.kollabmail.test",
        },
      },
    },
    {
      name: "Thomas Nguyen",
      email: "thomas.nguyen@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Thomas Nguyen",
        headline: "QA Engineer | Security-Focused Testing | Threat Modeling Advocate",
        bio: "Quality assurance engineer with a security-first mindset. I write tests that catch vulnerabilities early and help teams build more secure applications.",
        location: "Hanoi, Vietnam",
        timezone: "Asia/Ho_Chi_Minh",
        preferredRoles: ["Security Analyst", "Backend Developer"],
        skills: ["Testing & QA", "Security / Threat Modeling", "Debugging", "Technical Writing", "API Design"],
        techStack: ["Node.js", "Docker", "Express", "PostgreSQL", "Kubernetes"],
        expertiseSkills: ["Testing & QA", "Security / Threat Modeling"],
        domainInterests: ["Cybersecurity", "Software Engineering"],
        availabilityHoursPerWeek: 12,
        languages: ["English", "Vietnamese"],
        links: {
          github: "https://github.com/kollab-users/thomas-nguyen",
          linkedin: "https://www.linkedin.com/in/thomas-nguyen",
          portfolio: "https://thomas-nguyen.kollabmail.test",
        },
      },
    },
    {
      name: "Sara Patel",
      email: "sara.patel@kollabmail.test",
      password: hashedPassword,
      userType: "member" as const,
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      bookmarkedProjects: [],
      profile: {
        name: "Sara Patel",
        headline: "Software Engineer | Collaborative Builder | Web & Full Stack Enthusiast",
        bio: "Junior software engineer eager to contribute across the full stack. I value learning through collaboration and building projects that solve real user problems.",
        location: "New York, United States",
        timezone: "America/New_York",
        preferredRoles: ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
        skills: ["Product Thinking", "UX Collaboration", "Testing & QA", "API Design", "Debugging"],
        techStack: ["React", "Node.js", "Express", "PostgreSQL", "MongoDB"],
        domainInterests: ["Web Dev", "Software Engineering", "Mobile Dev"],
        availabilityHoursPerWeek: 18,
        languages: ["English", "Gujarati", "Hindi"],
        links: {
          github: "https://github.com/kollab-users/sara-patel",
          linkedin: "https://www.linkedin.com/in/sara-patel",
          portfolio: "https://sara-patel.kollabmail.test",
        },
      },
    },
  ];
};

// ── Main seed function ────────────────────────────────────────────────────────

const run = async () => {
  const isReset = process.argv.includes("--reset");
  let exitCode = 0;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Member Seed Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Reset mode: ${isReset ? "✅ Enabled (will delete & recreate)" : "❌ Disabled (will upsert only)"}`);
  console.log(`Email domain: kollabmail.test`);
  console.log(`Target members: 25`);
  console.log("");

  try {
    // ── Validate before connecting ───────────────────────────────────────────
    const members = await buildMembers();
    validateMembers(members);

    await connectDB();
    let deletedCount = 0;

    // ── Reset: delete only seeded members ────────────────────────────────────
    if (isReset) {
      console.log("🗑️  Deleting existing seeded members...");
      const deleteFilter = {
        userType: "member",
        email: { $in: SEEDED_MEMBER_EMAILS },
      };
      const deleteResult = await User.deleteMany(deleteFilter);
      deletedCount = deleteResult.deletedCount ?? 0;
      console.log(`   Deleted ${deletedCount} existing seeded members\n`);
    }

    // ── Upsert members ────────────────────────────────────────────────────────
    console.log("💾 Upserting members...\n");

    let upsertedCount = 0;
    let modifiedCount = 0;
    let matchedCount = 0;
    let failedCount = 0;

    for (const member of members) {
      try {
        const result = await User.updateOne(
          { email: member.email },
          {
            $set: member,
            $unset: { onboardingStep: 1 },
          },
          { upsert: true }
        );

        matchedCount += result.matchedCount ?? 0;
        modifiedCount += result.modifiedCount ?? 0;
        upsertedCount += result.upsertedCount ?? 0;

        console.log(`   ✓ ${member.name} (${member.email})`);
      } catch (memberErr) {
        failedCount += 1;
        console.error(`   ✗ Failed: ${member.name} (${member.email})`, memberErr);
      }
    }

    if (failedCount > 0) {
      throw new Error(`${failedCount} member(s) failed to seed`);
    }

    // ── Final summary ─────────────────────────────────────────────────────────
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Member Seed Complete");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Total intended: ${members.length}`);
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
    console.log("1. Verify members in MongoDB Atlas");
    console.log("2. Login with any seeded email and your SEED_USER_PASSWORD");
    console.log("3. Navigate to People page to see all members");
    console.log("4. Test smart search and recommendations");
    console.log("");
  } catch (err) {
    exitCode = 1;
    console.error("❌ Member seed failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
};

run();
