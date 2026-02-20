import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickAction } from "./mockReplies";

interface ChatInputProps {
  onSend: (text: string) => void;
  isTyping: boolean;
  quickActions: QuickAction[];
}

const ChatInput = ({ onSend, isTyping, quickActions }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px"; 
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isTyping) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    onSend(action.message);
  };

  const canSend = value.trim().length > 0 && !isTyping;

  return (
    <div className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm">
      {/* Quick action chips */}
      <div className="px-3 pt-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none flex-nowrap">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action)}
            disabled={isTyping}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-full border border-border bg-background text-xs font-medium text-foreground/80 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 pb-3 pt-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me anything…"
          disabled={isTyping}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring transition-shadow",
            "disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          )}
          style={{ minHeight: 40, maxHeight: 96 }}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-brand-sm",
            canSend
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          )}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
