import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import {
  ArrowRight, SlidersHorizontal,
  Code2, Database, Cloud, Server, GitBranch, Box,
  Network, Brain, Zap, FileCode, Layers, Terminal,
  Shield, Globe, TrendingUp, Wrench, Cpu, ClipboardCheck,
  GitMerge, Sparkles,
} from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "@/components/insights/JobCard";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJobMarketSummary, getJobMarketJobs, getJobMarketFilters, getRoleDistribution } from "@/services/jobMarketApi";
import type { JobSummary } from "@/data/mockJobMarket";
import type { Job } from "@/data/mockJobMarket";
import type { JobFilters } from "@/data/mockJobMarket";

const CHART_COLORS = [
  "hsl(262 52% 58%)",
  "hsl(240 45% 62%)",
  "hsl(262 52% 58%)",
  "hsl(240 45% 62%)",
  "hsl(262 52% 58%)",
  "hsl(240 45% 62%)",
  "hsl(262 52% 58%)",
  "hsl(240 45% 62%)",
  "hsl(262 52% 58%)",
  "hsl(240 45% 62%)",
];

type DashboardFilters = {
  country: string;
  seniority: string;
  workMode: string;
};

const DEFAULT_FILTERS: DashboardFilters = {
  country: "",
  seniority: "",
  workMode: "",
};

const SENIORITY_LABELS: Record<string, string> = {
  intern: "Intern",
  junior: "Junior",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead",
  manager: "Manager",
  executive: "Executive",
  staff: "Staff",
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  "on-site": "On-site",
  "on site": "On-site",
};

const INVALID_WORK_MODES = new Set(["unknown", "", "n/a", "null", "undefined"]);

const labelForSeniority = (value: string): string =>
  SENIORITY_LABELS[value.toLowerCase()] ?? value.replace(/\b\w/g, (c) => c.toUpperCase());

const labelForWorkMode = (value: string): string =>
  WORK_MODE_LABELS[value.toLowerCase()] ?? value.replace(/\b\w/g, (c) => c.toUpperCase());

