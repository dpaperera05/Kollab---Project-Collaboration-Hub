/**
 * simulationScoring.service.ts
 *
 * Grades a simulation attempt and produces a fully-shaped result object
 * ready to be persisted onto SimulationAttempt.
 *
 * Supports:
 *   scenario_mcq     — full / zero
 *   multi_select     — partial credit with over-selection penalty
 *   ordering         — partial credit per correct position
 *   code_review      — MCQ-style (correctAnswer) or multi-select style (correctAnswers)
 *   ui_review        — same as code_review
 *   written_response — delegated to aiRubricGrader.service.ts
 */

import type { ISimulation, ISimulationTask, IRubricItem } from "../models/simulation.model";
import type {
  ITaskAnswer,
  IRuleBasedResult,
  IAIGradingResult,
  ISkillBreakdown,
} from "../models/simulationAttempt.model";
import { gradeWrittenResponse } from "./aiRubricGrader.service";

// ── Public input / output types ───────────────────────────────────────────────

export interface SubmittedAnswer {
  taskId: string;
  value: unknown;
}

export interface GradeSimulationResult {
  ruleBasedResults: IRuleBasedResult[];
  aiGradingResults: IAIGradingResult[];
  earnedPoints: number;
  totalPoints: number;
  finalScore: number;
  passed: boolean;
  xpEarned: number;
  skillBreakdown: ISkillBreakdown[];
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
  /** String badge name or undefined */
  badgeEarned: string | undefined;
  portfolioEligible: boolean;
}

// ── Internal accumulator ──────────────────────────────────────────────────────

interface SkillAccumulator {
  earned: number;
  total: number;
}

// ── Safe value parsers ────────────────────────────────────────────────────────

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
};

// ── Skill point distribution helpers ─────────────────────────────────────────

/**
 * Distribute earnedPoints across skills using a task-level skillWeights map.
 * Weights are treated as proportional shares (they don't need to sum to 1).
 */
const distributeTaskSkillPoints = (
  skillWeights: Record<string, number> | undefined,
  earnedPoints: number,
  maxPoints: number,
  skillMap: Map<string, SkillAccumulator>
): Record<string, number> => {
  const weights = skillWeights ?? {};
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const skillPoints: Record<string, number> = {};

  if (entries.length === 0 || maxPoints <= 0) return skillPoints;

  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);

  for (const [skill, weight] of entries) {
    const proportion = weight / totalWeight;
    const taskSkillMax = proportion * maxPoints;
    const taskSkillEarned = proportion * earnedPoints;

    skillPoints[skill] = taskSkillEarned;

    const acc = skillMap.get(skill) ?? { earned: 0, total: 0 };
    acc.earned += taskSkillEarned;
    acc.total += taskSkillMax;
    skillMap.set(skill, acc);
  }

  return skillPoints;
};

/**
 * Distribute AI rubric item scores across skills using rubric-item-level
 * skillWeights.
 */
const distributeRubricSkillPoints = (
  rubric: IRubricItem[],
  rubricScores: { criterion: string; earnedScore: number; maxScore: number }[],
  skillMap: Map<string, SkillAccumulator>
): Record<string, number> => {
  const skillPoints: Record<string, number> = {};

  for (const rubricItem of rubric) {
    const weights = rubricItem.skillWeights ?? {};
    const entries = Object.entries(weights).filter(([, w]) => w > 0);
    if (entries.length === 0) continue;

    const scoreEntry = rubricScores.find((s) => s.criterion === rubricItem.criterion);
    if (!scoreEntry) continue;

    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);

    for (const [skill, weight] of entries) {
      const proportion = weight / totalWeight;
      const criterionEarned = proportion * scoreEntry.earnedScore;
      const criterionMax = proportion * rubricItem.maxScore;

      skillPoints[skill] = (skillPoints[skill] ?? 0) + criterionEarned;

      const acc = skillMap.get(skill) ?? { earned: 0, total: 0 };
      acc.earned += criterionEarned;
      acc.total += criterionMax;
      skillMap.set(skill, acc);
    }
  }

  return skillPoints;
};

// ── Individual task graders ───────────────────────────────────────────────────

const gradeScenarioMcq = (task: ISimulationTask, value: unknown): number => {
  const answer = asString(value);
  if (answer === null || !task.correctAnswer) return 0;
  return answer === task.correctAnswer ? task.points : 0;
};

