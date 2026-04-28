const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5000";

const SIMULATIONS_BASE = "/api/simulations";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SimulationSummary {
  _id: string;
  title: string;
  slug: string;
  roleCategory: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  xp: number;
  overview: string;
  skillsAssessed: string[];
  tags: string[];
  totalStages: number;
  totalTasks: number;
  isPublished: boolean;
  status: "active" | "inactive";
  passMark: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationTask {
  id: string;
  type:
    | "scenario_mcq"
    | "multi_select"
    | "ordering"
    | "code_review"
    | "ui_review"
    | "written_response";
  title: string;
  prompt: string;
  context?: string;
  options?: string[];
  points: number;
  aiGraded: boolean;
}

export interface SimulationStage {
  id: string;
  title: string;
  narrative: string;
  order: number;
  tasks: SimulationTask[];
}

export interface SimulationDetail extends SimulationSummary {
  workplaceBrief: string;
  stages: SimulationStage[];
}

export interface SkillBreakdown {
  skill: string;
  earnedPoints: number;
  totalPoints: number;
  score: number;
}

export interface AIRubricScore {
  criterion: string;
  earnedScore: number;
  maxScore: number;
  feedback: string;
}

export interface AIGradingResult {
  taskId: string;
  rubricScores: AIRubricScore[];
  totalEarned: number;
  totalMax: number;
  /** Per-skill points earned from this task (matches backend ISkillBreakdown). */
  skillPoints?: Record<string, number>;
  overallFeedback?: string;
  pending: boolean;
  error?: string;
}

export interface RuleBasedResult {
  taskId: string;
  earnedPoints: number;
  maxPoints: number;
  correct: boolean;
  /** Per-skill points earned from this task (matches backend IRuleBasedResult). */
  skillPoints?: Record<string, number>;
  feedback?: string;
}

export interface SimulationAttempt {
  _id: string;
  userId: string;
  simulationId: string | SimulationSummary;
  status: "in_progress" | "submitted" | "completed";
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  /** Saved answers — needed by the player page to pre-populate resumed attempts. */
  answers?: unknown[];
  earnedPoints: number;
  totalPoints: number;
  finalScore: number;
  passed: boolean;
  xpEarned: number;
  skillBreakdown: SkillBreakdown[];
  feedbackSummary?: string;
  strengths: string[];
  improvements: string[];
  badgeEarned: boolean;
  portfolioEligible: boolean;
  ruleBasedResults: RuleBasedResult[];
  aiGradingResults: AIGradingResult[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmittedAnswer {
  taskId: string;
  value: string | string[];
}

export interface SubmitResult {
  finalScore: number;
  passed: boolean;
  xpEarned: number;
  earnedPoints: number;
  totalPoints: number;
  skillBreakdown: SkillBreakdown[];
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
  badgeEarned: string | null;
  portfolioEligible: boolean;
}

export interface SubmitSimulationResponse {
  attempt: SimulationAttempt;
  result: SubmitResult;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const buildUrl = (path: string, query?: Record<string, unknown>): string => {
  const base = `${API_BASE_URL}${SIMULATIONS_BASE}${path}`;
  if (!query) return base;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

const getJson = async <T>(url: string, token?: string): Promise<T> => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
};

const postJson = async <T>(
  url: string,
  body: unknown,
  token: string
): Promise<T> => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(errBody.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
};

// ── Exported API functions ────────────────────────────────────────────────────

export interface FetchSimulationsFilters {
  roleCategory?: string;
  difficulty?: string;
  search?: string;
}

interface ListResponse {
  success: boolean;
  data: SimulationSummary[];
  total: number;
}

export const fetchSimulations = async (
  filters?: FetchSimulationsFilters
): Promise<SimulationSummary[]> => {
  const url = buildUrl("/", filters as Record<string, unknown> | undefined);
  const res = await getJson<ListResponse>(url);
  return res.data;
};

interface DetailResponse {
  success: boolean;
  data: SimulationDetail;
}

export const fetchSimulation = async (slug: string): Promise<SimulationDetail> => {
  const url = buildUrl(`/${encodeURIComponent(slug)}`);
  const res = await getJson<DetailResponse>(url);
  return res.data;
};

interface AttemptResponse {
  success: boolean;
  data: SimulationAttempt;
}

export const startSimulation = async (
  slug: string,
  token: string
): Promise<SimulationAttempt> => {
  const url = buildUrl(`/${encodeURIComponent(slug)}/start`);
  const res = await postJson<AttemptResponse>(url, {}, token);
  return res.data;
};

interface SubmitResponse {
  success: boolean;
  data: SubmitSimulationResponse;
}

export const submitSimulation = async (
  slug: string,
  answers: SubmittedAnswer[],
  token: string
): Promise<SubmitSimulationResponse> => {
  const url = buildUrl(`/${encodeURIComponent(slug)}/submit`);
  const res = await postJson<SubmitResponse>(url, { answers }, token);
  return res.data;
};

interface AttemptsListResponse {
  success: boolean;
  data: SimulationAttempt[];
  total: number;
}

export const fetchMySimulationAttempts = async (
  token: string
): Promise<SimulationAttempt[]> => {
  const url = buildUrl("/me/attempts");
  const res = await getJson<AttemptsListResponse>(url, token);
  return res.data;
};

interface MaybeAttemptResponse {
  success: boolean;
  data: SimulationAttempt | null;
}

export const fetchMyAttemptForSimulation = async (
  slug: string,
  token: string
): Promise<SimulationAttempt | null> => {
  const url = buildUrl(`/${encodeURIComponent(slug)}/attempts/mine`);
  const res = await getJson<MaybeAttemptResponse>(url, token);
  return res.data;
};