const toReadableLabel = (value: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ROLE_CATEGORY_LABELS: Record<string, string> = {
  // `devops_cloud`, `data_ai`, `other_tech`, `program_management` etc. — real DB snake_case values
  devopscloud: "DevOps & Cloud Engineer",
  devopsandcloud: "DevOps & Cloud Engineer",
  dataai: "AI/ML Engineer",
  dataandai: "AI/ML Engineer",
  aianddata: "AI/ML Engineer",
  othertech: "Other Tech Jobs",
  otherengineering: "Other Tech Jobs",
  programmanagement: "Project Manager",

  // Front-End
  frontend: "Front-End Development",
  frontenddev: "Front-End Development",
  frontenddeveloper: "Front-End Development",
  frontendengineer: "Front-End Development",
  frontendengineering: "Front-End Development",
  frontendweb: "Front-End Development",
  webfrontend: "Front-End Development",
  uiengineer: "Front-End Development",
  uideveloper: "Front-End Development",

  // Back-End
  backend: "Back-End Development",
  backenddev: "Back-End Development",
  backenddeveloper: "Back-End Development",
  backendengineer: "Back-End Development",
  backendengineering: "Back-End Development",
  serverside: "Back-End Development",

  // Full-Stack
  fullstack: "Full-Stack Development",
  fullstackdev: "Full-Stack Development",
  fullstackdeveloper: "Full-Stack Development",
  fullstackengineer: "Full-Stack Development",
  fullstackengineering: "Full-Stack Development",
  webdeveloper: "Full-Stack Development",
  webdevelopment: "Full-Stack Development",
  softwareengineer: "Full-Stack Development",
  softwaredeveloper: "Full-Stack Development",
  softwareengineering: "Software Engineer",
  softwaredevelopment: "Full-Stack Development",
  generalengineer: "Full-Stack Development",
  general: "Full-Stack Development",

  // DevOps & Cloud
  devops: "DevOps & Cloud Engineer",
  devopsengineer: "DevOps & Cloud Engineer",
  devopsengineering: "DevOps & Cloud Engineer",
  cloud: "DevOps & Cloud",
  cloudengineer: "DevOps & Cloud",
  cloudarchitect: "DevOps & Cloud",
  cloudengineering: "DevOps & Cloud",
  sre: "DevOps & Cloud",
  sitereliability: "DevOps & Cloud",
  sitereliabilityengineer: "DevOps & Cloud",
  platformengineer: "DevOps & Cloud",
  infrastructure: "DevOps & Cloud",
  infrastructureengineer: "DevOps & Cloud",
  cicd: "DevOps & Cloud",

  // Data Science & ML
  datascience: "Data Science & ML",
  datascientist: "Data Science & ML",
  datasciencist: "Data Science & ML",
  dataanalysis: "Data Science & ML",
  dataanalyst: "Data Science & ML",
  dataanalytics: "Data Science & ML",
  analytics: "Data Analyst",
  businessanalytics: "Data Science & ML",
  businessanalyst: "Data Science & ML",
  ml: "Data Science & ML",
  machinelearning: "Data Science & ML",
  mlengineer: "Data Science & ML",
  mlengineering: "Data Science & ML",
  ai: "Data Science & ML",
  aiml: "Data Science & ML",
  artificialintelligence: "Data Science & ML",
  aiengineer: "Data Science & ML",
  deeplearning: "Data Science & ML",
  nlp: "Data Science & ML",
  computervision: "Data Science & ML",
  dataengineer: "Data Science & ML",
  dataengineering: "Data Science & ML",

  // Mobile
  mobile: "Mobile Development",
  mobiledev: "Mobile Development",
  mobiledeveloper: "Mobile Development",
  mobileengineer: "Mobile Development",
  mobiledevelopment: "Mobile Development",
  ios: "Mobile Development",
  iosdeveloper: "Mobile Development",
  iosengineer: "Mobile Development",
  android: "Mobile Development",
  androiddeveloper: "Mobile Development",
  androidengineer: "Mobile Development",
  reactnative: "Mobile Development",
  flutter: "Mobile Development",

  // UI/UX Design
  design: "UI/UX Designer",
  uxdesign: "UI/UX Design",
  uidesign: "UI/UX Design",
  uiux: "UI/UX Design",
  uiuxdesign: "UI/UX Design",
  uiuxdesigner: "UI/UX Design",
  uxdesigner: "UI/UX Design",
  uidesigner: "UI/UX Design",
  productdesign: "UI/UX Design",
  productdesigner: "UI/UX Design",
  uxresearch: "UI/UX Design",
  uxresearcher: "UI/UX Design",
  visualdesign: "UI/UX Design",
  visualdesigner: "UI/UX Design",
  interactiondesign: "UI/UX Design",
  graphicdesign: "UI/UX Design",
  graphicdesigner: "UI/UX Design",

  // Product Management
  product: "Product Developer",
  productmanager: "Product Management",
  productmanagement: "Product Management",
  productowner: "Product Management",
  productlead: "Product Management",
  programmanager: "Product Management",

  // QA & Testing
  qa: "QA & Testing",
  qatesting: "QA Engineer",
  qualityassurance: "QA & Testing",
  qualityassuranceengineer: "QA & Testing",
  qaengineer: "QA & Testing",
  testingengineer: "QA & Testing",
  tester: "QA & Testing",
  sdet: "QA & Testing",
  automationengineer: "QA & Testing",
  testautomation: "QA & Testing",

  // Cybersecurity
  security: "Cybersecurity Engineer",
  cybersecurity: "Cybersecurity Engineer",
  securityengineer: "Cybersecurity",
  securityanalyst: "Cybersecurity",
  informationsecurity: "Cybersecurity",
  infosec: "Cybersecurity",
  appsecurity: "Cybersecurity",
  networksecurity: "Cybersecurity",
  pentesting: "Cybersecurity",
  penetrationtesting: "Cybersecurity",

  // Other niche
  embedded: "Embedded Systems",
  embeddedsystems: "Embedded Systems",
  embeddedengineer: "Embedded Systems",
  firmware: "Embedded Systems",
  blockchain: "Blockchain",
  blockchaindeveloper: "Blockchain",
  web3: "Blockchain & Web3",
  other: "Other",
};

// Ordered list of canonical category keys (raw values as stored in DB / mock data)
const CANONICAL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "DevOps",
  "Data Science",
  "Mobile",
  "Design",
  "Product",
  "QA",
  "Security",
];

