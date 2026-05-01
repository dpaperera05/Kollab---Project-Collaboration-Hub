export type QuickAction = {
  label: string;
  message: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "🤝 What is Kollab?", message: "What is Kollab?" },
  { label: "🚀 Find projects", message: "How do I find projects?" },
  { label: "📁 My portfolio", message: "How can I improve my portfolio?" },
  { label: "🧪 Job simulations", message: "Explain job simulations" },
  { label: "📊 Job insights", message: "What are job market insights?" },
];

interface MockReply {
  keywords: string[];
  response: string;
}

const MOCK_REPLIES: MockReply[] = [
  {
    keywords: ["beginner", "beginner-friendly", "start", "new", "learning", "entry"],
    response:
      "Great choice to start somewhere! 🌱 I recommend checking out **Peer Code Review Platform**, **Job Market Trend Visualizer**, or **Open Source E-Learning CMS** — all tagged as Beginner-friendly.\n\nYou can also use the **Difficulty → Beginner** filter on the Projects page to narrow down results instantly.",
  },
  {
    keywords: ["react", "frontend", "ui", "interface", "tailwind", "css", "next"],
    response:
      "There are several great frontend-focused projects on Kollab! 🖥️ Look for roles like **Frontend Developer** in projects like:\n\n- **AI-Powered Resume Analyzer** (React + TailwindCSS)\n- **Peer Code Review Platform** (React + GitHub API)\n- **Open Source E-Learning CMS** (Next.js + Tailwind)\n\nFilter by **Role Type → Developer** to see all frontend openings.",
  },
  {
    keywords: ["mentor", "mentorship", "guidance", "guide", "coach"],
    response:
      "Kollab connects you with experienced mentors on select projects! 🎓 When browsing projects, look for the **Mentor Linked** badge — it means a domain expert is actively guiding the team.\n\nMentors help with code reviews, career advice, and technical direction throughout the project lifecycle.",
  },
  {
    keywords: ["portfolio", "evidence", "proof", "showcase", "work", "skills", "badge"],
    response:
      "Kollab's **Evidence-Based Portfolio** system lets you prove your skills through real deliverables, not just self-assessments. 📁\n\nWhen you contribute to a project, your work is verified and linked to your profile — creating a live portfolio that employers can actually explore. Think: merged PRs, shipped features, data models, and design files — all attributed to you.",
  },
  {
    keywords: ["simulation", "job simulation", "practice", "real-world", "work experience"],
    response:
      "Job Simulations are structured, role-specific exercises that mimic real workplace tasks. 🧪 You complete them independently at your own pace and earn a skill proof upon completion.\n\nThey're perfect for:\n- Building experience when you don't have a job yet\n- Testing a career path before committing\n- Adding verified skills to your Kollab profile",
  },
  {
    keywords: ["filter", "filters", "search", "find", "narrow", "refine", "sort"],
    response:
      "Here's how to get the best results on the Projects page: 🎛️\n\n1. **Domain** — pick your area (AI & ML, Web Dev, Robotics…)\n2. **Difficulty** — Beginner / Intermediate / Advanced\n3. **Duration** — short-term (weeks) or long-term (months)\n4. **Location** — Remote, Hybrid, On-site\n5. **Compensation** — filter for Paid projects\n\nYou can combine multiple filters for very targeted results!",
  },
  {
    keywords: ["recommend", "suggestion", "suggest", "best", "popular", "top"],
    response:
      "Based on what's trending on Kollab right now, here are my top picks: ⭐\n\n1. **AI-Powered Resume Analyzer** — high demand, beginner-friendly ML role open\n2. **Peer Code Review Platform** — great for new developers, multiple openings\n3. **Federated Learning Research Tool** — top-rated, paid, research-grade\n\nWant me to filter by a specific domain or skill? Just tell me more about your background!",
  },
  {
    keywords: ["paid", "compensation", "money", "salary", "stipend", "earn"],
    response:
      "There are paid projects on Kollab! 💰 Currently, you can find compensation in:\n\n- **Autonomous Delivery Robot Sim** — Paid\n- **Blockchain Supply Chain Tracker** — Paid\n- **Federated Learning Research Tool** — Paid\n\nUse the **Compensation → Paid** filter on the Projects page to see all paid opportunities.",
  },
  {
    keywords: ["ai", "ml", "machine learning", "deep learning", "python", "nlp", "gpt", "llm"],
    response:
      "AI & ML is one of the hottest domains on Kollab! 🤖 Open projects include:\n\n- **AI-Powered Resume Analyzer** (NLP, OpenAI)\n- **Community Mental Health Chatbot** (LangChain, Python)\n- **Federated Learning Research Tool** (PyTorch, Flower)\n\nFilter by **Domain → AI & ML** to see all current opportunities, including research and applied projects.",
  },
  {
    keywords: ["apply", "join", "how to join", "application", "role", "open"],
    response:
      "Applying to a Kollab project is straightforward: 📝\n\n1. Open any project and click **View Details**\n2. Browse the **Roles & Applications** section\n3. Click **Apply for this Role** on any open role\n4. Fill in your motivation, evidence links, and upload your resume\n5. The project owner will review and reach out!\n\nYou can also message the owner directly from the project page.",
  },
  {
    keywords: ["hello", "hi", "hey", "help", "what can you do", "what are you"],
    response:
      "Hi there! 👋 I'm **Kollab Assistant**. Here's what I can help you with:\n\n- 🔍 Finding the right projects for your skill level\n- 🎛️ Explaining how filters and search work\n- 📁 Understanding the evidence-based portfolio system\n- 🧪 Learning about job simulations\n- 💬 Answering general questions about Kollab\n\nWhat would you like to explore?",
  },
  {
    keywords: ["iot", "hardware", "arduino", "sensor", "embedded"],
    response:
      "IoT projects on Kollab are great for hardware + software enthusiasts! ⚡ Check out:\n\n- **Smart Campus IoT Dashboard** — MQTT, Node.js, InfluxDB (Ongoing)\n- **Smart Greenhouse Automation** — Arduino, MQTT, React Native (Finished — great reference!)\n\nFilter by **Domain → IoT** to explore more.",
  },
  {
    keywords: ["cybersecurity", "security", "hacking", "ctf", "penetration", "pentest"],
    response:
      "Kollab has exciting cybersecurity projects! 🔐 The **Cybersecurity CTF Training Portal** is a standout — it's an ongoing project building a structured CTF platform for students.\n\nA Security Researcher role is currently open if you have CTF or pentesting experience. Filter by **Domain → Cybersecurity** to explore more.",
  },
];

