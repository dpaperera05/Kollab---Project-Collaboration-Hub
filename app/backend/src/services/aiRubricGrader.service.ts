/**
 * aiRubricGrader.service.ts
 *
 * Placeholder AI rubric grading service for written_response tasks.
 *
 * When AI_GRADING_ENABLED=true this is where an LLM call (e.g. OpenAI) would
 * be wired in. Until that integration is built the service returns a safe
 * zero-score result so the rest of the scoring pipeline always has a
 * well-shaped IAIGradingResult to work with.
 *
 * The backend will never crash due to AI grading being unavailable.
 */

import type { ISimulationTask, IRubricItem } from "../models/simulation.model";
import type { IAIGradingResult, IAIRubricScore } from "../models/simulationAttempt.model";

export interface AIGraderInput {
  task: ISimulationTask;
  userAnswer: string;
  rubric: IRubricItem[];
  modelAnswer?: string;
  maxPoints: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const isAIEnabled = (): boolean =>
  process.env.AI_GRADING_ENABLED === "true";

/**
 * Build a zero-score result for every rubric criterion.
 * Used when AI grading is skipped or fails.
 */
const buildSkippedResult = (
  taskId: string,
  rubric: IRubricItem[],
  reason: string
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
    pending: false,
    error: reason,
  };
};

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Grade a single written_response task against its rubric.
 *
 * Returns a fully-shaped IAIGradingResult in all cases — never throws.
 */
export const gradeWrittenResponse = async (
  input: AIGraderInput
): Promise<IAIGradingResult> => {
  const { task, rubric, userAnswer: _userAnswer, modelAnswer: _modelAnswer } = input;

  // ── Guard: AI grading disabled ────────────────────────────────────────────
  if (!isAIEnabled()) {
    return buildSkippedResult(
      task.id,
      rubric,
      "AI grading is currently disabled. This response has not been scored. " +
        "Enable AI grading by setting AI_GRADING_ENABLED=true in your environment."
    );
  }

  // ── Guard: AI grading enabled but not yet implemented ────────────────────
  // Replace this block with a real LLM call when ready.
  try {
    return buildSkippedResult(
      task.id,
      rubric,
      "AI grading is enabled but the grading provider is not yet configured. " +
        "This response has been recorded and will receive 0 marks until a grading " +
        "provider is set up."
    );
  } catch (err) {
    // Defensive catch — if anything in the future implementation throws, we
    // degrade gracefully rather than crashing the submission pipeline.
    const message =
      err instanceof Error ? err.message : "Unknown error during AI grading";

    return buildSkippedResult(
      task.id,
      rubric,
      `AI grading encountered an unexpected error: ${message}. ` +
        "This response has been recorded with 0 marks."
    );
  }
};