const TECH_ICON_MAP: Record<string, typeof Code2> = {
  // Languages
  python: Code2, javascript: FileCode, js: FileCode,
  typescript: FileCode, ts: FileCode, java: Code2,
  kotlin: Code2, swift: Code2, rust: Code2, go: Code2,
  golang: Code2, php: Code2, ruby: Code2, csharp: Code2,
  cplusplus: Code2, scala: Code2,
  // Frontend
  react: Layers, reactjs: Layers, vue: Layers, vuejs: Layers,
  angular: Layers, svelte: Layers, nextjs: Layers,
  html: Globe, css: Globe, tailwind: Globe,
  // Backend / Runtime
  nodejs: Server, express: Server, django: Server,
  flask: Server, fastapi: Server, spring: Server, rails: Server,
  // Databases
  sql: Database, mysql: Database, postgresql: Database,
  postgres: Database, mongodb: Database, redis: Database,
  elasticsearch: Database, dynamodb: Database, cassandra: Database, sqlite: Database,
  // Cloud
  aws: Cloud, azure: Cloud, gcp: Cloud, googlecloud: Cloud, cloudcomputing: Cloud,
  // DevOps
  docker: Box, kubernetes: Network, k8s: Network,
  terraform: Wrench, ansible: Wrench, jenkins: GitMerge,
  cicd: GitMerge, git: GitBranch, github: GitBranch,
  gitlab: GitBranch, linux: Terminal, bash: Terminal,
  shell: Terminal, nginx: Server,
  // ML / AI
  machinelearning: Brain, deeplearning: Brain, tensorflow: Brain,
  pytorch: Brain, sklearn: Brain, ai: Brain, nlp: Brain,
  computervision: Brain, llm: Brain,
  // Security
  cybersecurity: Shield, security: Shield,
  // Testing
  testing: ClipboardCheck, jest: ClipboardCheck, selenium: ClipboardCheck,
  cypress: ClipboardCheck, unittest: ClipboardCheck, pytest: ClipboardCheck,
  // General
  microservices: Cpu, api: Globe, restapi: Globe, graphql: Globe,
  agile: Zap, scrum: Zap, devops: Wrench,
};

const SKILL_DISPLAY_LABELS: Record<string, string> = {
  javascript: "JavaScript", typescript: "TypeScript", python: "Python",
  java: "Java", nodejs: "Node.js", react: "React", reactjs: "React",
  vue: "Vue.js", vuejs: "Vue.js", angular: "Angular", nextjs: "Next.js",
  svelte: "Svelte", aws: "AWS", azure: "Azure", gcp: "Google Cloud",
  googlecloud: "Google Cloud", docker: "Docker", kubernetes: "Kubernetes",
  k8s: "Kubernetes", sql: "SQL", mongodb: "MongoDB",
  postgresql: "PostgreSQL", postgres: "PostgreSQL", mysql: "MySQL",
  redis: "Redis", git: "Git", github: "GitHub", gitlab: "GitLab",
  linux: "Linux", terraform: "Terraform", cicd: "CI/CD",
  machinelearning: "Machine Learning", deeplearning: "Deep Learning",
  tensorflow: "TensorFlow", pytorch: "PyTorch", graphql: "GraphQL",
  restapi: "REST API", microservices: "Microservices", agile: "Agile",
  scrum: "Scrum", devops: "DevOps", csharp: "C#", cplusplus: "C++",
  golang: "Go", kotlin: "Kotlin", swift: "Swift", rust: "Rust",
  php: "PHP", ruby: "Ruby", scala: "Scala",
  elasticsearch: "Elasticsearch", nginx: "Nginx",
  sklearn: "scikit-learn", nlp: "NLP", llm: "LLM",
};

const normalizeSkillKey = (raw: string): string =>
  raw.toLowerCase().replace(/[\s.\-_/()+]+/g, "");

const getSkillIcon = (name: string): typeof Code2 =>
  TECH_ICON_MAP[normalizeSkillKey(name)] ?? TECH_ICON_MAP[name.toLowerCase()] ?? Code2;

const getSkillLabel = (name: string): string => {
  const key = normalizeSkillKey(name);
  return SKILL_DISPLAY_LABELS[key] ?? SKILL_DISPLAY_LABELS[name.toLowerCase()] ?? toReadableLabel(name);
};

