export interface PinnedShowcase {
  id: string;
  title: string;
  summary: string;
  techStack: string[];
  tags: string[];
}

export interface ActivityItem {
  id: string;
  type: "showcase" | "project" | "simulation" | "badge";
  text: string;
  date: string;
}

export interface PersonProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  headline?: string;
  preferredRoles: string[];
  skills: string[];
  techStack: string[];
  domainInterests: string[];
  availabilityHoursPerWeek: number;
  isProfilePublic: boolean;
  stats: {
    projectsCount: number;
    showcasesCount: number;
  };
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  skillEvidenceScores?: Record<string, number>;
  pinnedShowcases?: PinnedShowcase[];
  activity?: ActivityItem[];
}

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c0aede`;

// Helper to generate evidence scores from skills
const makeEvidence = (skills: string[], base: number): Record<string, number> => {
  const out: Record<string, number> = {};
  skills.forEach((s, i) => {
    out[s] = Math.min(100, Math.max(20, base - i * 8 + ((s.charCodeAt(0) * 7) % 25)));
  });
  return out;
};

const makeActivity = (name: string, id: string): ActivityItem[] => [
  { id: `${id}-a1`, type: "showcase", text: `Published a showcase: "${name}'s Latest Build"`, date: "2026-02-18" },
  { id: `${id}-a2`, type: "project", text: "Joined project: Smart Campus Navigator", date: "2026-02-10" },
  { id: `${id}-a3`, type: "simulation", text: "Completed simulation: Agile Sprint Challenge", date: "2026-01-28" },
  { id: `${id}-a4`, type: "badge", text: "Earned badge: Collaboration Star", date: "2026-01-15" },
  { id: `${id}-a5`, type: "project", text: "Created project: Portfolio Redesign", date: "2026-01-05" },
  { id: `${id}-a6`, type: "showcase", text: "Updated showcase: ML Pipeline Demo", date: "2025-12-20" },
];

const makePinned = (id: string, techs: string[]): PinnedShowcase[] => [
  { id: `${id}-s1`, title: "AI-Powered Dashboard", summary: "Built a real-time analytics dashboard with AI recommendations.", techStack: techs.slice(0, 3), tags: ["AI", "Dashboard"] },
  { id: `${id}-s2`, title: "Team Collaboration Tool", summary: "A kanban-style tool for managing distributed teams.", techStack: techs.slice(1, 4), tags: ["Productivity", "Real-world"] },
  { id: `${id}-s3`, title: "Open Source CLI", summary: "A developer utility tool published on npm with 200+ stars.", techStack: techs.slice(0, 2), tags: ["Open Source", "CLI"] },
  { id: `${id}-s4`, title: "E-Learning Platform", summary: "Interactive platform with quizzes and progress tracking.", techStack: techs.slice(2, 5).length ? techs.slice(2, 5) : techs.slice(0, 2), tags: ["Education", "Beginner-friendly"] },
];

export const mockPeople: PersonProfile[] = [
  {
    id: "p1", name: "Ava Chen", avatar: avatarUrl("ava"), headline: "Building AI-powered experiences with clean code",
    bio: "Full-stack developer passionate about AI-powered tools and clean UX. I love turning complex problems into elegant interfaces. When I'm not coding, I'm mentoring juniors and contributing to open source React projects.",
    preferredRoles: ["Frontend Developer", "Full Stack Developer"], skills: ["React", "TypeScript", "Node.js", "GraphQL", "Figma", "Jest"],
    techStack: ["React", "Next.js", "PostgreSQL", "Tailwind CSS"], domainInterests: ["AI & ML", "Web Dev"],
    availabilityHoursPerWeek: 15, isProfilePublic: true, stats: { projectsCount: 7, showcasesCount: 3 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com", portfolio: "https://avachen.dev" },
    skillEvidenceScores: makeEvidence(["React", "TypeScript", "Node.js", "GraphQL", "Figma", "Jest"], 92),
    pinnedShowcases: makePinned("p1", ["React", "Next.js", "PostgreSQL", "Tailwind CSS"]),
    activity: makeActivity("Ava Chen", "p1"),
  },
  {
    id: "p2", name: "Marcus Johnson", avatar: avatarUrl("marcus"), headline: "Scaling systems, one container at a time",
    bio: "Backend engineer with a love for distributed systems and DevOps. I've deployed microservices at scale and enjoy optimizing CI/CD pipelines. Passionate about infrastructure-as-code and cloud-native architectures.",
    preferredRoles: ["Backend Developer", "DevOps Engineer"], skills: ["Go", "Python", "Docker", "Kubernetes", "Terraform", "gRPC"],
    techStack: ["Go", "AWS", "Docker", "Terraform"], domainInterests: ["Software Engineering", "Cybersecurity"],
    availabilityHoursPerWeek: 20, isProfilePublic: true, stats: { projectsCount: 12, showcasesCount: 5 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["Go", "Python", "Docker", "Kubernetes", "Terraform", "gRPC"], 95),
    pinnedShowcases: makePinned("p2", ["Go", "AWS", "Docker", "Terraform"]),
    activity: makeActivity("Marcus Johnson", "p2"),
  },
  {
    id: "p3", name: "Priya Sharma", avatar: avatarUrl("priya"), headline: "Designing pixels that developers love to build",
    bio: "UI/UX designer who bridges the gap between design and code. I create design systems, prototype in Figma, and build them in React. Advocate for accessible and inclusive digital experiences.",
    preferredRoles: ["UI/UX Designer", "Frontend Developer"], skills: ["Figma", "CSS", "React", "Framer Motion", "Accessibility", "Storybook"],
    techStack: ["Figma", "React", "Tailwind CSS", "Storybook"], domainInterests: ["Web Dev", "Mobile Dev"],
    availabilityHoursPerWeek: 10, isProfilePublic: true, stats: { projectsCount: 9, showcasesCount: 6 },
    links: { portfolio: "https://priyasharma.design", linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["Figma", "CSS", "React", "Framer Motion", "Accessibility", "Storybook"], 88),
    pinnedShowcases: makePinned("p3", ["Figma", "React", "Tailwind CSS", "Storybook"]),
    activity: makeActivity("Priya Sharma", "p3"),
  },
  {
    id: "p4", name: "Liam O'Brien", avatar: avatarUrl("liam"), headline: "Exploring the frontier of NLP and computer vision",
    bio: "Data scientist exploring NLP and computer vision applications. I publish reproducible experiments and believe in open science. Currently working on transformer-based models for medical imaging.",
    preferredRoles: ["Data Scientist", "ML Engineer"], skills: ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas", "Scikit-learn"],
    techStack: ["Python", "Jupyter", "TensorFlow", "PostgreSQL"], domainInterests: ["AI & ML", "Data Science"],
    availabilityHoursPerWeek: 12, isProfilePublic: true, stats: { projectsCount: 5, showcasesCount: 4 },
    links: { github: "https://github.com" },
    skillEvidenceScores: makeEvidence(["Python", "TensorFlow", "PyTorch", "SQL", "Pandas", "Scikit-learn"], 90),
    pinnedShowcases: makePinned("p4", ["Python", "Jupyter", "TensorFlow", "PostgreSQL"]),
    activity: makeActivity("Liam O'Brien", "p4"),
  },
  {
    id: "p5", name: "Sofia Martinez", avatar: avatarUrl("sofia"), headline: "PM who codes — building products people love",
    bio: "Product manager turned developer. I build things people actually use. Experienced in user research, rapid prototyping, and shipping MVPs. I bridge the gap between business goals and technical execution.",
    preferredRoles: ["Product Manager", "Full Stack Developer"], skills: ["React", "Node.js", "Figma", "Analytics", "SQL", "Agile"],
    techStack: ["React", "Node.js", "MongoDB", "Mixpanel"], domainInterests: ["Software Engineering", "Web Dev"],
    availabilityHoursPerWeek: 8, isProfilePublic: true, stats: { projectsCount: 11, showcasesCount: 2 },
    links: { linkedin: "https://linkedin.com", portfolio: "https://sofia.dev" },
    skillEvidenceScores: makeEvidence(["React", "Node.js", "Figma", "Analytics", "SQL", "Agile"], 85),
    pinnedShowcases: makePinned("p5", ["React", "Node.js", "MongoDB", "Mixpanel"]),
    activity: makeActivity("Sofia Martinez", "p5"),
  },
  {
    id: "p6", name: "Ethan Park", avatar: avatarUrl("ethan"), headline: "Robots, firmware, and everything embedded",
    bio: "Embedded systems engineer with robotics competition experience. I love low-level programming, sensor fusion, and making hardware do cool things.",
    preferredRoles: ["Embedded Developer", "Robotics Engineer"], skills: ["C++", "Python", "ROS2", "Arduino", "RTOS", "Sensor Fusion"],
    techStack: ["C++", "ROS2", "Arduino", "Linux"], domainInterests: ["Robotics", "IoT"],
    availabilityHoursPerWeek: 18, isProfilePublic: true, stats: { projectsCount: 4, showcasesCount: 2 },
    links: { github: "https://github.com" },
    skillEvidenceScores: makeEvidence(["C++", "Python", "ROS2", "Arduino", "RTOS", "Sensor Fusion"], 87),
    pinnedShowcases: makePinned("p6", ["C++", "ROS2", "Arduino", "Linux"]),
    activity: makeActivity("Ethan Park", "p6"),
  },
  {
    id: "p7", name: "Zara Williams", avatar: avatarUrl("zara"), headline: "Breaking things to make them more secure",
    bio: "Security researcher focused on web application vulnerabilities. Experienced in penetration testing, threat modeling, and security audits for startups.",
    preferredRoles: ["Security Analyst", "Backend Developer"], skills: ["Python", "Burp Suite", "Linux", "Docker", "OWASP", "Threat Modeling"],
    techStack: ["Python", "Docker", "AWS", "Kali Linux"], domainInterests: ["Cybersecurity", "Software Engineering"],
    availabilityHoursPerWeek: 14, isProfilePublic: true, stats: { projectsCount: 6, showcasesCount: 3 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["Python", "Burp Suite", "Linux", "Docker", "OWASP", "Threat Modeling"], 91),
    pinnedShowcases: makePinned("p7", ["Python", "Docker", "AWS", "Kali Linux"]),
    activity: makeActivity("Zara Williams", "p7"),
  },
  {
    id: "p8", name: "Noah Kim", avatar: avatarUrl("noah"), headline: "Crafting mobile experiences that feel native",
    bio: "Mobile developer crafting delightful cross-platform experiences. I ship apps with smooth animations and offline-first architectures.",
    preferredRoles: ["Mobile Developer", "Frontend Developer"], skills: ["React Native", "Swift", "TypeScript", "Firebase", "Expo", "Animation"],
    techStack: ["React Native", "Expo", "Firebase", "Swift"], domainInterests: ["Mobile Dev", "Web Dev"],
    availabilityHoursPerWeek: 16, isProfilePublic: true, stats: { projectsCount: 8, showcasesCount: 4 },
    links: { github: "https://github.com", portfolio: "https://noahkim.dev" },
    skillEvidenceScores: makeEvidence(["React Native", "Swift", "TypeScript", "Firebase", "Expo", "Animation"], 89),
    pinnedShowcases: makePinned("p8", ["React Native", "Expo", "Firebase", "Swift"]),
    activity: makeActivity("Noah Kim", "p8"),
  },
  {
    id: "p9", name: "Emma Davis", avatar: avatarUrl("emma"), headline: "Architecting clouds, scaling services",
    bio: "Cloud architect with a knack for scalable microservices. I've built infrastructure handling millions of requests and love teaching others about cloud patterns.",
    preferredRoles: ["DevOps Engineer", "Backend Developer"], skills: ["AWS", "Terraform", "Go", "PostgreSQL", "Docker", "CI/CD"],
    techStack: ["AWS", "Terraform", "Docker", "Go"], domainInterests: ["Software Engineering", "Cybersecurity"],
    availabilityHoursPerWeek: 20, isProfilePublic: true, stats: { projectsCount: 10, showcasesCount: 5 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["AWS", "Terraform", "Go", "PostgreSQL", "Docker", "CI/CD"], 93),
    pinnedShowcases: makePinned("p9", ["AWS", "Terraform", "Docker", "Go"]),
    activity: makeActivity("Emma Davis", "p9"),
  },
  {
    id: "p10", name: "Daniel Lee", avatar: avatarUrl("daniel"), headline: "Making the web immersive with 3D and XR",
    bio: "AR/VR enthusiast building immersive campus experiences. I combine creative coding with spatial computing to create experiences that blur the line between digital and physical.",
    preferredRoles: ["Frontend Developer", "3D Developer"], skills: ["Unity", "C#", "Three.js", "WebXR", "Blender", "GLSL"],
    techStack: ["Unity", "Three.js", "React", "Blender"], domainInterests: ["Web Dev", "IoT"],
    availabilityHoursPerWeek: 12, isProfilePublic: true, stats: { projectsCount: 3, showcasesCount: 2 },
    links: { github: "https://github.com", portfolio: "https://daniellee.xyz" },
    skillEvidenceScores: makeEvidence(["Unity", "C#", "Three.js", "WebXR", "Blender", "GLSL"], 82),
    pinnedShowcases: makePinned("p10", ["Unity", "Three.js", "React", "Blender"]),
    activity: makeActivity("Daniel Lee", "p10"),
  },
  {
    id: "p11", name: "Olivia Brown", avatar: avatarUrl("olivia"), headline: "Docs + code = better developer experiences",
    bio: "Technical writer and frontend dev. Docs + code = my thing. I believe great documentation is as important as great code.",
    preferredRoles: ["Technical Writer", "Frontend Developer"], skills: ["React", "Markdown", "Docusaurus", "TypeScript", "MDX", "API Docs"],
    techStack: ["React", "Docusaurus", "Tailwind CSS", "MDX"], domainInterests: ["Web Dev", "Software Engineering"],
    availabilityHoursPerWeek: 10, isProfilePublic: true, stats: { projectsCount: 6, showcasesCount: 7 },
    links: { github: "https://github.com", portfolio: "https://oliviab.dev" },
    skillEvidenceScores: makeEvidence(["React", "Markdown", "Docusaurus", "TypeScript", "MDX", "API Docs"], 86),
    pinnedShowcases: makePinned("p11", ["React", "Docusaurus", "Tailwind CSS", "MDX"]),
    activity: makeActivity("Olivia Brown", "p11"),
  },
  {
    id: "p12", name: "James Wilson", avatar: avatarUrl("james"), headline: "Decentralizing identity, one block at a time",
    bio: "Blockchain developer exploring decentralized identity solutions. Smart contracts, zero-knowledge proofs, and Web3 infrastructure are my playgrounds.",
    preferredRoles: ["Blockchain Developer", "Backend Developer"], skills: ["Solidity", "Rust", "TypeScript", "Ethers.js", "ZK Proofs", "IPFS"],
    techStack: ["Solidity", "Hardhat", "React", "IPFS"], domainInterests: ["Software Engineering", "Cybersecurity"],
    availabilityHoursPerWeek: 15, isProfilePublic: true, stats: { projectsCount: 4, showcasesCount: 3 },
    links: { github: "https://github.com" },
    skillEvidenceScores: makeEvidence(["Solidity", "Rust", "TypeScript", "Ethers.js", "ZK Proofs", "IPFS"], 84),
    pinnedShowcases: makePinned("p12", ["Solidity", "Hardhat", "React", "IPFS"]),
    activity: makeActivity("James Wilson", "p12"),
  },
  {
    id: "p13", name: "Mia Tanaka", avatar: avatarUrl("mia"), headline: "Making the web accessible for everyone",
    bio: "Accessibility advocate and frontend specialist. I audit, fix, and build inclusive web experiences from the ground up.",
    preferredRoles: ["Frontend Developer", "UI/UX Designer"], skills: ["React", "ARIA", "CSS", "Testing", "Playwright", "a11y"],
    techStack: ["React", "Tailwind CSS", "Jest", "Playwright"], domainInterests: ["Web Dev", "Software Engineering"],
    availabilityHoursPerWeek: 12, isProfilePublic: true, stats: { projectsCount: 8, showcasesCount: 4 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["React", "ARIA", "CSS", "Testing", "Playwright", "a11y"], 88),
    pinnedShowcases: makePinned("p13", ["React", "Tailwind CSS", "Jest", "Playwright"]),
    activity: makeActivity("Mia Tanaka", "p13"),
  },
  {
    id: "p14", name: "Ryan Gupta", avatar: avatarUrl("ryan"), headline: "Automating ML pipelines at production scale",
    bio: "ML ops engineer automating model pipelines at scale. I focus on reproducible experiments, model monitoring, and efficient serving infrastructure.",
    preferredRoles: ["ML Engineer", "DevOps Engineer"], skills: ["Python", "MLflow", "Docker", "Kubernetes", "Airflow", "DVC"],
    techStack: ["Python", "MLflow", "Docker", "AWS"], domainInterests: ["AI & ML", "Data Science"],
    availabilityHoursPerWeek: 18, isProfilePublic: true, stats: { projectsCount: 7, showcasesCount: 3 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["Python", "MLflow", "Docker", "Kubernetes", "Airflow", "DVC"], 91),
    pinnedShowcases: makePinned("p14", ["Python", "MLflow", "Docker", "AWS"]),
    activity: makeActivity("Ryan Gupta", "p14"),
  },
  {
    id: "p15", name: "Chloe Anderson", avatar: avatarUrl("chloe"), headline: "Games, creative coding, and interactive art",
    bio: "Game developer and creative coder making interactive experiences. I ship jam games and experimental web toys.",
    preferredRoles: ["Game Developer", "Frontend Developer"], skills: ["Unity", "C#", "JavaScript", "Pixel Art", "Godot", "Canvas"],
    techStack: ["Unity", "Godot", "React", "Canvas API"], domainInterests: ["Web Dev", "Software Engineering"],
    availabilityHoursPerWeek: 14, isProfilePublic: true, stats: { projectsCount: 5, showcasesCount: 6 },
    links: { github: "https://github.com", portfolio: "https://chloeand.dev" },
    skillEvidenceScores: makeEvidence(["Unity", "C#", "JavaScript", "Pixel Art", "Godot", "Canvas"], 83),
    pinnedShowcases: makePinned("p15", ["Unity", "Godot", "React", "Canvas API"]),
    activity: makeActivity("Chloe Anderson", "p15"),
  },
  {
    id: "p16", name: "Alex Rivera", avatar: avatarUrl("alex"), headline: "Connecting sensors to the cloud, one MQTT at a time",
    bio: "IoT tinkerer connecting hardware to the cloud. I prototype with Raspberry Pi and ship production-grade edge solutions.",
    preferredRoles: ["Embedded Developer", "Backend Developer"], skills: ["Python", "C++", "MQTT", "Raspberry Pi", "Edge Computing", "Node-RED"],
    techStack: ["Python", "MQTT", "AWS IoT", "Node.js"], domainInterests: ["IoT", "Robotics"],
    availabilityHoursPerWeek: 16, isProfilePublic: true, stats: { projectsCount: 6, showcasesCount: 2 },
    links: { github: "https://github.com" },
    skillEvidenceScores: makeEvidence(["Python", "C++", "MQTT", "Raspberry Pi", "Edge Computing", "Node-RED"], 86),
    pinnedShowcases: makePinned("p16", ["Python", "MQTT", "AWS IoT", "Node.js"]),
    activity: makeActivity("Alex Rivera", "p16"),
  },
  {
    id: "p17", name: "Isabella Nguyen", avatar: avatarUrl("isabella"), headline: "Turning messy data into clear stories",
    bio: "Data analyst turning messy datasets into actionable insights. I love building dashboards, automating reports, and finding patterns in noise.",
    preferredRoles: ["Data Analyst", "Data Scientist"], skills: ["Python", "SQL", "Tableau", "R", "Pandas", "Statistics"],
    techStack: ["Python", "Pandas", "PostgreSQL", "Tableau"], domainInterests: ["Data Science", "AI & ML"],
    availabilityHoursPerWeek: 10, isProfilePublic: true, stats: { projectsCount: 9, showcasesCount: 5 },
    links: { linkedin: "https://linkedin.com" },
    skillEvidenceScores: makeEvidence(["Python", "SQL", "Tableau", "R", "Pandas", "Statistics"], 89),
    pinnedShowcases: makePinned("p17", ["Python", "Pandas", "PostgreSQL", "Tableau"]),
    activity: makeActivity("Isabella Nguyen", "p17"),
  },
  {
    id: "p18", name: "Tyler Brooks", avatar: avatarUrl("tyler"), headline: "React ecosystem enthusiast & OSS contributor",
    bio: "Open-source contributor and React ecosystem enthusiast. I maintain multiple npm packages and love pushing the boundaries of what's possible in the browser.",
    preferredRoles: ["Frontend Developer", "Full Stack Developer"], skills: ["React", "TypeScript", "Next.js", "Vite", "Testing", "OSS"],
    techStack: ["React", "Next.js", "Vite", "Supabase"], domainInterests: ["Web Dev", "Software Engineering"],
    availabilityHoursPerWeek: 20, isProfilePublic: true, stats: { projectsCount: 14, showcasesCount: 8 },
    links: { github: "https://github.com", linkedin: "https://linkedin.com", portfolio: "https://tylerbrooks.dev" },
    skillEvidenceScores: makeEvidence(["React", "TypeScript", "Next.js", "Vite", "Testing", "OSS"], 96),
    pinnedShowcases: makePinned("p18", ["React", "Next.js", "Vite", "Supabase"]),
    activity: makeActivity("Tyler Brooks", "p18"),
  },
];
