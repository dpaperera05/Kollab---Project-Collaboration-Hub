import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

type ChatResponse = {
  success: boolean;
  data: { chat: { _id?: string; id?: string; messages: ChatMessage[] } };
};

interface MessageOwnerWidgetProps {
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  projectId: string;
}

const MessageOwnerWidget = ({ ownerId, ownerName, ownerAvatar, projectId }: MessageOwnerWidgetProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    const ensureChat = async () => {
      if (initializedRef.current) return;
      if (!session?.token || !ownerId) return;
      initializedRef.current = true;
      setLoading(true);
      setError("");
      try {
        const res = await apiPost<ChatResponse>("/chats", { participantId: ownerId, participantName: ownerName, projectId });
        if (cancelled) return;
        const id = res?.data?.chat?._id || res?.data?.chat?.id || null;
        setChatId(id);
        setMessages(res?.data?.chat?.messages || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load chat");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    ensureChat();
    return () => { cancelled = true; };
  }, [ownerId, ownerName, projectId, session?.id]);

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    if (!session?.token) {
      toast({ title: "Login required", description: "Sign in to message the owner.", variant: "destructive" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (session?.id === ownerId) {
      toast({ title: "Cannot message yourself", description: "You are the project owner.", variant: "destructive" });
      return;
    }

    try {
      setSending(true);
      setError("");
      let activeChatId = chatId;
      if (!activeChatId) {
        const created = await apiPost<ChatResponse>("/chats", { participantId: ownerId, participantName: ownerName, projectId });
        activeChatId = created?.data?.chat?._id || created?.data?.chat?.id || null;
        setChatId(activeChatId);
        setMessages(created?.data?.chat?.messages || []);
      }
      if (!activeChatId) throw new Error("Unable to start chat");

      const res = await apiPost<ChatResponse>(`/chats/${activeChatId}/messages`, { text });
      setMessages(res?.data?.chat?.messages || []);
      setInput("");
    } catch (err: any) {
      setError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const disabled = !session?.token || sending;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/40">
        <MessageCircle size={15} className="text-primary flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-none">Message the Owner</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{ownerName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-52">
        {loading && <p className="text-xs text-muted-foreground">Loading messages&hellip;</p>}
        {!loading && messages.length === 0 && (
          <p className="text-xs text-muted-foreground">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg) => {
          const fromUser = msg.senderId === session?.id;
          return (
            <div
              key={msg.id}
              className={cn("flex items-end gap-2", fromUser ? "flex-row-reverse" : "flex-row")}
            >
              {!fromUser && (
                <img
                  src={ownerAvatar || getDefaultAvatarUrl(ownerId || ownerName)}
                  alt={ownerName}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = getDefaultAvatarUrl(ownerId || ownerName); }}
                  className="w-6 h-6 rounded-full border border-border bg-muted flex-shrink-0"
                />
              )}
              <div className="space-y-0.5 max-w-[75%]">
                <div className={cn(
                  "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  fromUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}>
                  {msg.text}
                </div>
                <p className={cn("text-xs text-muted-foreground", fromUser ? "text-right" : "text-left")}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-1 text-xs text-destructive">{error}</p>}

      {/* Input */}
      <div className="px-3 py-3 border-t border-border flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={session?.token ? "Write a message\u2026" : "Login to start chatting"}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-24 overflow-y-auto disabled:opacity-60"
          style={{ minHeight: 38 }}
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-brand-sm"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default MessageOwnerWidget;