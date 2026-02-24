import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import type { WorkspaceChatMessage } from "@/data/workspaceData";

interface Props {
  messages: WorkspaceChatMessage[];
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

const ChatMessageList = ({ messages }: Props) => {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((msg) => {
        const msgDate = dateSeparator(msg.timestamp);
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;
        const initials = msg.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2);

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground font-medium">{msgDate}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="flex gap-2.5 py-1.5 hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors">
              <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">{msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm text-foreground/90 break-words">{msg.text}</p>
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
