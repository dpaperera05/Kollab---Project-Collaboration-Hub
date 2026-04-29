import { apiPost } from "@/lib/api";

type AssistantRole = "user" | "assistant";
export type AssistantApiMessage = { role: AssistantRole; content: string };

type ChatResponse = {
  success: boolean;
  data?: { reply?: string };
  message?: string;
};

/**
 * Send a conversation history to the Kollab AI Assistant endpoint and return
 * the assistant's reply string.  Throws on network errors or unsuccessful
 * responses so the caller can decide how to surface the failure.
 */
export const chatWithAssistant = async (
  messages: AssistantApiMessage[]
): Promise<string> => {
  const res = await apiPost<ChatResponse>("/ai-assistant/chat", { messages });

  if (!res.success || !res.data?.reply) {
    throw new Error(res.message ?? "AI assistant returned an empty response.");
  }

  return res.data.reply;
};
