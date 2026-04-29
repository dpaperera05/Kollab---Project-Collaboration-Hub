/**
 * embeddingClient.service.ts
 *
 * HTTP client for the Python FastAPI embedding microservice.
 *
 * Responsibilities:
 *  - Send text to POST /embed on the Python service
 *  - Validate the response shape and dimensions
 *  - Provide clear error messages when the service is unavailable or misbehaves
 *
 * This file is the only place in the Node backend that communicates directly
 * with the embedding service. All other code should import generateEmbedding
 * from here rather than calling the Python service directly.
 */

import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, EMBEDDING_SERVICE_URL } from "../config/embedding";

/** How long to wait for the embedding service before giving up (ms). */
const REQUEST_TIMEOUT_MS = 15_000;

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
}

/**
 * Send `text` to the Python embedding service and return the embedding vector.
 *
 * @throws if the text is empty
 * @throws if the service is offline or the request times out
 * @throws if the response does not match the expected shape or dimensions
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // ── Input validation ───────────────────────────────────────────────────────
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("generateEmbedding: text must be a non-empty string.");
  }

  const trimmedText = text.trim();

  // ── Build the request with a timeout ──────────────────────────────────────
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let rawResponse: Response;

  try {
    rawResponse = await fetch(`${EMBEDDING_SERVICE_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmedText }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutHandle);

    // AbortError means the timeout fired
    if (err?.name === "AbortError") {
      throw new Error(
        `Embedding service timed out after ${REQUEST_TIMEOUT_MS / 1000}s. ` +
          `Is the Python service running at ${EMBEDDING_SERVICE_URL}?`,
      );
    }

    // Any other network error (ECONNREFUSED, DNS failure, etc.)
    throw new Error(
      `Embedding service is unreachable at ${EMBEDDING_SERVICE_URL}. ` +
        `Start it with: uvicorn main:app --reload --port 8001\n` +
        `Original error: ${String(err?.message ?? err)}`,
    );
  } finally {
    clearTimeout(timeoutHandle);
  }

  // ── Parse response body ────────────────────────────────────────────────────
  let body: any;
  try {
    body = await rawResponse.json();
  } catch {
    throw new Error(
      `Embedding service returned a non-JSON response (HTTP ${rawResponse.status}).`,
    );
  }

  if (!rawResponse.ok) {
    throw new Error(
      `Embedding service returned HTTP ${rawResponse.status}: ${body?.detail ?? JSON.stringify(body)}`,
    );
  }

  // ── Validate response shape ────────────────────────────────────────────────
  if (body?.success !== true) {
    throw new Error(`Embedding service returned success=false: ${JSON.stringify(body)}`);
  }

  if (!Array.isArray(body?.embedding) || body.embedding.length === 0) {
    throw new Error(
      "Embedding service response is missing a valid 'embedding' array.",
    );
  }

  if (body.dimensions !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding dimensions mismatch: expected ${EMBEDDING_DIMENSIONS}, ` +
        `received ${body.dimensions}. ` +
        `If the model changed, all stored embeddings must be regenerated.`,
    );
  }

  if (body.model !== EMBEDDING_MODEL) {
    // Warn but do not fail — allows safe model upgrades with a flag later
    console.warn(
      `[embeddingClient] Model mismatch: expected "${EMBEDDING_MODEL}", ` +
        `received "${body.model}". Consider regenerating stored embeddings.`,
    );
  }

  return {
    embedding: body.embedding as number[],
    model: body.model as string,
    dimensions: body.dimensions as number,
  };
}
