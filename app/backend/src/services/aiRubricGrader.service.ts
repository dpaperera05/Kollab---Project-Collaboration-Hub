/**
 * aiRubricGrader.service.ts
 *
 * Multi-provider AI rubric grading service for written_response tasks.
 *
 * Supported providers (AI_GRADING_PROVIDER env var):
 *   "github" — GitHub Models API (fetch-based; GITHUB_MODELS_TOKEN required)
 *   "openai" — OpenAI Platform (openai package; OPENAI_API_KEY required)
 *
 * Behaviour matrix:
 *   AI_GRADING_ENABLED !== "true"    → skipped result (0 marks)
 *   unsupported provider             → skipped result (0 marks)
 *   credentials missing              → skipped result (0 marks)
 *   rubric empty                     → skipped result (0 marks)
 *   API / JSON / validation error    → safe 0-score, user-safe message
 *   valid AI response                → scored IAIGradingResult
 *
 * The submit endpoint must never crash due to AI grading.
 */

import OpenAI from "openai";
import type { ISimulationTask, IRubricItem } from "../models/simulation.model";
import type { IAIGradingResult, IAIRubricScore } from "../models/simulationAttempt.model";

// ── Public input type ─────────────────────────────────────────────────────────

export interface AIGraderInput {
  task: ISimulationTask;
  userAnswer: string;
  rubric: IRubricItem[];
  modelAnswer?: string;
  maxPoints: number;
}

// ── Raw AI response shape (validated before use) ──────────────────────────────

interface RawRubricScore {
  criterion: unknown;
  score: unknown;
  maxScore: unknown;
  feedback: unknown;
}

interface RawAIResponse {
  totalScore: unknown;
  maxScore: unknown;
  rubricScores: unknown;
  overallFeedback: unknown;
  strengths: unknown;
  improvements: unknown;
  confidence: unknown;
}

// ── Config helpers ────────────────────────────────────────────────────────────

const isAIEnabled = (): boolean =>
  process.env.AI_GRADING_ENABLED === "true";

/** "github" is the default; also accepts "openai" */
const getProvider = (): string =>
  (process.env.AI_GRADING_PROVIDER ?? "github").trim().toLowerCase();

const getModel = (): string =>
  process.env.AI_GRADING_MODEL?.trim() || "openai/gpt-4.1-mini";

const getGitHubToken = (): string | null => {
  const t = process.env.GITHUB_MODELS_TOKEN?.trim();
  return t && t.length > 0 ? t : null;
};

const getGitHubEndpoint = (): string =>
  process.env.GITHUB_MODELS_ENDPOINT?.trim() ||
  "https://models.github.ai/inference/chat/completions";

const getOpenAIKey = (): string | null => {
  const k = process.env.OPENAI_API_KEY?.trim();
  return k && k.length > 0 ? k : null;
};

const hasCredentials = (provider: string): boolean => {
  if (provider === "github") return getGitHubToken() !== null;
  if (provider === "openai") return getOpenAIKey() !== null;
  return false;
};

// ── Safe user-facing failure message ─────────────────────────────────────────

const SAFE_FAIL_MESSAGE =
  "AI grading could not be completed. Please try again later.";

// ── Zero-score builder ────────────────────────────────────────────────────────

const buildSkippedResult = (
  taskId: string,
  rubric: IRubricItem[],
  reason: string,
  isPending = false
): IAIGradingResult => {
  const rubricScores: IAIRubricScore[] = rubric.map((item) => ({
    criterion: item.criterion,
    earnedScore: 0,
    maxScore: item.maxScore,
    feedback: reason,
  }));

  const totalMax = rubric.reduce((sum, item) => sum + item.maxScore, 0);

  return {
    taskId,
    rubricScores,
    totalEarned: 0,
    totalMax,
    skillPoints: {},
    overallFeedback: reason,
    pending: isPending,
    error: isPending ? undefined : reason,
  };
};

// ── Prompts ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a strict rubric-based evaluator for a professional job simulation platform.

Rules:
- Grade ONLY using the rubric criteria provided. Do not invent extra criteria.
- Scores must be numbers between 0 and each criterion's maxScore (inclusive).
- Empty, irrelevant, copied, or clearly unsafe answers must receive 0 for all criteria.
- Do not award marks beyond the maximum.
- The recalculated totalScore must equal the sum of all criterion scores.
- Return ONLY valid JSON — no markdown fences, no explanation text outside the JSON object.

