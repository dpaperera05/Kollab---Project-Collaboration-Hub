import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { Event } from "../models/event.model";

// ── Environment Guard ─────────────────────────────────────────────────────────

if (process.env.ALLOW_TECH_EVENT_SEED !== "true") {
  console.error("❌ ALLOW_TECH_EVENT_SEED must be set to true before running this script.");
  process.exit(1);
}

// ── Event Curator Allowlist ───────────────────────────────────────────────────

const EVENT_CURATORS = [
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

// ── Forbidden Words ───────────────────────────────────────────────────────────

const FORBIDDEN_WORDS = ["demo", "seed", "fake", "sample", "dummy", "placeholder", "kollab seed"];

// ── Technology Event Data ─────────────────────────────────────────────────────

const TECHNOLOGY_EVENTS = [
  {
    curatorEmail: "pineeakarsha@gmail.com",
    title: "Microsoft Build 2026",
    type: "Workshop" as const,
    dateTime: "2026-06-02T16:00:00.000Z",
    endDateTime: "2026-06-03T23:00:00.000Z",
    timezone: "America/Los_Angeles",
    locationType: "City" as const,
    city: "San Francisco, California, USA",
    organizer: "Microsoft",
    externalLink: "https://build.microsoft.com/en-US/home",
    tags: ["AI/ML", "Developer Tools", "Cloud Computing", "APIs", "Conference"],
    featured: true,
    participantCount: 18000,
    description: "Curated external listing for Microsoft Build 2026, a developer-focused event covering AI applications, cloud platforms, developer tools, and practical software engineering sessions for modern teams.",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "james.okonkwo@kollabmail.test",
    title: "Cisco Live 2026 Global Broadcast",
    type: "Webinar" as const,
    dateTime: "2026-06-02T16:00:00.000Z",
    endDateTime: "2026-06-04T23:00:00.000Z",
    timezone: "America/Los_Angeles",
    locationType: "Virtual" as const,
    virtualPlatform: "Cisco Live Digital",
    organizer: "Cisco",
    externalLink: "https://www.ciscolive.com/global/attend.html",
    tags: ["Cloud Computing", "DevOps", "Cybersecurity", "Networking", "Webinar"],
    featured: false,
    participantCount: 9500,
    description: "Curated external listing for Cisco Live's global broadcast, covering enterprise networking, infrastructure, cloud operations, security, and technical learning for IT and engineering teams.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "aisha.khan@kollabmail.test",
    title: "Apple WWDC26",
    type: "Webinar" as const,
    dateTime: "2026-06-08T17:00:00.000Z",
    endDateTime: "2026-06-12T23:00:00.000Z",
    timezone: "America/Los_Angeles",
    locationType: "Virtual" as const,
    virtualPlatform: "Apple Developer",
    organizer: "Apple",
    externalLink: "https://developer.apple.com/wwdc26/",
    tags: ["Mobile", "Developer Tools", "UI/UX", "APIs", "Conference"],
    featured: true,
    participantCount: 30000,
    description: "Curated external listing for Apple's Worldwide Developers Conference 2026, focused on Apple platform development, design, frameworks, app experiences, and developer sessions.",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "sarah.chen@kollabmail.test",
    title: "NVIDIA GTC Taipei 2026",
    type: "Talk" as const,
    dateTime: "2026-06-01T01:00:00.000Z",
    endDateTime: "2026-06-04T09:00:00.000Z",
    timezone: "Asia/Taipei",
    locationType: "City" as const,
    city: "Taipei, Taiwan",
    organizer: "NVIDIA",
    externalLink: "https://www.nvidia.com/gtc/",
    tags: ["AI/ML", "Data Science", "Robotics", "Cloud Computing", "Conference"],
    featured: true,
    participantCount: 12000,
    description: "Curated external listing for NVIDIA GTC Taipei, covering AI infrastructure, accelerated computing, agentic AI, robotics, and the broader AI developer ecosystem.",
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "maya.silva@kollabmail.test",
    title: "KubeCon + CloudNativeCon India 2026",
    type: "Talk" as const,
    dateTime: "2026-06-18T03:30:00.000Z",
    endDateTime: "2026-06-19T12:30:00.000Z",
    timezone: "Asia/Kolkata",
    locationType: "City" as const,
    city: "Mumbai, India",
    organizer: "CNCF / Linux Foundation",
    externalLink: "https://www.cncf.io/kubecon-cloudnativecon-events/",
    tags: ["Cloud Native", "Kubernetes", "DevOps", "Open Source", "Conference"],
    featured: false,
    participantCount: 4500,
    description: "Curated external listing for KubeCon + CloudNativeCon India 2026, bringing together cloud native developers, platform engineers, maintainers, and DevOps practitioners.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "arjun.mehra@kollabmail.test",
    title: "OWASP Global AppSec EU 2026",
    type: "Workshop" as const,
    dateTime: "2026-06-22T07:00:00.000Z",
    endDateTime: "2026-06-26T16:00:00.000Z",
    timezone: "Europe/Vienna",
    locationType: "City" as const,
    city: "Vienna, Austria",
    organizer: "OWASP Foundation",
    externalLink: "https://owasp.org/events/",
    tags: ["Cybersecurity", "APIs", "Web Development", "Security", "Workshop"],
    featured: false,
    participantCount: 3000,
    description: "Curated external listing for OWASP Global AppSec EU 2026, a security-focused event for developers, security engineers, and teams working on application security practices.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "emma.schneider@kollabmail.test",
    title: "KubeCon + CloudNativeCon Japan 2026",
    type: "Talk" as const,
    dateTime: "2026-07-29T00:30:00.000Z",
    endDateTime: "2026-07-30T09:30:00.000Z",
    timezone: "Asia/Tokyo",
    locationType: "City" as const,
    city: "Yokohama, Japan",
    organizer: "CNCF / Linux Foundation",
    externalLink: "https://www.cncf.io/kubecon-cloudnativecon-events/",
    tags: ["Cloud Native", "Kubernetes", "DevOps", "Open Source", "Conference"],
    featured: false,
    participantCount: 4200,
    description: "Curated external listing for KubeCon + CloudNativeCon Japan 2026, focused on open source cloud native technologies, Kubernetes operations, platform engineering, and community learning.",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "arjun.mehra@kollabmail.test",
    title: "Black Hat USA 2026",
    type: "Workshop" as const,
    dateTime: "2026-08-01T16:00:00.000Z",
    endDateTime: "2026-08-06T23:00:00.000Z",
    timezone: "America/Los_Angeles",
    locationType: "City" as const,
    city: "Las Vegas, Nevada, USA",
    organizer: "Black Hat",
    externalLink: "https://blackhat.com/us-26/",
    tags: ["Cybersecurity", "Security", "APIs", "System Design", "Conference"],
    featured: true,
    participantCount: 19000,
    description: "Curated external listing for Black Hat USA 2026, a major cybersecurity event featuring technical trainings, briefings, security research, open-source security tools, and practitioner networking.",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "sarah.chen@kollabmail.test",
    title: "KubeCon + CloudNativeCon + OpenInfra Summit + PyTorch Conference China 2026",
    type: "Talk" as const,
    dateTime: "2026-09-08T01:00:00.000Z",
    endDateTime: "2026-09-09T10:00:00.000Z",
    timezone: "Asia/Shanghai",
    locationType: "City" as const,
    city: "Shanghai, China",
    organizer: "CNCF / Linux Foundation",
    externalLink: "https://www.cncf.io/kubecon-cloudnativecon-events/",
    tags: ["Cloud Native", "Kubernetes", "AI/ML", "Open Source", "Conference"],
    featured: false,
    participantCount: 5000,
    description: "Curated external listing for a combined cloud native, open infrastructure, and PyTorch-focused event connecting infrastructure engineers, AI developers, and open-source contributors.",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "sofia.martinez@kollabmail.test",
    title: "Open Source Summit Europe 2026",
    type: "Talk" as const,
    dateTime: "2026-10-07T07:00:00.000Z",
    endDateTime: "2026-10-09T16:00:00.000Z",
    timezone: "Europe/Prague",
    locationType: "City" as const,
    city: "Prague, Czechia",
    organizer: "Linux Foundation",
    externalLink: "https://events.linuxfoundation.org/open-source-summit-europe/",
    tags: ["Open Source", "Developer Tools", "DevOps", "Cloud Computing", "Conference"],
    featured: false,
    participantCount: 6500,
    description: "Curated external listing for Open Source Summit Europe 2026, covering open-source development, collaboration, security, embedded systems, cloud infrastructure, and community-led innovation.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "liam.anderson@kollabmail.test",
    title: "OWASP Global AppSec USA 2026",
    type: "Workshop" as const,
    dateTime: "2026-11-02T17:00:00.000Z",
    endDateTime: "2026-11-06T23:00:00.000Z",
    timezone: "America/Los_Angeles",
    locationType: "City" as const,
    city: "San Francisco, California, USA",
    organizer: "OWASP Foundation",
    externalLink: "https://owasp.org/events/",
    tags: ["Cybersecurity", "Security", "APIs", "Web Development", "Workshop"],
    featured: false,
    participantCount: 3500,
    description: "Curated external listing for OWASP Global AppSec USA 2026, focused on application security, secure development practices, DevSecOps, and practical security education.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "james.okonkwo@kollabmail.test",
    title: "KubeCon + CloudNativeCon North America 2026",
    type: "Talk" as const,
    dateTime: "2026-11-09T16:00:00.000Z",
    endDateTime: "2026-11-12T23:00:00.000Z",
    timezone: "America/Denver",
    locationType: "City" as const,
    city: "Salt Lake City, Utah, USA",
    organizer: "CNCF / Linux Foundation",
    externalLink: "https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/",
    tags: ["Cloud Native", "Kubernetes", "DevOps", "Open Source", "Conference"],
    featured: true,
    participantCount: 15000,
    description: "Curated external listing for KubeCon + CloudNativeCon North America 2026, a major cloud native event for Kubernetes, platform engineering, open-source infrastructure, and developer operations.",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "maria.gonzalez@kollabmail.test",
    title: "Web Summit Lisbon 2026",
    type: "Talk" as const,
    dateTime: "2026-11-09T09:00:00.000Z",
    endDateTime: "2026-11-12T18:00:00.000Z",
    timezone: "Europe/Lisbon",
    locationType: "City" as const,
    city: "Lisbon, Portugal",
    organizer: "Web Summit",
    externalLink: "https://websummit.com/web-summit-2026/",
    tags: ["Startup", "AI/ML", "Product", "Developer Tools", "Conference"],
    featured: true,
    participantCount: 70000,
    description: "Curated external listing for Web Summit Lisbon 2026, a large global technology event connecting startups, investors, product leaders, developers, and technology companies.",
    coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "pineeakarsha@gmail.com",
    title: "Slush 2026",
    type: "Talk" as const,
    dateTime: "2026-11-18T06:00:00.000Z",
    endDateTime: "2026-11-19T16:00:00.000Z",
    timezone: "Europe/Helsinki",
    locationType: "City" as const,
    city: "Helsinki, Finland",
    organizer: "Slush",
    externalLink: "https://slush.org/",
    tags: ["Startup", "Product", "AI/ML", "Career", "Conference"],
    featured: false,
    participantCount: 13000,
    description: "Curated external listing for Slush 2026, a founder-focused startup event bringing together entrepreneurs, investors, operators, and technology ecosystem builders.",
    coverImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
  {
    curatorEmail: "james.okonkwo@kollabmail.test",
    title: "AWS re:Invent 2026",
    type: "Workshop" as const,
    dateTime: "2026-11-30T17:00:00.000Z",
    endDateTime: "2026-12-04T23:00:00.000Z",
    timezone: "America/Los_Angeles",
    locationType: "City" as const,
    city: "Las Vegas, Nevada, USA",
    organizer: "Amazon Web Services",
    externalLink: "https://aws.amazon.com/events/reinvent/",
    tags: ["Cloud Computing", "DevOps", "AI/ML", "AWS", "Workshop"],
    featured: true,
    participantCount: 60000,
    description: "Curated external listing for AWS re:Invent 2026, a major cloud computing event with technical sessions, keynotes, hands-on workshops, cloud architecture learning, and AI infrastructure topics.",
    coverImage: "https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&h=675&fit=crop",
    notes: "Curated external technology event listing for student discovery.",
  },
];

// ── Technology Event Title Allowlist ──────────────────────────────────────────

const TECHNOLOGY_EVENT_TITLES = TECHNOLOGY_EVENTS.map((e) => e.title);

// ── Validation ────────────────────────────────────────────────────────────────

const validateEvents = () => {
  console.log("\n🔍 Validating event data...");

  if (TECHNOLOGY_EVENTS.length !== 15) {
    throw new Error(`Expected exactly 15 events, found ${TECHNOLOGY_EVENTS.length}`);
  }

  const titles = new Set<string>();
  const allowedTypes = ["Hackathon", "Talk", "Workshop", "Webinar"];
  const allowedLocationTypes = ["Virtual", "City"];

  for (const event of TECHNOLOGY_EVENTS) {
    // Check curator exists
    const curator = EVENT_CURATORS.find((c) => c.email === event.curatorEmail);
    if (!curator) {
      throw new Error(`Curator not found for event: ${event.title}`);
    }

    // Check unique title
    if (titles.has(event.title)) {
      throw new Error(`Duplicate title found: ${event.title}`);
    }
    titles.add(event.title);

    // Check required fields
    if (!event.title || event.title.trim().length === 0) {
      throw new Error(`Missing title in event`);
    }
    if (!event.description || event.description.trim().length === 0) {
      throw new Error(`Missing description in event: ${event.title}`);
    }
    if (!event.dateTime || event.dateTime.trim().length === 0) {
      throw new Error(`Missing dateTime in event: ${event.title}`);
    }
    if (!event.externalLink || event.externalLink.trim().length === 0) {
      throw new Error(`Missing externalLink in event: ${event.title}`);
    }
    if (!event.coverImage || event.coverImage.trim().length === 0) {
      throw new Error(`Missing coverImage in event: ${event.title}`);
    }

    // Check type
    if (!allowedTypes.includes(event.type)) {
      throw new Error(`Invalid type "${event.type}" in event: ${event.title}`);
    }

    // Check locationType
    if (!allowedLocationTypes.includes(event.locationType)) {
      throw new Error(`Invalid locationType "${event.locationType}" in event: ${event.title}`);
    }

    // Check city if locationType is City
    if (event.locationType === "City" && (!event.city || event.city.trim().length === 0)) {
      throw new Error(`Missing city for City event: ${event.title}`);
    }

    // Check virtualPlatform if locationType is Virtual
    if (event.locationType === "Virtual" && (!event.virtualPlatform || event.virtualPlatform.trim().length === 0)) {
      throw new Error(`Missing virtualPlatform for Virtual event: ${event.title}`);
    }

    // Check externalLink starts with https://
    if (!event.externalLink.startsWith("https://")) {
      throw new Error(`externalLink must start with https:// in event: ${event.title}`);
    }

    // Check coverImage starts with https://
    if (!event.coverImage.startsWith("https://")) {
      throw new Error(`coverImage must start with https:// in event: ${event.title}`);
    }

    // Check tags array has 3-6 items
    if (!Array.isArray(event.tags) || event.tags.length < 3 || event.tags.length > 6) {
      throw new Error(`Tags must be an array with 3-6 items in event: ${event.title}`);
    }

    // Check for forbidden words in visible text
    const visibleText = [
      event.title,
      event.description,
      event.organizer || "",
      ...event.tags,
    ].join(" ").toLowerCase();

    for (const word of FORBIDDEN_WORDS) {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedWord}\\b`, "i");
      if (regex.test(visibleText)) {
        throw new Error(`Forbidden word "${word}" found in event: ${event.title}`);
      }
    }
  }

  console.log("✅ All 15 events validated successfully");
};

// ── Main Seeding Function ─────────────────────────────────────────────────────

const run = async () => {
  let exitCode = 0;
  let resetDeletedCount = 0;
  let upsertedCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let failedCount = 0;

  const isReset = process.argv.includes("--reset");

  console.log("🌱 Technology Events Seeding Started");
  console.log(`📋 Reset mode: ${isReset ? "ENABLED" : "DISABLED"}`);

  try {
    // ── Validate event data ─────────────────────────────────────────────────

    validateEvents();

    // ── Connect to MongoDB ──────────────────────────────────────────────────

    await connectDB();
    console.log("\n✅ Connected to MongoDB");

    // ── Validate curators ───────────────────────────────────────────────────

    console.log("\n👥 Validating event curators...");

    const resolvedCurators = new Map<string, string>();

    for (const curator of EVENT_CURATORS) {
      const dbUser = await User.findById(curator.userId).lean();

      if (!dbUser) {
        throw new Error(`❌ Curator user not found: ${curator.email} (ID: ${curator.userId})`);
      }

      const dbUserId = dbUser._id.toString();
      const dbEmail = dbUser.email || "";

      if (dbUserId !== curator.userId) {
        throw new Error(
          `❌ Curator ID mismatch for ${curator.email}: expected ${curator.userId}, found ${dbUserId}`
        );
      }

      if (dbEmail !== curator.email) {
        throw new Error(
          `❌ Curator email mismatch for ${curator.userId}: expected ${curator.email}, found ${dbEmail}`
        );
      }

      resolvedCurators.set(curator.email, dbUserId);
      console.log(`  ✓ ${curator.name} (${curator.email}) → ${dbUserId}`);
    }

    console.log(`✅ All ${resolvedCurators.size} curators validated`);

    // ── Handle reset if requested ───────────────────────────────────────────

    if (isReset) {
      console.log("\n🗑️  Reset mode: Deleting existing technology events...");

      const curatorIds = Array.from(resolvedCurators.values());
      const resetFilter = {
        userId: { $in: curatorIds },
        title: { $in: TECHNOLOGY_EVENT_TITLES },
      };

      const deleteResult = await Event.deleteMany(resetFilter);
      resetDeletedCount = deleteResult.deletedCount || 0;
      console.log(`✅ Deleted ${resetDeletedCount} existing technology events`);
    }

    // ── Upsert events ───────────────────────────────────────────────────────

    console.log("\n📝 Upserting technology events...");

    for (const event of TECHNOLOGY_EVENTS) {
      const curatorId = resolvedCurators.get(event.curatorEmail);
      if (!curatorId) {
        console.error(`  ❌ SKIP: Curator not resolved for ${event.curatorEmail}`);
        failedCount++;
        continue;
      }

      const filter = {
        userId: curatorId,
        title: event.title,
      };

      const eventDoc: any = {
        userId: curatorId,
        title: event.title,
        type: event.type,
        dateTime: event.dateTime,
        locationType: event.locationType,
        externalLink: event.externalLink,
        coverImage: event.coverImage,
        description: event.description,
        tags: event.tags,
        featured: event.featured,
        participantCount: event.participantCount,
        organizer: event.organizer,
        notes: event.notes,
      };

      if (event.endDateTime) eventDoc.endDateTime = event.endDateTime;
      if (event.timezone) eventDoc.timezone = event.timezone;
      if (event.city) eventDoc.city = event.city;
      if (event.virtualPlatform) eventDoc.virtualPlatform = event.virtualPlatform;

      const update = {
        $set: eventDoc,
      };

      try {
        const result = await Event.updateOne(filter, update, { upsert: true });

        if (result.upsertedCount) {
          console.log(`  ✓ INSERTED: "${event.title}" by ${event.curatorEmail}`);
          upsertedCount++;
        } else if (result.matchedCount) {
          matchedCount++;
          if (result.modifiedCount) {
            console.log(`  ↻ UPDATED: "${event.title}" by ${event.curatorEmail}`);
            modifiedCount++;
          } else {
            console.log(`  ≡ UNCHANGED: "${event.title}" by ${event.curatorEmail}`);
          }
        }
      } catch (err) {
        console.error(`  ❌ FAILED: "${event.title}"`, err);
        failedCount++;
      }
    }

    // ── Summary ─────────────────────────────────────────────────────────────

    console.log("\n📊 Technology Events Seeding Summary");
    console.log(`  Total intended: ${TECHNOLOGY_EVENTS.length}`);
    console.log(`  Inserted: ${upsertedCount}`);
    console.log(`  Matched: ${matchedCount}`);
    console.log(`  Modified: ${modifiedCount}`);
    console.log(`  Failed: ${failedCount}`);
    if (isReset) {
      console.log(`  Reset deleted: ${resetDeletedCount}`);
    }

    if (failedCount > 0) {
      console.error("\n❌ Some events failed to seed");
      exitCode = 1;
    } else {
      console.log("\n✅ Technology events seeding completed successfully");
    }
  } catch (err) {
    console.error("\n❌ Technology events seeding failed:", err);
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(exitCode);
  }
};

void run();
