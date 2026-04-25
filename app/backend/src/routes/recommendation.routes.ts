import { Router } from "express";
import { optionalAuth } from "../middleware/auth.middleware";
import { getRecommendedProjects } from "../controllers/recommendation.controller";

const router = Router();

// GET /api/recommendations/projects
// Works for both guests (returns latest open projects) and authenticated users
// (returns personalised scored recommendations).
router.get("/projects", optionalAuth, getRecommendedProjects);

export default router;
