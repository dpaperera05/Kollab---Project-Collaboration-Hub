import { Router } from "express";
import { optionalAuth } from "../middleware/auth.middleware";
import { chatWithAssistant } from "../controllers/aiAssistant.controller";

const router = Router();

// POST /api/ai-assistant/chat
// optionalAuth: guests may use the assistant; req.userId is set for logged-in users.
router.post("/chat", optionalAuth, chatWithAssistant);

export default router;
