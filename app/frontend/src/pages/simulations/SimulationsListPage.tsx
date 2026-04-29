import { useState, useEffect, useCallback } from "react";
import { Search, BriefcaseBusiness, Layers, FolderCheck, AlertCircle, Inbox } from "lucide-react";
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
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 backdrop-blur-sm">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      {icon}
    </div>
    <div>
      <p className="text-base font-bold text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

// ── Loading skeletons ─────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
    <div className="flex gap-2">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-5 w-3/4" />
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
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
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
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.06] via-background to-purple-50/40 dark:to-purple-950/10 pt-16 pb-14">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl"
        />

        <Container className="relative">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
              <BriefcaseBusiness size={12} />
              Career Readiness
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Job{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Simulations
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
              Practise realistic workplace tasks in guided, role-based simulations.
              Receive skill-by-skill feedback and earn verifiable portfolio evidence —
              without needing a job first.
            </p>
          </div>

          {/* Stat cards */}
          <div className="mt-8 flex flex-wrap gap-3">
            <StatCard
              icon={<BriefcaseBusiness size={18} />}
              value="7"
              label="Role Tracks"
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
        </Container>
      </section>

      {/* ── Filters ── */}
      <section className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-3">
        <Container>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search simulations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Role filter */}
            <Select value={roleCategory} onValueChange={setRoleCategory}>
              <SelectTrigger className="h-9 text-sm w-full sm:w-48">
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
              <SelectTrigger className="h-9 text-sm w-full sm:w-44">
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
                className="text-muted-foreground hover:text-foreground whitespace-nowrap"
              >
                Clear
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* ── Results ── */}
      <main className="py-10">
        <Container>
          {/* Result count */}
          {!loading && !error && (
            <p className="text-sm text-muted-foreground mb-6">
              {simulations.length} simulation{simulations.length !== 1 ? "s" : ""} found
            </p>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
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
