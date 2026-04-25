import { Router } from "express";
import { authenticate, optionalAuth } from "../middleware/auth.middleware";
import {
  getRecommendedProjects,
  getRecommendationDebugQuality,
  testEmbedding,
  generateProjectEmbedding,
  generateMissingEmbeddings,
  generateMyUserEmbedding,
  generateUserEmbeddingById,
} from "../controllers/recommendation.controller";

const router = Router();

// GET /api/recommendations/projects/debug-quality
// Development-only: structured scoring breakdown for the logged-in user.
// Returns 404 automatically when NODE_ENV=production (handled inside the controller).
// Must be declared BEFORE /projects so Express does not match "debug-quality"
// against the plain /projects GET handler.
router.get("/projects/debug-quality", authenticate, getRecommendationDebugQuality);

// GET /api/recommendations/projects
// Works for both guests (returns latest open projects) and authenticated users
// (returns personalised scored recommendations).
router.get("/projects", optionalAuth, getRecommendedProjects);

// POST /api/recommendations/test-embedding
// Development-only: verifies the Node backend can reach the Python embedding service.
// Disabled automatically when NODE_ENV=production (handled inside the controller).
router.post("/test-embedding", testEmbedding);

// ── Project embedding generation (admin / dev endpoints) ──────────────────────
// Both routes require a valid JWT (authenticate).
// No admin-role table exists yet in the schema, so authentication is the
// current protection level.

// Must be declared BEFORE the :projectId route so Express does not
// misinterpret "generate-missing-embeddings" as a projectId.
router.post(
  "/projects/generate-missing-embeddings",
  authenticate,
  generateMissingEmbeddings,
);

router.post(
  "/projects/:projectId/generate-embedding",
  authenticate,
  generateProjectEmbedding,
);

// ── User embedding generation (authenticated) ──────────────────────────────────
// /me must be declared BEFORE /:userId so Express doesn't treat the literal
// string "me" as a userId parameter.

// POST /api/recommendations/users/me/generate-embedding
// Generate embedding for the currently logged-in user.
router.post("/users/me/generate-embedding", authenticate, generateMyUserEmbedding);

// POST /api/recommendations/users/:userId/generate-embedding
// Generate embedding for any user by id. Admin / development use.
router.post("/users/:userId/generate-embedding", authenticate, generateUserEmbeddingById);

export default router;
