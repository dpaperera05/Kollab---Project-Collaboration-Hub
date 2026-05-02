import "dotenv/config";
import { connectDB } from "../config/db";
import { Blog } from "../models/blog.model";
import { User } from "../models/user.model";

const SEED_TAG = "Kollab Seed";

const seededBlogs = [
  {
    title: "How to Build a Strong Student Tech Portfolio",
    excerpt:
      "A practical guide to turning class projects and side builds into a portfolio that shows real impact to recruiters and mentors.",
    coverImage:
      "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1600&q=80",
    tags: ["Portfolio", "Career Readiness", "Web Development", "Learning", SEED_TAG],
    viewCount: 342,
    content:
      "## Start with outcomes, not just screenshots\n" +
      "Your portfolio should communicate what problem you solved, who it helped, and what changed after you shipped. A clean screenshot helps, but outcomes are what stand out.\n\n" +
      "> Recruiters remember stories of impact more than long lists of technologies.\n\n" +
      "## Build a project page format and repeat it\n" +
      "Use the same structure for each project so your profile is easy to scan. Keep each section short and concrete.\n\n" +
      "- Problem you identified\n" +
      "- Your role and responsibilities\n" +
      "- Tech stack and why you chose it\n" +
      "- Key trade-offs and lessons learned\n\n" +
      "## Show collaboration and iteration\n" +
      "Most student portfolios focus only on final output. Add evidence of teamwork, pull requests, design iterations, and feedback loops. That makes your work feel real and production-minded.\n\n" +
      "## Keep it current and focused\n" +
      "A strong portfolio does not need twenty projects. Three to five well-written case studies with clear outcomes are enough to demonstrate readiness.",
  },
  {
    title: "Choosing the Right Role in a Student Project Team",
    excerpt:
      "How to pick a project role that matches your current strengths while still stretching your skills for faster growth.",
    coverImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    tags: ["Projects", "Collaboration", "Career Readiness", "Learning", SEED_TAG],
    viewCount: 287,
    content:
      "## Match role choice to your next milestone\n" +
      "Before joining a team, define what you want to become better at in the next two months. Role choice should support that goal, not just what feels comfortable today.\n\n" +
      "## Understand role expectations early\n" +
      "Ask how decisions are made, how work is reviewed, and what success looks like for each role. Clear expectations prevent confusion later.\n\n" +
      "> The best role is one where you can contribute now and still learn every week.\n\n" +
      "## Common team roles and when to choose them\n" +
      "If you are exploring, start where feedback is frequent and measurable.\n\n" +
      "- Frontend: great for user-focused iteration and fast visible progress\n" +
      "- Backend: great for API design, data flow, and system reasoning\n" +
      "- QA/Product: great for communication, prioritization, and quality mindset\n\n" +
      "## Re-evaluate role fit every sprint\n" +
      "Student projects move quickly. Revisit your role every sprint and rotate responsibilities when possible so the team avoids bottlenecks and everyone grows.",
  },
  {
    title: "What I Learned From My First Open Source Contribution",
    excerpt:
      "A realistic walkthrough of the first contribution journey, from understanding issue labels to shipping a meaningful pull request.",
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    tags: ["Open Source", "Collaboration", "Learning", "Projects", SEED_TAG],
    viewCount: 411,
    content:
      "## Start with beginner-friendly issues\n" +
      "My first mistake was picking a complex issue without understanding the codebase. Switching to a well-labeled starter task helped me build momentum.\n\n" +
      "## Read contribution docs like requirements\n" +
      "I treated CONTRIBUTING.md, pull request templates, and code style rules as mandatory requirements. This reduced review churn and made collaboration smoother.\n\n" +
      "> Open source is less about coding alone and more about communicating clearly with maintainers.\n\n" +
      "## What made my first PR successful\n" +
      "Small scope and clear reasoning made the review easy.\n\n" +
      "- I explained the bug in one sentence\n" +
      "- I described exactly what changed\n" +
      "- I added test evidence and screenshots\n" +
      "- I responded quickly to feedback\n\n" +
      "## Why this mattered for my career\n" +
      "That first contribution gave me confidence in unfamiliar codebases and taught me professional review etiquette, both of which translated directly into stronger project teamwork.",
  },
  {
    title: "How Mentorship Helps Early Developers Grow Faster",
    excerpt:
      "Practical ways mentorship accelerates learning, improves decision-making, and helps junior developers avoid common project mistakes.",
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    tags: ["Mentorship", "Career Readiness", "Learning", "Collaboration", SEED_TAG],
    viewCount: 263,
    content:
      "## Mentorship shortens the trial-and-error cycle\n" +
      "Early developers spend a lot of time on avoidable mistakes. A good mentor helps you focus on high-impact improvements and avoid dead ends.\n\n" +
      "## Better questions lead to better growth\n" +
      "Mentorship sessions are most useful when you bring context, attempts, and specific blockers. This turns each conversation into a practical decision checkpoint.\n\n" +
      "> Bring one concrete challenge and one concrete decision to every mentorship session.\n\n" +
      "## Habits mentors help build\n" +
      "Beyond technical tips, mentors often improve your process and communication habits.\n\n" +
      "- Scope tasks before coding\n" +
      "- Document assumptions and trade-offs\n" +
      "- Ask for feedback early, not at the end\n" +
      "- Reflect after each sprint\n\n" +
      "## Mentorship and confidence\n" +
      "The biggest gain is confidence with uncertainty. You still face hard problems, but you become faster at framing them, testing options, and moving forward.",
  },
  {
    title: "Preparing for Job Simulations and Technical Interviews",
    excerpt:
      "A focused preparation plan for simulation-based hiring tasks and interviews, including communication patterns and problem-solving structure.",
    coverImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    tags: ["Job Simulations", "Career Readiness", "Projects", "AI & ML", SEED_TAG],
    viewCount: 376,
    content:
      "## Train using realistic constraints\n" +
      "Simulations reward structured thinking under time pressure. Practice with short timeboxes, incomplete information, and clear deliverables.\n\n" +
      "## Use a repeatable response framework\n" +
      "A simple structure keeps answers clear when you are nervous.\n\n" +
      "- Clarify requirements and assumptions\n" +
      "- Propose a solution path with trade-offs\n" +
      "- Validate with quick tests or examples\n" +
      "- Communicate risks and next steps\n\n" +
      "> Interviewers often score clarity of reasoning as much as the final answer.\n\n" +
      "## Prepare evidence from your own projects\n" +
      "Collect stories about bugs you fixed, design decisions you made, and collaboration moments. These examples are useful for both simulations and behavioral rounds.\n\n" +
      "## Final week checklist\n" +
      "In your final prep week, prioritize consistency over volume. Review fundamentals, practice communication, and run one full mock simulation end-to-end.",
  },
];

