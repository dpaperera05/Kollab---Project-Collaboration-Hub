import { Request, Response } from "express";
import { Simulation } from "../models/simulation.model";
import { SimulationAttempt } from "../models/simulationAttempt.model";
import {
  gradeSimulationAttempt,
  normaliseAnswers,
  type SubmittedAnswer,
} from "../services/simulationScoring.service";
import type { AuthRequest } from "../middleware/auth.middleware";

// ── Field projection helpers ──────────────────────────────────────────────────

/**
 * Fields stripped from tasks before sending to the client.
 * Correct answers must never be exposed before or during an attempt.
 */
const TASK_SENSITIVE_FIELDS = new Set([
  "correctAnswer",
  "correctAnswers",
  "correctOrder",
  "rubric",
  "modelAnswer",
  "explanation",
]);

const stripSensitiveTaskFields = (task: Record<string, unknown>) => {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(task)) {
    if (!TASK_SENSITIVE_FIELDS.has(key)) safe[key] = value;
  }
  return safe;
};

const sanitiseSimulationForClient = (sim: Record<string, unknown>) => {
  const stages = (sim.stages as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    ...sim,
    stages: stages.map((stage) => ({
      ...stage,
      tasks: ((stage.tasks as Array<Record<string, unknown>>) ?? []).map(
        stripSensitiveTaskFields
      ),
    })),
  };
};

/**
 * Build a lean summary object for the list view.
 * Counts totalTasks / totalStages; omits stage/task details entirely.
 */
const buildSimulationSummary = (sim: Record<string, unknown>) => {
  const stages = (sim.stages as Array<{ tasks?: unknown[] }> | undefined) ?? [];
  const totalTasks = stages.reduce((n, s) => n + (s.tasks?.length ?? 0), 0);

  return {
    _id: sim._id,
    title: sim.title,
    slug: sim.slug,
    roleCategory: sim.roleCategory,
    difficulty: sim.difficulty,
    estimatedMinutes: sim.estimatedMinutes,
    xp: sim.xp,
    overview: sim.overview,
    skillsAssessed: sim.skillsAssessed,
    tags: sim.tags,
    isPublished: sim.isPublished,
    status: sim.status,
    passMark: sim.passMark,
    totalStages: stages.length,
    totalTasks,
    createdAt: sim.createdAt,
    updatedAt: sim.updatedAt,
  };
};

// ── Validation helpers ────────────────────────────────────────────────────────

const isStringOrStringArray = (v: unknown): v is string | string[] =>
  typeof v === "string" || Array.isArray(v);

const isAnswerArray = (
  raw: unknown
): raw is Array<{ taskId: string; value: unknown }> => {
  if (!Array.isArray(raw)) return false;
  return raw.every(
    (a) =>
      a !== null &&
      typeof a === "object" &&
      typeof (a as Record<string, unknown>).taskId === "string" &&
      isStringOrStringArray((a as Record<string, unknown>).value)
  );
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/simulations
 * Public — returns published active simulations with optional filters.
 */
export const listSimulations = async (req: Request, res: Response) => {
  try {
    const { roleCategory, difficulty, search } = req.query;

    const filter: Record<string, unknown> = {
      isPublished: true,
      status: "active",
    };

    if (typeof roleCategory === "string" && roleCategory.trim()) {
      filter.roleCategory = roleCategory.trim();
    }

    if (
      typeof difficulty === "string" &&
      ["Beginner", "Intermediate", "Advanced"].includes(difficulty.trim())
    ) {
      filter.difficulty = difficulty.trim();
    }

    if (typeof search === "string" && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { overview: { $regex: escaped, $options: "i" } },
        { tags: { $regex: escaped, $options: "i" } },
        { skillsAssessed: { $regex: escaped, $options: "i" } },
      ];
    }

    const simulations = await Simulation.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const data = simulations.map((s) =>
      buildSimulationSummary(s as unknown as Record<string, unknown>)
    );

    return res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error("[listSimulations]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch simulations" });
  }
};

/**
 * GET /api/simulations/:slug
 * Public — returns full simulation by slug, with sensitive fields stripped.
 */
export const getSimulationBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const simulation = await Simulation.findOne({
      slug,
      isPublished: true,
      status: "active",
    }).lean();

    if (!simulation) {
      return res
        .status(404)
        .json({ success: false, message: "Simulation not found" });
    }

    const data = sanitiseSimulationForClient(
      simulation as unknown as Record<string, unknown>
    );

    return res.json({ success: true, data });
  } catch (err) {
    console.error("[getSimulationBySlug]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch simulation" });
  }
};

/**
 * POST /api/simulations/:slug/start
 * Authenticated — creates or returns an in_progress attempt.
 */
