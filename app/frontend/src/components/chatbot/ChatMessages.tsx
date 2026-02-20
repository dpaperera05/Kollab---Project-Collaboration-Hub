import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
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

/* Typing indicator dots */
const TypingIndicator = () => (
  <div className="flex items-end gap-2 px-1">
    <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center flex-shrink-0">
      <span className="text-primary text-[10px] font-bold">K</span>
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border shadow-sm">
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

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <>
      <style>{`
        @keyframes chatbot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex items-end gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center flex-shrink-0 mb-0.5">
                <span className="text-primary text-[10px] font-bold">K</span>
              </div>
            )}

            <div className={cn("flex flex-col gap-1 max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed space-y-0.5",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-brand-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                )}
              >
                <div className="space-y-0.5">
                  {renderContent(msg.content)}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </>
  );
};

export default ChatMessages;
