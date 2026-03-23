import "dotenv/config";
import { connectDB } from "../config/db";
import { Event } from "../models/event.model";

const seedUserId = "seed-user";

const events = [
  {
    title: "AI Innovation Hackathon 2026",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
    dateTime: "2026-03-15T09:00:00Z",
    locationType: "City",
    city: "San Francisco, CA",
    tags: ["AI", "Machine Learning", "Python", "TensorFlow", "Innovation"],
    externalLink: "https://example.com/ai-hackathon",
    featured: true,
    description: "48-hour hackathon focused on building AI-powered solutions for real-world problems.",
  },
  {
    title: "React Advanced Patterns Workshop",
    type: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    dateTime: "2026-03-08T14:00:00Z",
    locationType: "Virtual",
    tags: ["React", "TypeScript", "Frontend", "Web Dev"],
    externalLink: "https://example.com/react-workshop",
    description: "Deep dive into advanced React patterns including compound components, render props, and hooks.",
  },
  {
    title: "The Future of Quantum Computing",
    type: "Talk",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
    dateTime: "2026-03-05T18:00:00Z",
    locationType: "Virtual",
    tags: ["Quantum Computing", "Research", "Physics"],
    externalLink: "https://example.com/quantum-talk",
    description: "An expert panel discussion on the latest breakthroughs in quantum computing.",
  },
  {
    title: "DevOps & Cloud Infrastructure Bootcamp",
    type: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    dateTime: "2026-03-20T10:00:00Z",
    locationType: "City",
    city: "Austin, TX",
    tags: ["DevOps", "AWS", "Docker", "Kubernetes", "CI/CD"],
    externalLink: "https://example.com/devops-bootcamp",
    featured: true,
    description: "Hands-on bootcamp covering modern DevOps practices and cloud infrastructure.",
  },
  {
    title: "Women in Tech Leadership Summit",
    type: "Webinar",
    coverImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=400&fit=crop",
    dateTime: "2026-03-12T16:00:00Z",
    locationType: "Virtual",
    tags: ["Leadership", "Diversity", "Career", "Networking"],
    externalLink: "https://example.com/wit-summit",
    description: "Join industry leaders discussing pathways to leadership in technology.",
  },
  {
    title: "Blockchain & Web3 Buildathon",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=400&fit=crop",
    dateTime: "2026-04-01T08:00:00Z",
    locationType: "City",
    city: "Miami, FL",
    tags: ["Blockchain", "Web3", "Solidity", "DeFi", "Smart Contracts"],
    externalLink: "https://example.com/web3-buildathon",
    description: "Build decentralized applications and compete for prizes in this 3-day event.",
  },
  {
    title: "UX Research Methods Masterclass",
    type: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=400&fit=crop",
    dateTime: "2026-03-10T13:00:00Z",
    locationType: "Virtual",
    tags: ["UX", "Research", "Design", "Figma", "User Testing"],
    externalLink: "https://example.com/ux-masterclass",
    description: "Learn practical UX research techniques from seasoned professionals.",
  },
  {
    title: "Cybersecurity Capture the Flag",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
    dateTime: "2026-03-22T12:00:00Z",
    locationType: "Virtual",
    tags: ["Cybersecurity", "CTF", "Networking", "Linux", "Ethical Hacking"],
    externalLink: "https://example.com/ctf-event",
    featured: true,
    description: "Test your cybersecurity skills in this competitive capture-the-flag challenge.",
  },
  {
    title: "Data Engineering with Apache Spark",
    type: "Webinar",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop",
    dateTime: "2026-03-07T17:00:00Z",
    locationType: "Virtual",
    tags: ["Data Engineering", "Apache Spark", "Big Data", "Python"],
    externalLink: "https://example.com/spark-webinar",
    description: "An introduction to building scalable data pipelines with Apache Spark.",
  },
  {
    title: "Mobile App Dev: Flutter vs React Native",
    type: "Talk",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    dateTime: "2026-03-18T19:00:00Z",
    locationType: "City",
    city: "New York, NY",
    tags: ["Mobile Dev", "Flutter", "React Native", "Cross-Platform"],
    externalLink: "https://example.com/mobile-talk",
    description: "A head-to-head comparison of the two leading cross-platform frameworks.",
  },
  {
    title: "Open Source Contribution Sprint",
    type: "Hackathon",
    coverImage: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop",
    dateTime: "2026-04-05T10:00:00Z",
    locationType: "Virtual",
    tags: ["Open Source", "Git", "GitHub", "Community", "Beginner-friendly"],
    externalLink: "https://example.com/oss-sprint",
    description: "Contribute to popular open source projects with mentorship and guidance.",
  },
  {
    title: "Product Management Essentials",
    type: "Webinar",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    dateTime: "2026-03-25T15:00:00Z",
    locationType: "Virtual",
    tags: ["Product Management", "Agile", "Strategy", "Career"],
    externalLink: "https://example.com/pm-webinar",
    description: "Learn the fundamentals of product management from experienced PMs.",
  },
];

const run = async () => {
  try {
    await connectDB();
    await Event.deleteMany({});
    const docs = events.map((ev) => ({ ...ev, userId: seedUserId }));
    await Event.insertMany(docs);
    console.log(`Seeded ${docs.length} events.`);
  } catch (err) {
    console.error("Event seeding failed", err);
  } finally {
    process.exit(0);
  }
};

void run();
