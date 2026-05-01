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
    <div className="flex-shrink-0 border-t border-border bg-background">
      {/* Quick action chips */}
      <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action)}
            disabled={isTyping}
            className="px-2.5 py-1 rounded-full border border-[hsl(270_80%_70%/0.4)] bg-[hsl(270_80%_60%/0.06)] text-[11px] font-medium text-[hsl(270_80%_50%)] hover:bg-[hsl(270_80%_60%/0.15)] hover:border-[hsl(270_80%_60%/0.6)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 pb-3 pt-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your message here..."
          disabled={isTyping}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[hsl(270_80%_60%/0.4)] focus:border-[hsl(270_80%_60%/0.5)] transition-shadow",
            "disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          )}
          style={{ minHeight: 40, maxHeight: 96 }}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
            canSend
              ? "bg-gradient-to-br from-[hsl(270_80%_50%)] to-[hsl(245_70%_55%)] text-white hover:scale-105 shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          )}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