const gradeMultiSelect = (task: ISimulationTask, value: unknown): number => {
  const selected = asStringArray(value);
  const correct = task.correctAnswers ?? [];

  if (correct.length === 0) return 0;

  const correctSet = new Set(correct);
  const correctSelected = selected.filter((s) => correctSet.has(s)).length;
  const incorrectSelected = selected.filter((s) => !correctSet.has(s)).length;

  // Partial credit: correct answers earn proportional marks; each wrong
  // selection subtracts a quarter-point penalty.
  const perCorrect = task.points / correct.length;
  const raw = correctSelected * perCorrect - incorrectSelected * (perCorrect * 0.25);

  return Math.max(0, Math.min(task.points, raw));
};

const gradeOrdering = (task: ISimulationTask, value: unknown): number => {
  const userOrder = asStringArray(value);
  const correct = task.correctOrder ?? [];

  if (correct.length === 0) return 0;

  const correctPositions = userOrder.reduce((count, item, index) => {
    return count + (correct[index] === item ? 1 : 0);
  }, 0);

  return Math.max(
    0,
    Math.min(task.points, (correctPositions / correct.length) * task.points)
  );
};

/**
 * code_review and ui_review tasks:
 *   - if correctAnswer is set  → treat like scenario_mcq
 *   - if correctAnswers is set → treat like multi_select
 */
const gradeReviewTask = (task: ISimulationTask, value: unknown): number => {
  if (task.correctAnswer) return gradeScenarioMcq(task, value);
  if (task.correctAnswers && task.correctAnswers.length > 0)
    return gradeMultiSelect(task, value);
  return 0;
};

// ── Task index builder ────────────────────────────────────────────────────────

const buildTaskIndex = (simulation: ISimulation): Map<string, ISimulationTask> => {
  const index = new Map<string, ISimulationTask>();
  for (const stage of simulation.stages) {
    for (const task of stage.tasks) {
      index.set(task.id, task);
    }
  }
  return index;
};

// ── Feedback generators ───────────────────────────────────────────────────────

const generateFeedback = (
  skillBreakdown: ISkillBreakdown[],
  finalScore: number,
  passed: boolean,
  portfolioEligible: boolean
): { feedbackSummary: string; strengths: string[]; improvements: string[] } => {
  const sorted = [...skillBreakdown].sort((a, b) => b.score - a.score);

  const strengths = sorted
    .filter((s) => s.score >= 70)
    .slice(0, 2)
    .map((s) => `${s.skill} (${Math.round(s.score)}%)`);

  const improvements = sorted
    .filter((s) => s.score < 70)
    .slice(-2)
    .reverse()
    .map((s) => `${s.skill} (${Math.round(s.score)}%)`);

  const scoreLabel = `${Math.round(finalScore)}%`;
  const passLabel = passed ? "passed" : "did not pass";
  const portfolioLabel = portfolioEligible
    ? "This attempt is eligible as portfolio evidence."
    : "A score of 70% or above is required for portfolio eligibility.";

  const feedbackSummary =
    `You scored ${scoreLabel} and ${passLabel} this simulation. ${portfolioLabel}` +
    (strengths.length > 0
      ? ` Your strongest areas were: ${strengths.join(", ")}.`
      : "") +
    (improvements.length > 0
      ? ` Focus on improving: ${improvements.join(", ")}.`
      : "");

  return { feedbackSummary, strengths, improvements };
};

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Grade all submitted answers against the simulation definition.
 *
 * Never throws — AI grading failures degrade to zero scores with explanatory
 * feedback via aiRubricGrader.service.ts.
 */
