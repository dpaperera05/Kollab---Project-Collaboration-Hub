import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  AlertCircle,
  LogIn,
  Bot,
  BookOpen,
  Trophy,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/authStore";
import {
  fetchMySimulationAttempts,
  fetchSimulation,
  type SimulationAttempt,
  type SimulationSummary,
  type SubmitSimulationResponse,
  type SkillBreakdown,
  type RuleBasedResult,
  type AIGradingResult,
} from "@/services/simulationsApi";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PopulatedSimInfo {
  title: string;
  slug: string;
  roleCategory: string;
}

/** Unified display model — built from either sessionStorage or API data. */
interface DisplayData {
  finalScore: number;
  passed: boolean;
  xpEarned: number;
  earnedPoints: number;
  totalPoints: number;
  skillBreakdown: SkillBreakdown[];
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
  /** true if a badge was earned */
  badgeEarned: boolean;
  /** Full badge name if available (from submit result) */
  badgeLabel: string | null;
  portfolioEligible: boolean;
  ruleBasedResults: RuleBasedResult[];
  aiGradingResults: AIGradingResult[];
  simInfo: PopulatedSimInfo | null;
}

// ── SessionStorage key ────────────────────────────────────────────────────────

const SESSION_KEY = (id: string) => `jobSimulationResult:${id}`;

// ── Type guards ───────────────────────────────────────────────────────────────

const isPopulatedSim = (
  s: string | SimulationSummary
): s is SimulationSummary =>
  typeof s === "object" && s !== null && "slug" in s;

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildDisplayData = (
  attempt: SimulationAttempt,
  cachedResult: SubmitSimulationResponse["result"] | null,
  simInfo: PopulatedSimInfo | null
): DisplayData => ({
  finalScore: attempt.finalScore,
  passed: attempt.passed,
  xpEarned: attempt.xpEarned,
  earnedPoints: attempt.earnedPoints,
  totalPoints: attempt.totalPoints,
  skillBreakdown: attempt.skillBreakdown ?? [],
  feedbackSummary:
    attempt.feedbackSummary ??
    cachedResult?.feedbackSummary ??
    "",
  strengths:
    attempt.strengths?.length
      ? attempt.strengths
      : (cachedResult?.strengths ?? []),
  improvements:
    attempt.improvements?.length
      ? attempt.improvements
      : (cachedResult?.improvements ?? []),
  badgeEarned: attempt.badgeEarned,
  badgeLabel: cachedResult?.badgeEarned ?? null,
  portfolioEligible: attempt.portfolioEligible,
  ruleBasedResults: attempt.ruleBasedResults ?? [],
  aiGradingResults: attempt.aiGradingResults ?? [],
  simInfo,
});

const loadFromSession = (
  attemptId: string
): { attempt: SimulationAttempt; result: SubmitSimulationResponse["result"] } | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(attemptId));
    if (!raw) return null;
    return JSON.parse(raw) as {
      attempt: SimulationAttempt;
      result: SubmitSimulationResponse["result"];
    };
  } catch {
    return null;
  }
};

// ── Visual helpers ────────────────────────────────────────────────────────────

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const scoreFill = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#f43f5e";
};

const scoreBarClass = (score: number) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
};

/**
 * Format a numeric point value with at most 1 decimal place.
 * Strips a trailing ".0" so whole numbers display cleanly.
 * Examples: 8.600000000000001 → "8.6", 10.0 → "10", 1.8000000000000003 → "1.8"
 */
const formatNumber = (n: number): string => {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
};

// ── Score circle ──────────────────────────────────────────────────────────────

interface ScoreCircleProps {
  score: number;
  passed: boolean;
  size?: number;
}

const ScoreCircle = ({ score, passed, size = 140 }: ScoreCircleProps) => {
  const cx = size / 2;
  const r = cx - 10;
  const circ = 2 * Math.PI * r;
  const filled = ((Math.min(100, Math.max(0, score)) / 100) * circ);
  const offset = circ - filled;
  const color = scoreFill(passed ? score : score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth={10}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className={`text-2xl font-extrabold leading-none ${scoreColor(score)}`}
        >
          {Math.round(score)}%
        </span>
        <span className="mt-0.5 text-xs font-medium text-muted-foreground">
          score
        </span>
      </div>
    </div>
  );
};

