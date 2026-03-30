import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import type { WorkspaceChatMessage } from "@/data/workspaceData";

interface Props {
  messages: WorkspaceChatMessage[];
  currentUserId?: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dateSeparator(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDate.getTime() === today.getTime()) return "Today";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const ChatMessageList = ({ messages, currentUserId }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
        <MessageSquare size={36} className="opacity-40" />
        <p className="text-sm">No messages yet — start the collaboration</p>
      </div>
    );
  }

  let lastDate = "";

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gradient-to-b from-background via-background to-muted/40">
      {messages.map((msg) => {
        const msgDate = dateSeparator(msg.timestamp);
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;
        const initials = msg.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2);
        const isMe = currentUserId && msg.senderId === currentUserId;
        const containerDir = isMe ? "flex-row-reverse text-right" : "flex-row";
        const bubbleColors = isMe
          ? "bg-primary text-primary-foreground border border-primary/40"
          : "bg-muted text-foreground border border-border/60";
        const metaColor = isMe ? "text-primary-foreground/80" : "text-muted-foreground";
        const shadow = isMe ? "shadow-md" : "shadow-sm";

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground font-medium">{msgDate}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className={`flex gap-2.5 py-2 px-2 -mx-2 transition-all ${containerDir}`}>
              <Avatar className="h-9 w-9 mt-auto shrink-0 ring-2 ring-background/80 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className={`min-w-0 flex-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${bubbleColors} ${shadow} backdrop-blur-sm`}>
                  <div className={`flex items-baseline gap-2 ${isMe ? "justify-end" : ""}`}>
                    <span className="text-xs font-semibold leading-none truncate">{msg.senderName}</span>
                    <span className={`text-[10px] leading-none ${metaColor}`}>{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm leading-snug mt-1 break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
