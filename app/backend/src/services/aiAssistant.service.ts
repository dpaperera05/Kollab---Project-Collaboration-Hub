/**
 * aiAssistant.service.ts
 *
 * Kollab AI Chat Assistant — platform and career readiness guide.
 *
 * Uses the GitHub Models API (fetch-based) as the default provider,
 * mirroring the pattern in aiRubricGrader.service.ts.
 *
 * Env vars:
 *   GITHUB_MODELS_TOKEN     — required; Bearer token for the GitHub Models API
 *   GITHUB_MODELS_ENDPOINT  — optional; defaults to the standard inference URL
 *   AI_CHAT_MODEL           — optional; falls back to AI_GRADING_MODEL then a default
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantReply {
  reply: string;
}

// ── Config helpers ────────────────────────────────────────────────────────────

const getToken = (): string | null => {
  const t = process.env.GITHUB_MODELS_TOKEN?.trim();
  return t && t.length > 0 ? t : null;
};

const getEndpoint = (): string =>
  process.env.GITHUB_MODELS_ENDPOINT?.trim() ||
  "https://models.github.ai/inference/chat/completions";

const getModel = (): string =>
  process.env.AI_CHAT_MODEL?.trim() ||
  process.env.AI_GRADING_MODEL?.trim() ||
  "openai/gpt-4.1-mini";

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Kollab AI Assistant — a helpful, practical guide for the Kollab platform.

Kollab is a university project collaboration hub. It helps students and professionals:
- Discover and apply to collaborative projects
- Build and showcase portfolios
- Connect with mentors and book sessions
- Collaborate in team workspaces
- Practice job skills through simulated job scenarios (job simulations)
- Explore job market insights and trends
- Check and improve their career readiness score
- Network and communicate with collaborators

Your role:
- Help users navigate the Kollab platform effectively.
- Answer questions about projects, portfolios, mentorship, workspaces, simulations, job market, and career readiness.
- Provide clear, practical, and concise guidance.
- Suggest relevant platform features when appropriate.

Strict boundaries — you must follow these at all times:
- You CANNOT apply to projects, book mentors, edit profiles, or make any real changes to user data on the user's behalf.
- If a user asks you to perform a system action (e.g. "apply for me", "book a session", "update my profile"), clearly explain that you cannot perform actions but you can guide them on how to do it themselves within the platform.
- Do not fabricate platform data, user details, project listings, or mentor availability.
- Do not assume the user is logged in or has a profile. You may be speaking with a guest exploring Kollab for the first time.
- You do NOT have access to any user's profile, applications, bookings, saved items, or readiness score unless that information is explicitly shared in the conversation.
- If a user asks about their personal data or wants to take an account-specific action (applying for projects, saving portfolios, booking mentors, tracking their readiness score), encourage them to log in or create an account, then guide them to the relevant platform feature.
- Do not answer questions unrelated to Kollab, career development, collaboration, or professional growth.
- If asked something outside your scope, politely redirect the user back to Kollab-related topics.
- Keep answers concise and actionable. Avoid lengthy essays unless the question clearly requires depth.`;

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Send a conversation history to the AI provider and return the assistant's reply.
 * Never throws raw upstream errors — throws a safe, user-facing Error instead.
 */
export const getAssistantReply = async (
  messages: AssistantMessage[]
): Promise<AssistantReply> => {
  const token = getToken();

  if (!token) {
    console.error("[aiAssistant] GITHUB_MODELS_TOKEN is not configured");
    throw new Error("AI assistant is temporarily unavailable.");
  }

  const endpoint = getEndpoint();
  const model = getModel();

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });
  } catch (err) {
    console.error(
      "[aiAssistant] Network error reaching AI provider:",
      err instanceof Error ? err.message : "unknown error"
    );
    throw new Error("AI assistant is temporarily unavailable.");
  }

  if (!res.ok) {
    // Do not log response body — it may contain sensitive details
    console.error(
      `[aiAssistant] Provider request failed: HTTP ${res.status}`
    );
    throw new Error("AI assistant is temporarily unavailable.");
  }

  let json: { choices?: Array<{ message?: { content?: string } }> };
  try {
    json = (await res.json()) as typeof json;
  } catch (err) {
    console.error(
      "[aiAssistant] Failed to parse provider response as JSON:",
      err instanceof Error ? err.message : "unknown error"
    );
    throw new Error("AI assistant is temporarily unavailable.");
  }

  const reply = json.choices?.[0]?.message?.content?.trim() ?? "";

  if (!reply) {
    console.error("[aiAssistant] Provider returned an empty reply");
    throw new Error("AI assistant is temporarily unavailable.");
  }

  console.info(`[aiAssistant] Reply received via ${model} (${reply.length} chars)`);

  return { reply };
};
