import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { PortfolioItem } from "../models/portfolio.model";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Environment Guard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (process.env.ALLOW_MAIN_SHOWCASE_SEED !== "true") {
  console.error("\n❌ ALLOW_MAIN_SHOWCASE_SEED must be set to true before running this script.\n");
  process.exit(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TARGET_EMAIL = "pineeakarsha@gmail.com";

const MAIN_SHOWCASE_TITLES = [
  "Kollab — AI Powered Project Collaboration and Career Readiness Platform",
  "Plantify — AI Powered Automated Vertical Gardening System",
  "Casa Ceylon — 3D Furniture E-Commerce and Room Design Platform",
  "Cellexa — Premium Electronics E-Commerce Platform",
];

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Build Showcases
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildShowcases(userId: string) {
  return [
    // Showcase 1: Kollab
    {
      userId,
      title: "Kollab — AI Powered Project Collaboration and Career Readiness Platform",
      role: "Full Stack Developer",
      summary:
        "A full-stack AI-powered project collaboration and career readiness platform designed to help students and early-career users discover projects, build portfolios, receive mentorship, complete job simulations, and understand job market trends.",
      problem:
        "Students and early-career learners often struggle to find relevant project opportunities, prove practical skills, and connect their academic work with employability outcomes.",
      solution:
        "Built an integrated platform with project discovery, personalised recommendations, smart search, evidence-based profiles, job simulations, mentorship, and job market insights.",
      responsibilities:
        "Designed and implemented full-stack features across the React frontend, Node/Express backend, MongoDB data models, AI-powered recommendation/search flows, and supporting FastAPI services.",
      outcomes:
        "Delivered a working deployed platform with multiple connected modules, realistic portfolio data, AI-supported discovery, and portfolio-focused career readiness workflows.",
      techStack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB", "FastAPI", "Docker"],
      links: [
        {
          label: "GitHub Repository",
          url: "https://github.com/dpaperera05/Kollab---Project-Collaboration-Hub",
        },
        {
          label: "Technical Overview",
          url: "https://case-study.kollabmail.test/kollab-platform",
        },
      ],
      collaborators: [],
      screenshots: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop",
      ],
      coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop",
      specialNotes: "This was the main final-year project and the primary platform prepared for the viva demonstration.",
      isPublished: true,
    },

    // Showcase 2: Plantify
    {
      userId,
      title: "Plantify — AI Powered Automated Vertical Gardening System",
      role: "Mobile Developer",
      summary:
        "An AI-powered vertical gardening system with a mobile monitoring experience for viewing sensor data, plant progress, control actions, and image-based plant insights.",
      problem:
        "Home and urban growers need an easier way to monitor plant health, manage controlled growing conditions, and understand system status without constantly checking hardware manually.",
      solution:
        "Designed a mobile-first monitoring and control experience connected to IoT sensor flows, cloud data storage, and a FastAPI-based plant image analysis backend.",
      responsibilities:
        "Planned the mobile application flow, designed monitoring and control screens, connected the app concept to IoT data, and prepared the system architecture for sensor readings, alerts, controls, and visual plant monitoring.",
      outcomes:
        "Produced a complete project demonstration flow covering tower setup, live monitoring, manual controls, image capture, plant insights, and community support features.",
      techStack: ["React Native", "FastAPI", "PostgreSQL", "Docker", "AWS"],
      links: [
        {
          label: "Technical Overview",
          url: "https://case-study.kollabmail.test/plantify-system",
        },
        {
          label: "Mobile App Preview",
          url: "https://plantify.kollabmail.test",
        },
      ],
      collaborators: [],
      screenshots: [
        "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop",
      ],
      coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop",
      specialNotes:
        "This project demonstrates the ability to combine mobile app design, IoT system thinking, cloud-backed data flow, and AI-assisted plant monitoring.",
      isPublished: true,
    },

    // Showcase 3: Casa Ceylon
    {
      userId,
      title: "Casa Ceylon — 3D Furniture E-Commerce and Room Design Platform",
      role: "Frontend Developer",
      summary:
        "A modern furniture e-commerce and room design platform focused on premium product browsing, interactive room planning, and a polished customer experience.",
      problem:
        "Traditional online furniture shopping often lacks confidence-building interaction, room context, and visual support for choosing products that fit a user's space.",
      solution:
        "Designed a customer-facing furniture store experience with rich product presentation, room design interactions, product customization, and a modern interface for furniture discovery.",
      responsibilities:
        "Worked on the frontend user experience, product browsing flows, room design interface planning, responsive layouts, visual hierarchy, and interaction improvements for a premium e-commerce feel.",
      outcomes:
        "Created a strong HCI-focused project experience showing practical UI/UX thinking, frontend implementation, and interactive design for an e-commerce use case.",
      techStack: ["React", "Vite", "Tailwind CSS", "Node.js", "MongoDB"],
      links: [
        {
          label: "Case Study",
          url: "https://case-study.kollabmail.test/casa-ceylon",
        },
        {
          label: "Interface Preview",
          url: "https://casa-ceylon.kollabmail.test",
        },
      ],
      collaborators: [],
      screenshots: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&auto=format&fit=crop",
      ],
      coverImage: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop",
      specialNotes: "This showcase highlights frontend design quality, user experience refinement, and interactive product exploration.",
      isPublished: true,
    },

    // Showcase 4: Cellexa
    {
      userId,
      title: "Cellexa — Premium Electronics E-Commerce Platform",
      role: "Full Stack Developer",
      summary:
        "A premium electronics e-commerce platform concept with customer web experience, mobile app direction, and admin-side product management for smartphones, tablets, and accessories.",
      problem:
        "Electronics buyers need a clear, trustworthy, and modern shopping experience that supports product comparison, preorders, and category-based discovery.",
      solution:
        "Designed and implemented a premium e-commerce experience with product-focused pages, comparison support, preorder flow, and admin-oriented management concepts.",
      responsibilities:
        "Planned the product experience, built frontend screens, structured e-commerce flows, refined UI sections, and prepared project materials aligned with software project management deliverables.",
      outcomes:
        "Delivered a polished product concept that demonstrates full-stack thinking, product planning, UI design, and e-commerce workflow understanding.",
      techStack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
      links: [
        {
          label: "Case Study",
          url: "https://case-study.kollabmail.test/cellexa",
        },
        {
          label: "Interface Preview",
          url: "https://cellexa.kollabmail.test",
        },
      ],
      collaborators: [],
      screenshots: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop",
      ],
      coverImage: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&auto=format&fit=crop",
      specialNotes: "This project supports the profile's product-focused full-stack and frontend/UI direction.",
      isPublished: true,
    },
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateShowcases(showcases: any[], targetUserId: string) {
  console.log("🔍 Validating showcases...");

  if (showcases.length !== 4) {
    throw new Error(`Expected exactly 4 showcases, got ${showcases.length}`);
  }

  for (let i = 0; i < showcases.length; i++) {
    const s = showcases[i];
    const prefix = `Showcase ${i + 1} (${s.title})`;

    // Required fields
    if (!s.userId) throw new Error(`${prefix}: Missing userId`);
    if (!s.title) throw new Error(`${prefix}: Missing title`);
    if (!s.role) throw new Error(`${prefix}: Missing role`);
    if (!s.summary) throw new Error(`${prefix}: Missing summary`);
    if (!s.problem) throw new Error(`${prefix}: Missing problem`);
    if (!s.solution) throw new Error(`${prefix}: Missing solution`);
    if (!s.responsibilities) throw new Error(`${prefix}: Missing responsibilities`);
    if (!s.outcomes) throw new Error(`${prefix}: Missing outcomes`);
    if (!s.coverImage) throw new Error(`${prefix}: Missing coverImage`);
    if (s.isPublished !== true) throw new Error(`${prefix}: isPublished must be true`);

    // userId validation
    if (s.userId !== targetUserId) {
      throw new Error(`${prefix}: userId mismatch (expected ${targetUserId}, got ${s.userId})`);
    }

    // Role validation
    if (!ALLOWED_ROLES.includes(s.role)) {
      throw new Error(`${prefix}: Invalid role "${s.role}". Must be one of: ${ALLOWED_ROLES.join(", ")}`);
    }

    // Tech stack validation
    if (!Array.isArray(s.techStack)) {
      throw new Error(`${prefix}: techStack must be an array`);
    }
    if (s.techStack.length < 3 || s.techStack.length > 8) {
      throw new Error(`${prefix}: techStack must have 3-8 items, got ${s.techStack.length}`);
    }
    for (const tech of s.techStack) {
      if (!ALLOWED_TECH_STACK.includes(tech)) {
        throw new Error(
          `${prefix}: Invalid techStack value "${tech}". Must be one of: ${ALLOWED_TECH_STACK.join(", ")}`
        );
      }
    }

    // Screenshots validation
    if (!Array.isArray(s.screenshots)) {
      throw new Error(`${prefix}: screenshots must be an array`);
    }
    if (s.screenshots.length < 1 || s.screenshots.length > 5) {
      throw new Error(`${prefix}: screenshots must have 1-5 items, got ${s.screenshots.length}`);
    }

    // Links validation
    if (!Array.isArray(s.links)) {
      throw new Error(`${prefix}: links must be an array`);
    }
    if (s.links.length < 1) {
      throw new Error(`${prefix}: links must have at least 1 item`);
    }

    // Forbidden words check
    const allText = [
      s.title,
      s.summary,
      s.problem,
      s.solution,
      s.responsibilities,
      s.outcomes,
      s.specialNotes || "",
    ].join(" ");

    for (const word of FORBIDDEN_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(allText)) {
        throw new Error(`${prefix}: Text contains forbidden word "${word}"`);
      }
    }
  }

  console.log("   ✅ All showcases passed validation");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Execution
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function run() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 Main Member Showcase Seed Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const isReset = process.argv.includes("--reset");
  console.log(`Target email: ${TARGET_EMAIL}`);
  console.log(`Reset mode: ${isReset ? "✓ enabled" : "✗ disabled"}\n`);

  // Connect to MongoDB
  await connectDB();

  // Find target user
  console.log("🔍 Looking up target user...");
  const targetUser = await User.findOne({ email: TARGET_EMAIL });

  if (!targetUser) {
    throw new Error(`Target user not found: ${TARGET_EMAIL}`);
  }
  console.log(`   ✓ Found user: ${targetUser.email}`);

  if (targetUser.userType !== "member") {
    throw new Error(`Target user must be a member, got userType: ${targetUser.userType}`);
  }
  console.log(`   ✓ User type is "member"\n`);

  // Build showcases
  const showcases = buildShowcases(targetUser._id.toString());

  // Validate before DB operations
  validateShowcases(showcases, targetUser._id.toString());

  // Handle reset if requested
  let deletedCount = 0;
  if (isReset) {
    console.log("\n🗑️  Reset mode: Deleting existing showcases...");
    const deleteResult = await PortfolioItem.deleteMany({
      userId: targetUser._id.toString(),
      title: { $in: MAIN_SHOWCASE_TITLES },
    });
    deletedCount = deleteResult.deletedCount || 0;
    console.log(`   ✓ Deleted ${deletedCount} existing showcase(s)\n`);
  }

  // Upsert showcases
  console.log("💾 Upserting showcases...\n");

  let upsertedCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let failedCount = 0;

  for (const showcase of showcases) {
    try {
      const result = await PortfolioItem.updateOne(
        {
          userId: targetUser._id.toString(),
          title: showcase.title,
        },
        {
          $set: showcase,
        },
        { upsert: true }
      );

      upsertedCount++;
      if (result.matchedCount) matchedCount++;
      if (result.modifiedCount) modifiedCount++;

      const action = result.upsertedId ? "created" : result.modifiedCount ? "updated" : "unchanged";
      console.log(`   ${action === "created" ? "+" : action === "updated" ? "~" : "="} ${showcase.title}`);
    } catch (err) {
      failedCount++;
      console.error(`   ✗ Failed: ${showcase.title}`, err);
    }
  }

  // Final summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Main Member Showcase Seed Complete");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Target user: ${TARGET_EMAIL}`);
  console.log(`User ID: ${targetUser._id.toString()}`);
  console.log(`\nShowcase Summary:`);
  console.log(`   Total intended: ${showcases.length}`);
  console.log(`   Upserted: ${upsertedCount}`);
  console.log(`   Matched (existing): ${matchedCount}`);
  console.log(`   Modified: ${modifiedCount}`);
  console.log(`   Failed: ${failedCount}`);
  if (isReset) {
    console.log(`   Reset deleted: ${deletedCount}`);
  }
  console.log("\nNext steps:");
  console.log("1. Login with this email to verify the showcases");
  console.log("2. Check the profile page at /profile");
  console.log("3. Verify showcases appear as pinned portfolio items");
  console.log("4. Test public member profile view at /people/:id");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Entry Point
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let exitCode = 0;

run()
  .then(() => {
    console.log("✅ Script completed successfully");
  })
  .catch((err) => {
    exitCode = 1;
    console.error("\n❌ Main member showcase seed failed:", err);
  })
  .finally(async () => {
    await mongoose.disconnect();
    process.exit(exitCode);
  });
