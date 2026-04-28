import { Schema, model, Document } from "mongoose";

// ── Role categories ──────────────────────────────────────────────────────────

export const ROLE_CATEGORIES = [
  "Software Engineer",
  "UI/UX Designer",
  "Project Manager",
  "DevOps Engineer",
  "AI/ML Engineer",
  "Data Analyst",
  "QA Engineer",
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number];

// ── Task types ───────────────────────────────────────────────────────────────

export const TASK_TYPES = [
  "scenario_mcq",
  "multi_select",
  "ordering",
  "code_review",
  "ui_review",
  "written_response",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

// ── Sub-document interfaces ──────────────────────────────────────────────────

export interface IRubricItem {
  criterion: string;
  maxScore: number;
  description?: string;
  /** Map of skill name → weight (0–1 or absolute). Stored as Mixed. */
  skillWeights?: Record<string, number>;
}

export interface ISimulationTask {
  id: string;
  type: TaskType;
  title: string;
  prompt: string;
  /** Optional contextual detail shown to the user (code snippet, screenshot URL, etc.) */
  context?: string;
  /** For scenario_mcq and multi_select */
  options?: string[];
  /** Single correct answer string (scenario_mcq, code_review, ui_review) */
  correctAnswer?: string;
  /** Multiple correct answers (multi_select) */
  correctAnswers?: string[];
  /** Correct ordering of option strings (ordering task) */
  correctOrder?: string[];
  points: number;
  /** Map of skill name → weight contributed by this task. Stored as Mixed. */
  skillWeights?: Record<string, number>;
  /** Shown to the user after submission */
  explanation?: string;
  /** Model answer shown for written_response tasks */
  modelAnswer?: string;
  /** If true, scoring is delegated to the AI rubric grader */
  aiGraded: boolean;
  rubric?: IRubricItem[];
}

export interface ISimulationStage {
  id: string;
  title: string;
  /** Workplace narrative / scenario context for the stage */
  narrative: string;
  order: number;
  tasks: ISimulationTask[];
}

export interface ISimulation extends Document {
  title: string;
  slug: string;
  roleCategory: RoleCategory;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  xp: number;
  overview: string;
  workplaceBrief: string;
  skillsAssessed: string[];
  tags: string[];
  status: "active" | "inactive";
  isPublished: boolean;
  /** Minimum finalScore (0–100) required to pass. Default 70. */
  passMark: number;
  stages: ISimulationStage[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Sub-document schemas ─────────────────────────────────────────────────────

const rubricItemSchema = new Schema<IRubricItem>(
  {
    criterion: { type: String, required: true, trim: true },
    maxScore: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    skillWeights: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const taskSchema = new Schema<ISimulationTask>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: TASK_TYPES,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    prompt: { type: String, required: true, trim: true },
    context: { type: String, trim: true },
    options: [{ type: String, trim: true }],
    correctAnswer: { type: String, trim: true },
    correctAnswers: [{ type: String, trim: true }],
    correctOrder: [{ type: String, trim: true }],
    points: { type: Number, required: true, min: 0 },
    skillWeights: { type: Schema.Types.Mixed, default: {} },
    explanation: { type: String, trim: true },
    modelAnswer: { type: String, trim: true },
    aiGraded: { type: Boolean, default: false },
    rubric: { type: [rubricItemSchema], default: [] },
  },
  { _id: false }
);

const stageSchema = new Schema<ISimulationStage>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    narrative: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    tasks: { type: [taskSchema], default: [] },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────────────────────

const simulationSchema = new Schema<ISimulation>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    roleCategory: {
      type: String,
      enum: ROLE_CATEGORIES,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    xp: { type: Number, required: true, min: 0 },
    overview: { type: String, required: true, trim: true },
    workplaceBrief: { type: String, required: true, trim: true },
    skillsAssessed: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    isPublished: { type: Boolean, default: false, index: true },
    passMark: { type: Number, default: 70, min: 0, max: 100 },
    stages: { type: [stageSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "simulations",
  }
);

// Compound index for public listing queries
simulationSchema.index({ isPublished: 1, status: 1, roleCategory: 1 });

export const Simulation = model<ISimulation>("Simulation", simulationSchema);
