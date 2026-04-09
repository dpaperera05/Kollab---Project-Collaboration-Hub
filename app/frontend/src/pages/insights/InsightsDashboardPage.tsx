import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Briefcase, Code2, Globe, TrendingUp, ArrowRight, Building2, Cpu, Users } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryStatCard from "@/components/insights/SummaryStatCard";
import ChartCard from "@/components/insights/ChartCard";
import JobCard from "@/components/insights/JobCard";
import { fetchSummary, fetchJobs } from "@/services/jobMarketApi";
import type { JobSummary } from "@/data/mockJobMarket";
import type { Job } from "@/data/mockJobMarket";

const CHART_COLORS = [
  "hsl(270 80% 60%)",
  "hsl(315 85% 65%)",
  "hsl(200 80% 55%)",
  "hsl(150 60% 50%)",
  "hsl(30 90% 60%)",
  "hsl(0 75% 60%)",
  "hsl(240 60% 60%)",
  "hsl(180 60% 45%)",
  "hsl(60 70% 50%)",
  "hsl(330 70% 55%)",
];

const InsightsDashboardPage = () => {
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSummary(), fetchJobs({ limit: 3 })]).then(([s, j]) => {
      setSummary(s);
      setFeaturedJobs(j.jobs);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <Container>
            <div className="space-y-6">
              <Skeleton className="h-10 w-72" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-72 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 border-b border-border bg-gradient-to-b from-primary/[0.03] to-transparent">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-primary" size={24} />
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">Live Data</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Job Market Insights</h1>
              <p className="text-muted-foreground mt-2 max-w-lg text-base">
                Explore current tech job market demand, hiring patterns, and trending skills to guide your career.
              </p>
            </div>
            <Button className="self-start md:self-auto gap-2" asChild>
              <Link to="/insights/jobs">
                Explore All Jobs <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <div className="py-10">
        <Container className="space-y-10">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <SummaryStatCard label="Total Jobs" value={summary.totalJobs} icon={Briefcase} accent />
            <SummaryStatCard label="Tech Jobs" value={summary.techJobs} icon={Code2} />
            <SummaryStatCard label="Non-Tech Jobs" value={summary.nonTechJobs} icon={Users} />
            <SummaryStatCard label="Top Role" value={summary.topRoleCategory} icon={TrendingUp} />
            <SummaryStatCard label="Top Seniority" value={summary.topSeniority} icon={BarChart3} />
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Role Category Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.roleCategoryCounts} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 13, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                      {summary.roleCategoryCounts.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Seniority Distribution">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.seniorityCounts}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      dataKey="count"
                      nameKey="name"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {summary.seniorityCounts.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 13, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {summary.seniorityCounts.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {s.name} ({s.count})
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Top Skills & Technologies */}
          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Top Skills in Demand">
              <div className="flex flex-wrap gap-2">
                {summary.topSkills.map((s) => (
                  <Badge key={s.name} variant="secondary" className="text-sm px-3 py-1.5 gap-1.5">
                    {s.name}
                    <span className="text-xs text-muted-foreground font-normal">({s.count})</span>
                  </Badge>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Top Technologies">
              <div className="flex flex-wrap gap-2">
                {summary.topTechnologies.map((t) => (
                  <span key={t.name} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/8 text-primary border border-primary/15">
                    {t.name}
                    <span className="text-xs opacity-70 ml-1.5">({t.count})</span>
                  </span>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Top Companies & Countries */}
          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Top Hiring Companies">
              <div className="space-y-2.5">
                {summary.topCompanies.slice(0, 6).map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{c.count} jobs</Badge>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Top Countries">
              <div className="space-y-2.5">
                {summary.topCountries.slice(0, 6).map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{c.count} jobs</Badge>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Featured Jobs */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground">Featured Jobs</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-sm" asChild>
                <Link to="/insights/jobs">View All <ArrowRight size={14} /></Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        </Container>
      </div>

      <Footer />
    </div>
  );
};

export default InsightsDashboardPage;
