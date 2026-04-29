/**
 * projectEmbedding.service.ts
 *
 * Generates and stores recommendation embeddings for Project documents.
 *
 * Only the embedding fields on the project document are written — no other
 * project data is mutated. Embedding arrays are never returned to callers;
 * only safe summary metadata is exposed.
 *
 * Usage:
 *   import { generateAndStoreProjectEmbedding, generateMissingProjectEmbeddings }
 *     from "./projectEmbedding.service";
 */

import { Project } from "../models/project.model";
import { buildProjectEmbeddingText } from "./embeddingText.service";
import { generateEmbedding } from "./embeddingClient.service";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProjectEmbeddingSummary {
  projectId: string;
  title: string;
  embeddingGenerated: true;
  model: string;
  dimensions: number;
  textLength: number;
  updatedAt: Date;
}

export interface ProjectEmbeddingFailure {
  projectId: string;
  title: string;
  embeddingGenerated: false;
  error: string;
}

export type ProjectEmbeddingResult = ProjectEmbeddingSummary | ProjectEmbeddingFailure;

export interface BatchEmbeddingResult {
  processed: number;
  succeeded: number;
  failed: number;
  results: ProjectEmbeddingResult[];
}

// How many projects to process in a single batch request
const BATCH_LIMIT = 10;

// ── Single project ─────────────────────────────────────────────────────────────

/**
 * Generate and persist an embedding for a single project.
 *
 * Steps:
 *  1. Load the project (with embedding fields explicitly selected)
 *  2. Build the embedding text
 *  3. Call the Python embedding service
 *  4. Write the 4 embedding fields back to MongoDB
 *  5. Return a safe summary (no raw vector)
 *
 * @throws if the project is not found, the embedding service fails, or save fails
 */
export async function generateAndStoreProjectEmbedding(
  projectId: string,
): Promise<ProjectEmbeddingSummary> {
  // Load project — select the normally-hidden embedding fields so we can overwrite them
  const project = await Project.findById(projectId)
    .select(
      "+recommendationEmbedding +recommendationEmbeddingText +recommendationEmbeddingModel +recommendationEmbeddingUpdatedAt",
    )
    .exec();

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Build the embedding input text
  const text = buildProjectEmbeddingText(project);

  // Call the Python microservice
  const { embedding, model, dimensions } = await generateEmbedding(text);

  // Persist the embedding fields
  project.recommendationEmbedding = embedding;
  project.recommendationEmbeddingText = text;
  project.recommendationEmbeddingModel = model;
  project.recommendationEmbeddingUpdatedAt = new Date();

  try {
    await project.save();
  } catch (err: any) {
    throw new Error(
      `Failed to save embedding for project "${project.title}" (${projectId}): ${err?.message ?? err}`,
    );
  }

  return {
    projectId: project._id.toString(),
    title: project.title,
    embeddingGenerated: true,
    model,
    dimensions,
    textLength: text.length,
    updatedAt: project.recommendationEmbeddingUpdatedAt!,
  };
}

// ── Batch ──────────────────────────────────────────────────────────────────────

/**
 * Find projects that are missing an embedding (or have an empty vector) and
 * generate embeddings for them one at a time.
 *
 * Strategy:
 *  - Prefer "Open" status projects so the most actively-browsed projects are
 *    processed first.
 *  - Cap at BATCH_LIMIT (10) per invocation so the request never times out.
 *  - A failure on one project is logged and recorded, but does not stop
 *    processing of subsequent projects.
 *
 * Returns a summary of what was processed, succeeded, and failed.
 */
export async function generateMissingProjectEmbeddings(): Promise<BatchEmbeddingResult> {
  // Find projects where the embedding is absent or an empty array.
  // The field has select:false so we must explicitly select it for the query.
  const candidates = await Project.find(
    {
      $or: [
        { recommendationEmbedding: { $exists: false } },
        { recommendationEmbedding: { $size: 0 } },
        { recommendationEmbedding: null },
      ],
    },
    "_id title status",
  )
    // "Open" first — more likely to be shown to users right now
    .sort({ status: 1, createdAt: -1 }) // "Open" sorts before "Ongoing"/"Filled"/"Finished" alphabetically
    .limit(BATCH_LIMIT)
    .lean()
    .exec();

  // Sort so "Open" projects are processed before others regardless of Mongo sort order
  const sorted = [...candidates].sort((a, b) => {
    if (a.status === "Open" && b.status !== "Open") return -1;
    if (a.status !== "Open" && b.status === "Open") return 1;
    return 0;
  });

  const results: ProjectEmbeddingResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const doc of sorted) {
    const id = doc._id.toString();
    try {
      const summary = await generateAndStoreProjectEmbedding(id);
      results.push(summary);
      succeeded++;
      console.log(`[projectEmbedding] ✓ ${doc.title} (${id})`);
    } catch (err: any) {
      const errorMsg = err?.message ?? String(err);
      console.error(`[projectEmbedding] ✗ ${doc.title} (${id}): ${errorMsg}`);
      results.push({
        projectId: id,
        title: doc.title,
        embeddingGenerated: false,
        error: errorMsg,
      });
      failed++;
    }
  }

  return {
    processed: sorted.length,
    succeeded,
    failed,
    results,
  };
}
