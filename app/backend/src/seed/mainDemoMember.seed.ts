import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Environment Guard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (process.env.ALLOW_MAIN_MEMBER_SEED !== "true") {
  console.error("❌ ALLOW_MAIN_MEMBER_SEED must be set to true before running this script.");
  process.exit(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Target User Email
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TARGET_EMAIL = "pineeakarsha@gmail.com";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Allowed Values for Validation
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Profile Data for Main Demo Member
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const profileUpdate = {
  headline: "Undergraduate Full Stack Developer focused on AI-powered web experiences",
  bio: "I am an undergraduate software engineering student interested in building practical, user-friendly web applications with strong frontend quality and reliable backend services. I enjoy working on AI-powered platforms, collaboration tools and product-focused systems where clean UI, good architecture and real user value matter.",
  timezone: "Asia/Colombo",
  location: "Colombo, Sri Lanka",
  preferredRoles: [
    "Full Stack Developer",
    "Frontend Developer",
    "UI/UX Designer",
  ],
  skills: [
    "System Design",
    "API Design",
    "Database Design",
    "Testing & QA",
    "Product Thinking",
    "UX Collaboration",
    "DevOps & CI/CD",
  ],
  techStack: [
    "React",
    "Vite",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "MongoDB",
    "FastAPI",
  ],
  expertiseSkills: [
    "UX Collaboration",
    "API Design",
    "Product Thinking",
    "Testing & QA",
  ],
  languages: [
    "English",
    "Sinhala",
  ],
  links: {
    github: "https://github.com/dpaperera05",
    linkedin: "https://www.linkedin.com/in/pinee-perera-7a511a27a",
    portfolio: "https://pinee-akarsha.kollabmail.test",
  },
  availabilityHoursPerWeek: 12,
  domainInterests: [
    "AI & ML",
    "Web Dev",
    "Software Engineering",
    "Data Science",
  ],
  availabilitySlots: [],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const validateProfileData = () => {
  const errors: string[] = [];

  // Validate preferredRoles
  profileUpdate.preferredRoles.forEach((role) => {
    if (!ALLOWED_ROLES.includes(role)) {
      errors.push(`Invalid preferredRole: "${role}"`);
    }
  });

  // Validate skills
  profileUpdate.skills.forEach((skill) => {
    if (!ALLOWED_SKILLS.includes(skill)) {
      errors.push(`Invalid skill: "${skill}"`);
    }
  });

  // Validate techStack
  profileUpdate.techStack.forEach((tech) => {
    if (!ALLOWED_TECH_STACK.includes(tech)) {
      errors.push(`Invalid techStack value: "${tech}"`);
    }
  });

  // Validate expertiseSkills
  profileUpdate.expertiseSkills.forEach((skill) => {
    if (!ALLOWED_SKILLS.includes(skill)) {
      errors.push(`Invalid expertiseSkill: "${skill}"`);
    }
  });

  // Validate domainInterests
  profileUpdate.domainInterests.forEach((domain) => {
    if (!ALLOWED_DOMAINS.includes(domain)) {
      errors.push(`Invalid domainInterest: "${domain}"`);
    }
  });

  if (errors.length > 0) {
    console.error("\n❌ Validation failed:\n");
    errors.forEach((err) => console.error(`   - ${err}`));
    throw new Error(`Validation failed with ${errors.length} error(s)`);
  }

  console.log("✅ Profile data validation passed\n");
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Update Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const run = async () => {
  let exitCode = 0;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 Main Viva Demo Member Update Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Target email: ${TARGET_EMAIL}`);
  console.log("");

  try {
    // ── Validate profile data ─────────────────────────────────────────────────
    console.log("🔍 Validating profile data...");
    validateProfileData();

    // ── Connect to database ───────────────────────────────────────────────────
    await connectDB();

    // ── Find target user ──────────────────────────────────────────────────────
    console.log("🔍 Looking up target user...");
    const user = await User.findOne({ email: TARGET_EMAIL }).lean();

    if (!user) {
      throw new Error(
        `User with email "${TARGET_EMAIL}" not found. Please ensure the user exists in the database.`
      );
    }

    console.log(`   ✓ Found user: ${user.email}`);

    // ── Verify user type ──────────────────────────────────────────────────────
    if (user.userType !== "member") {
      throw new Error(
        `User "${TARGET_EMAIL}" has userType "${user.userType}" (expected "member"). Cannot proceed.`
      );
    }

    console.log(`   ✓ User type is "member"\n`);

    // ── Prepare update operation ──────────────────────────────────────────────
    console.log("📝 Preparing update...");
    console.log("   Preserving: _id, email, password, name, profile.name, profile.avatarUrl, profile.avatarKey, bookmarkedProjects");
    console.log("   Updating: profile fields, status flags");
    console.log("   Unsetting: onboardingStep\n");

    // Build $set update
    const updateSet: any = {
      userType: "member",
      isEmailVerified: true,
      onboardingCompleted: true,
      isProfilePublic: true,
      "profile.headline": profileUpdate.headline,
      "profile.bio": profileUpdate.bio,
      "profile.timezone": profileUpdate.timezone,
      "profile.location": profileUpdate.location,
      "profile.preferredRoles": profileUpdate.preferredRoles,
      "profile.skills": profileUpdate.skills,
      "profile.techStack": profileUpdate.techStack,
      "profile.expertiseSkills": profileUpdate.expertiseSkills,
      "profile.languages": profileUpdate.languages,
      "profile.links": profileUpdate.links,
      "profile.availabilityHoursPerWeek": profileUpdate.availabilityHoursPerWeek,
      "profile.domainInterests": profileUpdate.domainInterests,
      "profile.availabilitySlots": profileUpdate.availabilitySlots,
    };

    // Build $unset update
    const updateUnset: any = {
      onboardingStep: 1,
    };

    // ── Execute update ────────────────────────────────────────────────────────
    console.log("💾 Updating user...");
    const updateResult = await User.updateOne(
      { email: TARGET_EMAIL },
      {
        $set: updateSet,
        $unset: updateUnset,
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error("User not found during update operation");
    }

    console.log(`   ✓ User updated successfully`);
    console.log(`   Modified: ${updateResult.modifiedCount > 0 ? "Yes" : "No (already up-to-date)"}\n`);

    // ── Trigger embedding regeneration (optional) ─────────────────────────────
    console.log("📊 Note: User profile embedding regeneration may be needed.");
    console.log("   The embedding will be automatically regenerated when:");
    console.log("   1. The user logs in and views their profile");
    console.log("   2. The user updates their profile through the UI");
    console.log("   3. A manual embedding regeneration job is triggered\n");

    // ── Final summary ─────────────────────────────────────────────────────────
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Main Viva Demo Member Update Complete");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email: ${TARGET_EMAIL}`);
    console.log(`Status: ✓ Email verified, ✓ Onboarding completed, ✓ Public profile`);
    console.log(`Roles: ${profileUpdate.preferredRoles.join(", ")}`);
    console.log(`Tech Stack: ${profileUpdate.techStack.join(", ")}`);
    console.log(`Domains: ${profileUpdate.domainInterests.join(", ")}`);
    console.log("");
    console.log("Next steps:");
    console.log("1. Login with this email to verify the profile updates");
    console.log("2. Check the profile page at /profile");
    console.log("3. Verify showcases and skill evidence on member profile page");
    console.log("4. Test smart search and recommendation features");
    console.log("");
  } catch (err) {
    exitCode = 1;
    console.error("❌ Main member update failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
};

run();
