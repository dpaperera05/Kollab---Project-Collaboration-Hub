import { Router } from "express";
import { listActivities } from "../controllers/activity.controller";

const router = Router();

// Public feed for a member's recent activity
router.get("/:userId", listActivities);

export default router;