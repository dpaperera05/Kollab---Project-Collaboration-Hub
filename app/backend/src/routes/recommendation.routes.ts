import { Router } from "express";
import { optionalAuth } from "../middleware/auth.middleware";
import { getRecommendedProjects, testEmbedding } from "../controllers/recommendation.controller";

const router = Router();

// GET /api/recommendations/projects
// Works for both guests (returns latest open projects) and authenticated users
// (returns personalised scored recommendations).
router.get("/projects", optionalAuth, getRecommendedProjects);

// POST /api/recommendations/test-embedding
// Development-only: verifies the Node backend can reach the Python embedding service.
// Disabled automatically when NODE_ENV=production (handled inside the controller).
router.post("/test-embedding", testEmbedding);

export default router;
