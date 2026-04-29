import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { chatWithAssistant } from "../controllers/aiAssistant.controller";

const router = Router();

// POST /api/ai-assistant/chat
router.post("/chat", authenticate, chatWithAssistant);

export default router;