Required JSON shape (exactly):
{
  "totalScore": <number>,
  "maxScore": <number>,
  "rubricScores": [
    {
      "criterion": <string — must match the provided criterion name>,
      "score": <number>,
      "maxScore": <number>,
      "feedback": <string — one or two sentences>
    }
  ],
  "overallFeedback": <string — two to four sentences>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "confidence": "low" | "medium" | "high"
}`;

const buildUserPrompt = (input: AIGraderInput): string => {
  const { task, userAnswer, rubric, modelAnswer, maxPoints } = input;

  const rubricText = rubric
    .map(
      (r, i) =>
        `  ${i + 1}. "${r.criterion}" — max ${r.maxScore} marks` +
        (r.description ? `\n     Description: ${r.description}` : "")
    )
    .join("\n");

  const lines: string[] = [
    `TASK TITLE: ${task.title}`,
    `TASK PROMPT: ${task.prompt}`,
  ];

  if (task.context?.trim()) {
    lines.push(`TASK CONTEXT:\n${task.context}`);
  }

  if (modelAnswer?.trim()) {
    lines.push(
      `MODEL ANSWER (for reference only — do not copy verbatim):\n${modelAnswer}`
    );
  }

  lines.push(
    `TOTAL MAX MARKS: ${maxPoints}`,
    `RUBRIC CRITERIA:\n${rubricText}`,
    `CANDIDATE ANSWER:\n${userAnswer?.trim() || "(no answer provided)"}`
  );

  return lines.join("\n\n");
};

// ── JSON fence stripper (some models wrap output in ```json ... ```) ───────────

const stripFences = (text: string): string =>
  text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

// ── Validation ────────────────────────────────────────────────────────────────

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && isFinite(v);

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const normalise = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Match AI rubricScores to canonical rubric items using two strategies:
 *   1. Positional index — AI[i] corresponds to rubric[i]  (order-preserving)
 *   2. Normalised criterion name match (case-insensitive, punctuation-stripped)
 *
 * A missing or unscored criterion fills with 0 rather than failing the whole
 * result, so one missing field does not discard all other earned marks.
 *
 * Returns null only if rubricScores is missing or not an array.
 */
const validateAndBuild = (
  taskId: string,
  raw: RawAIResponse,
  rubric: IRubricItem[],
  maxPoints: number
): IAIGradingResult | null => {
  if (!Array.isArray(raw.rubricScores)) return null;

  const rawScores = raw.rubricScores as RawRubricScore[];
  const rubricScores: IAIRubricScore[] = [];

  for (const [i, item] of rubric.entries()) {
    // Strategy 1 — same positional index
    const byIndex: RawRubricScore | undefined =
      i < rawScores.length ? rawScores[i] : undefined;
    const indexValid =
      byIndex !== undefined &&
      isNumber(byIndex.score) &&
      typeof byIndex.criterion === "string";

    // Strategy 2 — normalised name match (only if index fails)
    const byName: RawRubricScore | undefined = indexValid
      ? byIndex
      : rawScores.find(
          (s) =>
            typeof s.criterion === "string" &&
            normalise(s.criterion) === normalise(item.criterion) &&
            isNumber(s.score)
        );

    const earnedScore =
      byName && isNumber(byName.score)
        ? clamp(byName.score, 0, item.maxScore)
        : 0;

    const feedbackStr =
      byName && typeof byName.feedback === "string"
        ? byName.feedback.trim()
        : "";

    rubricScores.push({
      criterion: item.criterion,
      earnedScore,
      maxScore: item.maxScore,
      feedback: feedbackStr,
    });
  }

  // Recalculate from validated scores — never trust AI's own totalScore
  const totalEarned = rubricScores.reduce((sum, s) => sum + s.earnedScore, 0);
  const totalMax = rubric.reduce((sum, r) => sum + r.maxScore, 0);
  const cappedEarned = Math.min(totalEarned, maxPoints);

  const overallFeedback =
    typeof raw.overallFeedback === "string" && raw.overallFeedback.trim()
      ? raw.overallFeedback.trim()
      : "No overall feedback provided.";

  return {
    taskId,
    rubricScores,
    totalEarned: cappedEarned,
    totalMax,
    skillPoints: {}, // filled by simulationScoring.service via distributeRubricSkillPoints
    overallFeedback,
    pending: false,
  };
};

// ── Provider: GitHub Models (fetch-based) ─────────────────────────────────────

const callGitHubModels = async (input: AIGraderInput): Promise<string> => {
  const token = getGitHubToken();
  if (!token) throw new Error("GITHUB_MODELS_TOKEN is not configured");

  const endpoint = getGitHubEndpoint();
  const model = getModel();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.1,
      max_tokens: 900,
    }),
  });

  if (!res.ok) {
    // Do not include response body — it may contain sensitive details
    console.error(
      `[aiRubricGrader] GitHub Models request failed: HTTP ${res.status}`
    );
    throw new Error(`GitHub Models request failed (HTTP ${res.status})`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return json.choices?.[0]?.message?.content ?? "";
};

// ── Provider: OpenAI Platform (openai package) ────────────────────────────────

let _openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
};

const callOpenAI = async (input: AIGraderInput): Promise<string> => {
  const key = getOpenAIKey();
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const model =
    process.env.AI_GRADING_MODEL?.trim() || "gpt-4.1-mini"; // OpenAI default

  const completion = await getOpenAIClient().chat.completions.create({
    model,
    temperature: 0.1,
    max_tokens: 1000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
};

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Grade a single written_response task against its rubric using the configured
 * AI provider.  Returns a fully-shaped IAIGradingResult in all cases — never
 * throws.
 */
export const gradeWrittenResponse = async (
  input: AIGraderInput
): Promise<IAIGradingResult> => {
  const { task, rubric } = input;

  // Guard: AI grading disabled
  if (!isAIEnabled()) {
    return buildSkippedResult(
      task.id,
      rubric,
      "AI grading is currently disabled. This response has been recorded and " +
        "will receive 0 marks until AI_GRADING_ENABLED=true is set."
    );
  }

  const provider = getProvider();

  // Guard: unsupported provider
  if (provider !== "github" && provider !== "openai") {
    console.error(
      `[aiRubricGrader] Unsupported AI_GRADING_PROVIDER: "${provider}"`
    );
    return buildSkippedResult(task.id, rubric, SAFE_FAIL_MESSAGE);
  }

  // Guard: missing credentials
  if (!hasCredentials(provider)) {
    const varName =
      provider === "github" ? "GITHUB_MODELS_TOKEN" : "OPENAI_API_KEY";
    return buildSkippedResult(
      task.id,
      rubric,
      `AI grading is enabled but ${varName} is not configured. ` +
        "This response has been recorded with 0 marks."
    );
  }

  // Guard: no rubric items
  if (!rubric || rubric.length === 0) {
    return buildSkippedResult(
      task.id,
      rubric,
      "No rubric was defined for this task. It cannot be AI-graded."
    );
  }

  try {
    // Call provider
    const rawContent =
      provider === "github"
        ? await callGitHubModels(input)
        : await callOpenAI(input);

    // Strip markdown fences that some models add around their JSON output
    const cleaned = stripFences(rawContent);

    // Parse JSON
    let parsed: RawAIResponse;
    try {
      parsed = JSON.parse(cleaned) as RawAIResponse;
    } catch {
      console.error(
        "[aiRubricGrader] Failed to parse AI response as JSON. Raw (truncated):",
        cleaned.slice(0, 300)
      );
      return buildSkippedResult(task.id, rubric, SAFE_FAIL_MESSAGE);
    }

    // Validate & build
    const validated = validateAndBuild(task.id, parsed, rubric, input.maxPoints);

    if (!validated) {
      console.error(
        "[aiRubricGrader] AI response failed schema validation:",
        JSON.stringify(parsed).slice(0, 300)
      );
      return buildSkippedResult(task.id, rubric, SAFE_FAIL_MESSAGE);
    }

    console.info(
      `[aiRubricGrader] Graded task "${task.id}" via ${provider}/${getModel()} — ` +
        `${validated.totalEarned}/${validated.totalMax} pts`
    );

    return validated;
  } catch (err) {
    // Log provider error safely — never expose raw messages containing tokens
    console.error(
      "[aiRubricGrader] Provider call failed:",
      err instanceof Error ? err.message : "unknown error"
    );
    return buildSkippedResult(task.id, rubric, SAFE_FAIL_MESSAGE);
  }
};