const run = async () => {
  const isReset = process.argv.includes("--reset");
  const titles = seededBlogs.map((blog) => blog.title);

  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const mentor = await User.findOne({ userType: "mentor" }).lean();
    const anyUser = await User.findOne({}).lean();
    const author = mentor ?? anyUser;

    if (!author) {
      console.error("No users found. Create at least one user before seeding blogs.");
      process.exit(1);
    }

    const authorId = author._id.toString();
    console.log(`Using author: ${author.name ?? authorId} (${(author as any).userType ?? "user"} - ${authorId})`);

    if (isReset) {
      const resetFilter = {
        userId: authorId,
        title: { $in: titles },
        tags: SEED_TAG,
      };
      const { deletedCount } = await Blog.deleteMany(resetFilter);
      console.log(`--reset: Deleted ${deletedCount} existing seeded blogs.`);
    }

    let inserted = 0;
    let skipped = 0;

    for (const blog of seededBlogs) {
      const exists = await Blog.exists({ userId: authorId, title: blog.title });
      if (exists) {
        console.log(`  SKIP  \"${blog.title}\" - already exists for selected author`);
        skipped++;
        continue;
      }

      await Blog.create({
        userId: authorId,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        tags: blog.tags,
        viewCount: blog.viewCount,
      });

      console.log(`  INSERT \"${blog.title}\"`);
      inserted++;
    }

    console.log("\n----------------------------------------");
    console.log(`Done. Inserted: ${inserted} | Skipped: ${skipped} | Total seed set: ${seededBlogs.length}`);
    console.log("----------------------------------------");
  } catch (err) {
    console.error("Blog seeding failed", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

void run();
