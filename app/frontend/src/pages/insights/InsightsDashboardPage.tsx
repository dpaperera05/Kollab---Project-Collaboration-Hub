import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ChartCard from "@/components/insights/ChartCard";
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
  "hsl(270 80% 60%)",
  "hsl(256 75% 62%)",
  "hsl(284 74% 58%)",
  "hsl(298 68% 57%)",
  "hsl(315 72% 62%)",
  "hsl(243 70% 64%)",
  "hsl(261 78% 54%)",
  "hsl(290 65% 60%)",
  "hsl(328 66% 60%)",
  "hsl(247 72% 66%)",
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
  devopscloud: "DevOps & Cloud",
  devopsandcloud: "DevOps & Cloud",
  dataai: "Data Science & AI",
  dataandai: "Data Science & AI",
  aianddata: "Data Science & AI",
  othertech: "Other Tech",
  otherengineering: "Other Tech",
  programmanagement: "Program Management",

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
  softwareengineering: "Full-Stack Development",
  softwaredevelopment: "Full-Stack Development",
  generalengineer: "Full-Stack Development",
  general: "Full-Stack Development",

  // DevOps & Cloud
  devops: "DevOps & Cloud",
  devopsengineer: "DevOps & Cloud",
  devopsengineering: "DevOps & Cloud",
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
  analytics: "Data Science & ML",
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
  design: "UI/UX Design",
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
  product: "Product Management",
  productmanager: "Product Management",
  productmanagement: "Product Management",
  productowner: "Product Management",
  productlead: "Product Management",
  programmanager: "Product Management",

  // QA & Testing
  qa: "QA & Testing",
  qatesting: "QA & Testing",
  qualityassurance: "QA & Testing",
  qualityassuranceengineer: "QA & Testing",
  qaengineer: "QA & Testing",
  testingengineer: "QA & Testing",
  tester: "QA & Testing",
  sdet: "QA & Testing",
  automationengineer: "QA & Testing",
  testautomation: "QA & Testing",

  // Cybersecurity
  security: "Cybersecurity",
  cybersecurity: "Cybersecurity",
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

const normalizeCategoryKey = (raw: string): string =>
  raw.toLowerCase().replace(/[\s_\-\/]+/g, "");

const labelForCategory = (raw: string): string =>
  ROLE_CATEGORY_LABELS[normalizeCategoryKey(raw)] ?? toReadableLabel(raw);

