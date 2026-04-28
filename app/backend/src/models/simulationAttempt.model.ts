import { Schema, model, Document, Types } from "mongoose";

// ── Answer structures ────────────────────────────────────────────────────────
// Answers are stored with the task id and a flexible value field so that
// all task types (mcq string, multi_select string[], ordering string[],
// code_review string, written_response string) can be stored uniformly.

export interface ITaskAnswer {
  taskId: string;
  /**
   * The user's submitted answer. Type depends on task:
   *   scenario_mcq / code_review / ui_review → string (chosen option text)
   *   multi_select / ordering               → string[]
   *   written_response                      → string (free text)
   */
  value: string | string[];
}

// ── Rule-based grading result (objective tasks) ──────────────────────────────

export interface IRuleBasedResult {
  taskId: string;
  earnedPoints: number;
  maxPoints: number;
  correct: boolean;
  /** Per-skill points earned from this task. */
  skillPoints: Record<string, number>;
  feedback?: string;
}

// ── AI grading result (written_response tasks) ───────────────────────────────

export interface IAIRubricScore {
  criterion: string;
  earnedScore: number;
  maxScore: number;
  feedback: string;
}

export interface IAIGradingResult {
  taskId: string;
  rubricScores: IAIRubricScore[];
  totalEarned: number;
  totalMax: number;
  /** Per-skill points earned from this task. */
  skillPoints: Record<string, number>;
  overallFeedback?: string;
  /** true while awaiting async AI response; false once graded */
  pending: boolean;
  error?: string;
}

// ── Skill breakdown ──────────────────────────────────────────────────────────

export interface ISkillBreakdown {
  skill: string;
  earnedPoints: number;
  totalPoints: number;
  /** 0–100 percentage */
  score: number;
}

// ── Main attempt interface ───────────────────────────────────────────────────

export interface ISimulationAttempt extends Document {
  userId: string;
  simulationId: Types.ObjectId;

  status: "in_progress" | "submitted" | "completed";
  startedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;

  answers: ITaskAnswer[];

  /** Results from rule-based grading of objective task types */
  ruleBasedResults: IRuleBasedResult[];
  /** Results from AI rubric grading of written_response tasks */
  aiGradingResults: IAIGradingResult[];

  /** Raw points earned across all tasks */
  earnedPoints: number;
  /** Maximum possible points for the simulation */
  totalPoints: number;
  /** 0–100 score derived from earnedPoints / totalPoints */
  finalScore: number;
  passed: boolean;
  xpEarned: number;

  skillBreakdown: ISkillBreakdown[];
  feedbackSummary?: string;
  strengths: string[];
  improvements: string[];

  /** Awarded when finalScore >= 90 */
  badgeEarned: boolean;
  /** True when finalScore >= passMark — makes attempt eligible for portfolio */
  portfolioEligible: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// ── Sub-document schemas ─────────────────────────────────────────────────────

const taskAnswerSchema = new Schema<ITaskAnswer>(
  {
    taskId: { type: String, required: true },
    // Mixed allows string or array of strings
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const ruleBasedResultSchema = new Schema<IRuleBasedResult>(
  {
    taskId: { type: String, required: true },
    earnedPoints: { type: Number, required: true, default: 0 },
    maxPoints: { type: Number, required: true, default: 0 },
    correct: { type: Boolean, required: true, default: false },
    skillPoints: { type: Schema.Types.Mixed, default: {} },
    feedback: { type: String, trim: true },
  },
  { _id: false }
);

const aiRubricScoreSchema = new Schema<IAIRubricScore>(
  {
    criterion: { type: String, required: true, trim: true },
    earnedScore: { type: Number, required: true, default: 0 },
    maxScore: { type: Number, required: true },
    feedback: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const aiGradingResultSchema = new Schema<IAIGradingResult>(
  {
    taskId: { type: String, required: true },
    rubricScores: { type: [aiRubricScoreSchema], default: [] },
    totalEarned: { type: Number, default: 0 },
    totalMax: { type: Number, default: 0 },
    skillPoints: { type: Schema.Types.Mixed, default: {} },
    overallFeedback: { type: String, trim: true },
    pending: { type: Boolean, default: false },
    error: { type: String, trim: true },
  },
  { _id: false }
);

const skillBreakdownSchema = new Schema<ISkillBreakdown>(
  {
    skill: { type: String, required: true, trim: true },
    earnedPoints: { type: Number, required: true, default: 0 },
    totalPoints: { type: Number, required: true, default: 0 },
    score: { type: Number, required: true, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────────────────────

const simulationAttemptSchema = new Schema<ISimulationAttempt>(
  {
    userId: { type: String, required: true, index: true },
    simulationId: { type: Schema.Types.ObjectId, ref: "Simulation", required: true, index: true },

    status: {
      type: String,
      enum: ["in_progress", "submitted", "completed"],
      default: "in_progress",
      index: true,
    },
    startedAt: { type: Date, required: true, default: () => new Date() },
    submittedAt: { type: Date },
    completedAt: { type: Date, index: true },

    answers: { type: [taskAnswerSchema], default: [] },
    ruleBasedResults: { type: [ruleBasedResultSchema], default: [] },
    aiGradingResults: { type: [aiGradingResultSchema], default: [] },

    earnedPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0, min: 0, max: 100 },
    passed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },

    skillBreakdown: { type: [skillBreakdownSchema], default: [] },
    feedbackSummary: { type: String, trim: true },
    strengths: [{ type: String, trim: true }],
    improvements: [{ type: String, trim: true }],

    badgeEarned: { type: Boolean, default: false },
    portfolioEligible: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "simulation_attempts",
  }
);

// One in-progress attempt per user per simulation
simulationAttemptSchema.index({ userId: 1, simulationId: 1 });
// Recent completions per user
simulationAttemptSchema.index({ userId: 1, completedAt: -1 });

export const SimulationAttempt = model<ISimulationAttempt>(
  "SimulationAttempt",
  simulationAttemptSchema
);
