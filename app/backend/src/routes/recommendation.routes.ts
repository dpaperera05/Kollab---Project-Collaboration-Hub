import { Router } from "express";
import { authenticate, optionalAuth } from "../middleware/auth.middleware";
import {
  getRecommendedProjects,
  testEmbedding,
  generateProjectEmbedding,
  generateMissingEmbeddings,
} from "../controllers/recommendation.controller";

const router = Router();

// GET /api/recommendations/projects
// Works for both guests (returns latest open projects) and authenticated users
// (returns personalised scored recommendations).
router.get("/projects", optionalAuth, getRecommendedProjects);

// POST /api/recommendations/test-embedding
// Development-only: verifies the Node backend can reach the Python embedding service.
// Disabled automatically when NODE_ENV=production (handled inside the controller).
router.post("/test-embedding", testEmbedding);

// ── Embedding generation (admin / dev endpoints) ──────────────────────────────
// Both routes require a valid JWT (authenticate).
// No admin-role table exists yet in the schema, so authentication is the
// current protection level. Restrict access via network/firewall in production.

// POST /api/recommendations/projects/generate-missing-embeddings
// Must be declared BEFORE the :projectId route so Express does not
// misinterpret "generate-missing-embeddings" as a projectId.
router.post(
  "/projects/generate-missing-embeddings",
  authenticate,
  generateMissingEmbeddings,
);

// POST /api/recommendations/projects/:projectId/generate-embedding
router.post(
  "/projects/:projectId/generate-embedding",
  authenticate,
  generateProjectEmbedding,
);

export default router;
