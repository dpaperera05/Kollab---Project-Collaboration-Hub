import { useState, useEffect, useCallback } from "react";
import {
  Search,
  BriefcaseBusiness,
  Layers,
  FolderCheck,
  AlertCircle,
  Inbox,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SimulationCard from "@/components/simulations/SimulationCard";
import {
  fetchSimulations,
  type SimulationSummary,
  type FetchSimulationsFilters,
} from "@/services/simulationsApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_CATEGORIES = [
  "Software Engineer",
  "UI/UX Designer",
  "Project Manager",
  "DevOps Engineer",
  "AI/ML Engineer",
  "Data Analyst",
  "QA Engineer",
] as const;

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-4 py-3.5 shadow-sm">
    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm font-extrabold text-foreground leading-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  </div>
);

// ── Loading skeletons ─────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
    <Skeleton className="h-1 w-full rounded-full" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-5 w-4/5" />
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-5/6" />
      <Skeleton className="h-3.5 w-4/6" />
    </div>
    <div className="flex gap-1.5">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-8 w-full rounded-lg" />
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

const EmptyState = ({ hasFilters, onClear }: EmptyStateProps) => (
  <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 flex flex-col items-center justify-center text-center gap-5">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
      <Inbox size={28} className="text-primary" />
    </div>
    <div className="space-y-1.5">
      <h3 className="text-lg font-bold text-foreground">No simulations found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasFilters
          ? "No simulations match your current filters. Try adjusting your search or role."
          : "No simulations are available yet. Check back soon."}
      </p>
    </div>
    {hasFilters && (
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear filters
      </Button>
    )}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const SimulationsListPage = () => {
  const [simulations, setSimulations] = useState<SimulationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleCategory, setRoleCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const hasFilters =
    search.trim().length > 0 || roleCategory !== "all" || difficulty !== "all";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: FetchSimulationsFilters = {
        search: search.trim() || undefined,
        roleCategory: roleCategory !== "all" ? roleCategory : undefined,
        difficulty: difficulty !== "all" ? difficulty : undefined,
      };
      const data = await fetchSimulations(filters);
      setSimulations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load simulations.");
    } finally {
      setLoading(false);
    }
  }, [search, roleCategory, difficulty]);

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  const clearFilters = () => {
    setSearch("");
    setRoleCategory("all");
    setDifficulty("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-primary/5 pt-20 pb-12 md:pt-24 md:pb-14">
        {/* Decorative glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />

        <Container className="relative">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles size={12} />
                Career Readiness
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Job Simulations
              </h1>
              <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed md:text-lg">
                Practice realistic role-based tasks in a guided environment, get
                skill-by-skill feedback, and earn portfolio-ready evidence that
                proves your readiness.
              </p>

              {/* Stat cards */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={<BriefcaseBusiness size={18} />}
                  value={loading ? "..." : String(simulations.length)}
                  label="Simulations"
                />
                <StatCard
                  icon={<Layers size={18} />}
                  value="Guided"
                  label="Multi-Stage Tasks"
                />
                <StatCard
                  icon={<FolderCheck size={18} />}
                  value="Portfolio"
                  label="Evidence on Pass"
                />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative ml-auto max-w-sm rounded-3xl border border-border bg-card/90 p-5 shadow-lg">
                <div className="absolute right-5 top-4 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <ShieldCheck size={12} />
                  Verified
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Simulation Snapshot
                </p>
                <h3 className="mt-2 text-lg font-bold text-foreground">Frontend Engineer Trial</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Solve staged product tasks, defend decisions, and deliver a final handoff.
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <CheckCircle2 size={14} className="text-primary" />
                      UX critique task
                    </span>
                    <span className="text-[11px] text-muted-foreground">20 pts</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <CircleDot size={14} className="text-primary" />
                      Code review task
                    </span>
                    <span className="text-[11px] text-muted-foreground">30 pts</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
                  <span className="text-xs font-semibold text-foreground">Potential Reward</span>
                  <span className="text-sm font-extrabold text-primary">+120 XP</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Filters ── */}
      <section className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 py-3">
        <Container>
          <div className="rounded-2xl border border-border/80 bg-card/70 p-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  placeholder="Search simulations by role, skill, or topic"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 text-sm border-border/70 bg-background/80"
                />
              </div>

              {/* Role filter */}
              <Select value={roleCategory} onValueChange={setRoleCategory}>
                <SelectTrigger className="h-10 text-sm w-full sm:w-52 bg-background/80 border-border/70">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_CATEGORIES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty filter */}
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-10 text-sm w-full sm:w-44 bg-background/80 border-border/70">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear — only shown when filters active */}
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs sm:text-sm">
              <p className="text-muted-foreground">
                {loading
                  ? "Refreshing simulations..."
                  : `${simulations.length} simulation${simulations.length !== 1 ? "s" : ""} found`}
              </p>
              {hasFilters && (
                <p className="text-muted-foreground">Showing filtered results</p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Results ── */}
      <main className="py-8 md:py-10">
        <Container>
          {/* Error state */}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center py-16 px-6 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
                <AlertCircle size={24} className="text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Failed to load simulations</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button size="sm" onClick={load}>
                Retry
              </Button>
            </div>
          )}

          {/* Simulation grid */}
          {!error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                : simulations.length === 0
                ? (
                  <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
                )
                : simulations.map((sim) => (
                  <SimulationCard key={sim._id} simulation={sim} />
                ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default SimulationsListPage;
