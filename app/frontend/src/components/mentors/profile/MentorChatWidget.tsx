import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";

const STORAGE_KEY = "kollab_messages";

interface MentorMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
}

function getMessages(mentorId: string): MentorMessage[] {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[`mentor_${mentorId}`] || [];
  } catch { return []; }
}

function saveMessages(mentorId: string, msgs: MentorMessage[]) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[`mentor_${mentorId}`] = msgs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* noop */ }
}

interface MentorChatWidgetProps {
  mentorId: string;
  mentorName: string;
}

const MentorChatWidget = ({ mentorId, mentorName }: MentorChatWidgetProps) => {
  const [messages, setMessages] = useState<MentorMessage[]>(() => getMessages(mentorId));
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const msg: MentorMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(mentorId, updated);
    setText("");
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: 340 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <MessageSquare size={14} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground">Message {mentorName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
              m.sender === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};

export default MentorChatWidget;
