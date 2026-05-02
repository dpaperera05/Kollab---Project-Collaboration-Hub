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

interface MemberChatWidgetProps {
  memberId: string;
  memberName: string;
  inputRef?: { current: HTMLInputElement | null };
}

const MemberChatWidget = ({ memberId, memberName, inputRef }: MemberChatWidgetProps) => {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
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
    if (!inputRef) return;
    inputRef.current = localInputRef.current;
  }, [inputRef]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!session) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const res = await apiGet<{ success: boolean; data: { chats: ApiChat[] } }>("/chats");
        const existing = res.data.chats.find((c) => c.participantIds.includes(memberId) && !c.projectId);
        if (existing) {
          setChatId(existing._id);
          setMessages(existing.messages || []);
        }
      } catch (err: any) {
        setError(err?.message || "Could not load messages");
        toast({ title: "Could not load chat", description: err?.message || "Please try again", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, [memberId, session, toast]);

  const ensureChat = async () => {
    if (chatId) return chatId;
    const res = await apiPost<{ success: boolean; data: { chat: ApiChat } }>("/chats", {
      participantId: memberId,
      participantName: memberName,
    });
    const created = res.data.chat;
    setChatId(created._id);
    return created._id;
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    if (!session) {
      toast({ title: "Login required", description: "Please login to message this member.", variant: "destructive" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (userId === memberId) {
      toast({ title: "Cannot message yourself", description: "Open Messages to view your conversations." });
      return;
    }

    try {
      setSending(true);
      setError(null);
      const id = await ensureChat();
      const res = await apiPost<{ success: boolean; data: { chat: ApiChat } }>(`/chats/${id}/messages`, {
        text: text.trim(),
      });
      setMessages(res.data.chat.messages || []);
      setText("");
    } catch (err: any) {
      setError(err?.message || "Message failed");
      toast({ title: "Message failed", description: err?.message || "Please try again", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const requiresLogin = !session;
  const selfView = userId === memberId;
  const inputDisabled = requiresLogin || selfView || loading || sending;
  const placeholder = requiresLogin
    ? "Login to message this member"
    : selfView
      ? "You cannot message yourself"
      : "Type a message...";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col shadow-sm" style={{ height: 340 }}>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/20">
        <MessageSquare size={14} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground">Message {memberName}</h3>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </p>
        ) : requiresLogin ? (
          <p className="text-xs text-muted-foreground text-center py-6">Please log in to message this member.</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.senderId === userId ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-xs",
                  m.senderId === userId ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                {m.text}
                <p className="text-[10px] mt-1 opacity-70">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {error && <p className="px-3 pt-1 text-xs text-destructive">{error}</p>}

      <div className="border-t border-border px-3 py-2.5 flex items-center gap-2">
        <input
          ref={localInputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={inputDisabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || inputDisabled}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </div>
    </div>
  );
};

export default MemberChatWidget;
