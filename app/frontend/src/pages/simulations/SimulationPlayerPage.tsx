import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
  Clock,
  Layers,
  ClipboardList,
  CheckCircle2,
  Circle,
  LogIn,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/authStore";
import {
  fetchSimulation,
  fetchMyAttemptForSimulation,
  startSimulation,
  submitSimulation,
  type SimulationDetail,
  type SimulationStage,
  type SimulationTask,
  type SimulationAttempt,
  type SubmittedAnswer,
} from "@/services/simulationsApi";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlatTask {
  task: SimulationTask;
  stage: SimulationStage;
  /** 0-based flat index */
  index: number;
  /** 1-based global task number */
  taskNumber: number;
}

/** Draft answers persisted in localStorage between sessions */
type DraftAnswers = Record<string, string | string[]>;

// ── Local storage helpers ─────────────────────────────────────────────────────

const DRAFT_KEY = (slug: string) => `jobSimulationDraft:${slug}`;
const RESULT_KEY = (attemptId: string) => `jobSimulationResult:${attemptId}`;

const loadDraft = (slug: string): DraftAnswers => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY(slug));
    return raw ? (JSON.parse(raw) as DraftAnswers) : {};
  } catch {
    return {};
  }
};

const saveDraft = (slug: string, answers: DraftAnswers) => {
  try {
    localStorage.setItem(DRAFT_KEY(slug), JSON.stringify(answers));
  } catch {
    /* ignore storage errors */
  }
};

const clearDraft = (slug: string) => {
  try {
    localStorage.removeItem(DRAFT_KEY(slug));
  } catch {
    /* ignore */
  }
};

// ── Flatten stages → tasks ────────────────────────────────────────────────────

const flattenTasks = (stages: SimulationStage[]): FlatTask[] => {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const result: FlatTask[] = [];
  let n = 1;
  for (const stage of sorted) {
    for (const task of stage.tasks) {
      result.push({ task, stage, index: result.length, taskNumber: n++ });
    }
  }
  return result;
};

// ── Seed initial answers from attempt or draft ────────────────────────────────

const seedAnswers = (
  flatTasks: FlatTask[],
  attemptAnswers: SimulationAttempt["answers"],
  draft: DraftAnswers
): DraftAnswers => {
  const answers: DraftAnswers = {};

  for (const { task } of flatTasks) {
    // Attempt answers take priority over draft
    const fromAttempt = (attemptAnswers ?? []).find(
      (a) => (a as { taskId: string }).taskId === task.id
    ) as { taskId: string; value?: string | string[] } | undefined;

    if (fromAttempt?.value !== undefined) {
      answers[task.id] = fromAttempt.value;
    } else if (draft[task.id] !== undefined) {
      answers[task.id] = draft[task.id];
    } else {
      // Default empty answer per task type
      if (
        task.type === "multi_select" ||
        task.type === "ordering"
      ) {
        answers[task.id] =
          task.type === "ordering" && task.options
            ? [...task.options]
            : [];
      } else {
        answers[task.id] = "";
      }
    }
  }

  return answers;
};

// ── Ordering task editor ──────────────────────────────────────────────────────

interface OrderingEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
}