const normalizeCategoryKey = (raw: string): string =>
  raw.toLowerCase().replace(/[\s_\-\/]+/g, "");

const labelForCategory = (raw: string): string =>
  ROLE_CATEGORY_LABELS[normalizeCategoryKey(raw)] ?? toReadableLabel(raw);

//change to the company logo images
const FEATURED_COMPANIES = [
  { name: "Vercel",     logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/vercel.jpg" },
  { name: "Datadog",   logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/datadog.jpg" },
  { name: "Coinbase",  logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/coinbase.png" },
  { name: "Stripe",    logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/stripe.png" },
  { name: "WHOOP",     logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/whoop.png" },
  { name: "Mistral AI",logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/mistral.png" },
  { name: "Plaid",     logo: "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/plaid.png" },
];

const HERO_DARK = "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/banners/job-market-hero-dark.png";
const HERO_LIGHT = "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/banners/job-market-hero-light.png";

const InsightsDashboardPage = () => {
  const { resolvedTheme } = useTheme();
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [filterOptions, setFilterOptions] = useState<JobFilters | null>(null);
  // `filters` = draft state shown in the selects; `appliedFilters` = committed state that drives the API call.
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);


  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [roleDistData, setRoleDistData] = useState<{ name: string; count: number }[] | null>(null);
  const [roleDistLoading, setRoleDistLoading] = useState(true);
  const [roleDistError, setRoleDistError] = useState<string | null>(null);


  const loadSummary = async () => {
    try {
      const summaryData = await getJobMarketSummary();
      setSummary(summaryData);
    } catch {
      setSummary(null);
    }
  };

  const loadFeaturedJobs = async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);
      const jobsData = await getJobMarketJobs({ limit: 3 });
      setFeaturedJobs(jobsData.jobs);
    } catch (err) {
      setFeaturedError(err instanceof Error ? err.message : "Failed to load featured jobs.");
      setFeaturedJobs([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      setFiltersLoading(true);
      setFiltersError(null);
      const nextOptions = await getJobMarketFilters();
      setFilterOptions(nextOptions);
    } catch (err) {
      setFiltersError(err instanceof Error ? err.message : "Failed to load dashboard filters.");
      setFilterOptions(null);
    } finally {
      setFiltersLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
    void loadFeaturedJobs();
    void loadFilterOptions();
  }, []);

  const loadRoleDistribution = useCallback(async () => {
    try {
      setRoleDistLoading(true);
      setRoleDistError(null);
      const data = await getRoleDistribution({
        country: appliedFilters.country || undefined,
        seniority: appliedFilters.seniority || undefined,
        workMode: appliedFilters.workMode || undefined,
      });
      setRoleDistData(data);
    } catch (err) {
      setRoleDistError(err instanceof Error ? err.message : "Failed to load role distribution.");
      setRoleDistData(null);
    } finally {
      setRoleDistLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void loadRoleDistribution();
  }, [loadRoleDistribution]);

  const isDirty =
    filters.country !== appliedFilters.country ||
    filters.seniority !== appliedFilters.seniority ||
    filters.workMode !== appliedFilters.workMode;

  const roleDistribution = useMemo(() => {
    // Canonical list: all categories that exist in the DB (from the filters endpoint).
    // Fall back to summary categories, then hardcoded list, until filterOptions loads.
    const summaryCategories = summary?.roleCategoryCounts?.map((item) => item.name) ?? [];
    const canonicalList: string[] =
      filterOptions?.roleCategories?.length ? filterOptions.roleCategories
      : summaryCategories.length ? summaryCategories
      : CANONICAL_CATEGORIES;

    const counts: Record<string, number> = {};
    if (roleDistData && roleDistData.length > 0) {
      // Primary: server-side $group aggregation — exact counts across ALL matching jobs,
      // not a sample. This is the only correct way to show filtered role distribution.
      for (const item of roleDistData) {
        if (item.name) counts[item.name] = item.count;
      }
    } else if (summary?.roleCategoryCounts) {
      // Fallback to all-time summary counts while the role distribution endpoint loads.
      for (const item of summary.roleCategoryCounts) {
        counts[item.name] = (counts[item.name] || 0) + item.count;
      }
    }

    // Always return every known category in stable canonical order — never sort by count
    // so the bars stay in the same position when filters change.
    return canonicalList
      .map((cat) => ({ name: cat, count: counts[cat] || 0 }));
  }, [roleDistData, summary, filterOptions]);

  // Skills and technologies always reflect overall market demand — not filtered by role chart filters.
  const topSkillsRanked = useMemo(() => (summary?.topSkills || []).slice(0, 10), [summary]);
  const topTechnologiesRanked = useMemo(() => (summary?.topTechnologies || []).slice(0, 10), [summary]);

  const handleFilterUpdate = (patch: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-16 w-full">
        <img
          src={resolvedTheme === "dark" ? HERO_DARK : HERO_LIGHT}
          alt="Job Market Intelligence"
          className="w-full object-cover"
        />
      </section>

      <div className="py-10">
        <Container className="space-y-8">
          <Card className="border border-primary/15 bg-card shadow-lg ring-1 ring-primary/5 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            {/* Section header */}
            <div className="px-4 md:px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-r from-primary/5 via-card to-card">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/40" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Tech Role Distribution</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-3.5">Breakdown of tech job categories across the current market view.</p>
            </div>

            {/* Controls */}
            <div className="px-4 md:px-6 py-4 bg-muted/30 border-b border-border/50">
              {filtersLoading ? (
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={`filter-skeleton-${i}`} className="h-9 w-36 rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  {filtersError && (
                    <p className="text-xs text-destructive/70 mb-2">{filtersError}</p>
                  )}
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">Country</Label>
                      <Select value={filters.country || "__all__"} onValueChange={(value) => handleFilterUpdate({ country: value === "__all__" ? "" : value })}>
                        <SelectTrigger className="h-9 w-36 text-sm bg-background border-border/70 shadow-sm focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All countries</SelectItem>
                          {(filterOptions?.countries || []).map((item) => (
                            <SelectItem key={item} value={item}>{item}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">Seniority</Label>
                      <Select value={filters.seniority || "__all__"} onValueChange={(value) => handleFilterUpdate({ seniority: value === "__all__" ? "" : value })}>
                        <SelectTrigger className="h-9 w-36 text-sm bg-background border-border/70 shadow-sm focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All levels</SelectItem>
                          {(filterOptions?.seniorityLevels || [])
                            .filter((item) => item.toLowerCase() !== "unknown")
                            .map((item) => (
                              <SelectItem key={item} value={item}>{labelForSeniority(item)}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">Work Mode</Label>
                      <Select value={filters.workMode || "__all__"} onValueChange={(value) => handleFilterUpdate({ workMode: value === "__all__" ? "" : value })}>
                        <SelectTrigger className="h-9 w-36 text-sm bg-background border-border/70 shadow-sm focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="All modes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All modes</SelectItem>
                          {(filterOptions?.workModes || [])
                            .filter((item) => !INVALID_WORK_MODES.has(item.toLowerCase()))
                            .map((item) => (
                              <SelectItem key={item} value={item}>{labelForWorkMode(item)}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-foreground" onClick={resetFilters}>Reset</Button>
                      <Button
                        size="sm"
                        className="h-9 text-xs px-4 relative shadow-sm"
                        onClick={applyFilters}
                        disabled={roleDistLoading}
                      >
                        <SlidersHorizontal size={13} className="mr-1.5" />
                        Apply
                        {isDirty && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Chart — fixed height so entire chart is visible without scrolling */}
            <div className="p-4 md:p-6">
              {roleDistLoading ? (
                <Skeleton className="h-[440px] rounded-xl" />
              ) : roleDistError ? (
                <div className="text-center py-8 border border-border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-3">{roleDistError}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadRoleDistribution()}>Retry market chart</Button>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-background to-muted/20 p-4 md:p-5 shadow-inner">
                  <div style={{ height: Math.max((roleDistribution.length || 1) * 44 + 32, 220) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleDistribution} layout="vertical" margin={{ left: 14, right: 24, top: 4, bottom: 4 }}>
                        <XAxis type="number" tick={false} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={false}
                          width={190}
                          tickFormatter={(value) => labelForCategory(String(value))}
                        />
                        <Tooltip
                          labelFormatter={(label) => labelForCategory(String(label))}
                          formatter={(value) => [value, "Jobs"]}
                          cursor={{ fill: "hsl(var(--primary) / 0.06)" }}
                          contentStyle={{
                            borderRadius: 10,
                            fontSize: 13,
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--background))",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22} isAnimationActive={true} animationDuration={600} animationEasing="ease-out">
                          {roleDistribution.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Jobs Sourced From */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Jobs Sourced From</h2>
              <p className="text-sm text-muted-foreground mt-1">Selected company job boards represented in the current market intelligence pipeline.</p>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {FEATURED_COMPANIES.map((company) => (
                <div
                  key={company.name}
                  className="flex-shrink-0 flex items-center gap-3 rounded-xl border border-border/60 bg-white dark:bg-card shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 px-4 py-3 min-w-[148px]"
                >
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={company.logo}
                      alt={company.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                        const fallback = img.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <span
                      className="hidden w-full h-full items-center justify-center text-sm font-bold text-primary/70"
                      aria-hidden="true"
                    >
                      {company.name[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{company.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Skill & Technology Signals */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Skill &amp; Technology Signals</h2>
              <p className="text-sm text-muted-foreground mt-1">See which skills and tools appear most often across current tech job postings.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/80 bg-card/95 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-border/50">
                  <h3 className="text-base font-semibold text-foreground">Top Skills in Demand</h3>
                </div>
                <div className="p-4">
                  {topSkillsRanked.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                      <Sparkles size={28} className="text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Not enough skill demand data available yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {topSkillsRanked.map((entry, idx) => {
                        const Icon = getSkillIcon(entry.name);
                        const isTop3 = idx < 3;
                        return (
                          <div
                            key={entry.name}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isTop3 ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/40"}`}
                          >
                            <span className={`text-[11px] font-bold w-4 text-center flex-shrink-0 tabular-nums ${idx === 0 ? "text-primary" : idx === 1 ? "text-primary/60" : idx === 2 ? "text-primary/40" : "text-muted-foreground/30"}`}>
                              {idx + 1}
                            </span>
                            <div className={`flex-shrink-0 ${isTop3 ? "text-primary" : "text-muted-foreground/50"}`}>
                              <Icon size={15} />
                            </div>
                            <span className={`flex-1 truncate ${idx === 0 ? "text-sm font-semibold text-foreground" : isTop3 ? "text-sm font-medium text-foreground" : "text-sm text-foreground/60"}`}>
                              {getSkillLabel(entry.name)}
                            </span>
                            {idx === 0 && <TrendingUp size={12} className="text-primary/50 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-border/80 bg-card/95 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-border/50">
                  <h3 className="text-base font-semibold text-foreground">Top Technologies in Demand</h3>
                </div>
                <div className="p-4">
                  {topTechnologiesRanked.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                      <Sparkles size={28} className="text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Not enough technology demand data available yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {topTechnologiesRanked.map((entry, idx) => {
                        const Icon = getSkillIcon(entry.name);
                        const isTop3 = idx < 3;
                        return (
                          <div
                            key={entry.name}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isTop3 ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/40"}`}
                          >
                            <span className={`text-[11px] font-bold w-4 text-center flex-shrink-0 tabular-nums ${idx === 0 ? "text-primary" : idx === 1 ? "text-primary/60" : idx === 2 ? "text-primary/40" : "text-muted-foreground/30"}`}>
                              {idx + 1}
                            </span>
                            <div className={`flex-shrink-0 ${isTop3 ? "text-primary" : "text-muted-foreground/50"}`}>
                              <Icon size={15} />
                            </div>
                            <span className={`flex-1 truncate ${idx === 0 ? "text-sm font-semibold text-foreground" : isTop3 ? "text-sm font-medium text-foreground" : "text-sm text-foreground/60"}`}>
                              {getSkillLabel(entry.name)}
                            </span>
                            {idx === 0 && <TrendingUp size={12} className="text-primary/50 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground">Featured Jobs</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-sm" asChild>
                <Link to="/insights/jobs">View All <ArrowRight size={14} /></Link>
              </Button>
            </div>
            {featuredLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={`featured-skeleton-${i}`} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : featuredError ? (
              <div className="text-center py-6 border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">{featuredError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadFeaturedJobs()}>Retry featured jobs</Button>
              </div>
            ) : featuredJobs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-border rounded-xl text-muted-foreground">
                No featured jobs available right now.
              </div>
            )}
          </section>
        </Container>
      </div>

      <Footer />
    </div>
  );
};

export default InsightsDashboardPage;
