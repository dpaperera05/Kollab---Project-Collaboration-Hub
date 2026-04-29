import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  listSimulations,
  getSimulationBySlug,
  startSimulation,
  submitSimulation,
  getMyAttempts,
  getMyAttemptForSimulation,
} from "../controllers/simulation.controller";

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/simulations
router.get("/", listSimulations);

// ── Authenticated routes (fixed paths first to avoid :slug conflicts) ─────────

// GET /api/simulations/me/attempts
// MUST be registered before /:slug to prevent "me" matching as a slug.
router.get("/me/attempts", authenticate, getMyAttempts);

// ── Slug-param routes ─────────────────────────────────────────────────────────

// GET /api/simulations/:slug
router.get("/:slug", getSimulationBySlug);

// POST /api/simulations/:slug/start
router.post("/:slug/start", authenticate, startSimulation);

// POST /api/simulations/:slug/submit
router.post("/:slug/submit", authenticate, submitSimulation);

// GET /api/simulations/:slug/attempts/mine
router.get("/:slug/attempts/mine", authenticate, getMyAttemptForSimulation);

export default router;