const OrderingEditor = ({ items, onChange }: OrderingEditorProps) => {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={`${item}-${idx}`}
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
        >
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {idx + 1}
          </span>
          <span className="flex-1 text-sm text-foreground">{item}</span>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              aria-label="Move up"
              disabled={idx === 0}
              onClick={() => move(idx, idx - 1)}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={14} className="-rotate-90" />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={idx === items.length - 1}
              onClick={() => move(idx, idx + 1)}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Task renderer ─────────────────────────────────────────────────────────────

interface TaskRendererProps {
  task: SimulationTask;
  answer: string | string[];
  onChange: (value: string | string[]) => void;
}

const TaskRenderer = ({ task, answer, onChange }: TaskRendererProps) => {
  const options = task.options ?? [];

  if (
    task.type === "scenario_mcq" ||
    task.type === "code_review" ||
    task.type === "ui_review"
  ) {
    const selected = typeof answer === "string" ? answer : "";
    return (
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
              selected === opt
                ? "border-primary/60 bg-primary/[0.04]"
                : "border-border/70 bg-background hover:border-primary/30 hover:bg-primary/[0.02]"
            }`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selected === opt
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/40"
              }`}
            >
              {selected === opt && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>
            <input
              type="radio"
              className="sr-only"
              name={`task-${task.id}`}
              value={opt}
              checked={selected === opt}
              onChange={() => onChange(opt)}
            />
            <span className="text-sm leading-relaxed text-foreground">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (task.type === "multi_select") {
    const selected = Array.isArray(answer) ? answer : [];
    return (
      <div className="space-y-3">
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                checked
                  ? "border-primary/60 bg-primary/[0.04]"
                  : "border-border/70 bg-background hover:border-primary/30 hover:bg-primary/[0.02]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  checked
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                }`}
              >
                {checked && (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5 fill-white"
                  >
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? selected.filter((v) => v !== opt)
                    : [...selected, opt];
                  onChange(next);
                }}
              />
              <span className="text-sm leading-relaxed text-foreground">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (task.type === "ordering") {
    const items = Array.isArray(answer) && answer.length > 0
      ? answer
      : [...options];
    return (
      <OrderingEditor
        items={items}
        onChange={(next) => onChange(next)}
      />
    );
  }

  if (task.type === "written_response") {
    const text = typeof answer === "string" ? answer : "";
    return (
      <textarea
        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        rows={8}
        placeholder="Write your professional response here…"
        value={text}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <p className="text-sm text-muted-foreground italic">
      Unknown task type: {task.type}
    </p>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

const PlayerSkeleton = () => (
  <Container className="py-10">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr_240px]">
      <Skeleton className="h-72 rounded-2xl" />
      <div className="space-y-5">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-60 rounded-2xl" />
    </div>
  </Container>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const SimulationPlayerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const session = getSession();
  const token = session?.token ?? null;

  const [simulation, setSimulation] = useState<SimulationDetail | null>(null);
  const [attempt, setAttempt] = useState<SimulationAttempt | null>(null);
  const [flatTasks, setFlatTasks] = useState<FlatTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<DraftAnswers>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prevent double-starting
  const startingRef = useRef(false);

  // ── Load simulation + attempt ─────────────────────────────────────────────

  useEffect(() => {
    if (!slug || !token) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const simData = await fetchSimulation(slug);
        if (cancelled) return;

        const flat = flattenTasks(simData.stages);
        setSimulation(simData);
        setFlatTasks(flat);

        // Try to get existing attempt
        let existingAttempt: SimulationAttempt | null = null;
        try {
          existingAttempt = await fetchMyAttemptForSimulation(slug, token);
        } catch (attemptErr) {
          console.warn("[SimulationPlayerPage] Could not fetch attempt:", attemptErr);
        }

        // If no in_progress attempt, start one (guarded against double-start)
        if (
          !existingAttempt ||
          (existingAttempt.status !== "in_progress" &&
            existingAttempt.status !== "submitted")
        ) {
          if (!startingRef.current) {
            startingRef.current = true;
            try {
              existingAttempt = await startSimulation(slug, token);
            } catch (startErr) {
              if (!cancelled) {
                setError(
                  startErr instanceof Error
                    ? startErr.message
                    : "Failed to start simulation."
                );
                setLoading(false);
              }
              return;
            }
          }
        }

        if (cancelled) return;

        setAttempt(existingAttempt);

        // Seed answers: attempt answers > draft > defaults
        const draft = loadDraft(slug);
        const seeded = seedAnswers(flat, existingAttempt?.answers, draft);
        setAnswers(seeded);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load simulation."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  // ── Persist draft on answer change ───────────────────────────────────────

  const handleAnswerChange = useCallback(
    (taskId: string, value: string | string[]) => {
      setAnswers((prev) => {
        const next = { ...prev, [taskId]: value };
        if (slug) saveDraft(slug, next);
        return next;
      });
    },
    [slug]
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!token || !slug) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const submittedAnswers: SubmittedAnswer[] = flatTasks.map(({ task }) => ({
        taskId: task.id,
        value: answers[task.id] ?? "",
      }));

      const response = await submitSimulation(slug, submittedAnswers, token);
      const attemptId = response.attempt._id;

      // Cache result for the results page
      try {
        sessionStorage.setItem(RESULT_KEY(attemptId), JSON.stringify(response));
      } catch {
        /* ignore */
      }

      clearDraft(slug);
      navigate(`/simulations/results/${attemptId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit simulation."
      );
      setSubmitting(false);
    }
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="flex flex-col items-center gap-5 py-32 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <LogIn size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              You need to be logged in
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please log in to access this simulation.
            </p>
          </div>
          <Button asChild>
            <Link to="/login" state={{ from: `/simulations/${slug}/play` }}>
              <LogIn size={16} className="mr-2" />
              Log in
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to={`/simulations/${slug ?? ""}`}>
              <ArrowLeft size={15} className="mr-2" />
              Back to Simulation
            </Link>
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PlayerSkeleton />
        <Footer />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (error || !simulation || flatTasks.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="flex flex-col items-center gap-5 py-32 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {error ?? "This simulation has no tasks."}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button asChild variant="ghost">
              <Link to={`/simulations/${slug ?? ""}`}>
                <ArrowLeft size={15} className="mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const current = flatTasks[currentIndex];
  const totalTasks = flatTasks.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalTasks - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalTasks) * 100);

  // Group tasks by stage for sidebar
  const stageGroups = simulation.stages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      stage,
      items: flatTasks.filter((ft) => ft.stage.id === stage.id),
    }));

  const hasAnswer = (taskId: string) => {
    const val = answers[taskId];
    if (!val) return false;
    if (typeof val === "string") return val.trim().length > 0;
    return val.length > 0;
  };

  const skillChips = current.task.skillWeights
    ? Object.keys(current.task.skillWeights)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Top progress bar ── */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <Container className="py-8">
        {/* Breadcrumb */}
        <Link
          to={`/simulations/${slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          {simulation.title}
        </Link>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[220px_1fr_240px]">
          {/* ── Left sidebar: stage/task navigation ── */}
          <aside className="rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stages
            </p>
            <div className="space-y-3">
              {stageGroups.map(({ stage, items }) => (
                <div key={stage.id}>
                  <p className="mb-1.5 text-xs font-semibold text-foreground/80">
                    {stage.order}. {stage.title}
                  </p>
                  <div className="space-y-1 pl-2">
                    {items.map((ft) => {
                      const isActive = ft.index === currentIndex;
                      const answered = hasAnswer(ft.task.id);
                      return (
                        <button
                          key={ft.task.id}
                          type="button"
                          onClick={() => setCurrentIndex(ft.index)}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                            isActive
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {answered ? (
                            <CheckCircle2 size={12} className={isActive ? "text-primary" : "text-emerald-500"} />
                          ) : (
                            <Circle size={12} className="opacity-40" />
                          )}
                          <span className="truncate">{ft.task.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main task panel ── */}
          <main className="min-w-0">
            {/* Task header */}
            <div className="mb-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/25 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {current.stage.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  Task {current.taskNumber} of {totalTasks}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {current.task.points} pts
                </span>
                {current.task.aiGraded && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    AI Graded
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {current.task.title}
              </h1>

              {/* Skill chips */}
              {skillChips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skillChips.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stage narrative (shown on first task of a new stage) */}
            {current.task === current.stage.tasks[0] && (
              <div className="mb-5 rounded-xl border border-border/50 bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Stage Context
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {current.stage.narrative}
                </p>
              </div>
            )}

            {/* Task prompt */}
            <div className="mb-5 rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Your Task
              </p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {current.task.prompt}
              </p>

              {/* Context (code snippet, scenario detail etc.) */}
              {current.task.context && (
                <div className="mt-4 rounded-lg border border-border/60 bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Context
                  </p>
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground font-mono overflow-x-auto">
                    {current.task.context}
                  </pre>
                </div>
              )}
            </div>

            {/* Answer area */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Your Answer
              </p>
              <TaskRenderer
                task={current.task}
                answer={answers[current.task.id] ?? ""}
                onChange={(val) => handleAnswerChange(current.task.id, val)}
              />
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={15} className="flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={isFirst}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                <ChevronLeft size={16} className="mr-1.5" />
                Previous
              </Button>

              {isLast ? (
                <Button
                  type="button"
                  className="font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.3)] transition-all duration-200"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Submit Simulation
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next
                  <ChevronRight size={16} className="ml-1.5" />
                </Button>
              )}
            </div>
          </main>

          {/* ── Right sidebar: meta ── */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            {/* Simulation info card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Simulation Info
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    ~{simulation.estimatedMinutes} min
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Layers size={14} className="text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {simulation.stages.length} stage
                    {simulation.stages.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClipboardList size={14} className="text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap size={14} className="text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {simulation.xp} XP on pass
                  </span>
                </div>
              </div>
            </div>

            {/* Progress card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Progress
                </p>
                <span className="text-xs font-bold text-primary">
                  {progressPercent}%
                </span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Task {current.taskNumber} of {totalTasks}
              </p>

              {/* Answered count */}
              <p className="mt-1.5 text-xs text-muted-foreground">
                {flatTasks.filter((ft) => hasAnswer(ft.task.id)).length} of{" "}
                {totalTasks} answered
              </p>
            </div>

            {/* Skills assessed */}
            {simulation.skillsAssessed.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Skills Assessed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {simulation.skillsAssessed.map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default SimulationPlayerPage;

