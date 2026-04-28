import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  Zap,
  Layers,
  ClipboardList,
  ArrowLeft,
  Play,
  BookOpen,
  Target,
  CheckCircle2,
  ListChecks,
  AlertCircle,
  Brain,
  FolderCheck,
  LogIn,
  RefreshCw,
  Code2,
  Pencil,
  Eye,
  BarChart3,
  Shield,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/authStore";
import {
  fetchSimulation,
  fetchMyAttemptForSimulation,
  startSimulation,
  type SimulationDetail,
  type SimulationAttempt,
  type SimulationTask,
} from "@/services/simulationsApi";

// ── Helpers ────────────────────────────────────────────────────────────────────

const difficultyConfig: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  Intermediate:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  Advanced:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
};

interface TaskTypeMeta {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const taskTypeMeta: Record<SimulationTask["type"], TaskTypeMeta> = {
  scenario_mcq: {
    label: "Scenario Decisions",
    description:
      "Choose the best course of action when faced with real workplace scenarios.",
    icon: <Brain size={15} />,
  },
  multi_select: {
    label: "Evidence Review",
    description:
      "Identify all relevant evidence or considerations from a set of options.",
    icon: <ListChecks size={15} />,
  },
  ordering: {
    label: "Process Ordering",
    description:
      "Arrange steps in the correct sequence to complete a professional workflow.",
    icon: <Layers size={15} />,
  },
  code_review: {
    label: "Code Investigation",
    description: "Analyse code or technical context to identify bugs and issues.",
    icon: <Code2 size={15} />,
  },
  ui_review: {
    label: "Design Review",
    description:
      "Evaluate UI designs or visual context and make informed design decisions.",
    icon: <Eye size={15} />,
  },
  written_response: {
    label: "Written Communication",
    description:
      "Draft professional written responses evaluated against an AI rubric.",
    icon: <Pencil size={15} />,
  },
};

// ── Small components ──────────────────────────────────────────────────────────

interface MetaItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

const MetaItem = ({ icon, value, label }: MetaItemProps) => (
  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
    <span className="text-primary">{icon}</span>
    <span className="font-semibold text-foreground">{value}</span>
    <span>{label}</span>
  </div>
);

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard = ({ icon, title, children }: SectionCardProps) => (
  <div className="rounded-2xl border border-border bg-card p-6">
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

const DetailSkeleton = () => (
  <>
    <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-purple-50/30 dark:to-purple-950/5 pt-20 pb-12">
      <Container>
        <Skeleton className="mb-6 h-4 w-32" />
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mb-3 h-9 w-2/3" />
        <div className="mb-5 flex gap-5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-2xl" />
      </Container>
    </section>
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </Container>
  </>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const SimulationDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const session = getSession();
  const token = session?.token;

  const [simulation, setSimulation] = useState<SimulationDetail | null>(null);
  const [attempt, setAttempt] = useState<SimulationAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        // Simulation fetch is the critical path — failure shows error/not-found.
        const simData = await fetchSimulation(slug);
        if (cancelled) return;
        setSimulation(simData);

        // Attempt fetch is best-effort — expired tokens or network glitches
        // must not take down a page whose main content loaded successfully.
        if (token) {
          try {
            const attemptData = await fetchMyAttemptForSimulation(slug, token);
            if (!cancelled) setAttempt(attemptData);
          } catch (attemptErr) {
            console.warn(
              "[SimulationDetailPage] Could not load attempt (degrading gracefully):",
              attemptErr
            );
            if (!cancelled) setAttempt(null);
          }
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load simulation.";
        if (msg.toLowerCase().includes("not found")) {
          setNotFound(true);
        } else {
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  const handleStart = async () => {
    if (!token || !slug) return;
    setStarting(true);
    setStartError(null);
    try {
      await startSimulation(slug, token);
      navigate(`/simulations/${slug}/play`);
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "Failed to start simulation."
      );
      setStarting(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const presentTaskTypes: SimulationTask["type"][] = simulation
    ? ([
        ...new Set(
          simulation.stages.flatMap((s) => s.tasks.map((t) => t.type))
        ),
      ] as SimulationTask["type"][])
    : [];

  const totalTasks = simulation
    ? simulation.stages.reduce((sum, s) => sum + s.tasks.length, 0)
    : 0;

  const attemptStatus = attempt?.status ?? null;

  // ── Loading / not-found / error states ───────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DetailSkeleton />
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="flex flex-col items-center gap-5 py-32 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <AlertCircle size={28} className="text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Simulation not found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This simulation doesn't exist or may have been removed.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/simulations">
              <ArrowLeft size={16} className="mr-2" />
              Back to Job Simulations
            </Link>
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="flex flex-col items-center gap-5 py-32 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Failed to load simulation
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  const diff = simulation.difficulty as "Beginner" | "Intermediate" | "Advanced";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.06] via-background to-purple-50/40 dark:to-purple-950/10 pb-12 pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-purple-400/8 blur-3xl"
        />

        <Container className="relative">
          {/* Breadcrumb */}
          <Link
            to="/simulations"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Job Simulations
          </Link>

          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/8 font-medium text-primary"
            >
              {simulation.roleCategory}
            </Badge>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${difficultyConfig[diff]}`}
            >
              {simulation.difficulty}
            </span>
          </div>

          {/* Title */}
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {simulation.title}
          </h1>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <MetaItem
              icon={<Clock size={14} />}
              value={simulation.estimatedMinutes}
              label="min"
            />
            <MetaItem icon={<Zap size={14} />} value={simulation.xp} label="XP" />
            <MetaItem
              icon={<Layers size={14} />}
              value={simulation.stages.length}
              label="stages"
            />
            <MetaItem
              icon={<ClipboardList size={14} />}
              value={totalTasks}
              label="tasks"
            />
          </div>

          {/* Overview */}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {simulation.overview}
          </p>
        </Container>
      </section>

      {/* ── Body ── */}
      <Container className="py-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* ── Main column ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Workplace Brief */}
            <SectionCard icon={<BookOpen size={16} />} title="Workplace Brief">
              <div className="rounded-xl border border-border/50 bg-muted/40 p-5">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {simulation.workplaceBrief}
                </p>
              </div>
            </SectionCard>

            {/* Skills Assessed */}
            <SectionCard icon={<Target size={16} />} title="Skills You'll Develop">
              <div className="flex flex-wrap gap-2">
                {simulation.skillsAssessed.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {simulation.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {simulation.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Guided Stages */}
            <SectionCard icon={<Layers size={16} />} title="Guided Stages">
              <p className="mb-4 text-sm text-muted-foreground">
                Work through each stage in sequence. Every stage builds on the last.
              </p>
              <div className="space-y-3">
                {simulation.stages
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => (
                    <div
                      key={stage.id}
                      className="flex gap-4 rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {stage.order}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {stage.title}
                          </p>
                          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <ClipboardList size={11} />
                            {stage.tasks.length} task
                            {stage.tasks.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {stage.narrative}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </SectionCard>

            {/* What You'll Do */}
            {presentTaskTypes.length > 0 && (
              <SectionCard
                icon={<CheckCircle2 size={16} />}
                title="What You'll Do"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {presentTaskTypes.map((type) => {
                    const meta = taskTypeMeta[type];
                    return (
                      <div
                        key={type}
                        className="flex gap-3 rounded-xl border border-border/60 bg-background p-3.5"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {meta.icon}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {meta.label}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {meta.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Scoring & Recognition */}
            <SectionCard
              icon={<BarChart3 size={16} />}
              title="Scoring & Recognition"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      icon: <Shield size={15} className="text-primary" />,
                      title: "Pass Mark: 70%",
                      desc: "Score 70% or above to pass and unlock portfolio evidence.",
                    },
                    {
                      icon: (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      ),
                      title: "Auto-Grading",
                      desc: "Objective tasks (MCQ, multi-select, ordering) are graded instantly.",
                    },
                    {
                      icon: <Brain size={15} className="text-purple-500" />,
                      title: "AI Rubric Grading",
                      desc: "Written responses are evaluated against a structured AI rubric.",
                    },
                    {
                      icon: <FolderCheck size={15} className="text-amber-500" />,
                      title: "Portfolio Evidence",
                      desc: "Passing adds this simulation to your Kollab portfolio automatically.",
                    },
                  ] as const
                ).map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-xl border border-border/50 bg-muted/40 p-4"
                  >
                    <div className="mt-0.5 flex-shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* CTA card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Quick meta grid */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                {(
                  [
                    {
                      icon: <Clock size={13} />,
                      label: "Duration",
                      value: `${simulation.estimatedMinutes} min`,
                    },
                    {
                      icon: <Zap size={13} />,
                      label: "XP on Pass",
                      value: `${simulation.xp} XP`,
                    },
                    {
                      icon: <Layers size={13} />,
                      label: "Stages",
                      value: `${simulation.stages.length} Guided`,
                    },
                    {
                      icon: <Target size={13} />,
                      label: "Pass Mark",
                      value: `${simulation.passMark}%`,
                    },
                  ] as const
                ).map(({ icon, label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/60 px-3 py-2.5">
                    <div className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="text-primary">{icon}</span>
                      {label}
                    </div>
                    <p className="text-sm font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Attempt status pill */}
              {attemptStatus && (
                <div
                  className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                    attemptStatus === "completed"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 flex-shrink-0 rounded-full ${
                      attemptStatus === "completed"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  {attemptStatus === "completed"
                    ? "Completed"
                    : attemptStatus === "in_progress"
                    ? "In Progress"
                    : "Submitted — grading in progress"}
                </div>
              )}

              {/* Auth / CTA buttons */}
              {!token ? (
                <div className="space-y-3">
                  <Button asChild className="h-11 w-full font-semibold">
                    <Link to="/login" state={{ from: `/simulations/${slug}` }}>
                      <LogIn size={16} className="mr-2" />
                      Log in to Start
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    No account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign up free
                    </Link>
                  </p>
                </div>
              ) : attemptStatus === "completed" ? (
                <div className="space-y-2">
                  <Button
                    asChild
                    className="h-11 w-full font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.3)] transition-all duration-200"
                  >
                    <Link to={`/simulations/results/${attempt?._id ?? ""}`}>
                      <BarChart3 size={16} className="mr-2" />
                      View Results
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-11 w-full font-semibold text-muted-foreground hover:text-foreground"
                    onClick={handleStart}
                    disabled={starting}
                  >
                    <RefreshCw
                      size={16}
                      className={`mr-2 ${starting ? "animate-spin" : ""}`}
                    />
                    Retake Simulation
                  </Button>
                </div>
              ) : attemptStatus === "in_progress" ||
                attemptStatus === "submitted" ? (
                <Button
                  className="h-11 w-full font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.3)] transition-all duration-200"
                  onClick={() => navigate(`/simulations/${slug}/play`)}
                >
                  <Play size={16} className="mr-2" />
                  Continue Simulation
                </Button>
              ) : (
                <Button
                  className="h-11 w-full font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.3)] transition-all duration-200"
                  onClick={handleStart}
                  disabled={starting}
                >
                  {starting ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Starting…
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" />
                      Start Simulation
                    </>
                  )}
                </Button>
              )}

              {startError && (
                <p className="mt-3 text-center text-xs text-destructive">
                  {startError}
                </p>
              )}
            </div>

            {/* Back link */}
            <Button
              asChild
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <Link to="/simulations">
                <ArrowLeft size={15} className="mr-2" />
                Back to Job Simulations
              </Link>
            </Button>

            {/* Skills sidebar card */}
            {simulation.skillsAssessed.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Skills in this simulation
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {simulation.skillsAssessed.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default SimulationDetailPage;

