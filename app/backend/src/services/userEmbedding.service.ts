/**
 * userEmbedding.service.ts
 *
 * Generates and stores recommendation embeddings inside the User document's
 * profile sub-document.
 *
 * Only the 4 embedding fields are written — no other user or profile data is
 * mutated. Raw embedding arrays are never returned to callers; only safe
 * summary metadata is exposed.
 *
 * PERSISTENCE NOTE:
 * Both the write and the post-write verification use the raw MongoDB driver
 * (User.collection) rather than Mongoose ODM methods.  This is intentional:
 * Mongoose silently strips fields marked `select: false` in a sub-schema
 * during serialization for saves, AND during re-hydration after reads — even
 * when you use the `+field` prefix on `.select()`.  Going through the driver
 * directly bypasses Mongoose's field-selection layer entirely.
 */

import mongoose from "mongoose";
import { User } from "../models/user.model";
import { buildUserRecommendationEmbeddingText } from "./embeddingText.service";
import { generateEmbedding } from "./embeddingClient.service";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserEmbeddingSummary {
  userId: string;
  databaseName: string;
  collectionName: string;
  embeddingGenerated: true;
  model: string;
  dimensions: number;
  textLength: number;
  updatedAt: Date;
  savedPath: "profile.recommendationEmbedding";
  verifiedInRawMongo: boolean;
  storedEmbeddingPreviewLength: number;
  storedEmbeddingModel: string;
  storedEmbeddingUpdatedAt: Date | null;
}

// Minimum number of non-whitespace characters the embedding text must contain
// before we consider the profile "rich enough" to embed.
const MIN_TEXT_LENGTH = 20;

// ── Single user ────────────────────────────────────────────────────────────────

/**
 * Generate and persist a recommendation embedding for a single user.
 *
 * @throws "User not found" if the id does not match any document
 * @throws "User profile does not contain enough recommendation data" if the
 *   profile is empty or produces only whitespace
 * @throws errors from generateEmbedding (service offline, timeout, etc.)
 * @throws "Embedding was generated but not persisted to MongoDB" if the raw
 *   verification step cannot read back what was written
 */
export async function generateAndStoreUserRecommendationEmbedding(
  userId: string,
): Promise<UserEmbeddingSummary> {
  const databaseName = mongoose.connection.name ?? "unknown";
  const collectionName = User.collection.name;

  console.log("[userEmbedding] ── Starting embedding generation ──");
  console.log(`[userEmbedding] database  : ${databaseName}`);
  console.log(`[userEmbedding] collection: ${collectionName}`);
  console.log(`[userEmbedding] userId    : ${userId}`);

  // ── 1. Load the user for text building ────────────────────────────────────
  const user = await User.findById(userId).exec();

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // ── 2. Build embedding text ───────────────────────────────────────────────
  const text = buildUserRecommendationEmbeddingText(user);

  if (!text || text.trim().length < MIN_TEXT_LENGTH) {
    throw new Error(
      "User profile does not contain enough recommendation data. " +
        "Add skills, preferred roles, or domain interests to your profile first.",
    );
  }

  // ── 3. Call the Python microservice ───────────────────────────────────────
  const { embedding, model, dimensions } = await generateEmbedding(text);
  const updatedAt = new Date();

  // ── 4. Write via raw MongoDB driver ───────────────────────────────────────
  // We deliberately bypass Mongoose ODM here.  Mongoose strips `select: false`
  // sub-schema fields both when serializing a `save()` payload and when
  // re-hydrating a `findById().select("+field")` result.  The raw driver has
  // no knowledge of Mongoose schemas and writes exactly what we pass.
  let oid: mongoose.Types.ObjectId;
  try {
    oid = new mongoose.Types.ObjectId(userId);
  } catch {
    throw new Error(`Invalid userId format: "${userId}"`);
  }

  const writeResult = await User.collection.updateOne(
    { _id: oid },
    {
      $set: {
        "profile.recommendationEmbedding": embedding,
        "profile.recommendationEmbeddingText": text,
        "profile.recommendationEmbeddingModel": model,
        "profile.recommendationEmbeddingUpdatedAt": updatedAt,
      },
    },
    { upsert: false },
  );

  console.log(`[userEmbedding] write result — matchedCount=${writeResult.matchedCount}, modifiedCount=${writeResult.modifiedCount}`);

  if (writeResult.matchedCount === 0) {
    throw new Error(`User not found during update: ${userId}`);
  }
  if (writeResult.modifiedCount === 0) {
    // modifiedCount can be 0 if the document already had identical values;
    // treat as success and still verify.
    console.warn(`[userEmbedding] modifiedCount=0 — document may already have an identical embedding.`);
  }

  // ── 5. Verify via raw MongoDB driver ──────────────────────────────────────
  // `$slice: 3` returns only the first 3 elements of the array so we never
  // expose the full 384-number vector in logs or responses.
  const rawUser = await User.collection.findOne(
    { _id: oid },
    {
      projection: {
        "profile.recommendationEmbedding": { $slice: 3 },
        "profile.recommendationEmbeddingText": 1,
        "profile.recommendationEmbeddingModel": 1,
        "profile.recommendationEmbeddingUpdatedAt": 1,
      },
    },
  );

  console.log(`[userEmbedding] raw verification keys: ${rawUser ? Object.keys((rawUser as any)?.profile ?? {}).join(", ") : "null"}`);

  const rawProfile = (rawUser as any)?.profile;
  const rawEmbeddingPreview = rawProfile?.recommendationEmbedding;
  const rawModel = rawProfile?.recommendationEmbeddingModel as string | undefined;
  const rawUpdatedAt = rawProfile?.recommendationEmbeddingUpdatedAt as Date | null | undefined;

  if (!Array.isArray(rawEmbeddingPreview) || rawEmbeddingPreview.length === 0) {
    throw new Error(
      `Embedding was generated but not persisted to MongoDB. ` +
        `Raw read of ${collectionName}.${userId}.profile.recommendationEmbedding returned: ` +
        `${JSON.stringify(rawEmbeddingPreview)}. ` +
        `database="${databaseName}", collection="${collectionName}".`,
    );
  }

  console.log(`[userEmbedding] ✓ verified — preview[0..2]: ${JSON.stringify(rawEmbeddingPreview)}`);

  return {
    userId,
    databaseName,
    collectionName,
    embeddingGenerated: true,
    model,
    dimensions,
    textLength: text.length,
    updatedAt,
    savedPath: "profile.recommendationEmbedding",
    verifiedInRawMongo: true,
    storedEmbeddingPreviewLength: rawEmbeddingPreview.length,
    storedEmbeddingModel: rawModel ?? model,
    storedEmbeddingUpdatedAt: rawUpdatedAt ?? null,
  };
}
