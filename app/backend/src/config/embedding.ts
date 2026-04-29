/**
 * Embedding configuration constants.
 *
 * These values must match the Python FastAPI embedding service.
 *
 * IMPORTANT: If EMBEDDING_MODEL is changed, all stored embeddings in MongoDB
 * must be regenerated from scratch because different models produce vectors in
 * different dimensional spaces with different semantic representations.
 * A stale embedding compared against a fresh one will produce meaningless scores.
 */

export const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

export const EMBEDDING_DIMENSIONS = 384;

export const EMBEDDING_SERVICE_URL =
  process.env.EMBEDDING_SERVICE_URL ?? "http://localhost:8001";