export const gradeSimulationAttempt = async (
  simulation: ISimulation,
  answers: SubmittedAnswer[]
): Promise<GradeSimulationResult> => {
  const taskIndex = buildTaskIndex(simulation);
  const answerMap = new Map<string, unknown>(
    answers.map((a) => [a.taskId, a.value])
  );

  const skillMap = new Map<string, SkillAccumulator>();
  const ruleBasedResults: IRuleBasedResult[] = [];
  const aiGradingResults: IAIGradingResult[] = [];

  let earnedPoints = 0;
  let totalPoints = 0;

  // ── Grade each task ───────────────────────────────────────────────────────
  for (const [taskId, task] of taskIndex) {
    totalPoints += task.points;
    const value = answerMap.get(taskId);

    if (task.type === "written_response") {
      // Delegate to AI grader — always returns a safe result
      const userAnswer = asString(value) ?? "";
      const rubric: IRubricItem[] = task.rubric ?? [];
      const aiResult = await gradeWrittenResponse({
        task,
        userAnswer,
        rubric,
        modelAnswer: task.modelAnswer,
        maxPoints: task.points,
      });

      // Distribute skill points using rubric-item weights
      const skillPoints = distributeRubricSkillPoints(
        rubric,
        aiResult.rubricScores,
        skillMap
      );
      aiResult.skillPoints = skillPoints;

      // Accumulate skills that only have task-level weights (fallback)
      if (Object.keys(skillPoints).length === 0 && task.skillWeights) {
        distributeTaskSkillPoints(
          task.skillWeights,
          aiResult.totalEarned,
          aiResult.totalMax > 0 ? aiResult.totalMax : task.points,
          skillMap
        );
      }

      earnedPoints += aiResult.totalEarned;
      aiGradingResults.push(aiResult);
    } else {
      // Objective task
      let taskEarned = 0;
      let feedback: string | undefined;

      switch (task.type) {
        case "scenario_mcq":
          taskEarned = gradeScenarioMcq(task, value);
          break;
        case "multi_select":
          taskEarned = gradeMultiSelect(task, value);
          break;
        case "ordering":
          taskEarned = gradeOrdering(task, value);
          break;
        case "code_review":
        case "ui_review":
          taskEarned = gradeReviewTask(task, value);
          break;
        default:
          taskEarned = 0;
      }

      if (taskEarned < task.points) {
        feedback = task.explanation ?? undefined;
      }

      const skillPoints = distributeTaskSkillPoints(
        task.skillWeights as Record<string, number> | undefined,
        taskEarned,
        task.points,
        skillMap
      );

      const correct =
        task.type === "scenario_mcq" ||
        task.type === "code_review" ||
        task.type === "ui_review"
          ? taskEarned === task.points
          : taskEarned >= task.points * 0.99; // floating-point tolerance

      ruleBasedResults.push({
        taskId,
        earnedPoints: taskEarned,
        maxPoints: task.points,
        correct,
        skillPoints,
        feedback,
      });

      earnedPoints += taskEarned;
    }
  }

  // ── Aggregate scores ──────────────────────────────────────────────────────
  const finalScore =
    totalPoints > 0 ? Math.min(100, (earnedPoints / totalPoints) * 100) : 0;

  const passed = finalScore >= (simulation.passMark ?? 70);

  const xpEarned = passed
    ? simulation.xp
    : Math.round(simulation.xp * 0.4);

  const badgeEarned: string | undefined =
    finalScore >= 90
      ? `${simulation.roleCategory} Excellence Badge`
      : undefined;

  const portfolioEligible = finalScore >= (simulation.passMark ?? 70);

  // ── Build skill breakdown ─────────────────────────────────────────────────
  const skillBreakdown: ISkillBreakdown[] = Array.from(skillMap.entries()).map(
    ([skill, acc]) => ({
      skill,
      earnedPoints: acc.earned,
      totalPoints: acc.total,
      score: acc.total > 0 ? Math.min(100, (acc.earned / acc.total) * 100) : 0,
    })
  );

  // ── Generate feedback ─────────────────────────────────────────────────────
  const { feedbackSummary, strengths, improvements } = generateFeedback(
    skillBreakdown,
    finalScore,
    passed,
    portfolioEligible
  );

  // ── Normalise answers for storage ─────────────────────────────────────────
  // (Caller should persist these — returned here so the controller can store
  //  them alongside the grading results without re-iterating.)

  return {
    ruleBasedResults,
    aiGradingResults,
    earnedPoints,
    totalPoints,
    finalScore,
    passed,
    xpEarned,
    skillBreakdown,
    feedbackSummary,
    strengths,
    improvements,
    badgeEarned,
    portfolioEligible,
  };
};

// ── Convenience: coerce SubmittedAnswer[] → ITaskAnswer[] ─────────────────────
// Used by the controller to store the sanitised answers on the attempt document.

export const normaliseAnswers = (
  answers: SubmittedAnswer[]
): Array<{ taskId: string; value: string | string[] }> =>
  answers.map((a) => ({
    taskId: a.taskId,
    value: Array.isArray(a.value)
      ? asStringArray(a.value)
      : asString(a.value) ?? "",
  }));