// ── Skill bar row ─────────────────────────────────────────────────────────────

const SkillRow = ({
  skill,
  isStrongest,
  isWeakest,
}: {
  skill: SkillBreakdown;
  isStrongest?: boolean;
  isWeakest?: boolean;
}) => {
  const pct = Math.round(skill.score);
  return (
    <div className="flex items-center gap-4">
      <div className="w-48 flex-shrink-0 flex items-center gap-1.5 min-w-0">
        <span className="truncate text-sm font-medium text-foreground">
          {skill.skill}
        </span>
        {isStrongest && (
          <span className="flex-shrink-0 rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Best
          </span>
        )}
        {isWeakest && (
          <span className="flex-shrink-0 rounded-full bg-rose-100 px-1.5 py-px text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            Focus
          </span>
        )}
      </div>
      <div className="relative flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${scoreBarClass(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-10 flex-shrink-0 text-right text-xs font-bold ${scoreColor(pct)}`}>
        {pct}%
      </span>
      <span className="w-24 flex-shrink-0 text-right text-xs text-muted-foreground">
        {formatNumber(skill.earnedPoints)}/{formatNumber(skill.totalPoints)} pts
      </span>
    </div>
  );
};

// ── Task result card ──────────────────────────────────────────────────────────

const RuleBasedCard = ({
  result,
  index,
  taskTitle,
}: {
  result: RuleBasedResult;
  index: number;
  taskTitle?: string;
}) => {
  const [open, setOpen] = useState(false);
  const earned = result.earnedPoints;
  const max = result.maxPoints;
  const pct = max > 0 ? Math.round((earned / max) * 100) : 0;

  // Three-way status: Correct / Partial / Incorrect
  const isCorrect = max > 0 && earned >= max;
  const isPartial = earned > 0 && earned < max;

  const statusBadge = isCorrect ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle2 size={11} />
      Correct
    </span>
  ) : isPartial ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <Star size={11} />
      Partial
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
      <XCircle size={11} />
      Incorrect
    </span>
  );

  const iconBg = isCorrect
    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    : isPartial
    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          {isCorrect ? (
            <CheckCircle2 size={15} />
          ) : isPartial ? (
            <Star size={15} />
          ) : (
            <XCircle size={15} />
          )}
        </span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
          {result.taskTitle ?? taskTitle ?? `Task ${index + 1}`}
        </span>
        <span className={`flex-shrink-0 text-sm font-bold ${scoreColor(pct)}`}>
          {formatNumber(earned)}/{formatNumber(max)} pts
        </span>
        <span className="flex-shrink-0 ml-1">{statusBadge}</span>
        {open ? (
          <ChevronUp size={15} className="ml-1 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown size={15} className="ml-1 flex-shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border/50 px-5 py-4 space-y-2">
          {result.feedback ? (
            <p className="text-sm text-foreground/85 leading-relaxed">
              {result.feedback}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No additional feedback for this task.
            </p>
          )}
          {result.skillPoints && Object.keys(result.skillPoints).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(result.skillPoints).map(([skill, pts]) => (
                <span
                  key={skill}
                  className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {skill}: {formatNumber(pts as number)} pts
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AIGradingCard = ({
  result,
  index,
  ruleBasedCount,
  taskTitle,
}: {
  result: AIGradingResult;
  index: number;
  ruleBasedCount: number;
  taskTitle?: string;
}) => {
  const [open, setOpen] = useState(false);
  const displayTitle =
    result.taskTitle ?? taskTitle ?? `Task ${ruleBasedCount + index + 1}`;

  // ── Pending: AI not yet configured ─────────────────────────────────────────
  if (result.pending) {
    return (
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-900/10 px-5 py-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertCircle size={14} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{displayTitle}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            AI grading is not yet configured for this task. Your response has been recorded and will be reviewed.
          </p>
        </div>
        <span className="flex-shrink-0 self-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Pending
        </span>
      </div>
    );
  }

  const earned = result.totalEarned;
  const max = result.totalMax;
  const pct = max > 0 ? Math.round((earned / max) * 100) : 0;

  // ── Failed grading — neutral note, no error details ────────────────────────
  if (result.error) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-5 py-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <Bot size={14} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{displayTitle}</p>
            <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-px text-xs font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              AI Graded
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI grading could not be completed for this response. Your answer has been recorded.
          </p>
        </div>
        <span className="flex-shrink-0 self-center text-sm font-bold text-muted-foreground">
          0/{formatNumber(max)} pts
        </span>
      </div>
    );
  }

  // ── Normal graded result ───────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <Bot size={14} />
        </span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
          {displayTitle}
          <span className="ml-2 rounded-full border border-purple-200 bg-purple-50 px-2 py-px text-xs font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            AI Graded
          </span>
        </span>
        <span className={`flex-shrink-0 text-sm font-bold ${scoreColor(pct)}`}>
          {formatNumber(earned)}/{formatNumber(max)} pts
        </span>
        {open ? (
          <ChevronUp size={15} className="ml-2 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown size={15} className="ml-2 flex-shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border/50 px-5 py-4 space-y-4">
          {result.overallFeedback && (
            <div className="rounded-lg bg-purple-50 border border-purple-100 dark:bg-purple-900/15 dark:border-purple-800/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-1.5">
                Overall Feedback
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {result.overallFeedback}
              </p>
            </div>
          )}
          {result.rubricScores && result.rubricScores.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rubric Breakdown
              </p>
              {result.rubricScores.map((r) => {
                const rPct =
                  r.maxScore > 0 ? (r.earnedScore / r.maxScore) * 100 : 0;
                return (
                  <div
                    key={r.criterion}
                    className="rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-foreground leading-snug">
                        {r.criterion}
                      </span>
                      <span
                        className={`flex-shrink-0 text-xs font-bold ${scoreColor(rPct)}`}
                      >
                        {formatNumber(r.earnedScore)}/{formatNumber(r.maxScore)} pts
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${scoreBarClass(rPct)}`}
                        style={{ width: `${Math.min(100, rPct)}%` }}
                      />
                    </div>
                    {r.feedback && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {r.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!result.overallFeedback && result.rubricScores.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No detailed feedback available for this task.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

const ResultSkeleton = () => (
  <>
    <div className="h-56 w-full bg-muted animate-pulse" />
    <Container className="py-10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </Container>
  </>
);

// ── Section card wrapper ──────────────────────────────────────────────────────

const Section = ({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
    <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-foreground">
      <span className="text-primary">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const SimulationResultPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const session = getSession();
  const token = session?.token ?? null;

  const [data, setData] = useState<DisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Maps taskId → task title, populated by a secondary fetch of the simulation detail. */
  const [taskTitleMap, setTaskTitleMap] = useState<Record<string, string>>({});

  // Fetch simulation detail to build task title map once simInfo.slug is known
  useEffect(() => {
    const slug = data?.simInfo?.slug;
    if (!slug) return;
    let cancelled = false;
    fetchSimulation(slug)
      .then((detail) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        detail.stages.forEach((stage) => {
          stage.tasks.forEach((task) => {
            map[task.id] = task.title;
          });
        });
        setTaskTitleMap(map);
      })
      .catch(() => {
        // Silently ignore — task title fallback ("Task N") is acceptable
      });
    return () => {
      cancelled = true;
    };
  }, [data?.simInfo?.slug]);

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      // Phase 1 — instant display from sessionStorage
      const cached = loadFromSession(attemptId);
      if (cached) {
        const simInfo = isPopulatedSim(cached.attempt.simulationId)
          ? {
              title: cached.attempt.simulationId.title,
              slug: cached.attempt.simulationId.slug,
              roleCategory: cached.attempt.simulationId.roleCategory,
            }
          : null;
        setData(buildDisplayData(cached.attempt, cached.result, simInfo));
        setLoading(false);
      }

      // Phase 2 — fetch from API for richer sim info (and fallback if no cache)
      if (token) {
        try {
          const attempts = await fetchMySimulationAttempts(token);
          if (cancelled) return;

          const found = attempts.find((a) => a._id === attemptId);
          if (found) {
            const simInfo = isPopulatedSim(found.simulationId)
              ? {
                  title: found.simulationId.title,
                  slug: found.simulationId.slug,
                  roleCategory: found.simulationId.roleCategory,
                }
              : null;

            const resultPayload =
              cached?.result ?? null;

            setData(buildDisplayData(found, resultPayload, simInfo));
            setLoading(false);
          } else if (!cached) {
            // Not in cache and not found in API
            if (!cancelled) setError("Result not found. It may have expired.");
            if (!cancelled) setLoading(false);
          }
        } catch (err) {
          if (cancelled) return;
          if (!cached) {
            setError(
              err instanceof Error ? err.message : "Failed to load result."
            );
            setLoading(false);
          }
          // If we already have cached data, silently fail the API enrichment
        }
      } else if (!cached) {
        // No token, no cache
        setError("Please log in to view your results.");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, token]);

  // ── Auth / not-found states ───────────────────────────────────────────────

  if (!loading && !data && error) {
    const isAuthError = error.includes("log in");
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <Container className="flex flex-col items-center gap-5 py-32 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
              isAuthError ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            {isAuthError ? (
              <LogIn size={28} className="text-primary" />
            ) : (
              <AlertCircle size={28} className="text-destructive" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{error}</h1>
            {isAuthError && (
              <p className="mt-2 text-sm text-muted-foreground">
                Log in to see your simulation results.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {isAuthError && (
              <Button asChild>
                <Link to="/login">
                  <LogIn size={15} className="mr-2" />
                  Log in
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/simulations">
                <ArrowLeft size={15} className="mr-2" />
                Job Simulations
              </Link>
            </Button>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <ResultSkeleton />
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  const {
    finalScore,
    passed,
    xpEarned,
    earnedPoints,
    totalPoints,
    skillBreakdown,
    feedbackSummary,
    strengths,
    improvements,
    badgeEarned,
    badgeLabel,
    portfolioEligible,
    ruleBasedResults,
    aiGradingResults,
    simInfo,
  } = data;

  const passMark = 70;
  const sortedSkills = [...skillBreakdown].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />

      {/* ── Hero ── */}
      <div
        className={`relative overflow-hidden ${
          passed
            ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-primary"
            : "bg-gradient-to-br from-primary via-purple-600 to-rose-500"
        }`}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

        <Container className="relative py-12">
          {/* Breadcrumb */}
          <Link
            to="/simulations"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Job Simulations
          </Link>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-10">
            {/* Score circle */}
            <div className="flex-shrink-0">
              <div className="relative inline-flex items-center justify-center">
                <svg
                  width={160}
                  height={160}
                  style={{ transform: "rotate(-90deg)" }}
                  aria-hidden="true"
                >
                  <circle
                    cx={80}
                    cy={80}
                    r={64}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={12}
                  />
                  <circle
                    cx={80}
                    cy={80}
                    r={64}
                    fill="none"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth={12}
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={
                      2 * Math.PI * 64 -
                      (Math.min(100, finalScore) / 100) * 2 * Math.PI * 64
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold leading-none text-white">
                    {Math.round(finalScore)}%
                  </span>
                  <span className="mt-1 text-xs font-medium text-white/70">
                    final score
                  </span>
                </div>
              </div>
            </div>

            {/* Title + status */}
            <div className="flex-1 text-center md:text-left">
              {simInfo && (
                <p className="mb-1 text-sm font-medium text-white/70">
                  {simInfo.roleCategory}
                </p>
              )}
              <h1 className="text-2xl font-extrabold leading-tight text-white md:text-3xl">
                {simInfo?.title ?? "Simulation Complete"}
              </h1>

              {/* Pass/fail badge */}
              <div className="mt-3 inline-flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold shadow-lg ${
                    passed
                      ? "bg-white text-emerald-700"
                      : "bg-white/15 text-white border border-white/30"
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <XCircle size={15} />
                  )}
                  {passed ? "Passed" : "Not Passed"}
                </span>
              </div>

              {/* Chips row */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                  <Zap size={12} />
                  {xpEarned} XP earned
                </span>

                {badgeEarned && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
                    <Trophy size={12} />
                    {badgeLabel ?? "Excellence Badge"}
                  </span>
                )}

                {portfolioEligible && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                    <BookOpen size={12} />
                    Portfolio eligible
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Content ── */}
      <Container className="py-10 space-y-6">

        {/* ── Row 1: Score card + Strengths / Improvements ── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Score card */}
          <Section title="Score Overview" icon={<Star size={17} />}>
            <div className="flex items-center justify-between mb-6">
              <ScoreCircle score={finalScore} passed={passed} size={120} />
              <div className="flex-1 pl-8 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Points earned
                  </p>
                  <p className="text-2xl font-extrabold text-foreground">
                    {formatNumber(earnedPoints)}
                    <span className="text-lg font-medium text-muted-foreground">
                      /{formatNumber(totalPoints)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Pass mark
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {passMark}%{" "}
                    <span
                      className={`text-xs font-medium ${
                        passed ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {passed ? "— You passed!" : "— Not reached"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Score bar */}
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">
                  Pass mark {passMark}%
                </span>
                <span>100%</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                {/* Pass mark marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground/20 z-10"
                  style={{ left: `${passMark}%` }}
                />
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${scoreBarClass(
                    finalScore
                  )}`}
                  style={{ width: `${Math.min(100, finalScore)}%` }}
                />
              </div>
            </div>
          </Section>

          {/* Strengths & Improvements */}
          <Section title="Your Performance" icon={<TrendingUp size={17} />}>
            {strengths.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Strengths
                </p>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/85"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 flex-shrink-0 text-emerald-500"
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {improvements.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  Areas to improve
                </p>
                <ul className="space-y-2">
                  {improvements.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/85"
                    >
                      <Star
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-amber-500"
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {strengths.length === 0 && improvements.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No detailed feedback available.
              </p>
            )}
          </Section>
        </div>

        {/* ── Skill breakdown ── */}
        {sortedSkills.length > 0 && (
          <Section title="Skill Breakdown" icon={<Award size={17} />}>
            <div className="space-y-4">
              {sortedSkills.map((skill, idx) => (
                <SkillRow
                  key={skill.skill}
                  skill={skill}
                  isStrongest={idx === 0 && sortedSkills.length > 1}
                  isWeakest={idx === sortedSkills.length - 1 && sortedSkills.length > 1}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Feedback summary ── */}
        {feedbackSummary && (
          <Section title="Feedback Summary" icon={<BookOpen size={17} />}>
            <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
              {feedbackSummary}
            </p>
          </Section>
        )}

        {/* ── Task breakdown ── */}
        {(ruleBasedResults.length > 0 || aiGradingResults.length > 0) && (
          <Section
            title="Task-by-Task Breakdown"
            icon={<ClipboardList />}
          >
            <div className="space-y-3">
              {ruleBasedResults.map((r, i) => (
                <RuleBasedCard
                  key={r.taskId}
                  result={r}
                  index={i}
                  taskTitle={taskTitleMap[r.taskId]}
                />
              ))}
              {aiGradingResults.map((r, i) => (
                <AIGradingCard
                  key={r.taskId}
                  result={r}
                  index={i}
                  ruleBasedCount={ruleBasedResults.length}
                  taskTitle={taskTitleMap[r.taskId]}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Actions ── */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            What&apos;s next?
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/simulations">
                <ArrowLeft size={15} className="mr-2" />
                Browse Simulations
              </Link>
            </Button>

            {simInfo?.slug && (
              <Button asChild variant="outline">
                <Link to={`/simulations/${simInfo.slug}/play`}>
                  <RotateCcw size={15} className="mr-2" />
                  Retake Simulation
                </Link>
              </Button>
            )}

            {simInfo?.slug && (
              <Button asChild variant="ghost">
                <Link to={`/simulations/${simInfo.slug}`}>
                  <ExternalLink size={15} className="mr-2" />
                  View Details
                </Link>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              disabled
              title="Coming soon"
            >
              <BookOpen size={15} className="mr-2" />
              Add to Portfolio
              <span className="ml-2 rounded-full bg-muted px-2 py-px text-xs text-muted-foreground">
                Soon
              </span>
            </Button>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

// Lucide icon used in the task breakdown section header
const ClipboardList = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={17}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export default SimulationResultPage;

