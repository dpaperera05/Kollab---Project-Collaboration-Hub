import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, ThumbsUp, ThumbsDown, ChevronDown, Check } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChatbot";

const renderContent = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.trim().startsWith("- ")) {
      const content = line.trim().slice(2);
      return (
        <li key={i} className="flex items-start gap-1.5 ml-1">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-60" />
          <span dangerouslySetInnerHTML={{ __html: bold(content) }} />
        </li>
      );
    }
    if (/^\d+\. /.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\. (.+)/);
      if (match) {
        return (
          <li key={i} className="flex items-start gap-1.5 ml-1 list-decimal list-inside">
            <span dangerouslySetInnerHTML={{ __html: bold(match[2]) }} />
          </li>
        );
      }
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return (
      <p key={i} dangerouslySetInnerHTML={{ __html: bold(line) }} />
    );
  });
};

const bold = (text: string) =>
  text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

const BOT_AVATAR = "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/kollab-bot.png";

/* Typing indicator dots */
const TypingIndicator = () => (
  <div className="flex items-end gap-2 px-1">
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-sm">
      <img src={BOT_AVATAR} alt="Kollab" className="w-full h-full object-contain" />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-muted/60 border border-border shadow-sm">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            style={{
              animation: "chatbot-bounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const BotActions = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        title="Copy"
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>
      <button
        onClick={() => setLiked(liked === "up" ? null : "up")}
        title="Helpful"
        className={cn(
          "p-1 rounded transition-colors",
          liked === "up" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <ThumbsUp size={12} />
      </button>
      <button
        onClick={() => setLiked(liked === "down" ? null : "down")}
        title="Not helpful"
        className={cn(
          "p-1 rounded transition-colors",
          liked === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <ThumbsDown size={12} />
      </button>
    </div>
  );
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 80);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes chatbot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 py-4 space-y-3 scroll-smooth bg-muted/20"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex items-end gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Bot avatar */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-0.5 bg-white shadow-sm">
                  <img src={BOT_AVATAR} alt="Kollab" className="w-full h-full object-contain" />
                </div>
              )}

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 mb-0.5 bg-gradient-to-br from-[hsl(270_80%_55%)] to-[hsl(245_70%_60%)] flex items-center justify-center shadow-sm">
                  <span className="text-white text-[11px] font-bold">U</span>
                </div>
              )}

              <div className={cn("flex flex-col gap-1 max-w-[75%] group", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[hsl(270_80%_45%)] to-[hsl(245_70%_55%)] text-white rounded-br-none shadow-md"
                      : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
                  )}
                >
                  <div className="space-y-0.5">
                    {renderContent(msg.content)}
                  </div>
                </div>

                {/* Timestamp + read receipt */}
                <div className={cn("flex items-center gap-1 px-1", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  {msg.role === "user" && (
                    <span className="text-[10px] text-[hsl(245_70%_60%)] font-medium">✓✓</span>
                  )}
                </div>

                {/* Bot message actions */}
                {msg.role === "assistant" && <BotActions content={msg.content} />}
              </div>
            </div>
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[hsl(245_70%_55%)] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>
    </>
  );
};

export default ChatMessages;
