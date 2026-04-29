import { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import {
  getAssistantReply,
  fetchTopProjectsForUser,
} from "../services/aiAssistant.service";
import type { AssistantMessage, ProjectSummary } from "../services/aiAssistant.service";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_CONTENT_LENGTH = 2000;
const VALID_ROLES = new Set(["user", "assistant"]);
// ── Intent detection & context building ──────────────────────────────────────

const RECOMMENDATION_PATTERNS = [
  /recommend.*project/i,
  /suggest.*project/i,
  /suitable.*project/i,
  /project.*to.*(join|work)/i,
  /find me a project/i,
  /which project/i,
  /best project/i,
  /projects? for me/i,
];

const isRecommendationIntent = (text: string): boolean =>
  RECOMMENDATION_PATTERNS.some((re) => re.test(text));

const buildProjectContext = (projects: ProjectSummary[]): string => {
  const header =
    `PROJECT_RECOMMENDATION_CONTEXT:\n` +
    `The logged-in user asked for project recommendations. Use only these real projects from the database:\n\n`;

  if (projects.length === 0) {
    return (
      header +
      `(No open projects with a positive match score are available right now.)\n\n` +
      `Instruction:\n` +
      `Tell the user there are no strong matches at the moment. ` +
      `Suggest they complete or update their profile with more skills and interests, ` +
      `or browse all open projects directly on the Projects page.`
    );
  }

  const list = projects
    .map((p, i) => {
      const roles =
        p.openRoles.map((r) => `${r.title} (${r.level})`).join(", ") || "N/A";
      const tech = p.technologies.join(", ") || "N/A";
      const skills = p.matchedSkills.join(", ") || "None";
      const reasons = p.recommendationReasons.join("; ") || "General match";
      return (
        `${i + 1}. ${p.title}\n` +
        `   Match: ${p.matchPercentage}%\n` +
        `   Domain: ${p.domain}\n` +
        `   Difficulty: ${p.difficulty}\n` +
        `   Technologies: ${tech}\n` +
        `   Open roles: ${roles}\n` +
        `   Matched skills: ${skills}\n` +
        `   Reasons: ${reasons}`
      );
    })
    .join("\n\n");

  return (
    header +
    list +
    `\n\nInstruction:\n` +
    `Recommend the strongest 1–3 options. Do not invent project names. Use only the projects listed above.`
  );
};
// ── Controller ────────────────────────────────────────────────────────────────

export const chatWithAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // req.userId is set by optionalAuth when a valid JWT is present;
  // it is undefined for guests, which is allowed.
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

  // Detect project recommendation intent on the latest user message
  const lastUserMessage =
    trimmedMessages.filter((m) => m.role === "user").at(-1)?.content ?? "";

  let context: string | undefined;
  if (isRecommendationIntent(lastUserMessage) && req.userId) {
    const projects = await fetchTopProjectsForUser(req.userId, 4);
    context = buildProjectContext(projects);
  }

  try {
    const { reply } = await getAssistantReply(trimmedMessages, context);
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
