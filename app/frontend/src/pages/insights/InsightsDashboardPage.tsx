import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Code2, Globe2, SlidersHorizontal, Sparkles, Users } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJobMarketSummary, getJobMarketJobs, getJobMarketFilters } from "@/services/jobMarketApi";
import type { JobSummary } from "@/data/mockJobMarket";
import type { Job } from "@/data/mockJobMarket";
import type { JobFilters } from "@/data/mockJobMarket";

const CHART_COLORS = [
  "hsl(214 85% 56%)",
  "hsl(187 72% 42%)",
  "hsl(154 60% 42%)",
  "hsl(31 90% 56%)",
  "hsl(345 72% 52%)",
  "hsl(258 72% 62%)",
  "hsl(202 80% 48%)",
  "hsl(171 67% 38%)",
  "hsl(43 93% 52%)",
  "hsl(12 82% 56%)",
];

type DashboardTimeRange = "24h" | "7d" | "30d";

type DashboardFilters = {
  timeRange: DashboardTimeRange;
  country: string;
  roleCategory: string;
  seniority: string;
  workMode: string;
  techJobsOnly: boolean;
};

const TIME_RANGE_OPTIONS: { label: string; value: DashboardTimeRange }[] = [
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
];

const DEFAULT_FILTERS: DashboardFilters = {
  timeRange: "7d",
  country: "",
  roleCategory: "",
  seniority: "",
  workMode: "",
  techJobsOnly: true,
};

const LOW_DATA_THRESHOLD = 50;

