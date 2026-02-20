import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "owner";
  time: string;
}

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface MessageOwnerWidgetProps {
  ownerName: string;
  ownerAvatar: string;
}

const MessageOwnerWidget = ({ ownerName, ownerAvatar }: MessageOwnerWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      text: `Hi! I'm ${ownerName}. Feel free to ask me anything about the project.`,
      sender: "owner",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: "user", time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated owner reply
    setTimeout(() => {
      const ownerMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for reaching out! I'll get back to you shortly. In the meantime, feel free to apply for the role that interests you.",
        sender: "owner",
        time: getTime(),
      };
      setMessages((prev) => [...prev, ownerMsg]);
    }, 1200);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30">
        <MessageCircle size={15} className="text-primary flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-none">Message the Owner</p>
          <p className="text-xs text-muted-foreground mt-0.5">{ownerName}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-52">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2",
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {msg.sender === "owner" && (
              <img
                src={ownerAvatar}
                alt={ownerName}
                className="w-6 h-6 rounded-full border border-border bg-muted flex-shrink-0"
              />
            )}
            <div className="space-y-0.5 max-w-[75%]">
              <div
                className={cn(
                  "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.text}
              </div>
              <p className={cn(
                "text-xs text-muted-foreground",
                msg.sender === "user" ? "text-right" : "text-left"
              )}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Write a message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-24 overflow-y-auto"
          style={{ minHeight: 38 }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-brand-sm"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default MessageOwnerWidget;
