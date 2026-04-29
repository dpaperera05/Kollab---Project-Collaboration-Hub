import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getContextualGreeting } from "@/components/chatbot/mockReplies";
import { chatWithAssistant } from "@/services/aiAssistantApi";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const makeId = () => Math.random().toString(36).slice(2, 9);

const makeAssistantMessage = (content: string): ChatMessage => ({
  id: makeId(),
  role: "assistant",
  content,
  timestamp: new Date(),
});

export const useChatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const getWelcome = useCallback(
    () => makeAssistantMessage(getContextualGreeting(location.pathname)),
    [location.pathname]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getWelcome()]);

  const open = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setHasUnread(false);
      return !prev;
    });
  }, []);

  const newChat = useCallback(() => {
    setMessages([getWelcome()]);
    setIsTyping(false);
  }, [getWelcome]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Build history: skip the very first assistant greeting, add new user message,
      // then trim to the latest 10 to stay within the backend limit.
      const historyMessages = [...messages, userMsg]
        .filter((m, i) => !(i === 0 && m.role === "assistant"))
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      try {
        const reply = await chatWithAssistant(historyMessages);
        setMessages((prev) => [...prev, makeAssistantMessage(reply)]);
      } catch (err) {
        const status = (err as { status?: number }).status;
        const fallback =
          status === 401
            ? "Please log in to use the Kollab AI Assistant. Once you are logged in, I can help you with projects, portfolios, mentorship, job simulations, and job market insights."
            : "Sorry, I could not reach the AI assistant right now. Please try again in a moment.";
        console.error(
          "[useChatbot] AI request failed:",
          err instanceof Error ? err.message : "unknown error"
        );
        setMessages((prev) => [...prev, makeAssistantMessage(fallback)]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    messages,
    isTyping,
    hasUnread,
    sendMessage,
    newChat,
    pathname: location.pathname,
  };
};