export const startSimulation = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorised" });
    }

    const { slug } = req.params;

    const simulation = await Simulation.findOne({
      slug,
      isPublished: true,
      status: "active",
    }).lean();

    if (!simulation) {
      return res
        .status(404)
        .json({ success: false, message: "Simulation not found" });
    }

    // Return existing in_progress attempt rather than creating a duplicate
    const existing = await SimulationAttempt.findOne({
      userId,
      simulationId: simulation._id,
      status: "in_progress",
    }).lean();

    if (existing) {
      return res.json({
        success: true,
        data: existing,
        message: "Returning existing in-progress attempt",
      });
    }

    const attempt = await SimulationAttempt.create({
      userId,
      simulationId: simulation._id,
      status: "in_progress",
      startedAt: new Date(),
    });

    return res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    console.error("[startSimulation]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to start simulation" });
  }
};

/**
 * POST /api/simulations/:slug/submit
 * Authenticated — grades answers and persists a completed attempt.
 */
export const submitSimulation = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorised" });
    }

    const { slug } = req.params;

    // Validate body
    const rawAnswers = (req.body as Record<string, unknown>).answers;
    if (!isAnswerArray(rawAnswers)) {
      return res.status(400).json({
        success: false,
        message:
          "Request body must contain an answers array of { taskId: string, value: string | string[] }",
      });
    }

    const answers: SubmittedAnswer[] = rawAnswers;

    const simulation = await Simulation.findOne({
      slug,
      isPublished: true,
      status: "active",
    });

    if (!simulation) {
      return res
        .status(404)
        .json({ success: false, message: "Simulation not found" });
    }

    // Grade
    const result = await gradeSimulationAttempt(simulation, answers);

    const now = new Date();

    // Find an existing in_progress attempt to update, or create fresh
    const existingAttempt = await SimulationAttempt.findOne({
      userId,
      simulationId: simulation._id,
      status: "in_progress",
    });

    const attemptData = {
      status: "completed" as const,
      submittedAt: now,
      completedAt: now,
      answers: normaliseAnswers(answers),
      ruleBasedResults: result.ruleBasedResults,
      aiGradingResults: result.aiGradingResults,
      earnedPoints: result.earnedPoints,
      totalPoints: result.totalPoints,
      finalScore: result.finalScore,
      passed: result.passed,
      xpEarned: result.xpEarned,
      skillBreakdown: result.skillBreakdown,
      feedbackSummary: result.feedbackSummary,
      strengths: result.strengths,
      improvements: result.improvements,
      badgeEarned: Boolean(result.badgeEarned),
      portfolioEligible: result.portfolioEligible,
    };

    let savedAttempt;

    if (existingAttempt) {
      Object.assign(existingAttempt, attemptData);
      savedAttempt = await existingAttempt.save();
    } else {
      savedAttempt = await SimulationAttempt.create({
        userId,
        simulationId: simulation._id,
        startedAt: now,
        ...attemptData,
      });
    }

    return res.json({
      success: true,
      data: {
        attempt: savedAttempt,
        result: {
          finalScore: result.finalScore,
          passed: result.passed,
          xpEarned: result.xpEarned,
          earnedPoints: result.earnedPoints,
          totalPoints: result.totalPoints,
          skillBreakdown: result.skillBreakdown,
          feedbackSummary: result.feedbackSummary,
          strengths: result.strengths,
          improvements: result.improvements,
          badgeEarned: result.badgeEarned ?? null,
          portfolioEligible: result.portfolioEligible,
        },
      },
    });
  } catch (err) {
    console.error("[submitSimulation]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit simulation" });
  }
};

/**
 * GET /api/simulations/me/attempts
 * Authenticated — returns all attempts for the logged-in user.
 */
export const getMyAttempts = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorised" });
    }

    const attempts = await SimulationAttempt.find({ userId })
      .populate(
        "simulationId",
        "title slug roleCategory difficulty estimatedMinutes xp"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: attempts, total: attempts.length });
  } catch (err) {
    console.error("[getMyAttempts]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch attempts" });
  }
};

/**
 * GET /api/simulations/:slug/attempts/mine
 * Authenticated — returns the latest attempt for a given simulation.
 */
export const getMyAttemptForSimulation = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorised" });
    }

    const { slug } = req.params;

    const simulation = await Simulation.findOne({ slug }).select("_id").lean();
    if (!simulation) {
      return res
        .status(404)
        .json({ success: false, message: "Simulation not found" });
    }

    const attempt = await SimulationAttempt.findOne({
      userId,
      simulationId: simulation._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: attempt ?? null });
  } catch (err) {
    console.error("[getMyAttemptForSimulation]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch attempt" });
  }
};
