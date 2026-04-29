import { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { getAssistantReply } from "../services/aiAssistant.service";
import type { AssistantMessage } from "../services/aiAssistant.service";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_CONTENT_LENGTH = 2000;
const VALID_ROLES = new Set(["user", "assistant"]);

// ── Controller ────────────────────────────────────────────────────────────────

export const chatWithAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // Auth guard — authenticate middleware sets userId; double-check here
  if (!req.userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { messages } = req.body ?? {};

  // Validate: messages must be a non-empty array
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({
      success: false,
      message: "messages must be a non-empty array.",
    });
    return;
  }

  // Validate each message entry
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (typeof msg !== "object" || msg === null) {
      res.status(400).json({
        success: false,
        message: `messages[${i}] must be an object with role and content.`,
      });
      return;
    }

    if (!VALID_ROLES.has(msg.role)) {
      res.status(400).json({
        success: false,
        message: `messages[${i}].role must be "user" or "assistant".`,
      });
      return;
    }

    if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: `messages[${i}].content must be a non-empty string.`,
      });
      return;
    }

    if (msg.content.length > MAX_MESSAGE_CONTENT_LENGTH) {
      res.status(400).json({
        success: false,
        message: `messages[${i}].content exceeds the maximum length of ${MAX_MESSAGE_CONTENT_LENGTH} characters.`,
      });
      return;
    }
  }

  // Trim history to the latest N messages to limit context window and cost
  const trimmedMessages: AssistantMessage[] = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((msg: { role: "user" | "assistant"; content: string }) => ({
      role: msg.role,
      content: msg.content.trim(),
    }));

  try {
    const { reply } = await getAssistantReply(trimmedMessages);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    console.error(
      "[aiAssistant controller] Service error:",
      err instanceof Error ? err.message : "unknown error"
    );
    res.status(500).json({
      success: false,
      message: "AI assistant is temporarily unavailable.",
    });
  }
};