const FALLBACK_RESPONSES = [
  "That's a great question! 🤔 I'm still learning all the details, but here's what I'd suggest: browse the **Projects** page and use filters to narrow down by your skills and interests. If you're not sure where to start, try the **Beginner** difficulty filter!",
  "Interesting! While I don't have a specific answer for that right now, I'd recommend exploring the **Browse Projects** section — there's a lot to discover. You can also use the smart search bar to find projects by keyword.",
  "I want to make sure I give you the best guidance! 💡 Could you tell me more about what you're looking for? For example: your skill level, preferred domain (AI, Web Dev, Robotics…), or whether you want a paid project?",
];

let fallbackIndex = 0;

export const getMockReply = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();

  for (const rule of MOCK_REPLIES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.response;
    }
  }

  // Rotate fallback responses
  const reply = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return reply;
};

export const getContextualGreeting = (pathname: string): string => {
  if (pathname.startsWith("/projects/") && pathname !== "/projects/") {
    return "Hey! Looks like you're viewing a project. I can help you decide if it's a good fit, explain the roles, or suggest similar ones. What would you like to know?";
  }
  if (pathname === "/projects") {
    return "Welcome to Projects. I can help you find the right project, explain filters, or walk you through the application process. What are you looking for?";
  }
  if (pathname.startsWith("/portfolio") || pathname.startsWith("/profile")) {
    return "Hi! I can help you strengthen your portfolio, add skill evidence, or improve your career readiness score. What would you like to work on?";
  }
  if (pathname.startsWith("/mentors")) {
    return "Hi! I can help you find the right mentor, prepare for a session, or understand how mentorship works on Kollab. What do you need?";
  }
  if (pathname.startsWith("/simulations")) {
    return "Hi! I can explain how job simulations work, help you understand your feedback, or guide you on turning results into portfolio evidence. What would you like to know?";
  }
  if (pathname.startsWith("/insights")) {
    return "Hi! I can explain the job market data on this page, highlight trending skills, or help you apply these insights to your career plan. What are you curious about?";
  }
  return "Hi! I'm **Kollab Assistant**. I can help you find projects, build your portfolio, explore job simulations, connect with mentors, and more. What would you like to explore?";
};

export const getContextualQuickActions = (pathname: string): QuickAction[] => {
  if (pathname.startsWith("/projects/") && pathname !== "/projects/") {
    return [
      { label: "Recommend projects", message: "Recommend projects for me" },
      { label: "Help with filters", message: "Help me choose filters" },
      { label: "How to apply", message: "How do I apply to a project?" },
      { label: "Find teammates", message: "How do I find teammates on Kollab?" },
    ];
  }
  if (pathname === "/projects") {
    return [
      { label: "Recommend projects", message: "Recommend projects for me" },
      { label: "Help with filters", message: "Help me choose filters" },
      { label: "How to apply", message: "How do I apply to a project?" },
      { label: "Find teammates", message: "How do I find teammates on Kollab?" },
    ];
  }
  if (pathname.startsWith("/portfolio") || pathname.startsWith("/profile")) {
    return [
      { label: "Improve my portfolio", message: "How can I improve my portfolio?" },
      { label: "Add skill evidence", message: "How do I add skill evidence to my portfolio?" },
      { label: "Readiness score tips", message: "How do I improve my readiness score?" },
      { label: "Export resume", message: "Can I export my portfolio as a resume?" },
    ];
  }
  if (pathname.startsWith("/mentors")) {
    return [
      { label: "Find a mentor", message: "How do I find the right mentor?" },
      { label: "Book mentorship", message: "How do I book a mentor session?" },
      { label: "Prepare for session", message: "How should I prepare for a mentor session?" },
      { label: "Mentor sign-offs", message: "What are mentor sign-offs?" },
    ];
  }
  if (pathname.startsWith("/simulations")) {
    return [
      { label: "How simulations work", message: "How do job simulations work?" },
      { label: "Improve my score", message: "How can I improve my simulation score?" },
      { label: "Explain feedback", message: "How do I read my simulation feedback?" },
      { label: "Portfolio evidence", message: "How do I add simulation results to my portfolio?" },
    ];
  }
  if (pathname.startsWith("/insights")) {
    return [
      { label: "Explain job insights", message: "What are job market insights?" },
      { label: "Trending skills", message: "What skills are trending right now?" },
      { label: "Role categories", message: "What role categories are available in job insights?" },
      { label: "Use this data", message: "How do I use job market data to plan my career?" },
    ];
  }
  return QUICK_ACTIONS;
};