const countBy = (values: string[]) => {
  return values.reduce<Record<string, number>>((acc, value) => {
    if (!value || !value.trim()) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
};

const rankedEntries = (counts: Record<string, number>) => {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

const HERO_DARK = "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/banners/job-market-hero-dark.png";
const HERO_LIGHT = "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/banners/job-market-hero-light.png";

const InsightsDashboardPage = () => {
  const { resolvedTheme } = useTheme();
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [marketViewJobs, setMarketViewJobs] = useState<Job[]>([]);
  const [filterOptions, setFilterOptions] = useState<JobFilters | null>(null);
  // `filters` = draft state shown in the selects; `appliedFilters` = committed state that drives the API call.
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const [marketLoading, setMarketLoading] = useState(true);

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

  const loadMarketView = useCallback(async () => {
    try {
      setMarketLoading(true);

      const baseQuery = {
        limit: 100,
        sortBy: "postedDate" as const,
        sortOrder: "desc" as const,
        country: appliedFilters.country || undefined,
        seniority: appliedFilters.seniority || undefined,
        workMode: appliedFilters.workMode || undefined,
        isTechJob: true as const,
      };

      const firstPage = await getJobMarketJobs({ ...baseQuery, page: 1 });
      const maxPages = Math.min(Math.max(firstPage.totalPages, 1), 5);
      const pageRequests =
        maxPages > 1
          ? Array.from({ length: maxPages - 1 }, (_, idx) => getJobMarketJobs({ ...baseQuery, page: idx + 2 }))
          : [];

      const nextPages = pageRequests.length ? await Promise.all(pageRequests) : [];
      const allJobs = [
        ...firstPage.jobs,
        ...nextPages.flatMap((pageResult) => pageResult.jobs),
      ];

      setMarketViewJobs(allJobs);
    } catch {
      setMarketViewJobs([]);
    } finally {
      setMarketLoading(false);
    }
  }, [appliedFilters]);

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
    void loadMarketView();
  }, [loadMarketView]);

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

    // Always return every known category — zero-filled for those with no matches.
    return canonicalList
      .map((cat) => ({ name: cat, count: counts[cat] || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [roleDistData, summary, filterOptions]);

  const topSkillsRanked = useMemo(() => {
    if (marketViewJobs.length === 0) return summary?.topSkills || [];
    const counts = countBy(marketViewJobs.flatMap((job) => job.skills));
    return rankedEntries(counts).slice(0, 10);
  }, [marketViewJobs, summary]);

  const topTechnologiesRanked = useMemo(() => {
    if (marketViewJobs.length === 0) return summary?.topTechnologies || [];
    const counts = countBy(marketViewJobs.flatMap((job) => job.technologies));
    return rankedEntries(counts).slice(0, 10);
  }, [marketViewJobs, summary]);

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
          <Card className="border-border/80 bg-card/95 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-4 md:px-6 pt-5 pb-4 border-b border-border/60">
              <h2 className="text-2xl md:text-[1.7rem] font-bold tracking-tight text-foreground">Role Distribution Across Current Market View</h2>
              <p className="text-sm text-muted-foreground mt-1">Showing tech jobs only &mdash; adjust filters to narrow by country, seniority, or work mode</p>
            </div>

            {/* Controls */}
            <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-card to-muted/20 border-b border-border/60">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <p className="text-sm font-semibold text-foreground">Market View Controls</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={resetFilters}>Reset</Button>
                  <Button
                    size="sm"
                    className="text-xs relative"
                    onClick={applyFilters}
                    disabled={marketLoading}
                  >
                    Apply Filters
                    {isDirty && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </Button>
                </div>
              </div>

              {filtersLoading ? (
                <div className="grid md:grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={`filter-skeleton-${i}`} className="h-10 rounded-md" />
                  ))}
                </div>
              ) : (
                <>
                  {filtersError && (
                    <p className="text-xs text-muted-foreground mb-3">{filtersError}</p>
                  )}

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Country</Label>
                      <Select value={filters.country || "__all__"} onValueChange={(value) => handleFilterUpdate({ country: value === "__all__" ? "" : value })}>
                        <SelectTrigger className="h-10 bg-background/70">
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

                    <div className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Seniority</Label>
                      <Select value={filters.seniority || "__all__"} onValueChange={(value) => handleFilterUpdate({ seniority: value === "__all__" ? "" : value })}>
                        <SelectTrigger className="h-10 bg-background/70">
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All levels</SelectItem>
                          {(filterOptions?.seniorityLevels || []).map((item) => (
                            <SelectItem key={item} value={item}>{labelForSeniority(item)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Work Mode</Label>
                      <Select value={filters.workMode || "__all__"} onValueChange={(value) => handleFilterUpdate({ workMode: value === "__all__" ? "" : value })}>
                        <SelectTrigger className="h-10 bg-background/70">
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
                  </div>
                </>
              )}
            </div>

            {/* Chart */}
            <div className="p-4 md:p-6">
              {roleDistLoading ? (
                <Skeleton className="h-[500px] rounded-xl" />
              ) : roleDistError ? (
                <div className="text-center py-8 border border-border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-3">{roleDistError}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadRoleDistribution()}>Retry market chart</Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border/80 bg-background/70 p-4 md:p-5">
                  <div className="h-[480px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleDistribution} layout="vertical" margin={{ left: 14, right: 8, top: 6, bottom: 6 }}>
                        <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          width={180}
                          tickFormatter={(value) => labelForCategory(String(value))}
                        />
                        <Tooltip
                          labelFormatter={(label) => labelForCategory(String(label))}
                          formatter={(value) => [value, "Jobs"]}
                          contentStyle={{
                            borderRadius: 10,
                            fontSize: 13,
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--background))",
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
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

          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Top Skills in Demand">
              {topSkillsRanked.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data available for this time range</p>
              ) : (
                <div className="space-y-3">
                  {topSkillsRanked.map((entry, idx) => (
                    <div key={entry.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`truncate ${idx === 0 ? "text-sm font-bold text-foreground" : idx < 3 ? "text-sm font-semibold text-foreground" : "text-sm text-foreground/70"}`}>
                          {idx + 1}. {toReadableLabel(entry.name)}
                        </p>
                        <Badge variant={idx < 3 ? "default" : "secondary"} className={`text-xs ${idx >= 3 ? "opacity-75" : ""}`}>{entry.count}</Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? "bg-primary" : idx === 1 ? "bg-primary/80" : idx === 2 ? "bg-primary/65" : "bg-primary/35"}`}
                          style={{ width: `${Math.max((entry.count / (topSkillsRanked[0]?.count || 1)) * 100, 10)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Top Technologies in Demand">
              {topTechnologiesRanked.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data available for this time range</p>
              ) : (
                <div className="space-y-3">
                  {topTechnologiesRanked.map((entry, idx) => (
                    <div key={entry.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`truncate ${idx === 0 ? "text-sm font-bold text-foreground" : idx < 3 ? "text-sm font-semibold text-foreground" : "text-sm text-foreground/70"}`}>
                          {idx + 1}. {toReadableLabel(entry.name)}
                        </p>
                        <Badge variant={idx < 3 ? "default" : "secondary"} className={`text-xs ${idx >= 3 ? "opacity-75" : ""}`}>{entry.count}</Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? "bg-primary" : idx === 1 ? "bg-primary/80" : idx === 2 ? "bg-primary/65" : "bg-primary/35"}`}
                          style={{ width: `${Math.max((entry.count / (topTechnologiesRanked[0]?.count || 1)) * 100, 10)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

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