const toReadableLabel = (value: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDateLabel = (value?: string) => {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getTimeRangeCutoff = (range: DashboardTimeRange) => {
  const now = Date.now();
  if (range === "24h") return now - 24 * 60 * 60 * 1000;
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  return now - 30 * 24 * 60 * 60 * 1000;
};

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

const InsightsDashboardPage = () => {
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [marketViewJobs, setMarketViewJobs] = useState<Job[]>([]);
  const [filterOptions, setFilterOptions] = useState<JobFilters | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const [autoExpandedMessage, setAutoExpandedMessage] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const summaryData = await getJobMarketSummary();
      setSummary(summaryData);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Failed to load job market insights.");
      setSummary(null);
    } finally {
      setSummaryLoading(false);
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
      setMarketError(null);

      const baseQuery = {
        limit: 100,
        sortBy: "postedDate" as const,
        sortOrder: "desc" as const,
        country: filters.country || undefined,
        roleCategory: filters.roleCategory || undefined,
        seniority: filters.seniority || undefined,
        workMode: filters.workMode || undefined,
        isTechJob: filters.techJobsOnly ? true : undefined,
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

      const cutoff = getTimeRangeCutoff(filters.timeRange);
      const scopedJobs = allJobs.filter((job) => {
        const ts = new Date(job.postedDate).getTime();
        return !Number.isNaN(ts) && ts >= cutoff;
      });

      setMarketViewJobs(scopedJobs);
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : "Failed to load current market view.");
      setMarketViewJobs([]);
    } finally {
      setMarketLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadSummary();
    void loadFeaturedJobs();
    void loadFilterOptions();
  }, []);

  useEffect(() => {
    void loadMarketView();
  }, [loadMarketView]);

  const roleDistribution = useMemo(() => {
    if (marketViewJobs.length === 0) {
      return summary?.roleCategoryCounts || [];
    }

    const counts = countBy(marketViewJobs.map((job) => job.roleCategory || "Other"));
    return rankedEntries(counts).slice(0, 10);
  }, [marketViewJobs, summary]);

  const seniorityDistribution = useMemo(() => {
    if (marketViewJobs.length === 0) {
      return summary?.seniorityCounts || [];
    }

    const counts = countBy(marketViewJobs.map((job) => job.seniority || "Unknown"));
    return rankedEntries(counts);
  }, [marketViewJobs, summary]);

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

  const dominantRole = roleDistribution[0]?.name || summary?.topRoleCategory || "Insufficient data";
  const dominantSeniority = seniorityDistribution[0]?.name || summary?.topSeniority || "Insufficient data";
  const topSkill = topSkillsRanked[0]?.name || "Insufficient data";
  const topTechnology = topTechnologiesRanked[0]?.name || "Insufficient data";

  const workModeStats = useMemo(() => {
    const knownModes = marketViewJobs
      .map((job) => (job.workMode || "").trim())
      .filter((mode) => mode.length > 0);
    const knownCount = knownModes.length;
    const remoteCount = knownModes.filter((mode) => mode.toLowerCase() === "remote").length;

    if (knownCount < 10) {
      return {
        shareLabel: "Insufficient data",
        insight: "Work mode split needs more records to be reliable.",
      };
    }

    const remotePercent = Math.round((remoteCount / knownCount) * 100);
    return {
      shareLabel: `${remotePercent}%`,
      insight:
        remotePercent >= 50
          ? `Remote roles lead the current view at ${remotePercent}% of known work modes.`
          : `On-site and hybrid roles dominate, with remote at ${remotePercent}% of known work modes.`,
    };
  }, [marketViewJobs]);

  const jobsAnalyzed = marketViewJobs.length;
  const lowDataMode = jobsAnalyzed > 0 && jobsAnalyzed < LOW_DATA_THRESHOLD;

  useEffect(() => {
    if (marketLoading || marketError) return;
    if (jobsAnalyzed <= 0) return;

    if (jobsAnalyzed < LOW_DATA_THRESHOLD && filters.timeRange !== "30d") {
      setFilters((prev) => ({ ...prev, timeRange: "30d" }));
      setAutoExpandedMessage(
        `Showing limited dataset (${jobsAnalyzed} jobs). Automatically expanded to Last 30 Days for better accuracy.`
      );
      return;
    }

    if (filters.timeRange === "30d") {
      setAutoExpandedMessage(null);
    }
  }, [jobsAnalyzed, marketLoading, marketError, filters.timeRange]);

  const latestPostedDate = useMemo(() => {
    const source = marketViewJobs.length ? marketViewJobs : featuredJobs;
    const latest = source
      .map((job) => new Date(job.postedDate).getTime())
      .filter((ts) => !Number.isNaN(ts))
      .sort((a, b) => b - a)[0];
    return latest ? new Date(latest).toISOString() : undefined;
  }, [marketViewJobs, featuredJobs]);

  const timeRangeLabel = TIME_RANGE_OPTIONS.find((item) => item.value === filters.timeRange)?.label || "Last 7 Days";

  const marketScopeText = filters.techJobsOnly ? "Tech jobs only" : "All jobs";

  const marketInsights = useMemo(() => {
    const insights: string[] = [];

    if (dominantRole !== "Insufficient data") {
      insights.push(
        `${toReadableLabel(dominantRole)} dominates the current market, representing the largest share of active roles.`
      );
    }

    if (dominantSeniority !== "Insufficient data") {
      insights.push(`${toReadableLabel(dominantSeniority)} positions appear most frequently in the current dataset.`);
    }

    if (topTechnology !== "Insufficient data") {
      insights.push(`${toReadableLabel(topTechnology)} is the most frequently mentioned technology across listings.`);
    } else if (topSkill !== "Insufficient data") {
      insights.push(`${toReadableLabel(topSkill)} appears as the most common capability in current listings.`);
    }

    if (workModeStats.shareLabel !== "Insufficient data") {
      insights.push(`Remote roles account for ${workModeStats.shareLabel} of identified work modes.`);
    } else {
      insights.push(workModeStats.insight);
    }

    if (lowDataMode) {
      insights.push("Data coverage is currently limited, so trend confidence is moderate rather than high.");
    }

    return insights.slice(0, 5);
  }, [dominantRole, dominantSeniority, topTechnology, topSkill, workModeStats.insight, lowDataMode]);

  const handleFilterUpdate = (patch: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-16 w-full">
        <img
          src="https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/banners/job-market-hero.png"
          alt="Job Market Intelligence"
          className="w-full object-cover"
        />
      </section>

      <div className="py-10">
        <Container className="space-y-8">
          <Card className="border-border/80 bg-gradient-to-r from-card to-muted/20 p-4 md:p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Market View Controls</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={resetFilters}>Reset Filters</Button>
            </div>

            {filtersLoading ? (
              <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={`filter-skeleton-${i}`} className="h-10 rounded-md" />
                ))}
              </div>
            ) : (
              <>
                {filtersError && (
                  <p className="text-xs text-muted-foreground mb-3">{filtersError}</p>
                )}

                <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Time Range</Label>
                    <Select value={filters.timeRange} onValueChange={(value) => handleFilterUpdate({ timeRange: value as DashboardTimeRange })}>
                      <SelectTrigger className="h-10 bg-background/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_RANGE_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Role Category</Label>
                    <Select value={filters.roleCategory || "__all__"} onValueChange={(value) => handleFilterUpdate({ roleCategory: value === "__all__" ? "" : value })}>
                      <SelectTrigger className="h-10 bg-background/70">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All roles</SelectItem>
                        {(filterOptions?.roleCategories || []).map((item) => (
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
                          <SelectItem key={item} value={item}>{item}</SelectItem>
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
                        {(filterOptions?.workModes || []).map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Tech Jobs Only</Label>
                    <Card className="h-10 px-3 flex items-center justify-between border-border/80 bg-background/70">
                      <span className="text-xs text-foreground">{filters.techJobsOnly ? "Enabled" : "Disabled"}</span>
                      <Switch checked={filters.techJobsOnly} onCheckedChange={(checked) => handleFilterUpdate({ techJobsOnly: checked })} />
                    </Card>
                  </div>
                </div>
              </>
            )}
          </Card>

          {autoExpandedMessage && (
            <Card className="border border-amber-300/60 bg-amber-50/60 dark:bg-amber-900/10 p-3.5">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                {autoExpandedMessage}
              </p>
            </Card>
          )}

          {!autoExpandedMessage && lowDataMode && (
            <Card className="border border-amber-300/60 bg-amber-50/60 dark:bg-amber-900/10 p-3.5">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                Limited data for selected time range. Showing limited dataset ({jobsAnalyzed} jobs).
              </p>
            </Card>
          )}

          {summaryError && !summary && (
            <div className="text-center py-8 border border-border rounded-xl">
              <h2 className="text-xl font-bold mb-2">Could not load insights</h2>
              <p className="text-muted-foreground mb-4">{summaryError}</p>
              <Button onClick={() => void loadSummary()}>Try again</Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {summaryLoading && Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`summary-skeleton-${i}`} className="h-24 rounded-xl" />
            ))}

            {!summaryLoading && summary && (
              <>
                <Card className="p-4 md:p-5 border border-border/50 bg-card/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Jobs Analyzed</p>
                    <Briefcase size={15} className="text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold mt-3 text-foreground leading-none">{jobsAnalyzed.toLocaleString()}</p>
                </Card>
                <Card className="p-4 md:p-5 border border-border/50 bg-card/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Most Demanded Role</p>
                    <Code2 size={15} className="text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mt-3 text-foreground line-clamp-1">{toReadableLabel(dominantRole)}</p>
                </Card>
                <Card className="p-4 md:p-5 border border-border/50 bg-card/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Most Common Seniority</p>
                    <Users size={15} className="text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mt-3 text-foreground line-clamp-1">{toReadableLabel(dominantSeniority)}</p>
                </Card>
                <Card className="p-4 md:p-5 border border-border/50 bg-card/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Remote Share</p>
                    <Globe2 size={15} className="text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold mt-3 text-foreground leading-none">{workModeStats.shareLabel}</p>
                </Card>
                <Card className="p-4 md:p-5 border border-border/50 bg-card/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Most Mentioned Skill / Tech</p>
                    <Sparkles size={15} className="text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mt-3 text-foreground line-clamp-1">
                    {toReadableLabel(topTechnology !== "Insufficient data" ? topTechnology : topSkill)}
                  </p>
                </Card>
              </>
            )}
          </div>

          <Card className="border-border/80 bg-card/95 p-4 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl md:text-[1.7rem] font-bold tracking-tight text-foreground">Role Distribution Across Current Market View</h2>
                <p className="text-sm text-muted-foreground mt-1">Role distribution based on current filters and selected time range</p>
              </div>
              <Badge variant="outline" className="text-xs border-border/80">{timeRangeLabel}</Badge>
            </div>

            {marketLoading ? (
              <div className="grid lg:grid-cols-[1fr_260px] gap-4">
                <Skeleton className="h-[500px] rounded-xl" />
                <Skeleton className="h-[500px] rounded-xl" />
              </div>
            ) : marketError ? (
              <div className="text-center py-8 border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">{marketError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadMarketView()}>Retry market chart</Button>
              </div>
            ) : roleDistribution.length === 0 ? (
              <div className="text-center py-8 border border-border rounded-xl text-muted-foreground">
                No role distribution data for this filter set.
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_260px] gap-4">
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
                          width={130}
                          tickFormatter={(value) => toReadableLabel(String(value))}
                        />
                        <Tooltip
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

                <div className="rounded-xl border border-border/80 bg-background/70 p-4 md:p-5 space-y-4">
                  <p className="text-sm font-semibold text-foreground">Market Takeaways</p>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-border/70 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Dominant Role</p>
                      <p className="text-sm font-semibold mt-1 text-foreground">{toReadableLabel(dominantRole)}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Most Common Seniority</p>
                      <p className="text-sm font-semibold mt-1 text-foreground">{toReadableLabel(dominantSeniority)}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Remote Share</p>
                      <p className="text-sm font-semibold mt-1 text-foreground">{workModeStats.shareLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="border-border/80 bg-card/95 p-4 md:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Market Insights</h3>
            <p className="text-sm text-muted-foreground mt-1">Key takeaways generated from current job market data</p>
            <ul className="mt-4 space-y-2">
              {marketInsights.map((insight) => (
                <li key={insight} className="text-sm text-foreground flex items-start gap-2 leading-relaxed">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary/70" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
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
