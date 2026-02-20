import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "@/hooks/useChatbot";
import { getContextualQuickActions, type QuickAction } from "./mockReplies";

interface ChatWidgetProps {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onNewChat: () => void;
  onSend: (text: string) => void;
  pathname: string;
}

const ChatWidget = ({
  isOpen,
  messages,
  isTyping,
  onClose,
  onMinimize,
  onNewChat,
  onSend,
  pathname,
}: ChatWidgetProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const quickActions: QuickAction[] = getContextualQuickActions(pathname);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const el = panelRef.current.querySelector<HTMLElement>(
        'button, textarea, input, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Kollab Assistant chat"
        aria-modal="true"
        className={cn(
          "fixed bottom-24 right-6 z-50",
          "hidden md:flex flex-col",
          "w-[380px] xl:w-[420px]",
          "rounded-2xl border border-border bg-background shadow-2xl overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ height: "min(580px, calc(100vh - 120px))" }}
      >
        <ChatHeader onClose={onClose} onNewChat={onNewChat} onMinimize={onMinimize} />
        <ChatMessages messages={messages} isTyping={isTyping} />
        <ChatInput onSend={onSend} isTyping={isTyping} quickActions={quickActions} />
      </div>

      {/* Mobile bottom sheet */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <div
            className={cn(
              "relative z-10 flex flex-col bg-background border-t border-border rounded-t-2xl",
              "transition-transform duration-300",
              isOpen ? "translate-y-0" : "translate-y-full"
            )}
            style={{ height: "85vh" }}
          >
            {/* Pull handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <ChatHeader onClose={onClose} onNewChat={onNewChat} onMinimize={onClose} />
            <ChatMessages messages={messages} isTyping={isTyping} />
            <ChatInput onSend={onSend} isTyping={isTyping} quickActions={quickActions} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
