import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApiMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface ApiChat {
  _id: string;
  participantIds: string[];
  messages: ApiMessage[];
  projectId?: string;
}

interface MentorChatWidgetProps {
  mentorId: string;
  mentorName: string;
}

const MentorChatWidget = ({ mentorId, mentorName }: MentorChatWidgetProps) => {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const userId = session?.id;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!session) { setLoading(false); return; }
      try {
        const res = await apiGet<{ success: boolean; data: { chats: ApiChat[] } }>("/chats");
        const existing = res.data.chats.find((c) => c.participantIds.includes(mentorId) && !c.projectId);
        if (existing) {
          setChatId(existing._id);
          setMessages(existing.messages || []);
        }
      } catch (err: any) {
        toast({ title: "Could not load chat", description: err?.message || "Please try again", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, [mentorId, session, toast]);

  const ensureChat = async () => {
    if (chatId) return chatId;
    const res = await apiPost<{ success: boolean; data: { chat: ApiChat } }>("/chats", { participantId: mentorId, participantName: mentorName });
    const created = res.data.chat;
    setChatId(created._id);
    return created._id;
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    if (!session) {
      toast({ title: "Login required", description: "Please login to message a mentor.", variant: "destructive" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setSending(true);
      const id = await ensureChat();
      const res = await apiPost<{ success: boolean; data: { chat: ApiChat } }>(`/chats/${id}/messages`, { text: text.trim() });
      setMessages(res.data.chat.messages || []);
      setText("");
    } catch (err: any) {
      toast({ title: "Message failed", description: err?.message || "Please try again", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:h-[380px]">
      <div className="border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Message {mentorName}</h3>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 px-3 py-3.5">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </p>
        ) : messages.length === 0 ? (
          <div className="mx-2 rounded-xl border border-dashed border-border bg-background/70 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Start the conversation with a short introduction.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.senderId === userId ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[82%] rounded-2xl px-3 py-2.5 text-xs shadow-sm",
                m.senderId === userId
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md border border-border bg-background text-foreground"
              )}>
                {m.text}
                <p className="mt-1.5 text-[10px] opacity-70">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border bg-card px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
            className="flex-1 bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
        </div>
      </div>
    </section>
  );
};

export default MentorChatWidget;
