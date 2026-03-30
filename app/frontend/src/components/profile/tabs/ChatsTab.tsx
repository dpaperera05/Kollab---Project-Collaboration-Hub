import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send, Loader2, Tag } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { getSession } from "@/lib/authStore";
import { cn } from "@/lib/utils";

type ApiMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

type ApiChat = {
  _id: string;
  participantIds: string[];
  participantNames?: Record<string, string>;
  messages: ApiMessage[];
  updatedAt?: string;
  projectId?: string;
  projectTitle?: string;
};

const ChatsTab = () => {
  const session = getSession();
  const userId = session?.id;

  const [chats, setChats] = useState<ApiChat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const directChats = useMemo(() => chats.filter((c) => (c.participantIds?.length || 0) <= 2), [chats]);
  const active = directChats.find((c) => c._id === activeId) || null;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ success: boolean; data: { chats: ApiChat[] } }>("/chats");
        setChats(res.data.chats || []);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load chats");
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (directChats.length === 0) {
      setActiveId(null);
    } else if (!directChats.some((c) => c._id === activeId)) {
      setActiveId(directChats[0]._id);
    }
  }, [directChats, activeId]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  const otherName = (chat: ApiChat) => {
    if (!userId) return "Chat";
    const otherId = chat.participantIds.find((id) => id !== userId) || chat.participantIds[0] || "";
    return chat.participantNames?.[otherId] || "Conversation";
  };

  const subtitle = (chat: ApiChat) => {
    const parts: string[] = [];
    if (chat.projectId) parts.push(chat.projectTitle || "Project chat");
    return parts.join(" • ");
  };

  const lastMessagePreview = (chat: ApiChat) => {
    const last = chat.messages[chat.messages.length - 1];
    return last?.text || "No messages";
  };

  const handleSend = async () => {
    if (!input.trim() || !active?._id) return;
    try {
      setSending(true);
      const res = await apiPost<{ success: boolean; data: { chat: ApiChat } }>(`/chats/${active._id}/messages`, { text: input.trim() });
      const updated = res.data.chat;
      setChats((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setInput("");
    } catch (err: any) {
      toast({ title: "Message failed", description: err?.message || "Could not send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Messages</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[420px]">
        <Card className="border-border card-shadow md:col-span-1">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading chats...</div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-destructive">{error}</div>
            ) : directChats.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                <p>No conversations</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {directChats.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setActiveId(c._id)}
                    className={cn("w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors", active?._id === c._id && "bg-primary/5 border-l-2 border-primary")}
                  >
                    <p className="font-medium text-sm text-foreground truncate">{otherName(c)}</p>
                    <p className="text-xs text-muted-foreground truncate">{lastMessagePreview(c)}</p>
                    {subtitle(c) && <p className="text-[11px] text-muted-foreground/80 truncate">{subtitle(c)}</p>}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border card-shadow md:col-span-2 flex flex-col">
          {active ? (
            <>
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-foreground">{otherName(active)}</p>
                    {subtitle(active) && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Tag size={12} />
                        <span>{subtitle(active)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px]">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[75%] rounded-xl px-3 py-2 text-sm",
                      m.senderId === userId ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    {m.text}
                    <p className={cn("text-[10px] mt-1", m.senderId === userId ? "text-primary-foreground/70" : "text-muted-foreground")}> 
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </CardContent>
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleSend(); }
                  }}
                />
                <Button size="icon" onClick={handleSend} disabled={sending || !input.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              {loading ? "Loading chats..." : "Select a conversation"}
            </CardContent>
          )}
        </Card>
      </div>

    </div>
  );
};

export default ChatsTab;
