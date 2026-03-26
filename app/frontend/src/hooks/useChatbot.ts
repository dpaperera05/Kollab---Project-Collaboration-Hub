import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getMockReply, getContextualGreeting } from "@/components/chatbot/mockReplies";

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
    (text: string) => {
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

      const delay = 600 + Math.random() * 400;

      setTimeout(() => {
        const reply = getMockReply(trimmed);
        setMessages((prev) => [...prev, makeAssistantMessage(reply)]);
        setIsTyping(false);
      }, delay);
    },
    [isTyping]
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
