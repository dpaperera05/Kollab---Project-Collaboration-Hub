import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { mockChats, type MockChat } from "@/data/mockProfileContent";
import { cn } from "@/lib/utils";

const ChatsTab = () => {
  const [chats, setChats] = useState<MockChat[]>(() => mockChats.map(c => ({ ...c, messages: [...c.messages] })));
  const [activeId, setActiveId] = useState<string | null>(chats[0]?.id || null);
  const [input, setInput] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  const active = chats.find(c => c.id === activeId) || null;

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    setChats(prev => prev.map(c => c.id === activeId ? {
      ...c, messages: [...c.messages, { id: `m-${Date.now()}`, senderId: "me" as const, text: input.trim(), timestamp: new Date().toISOString() }]
    } : c));
    setInput("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Messages</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
        {/* List */}
        <Card className="border-border card-shadow md:col-span-1">
          <CardContent className="p-0">
            {chats.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" /><p>No conversations</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {chats.map(c => {
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <button key={c.id} onClick={() => setActiveId(c.id)}
                      className={cn("w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors", activeId === c.id && "bg-primary/5 border-l-2 border-primary")}>
                      <p className="font-medium text-sm text-foreground truncate">{c.participantName}</p>
                      <p className="text-xs text-muted-foreground truncate">{lastMsg?.text || "No messages"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thread */}
        <Card className="border-border card-shadow md:col-span-2 flex flex-col">
          {active ? (
            <>
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground">{active.participantName}</p>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                {active.messages.map(m => (
                  <div key={m.id} className={cn("max-w-[75%] rounded-xl px-3 py-2 text-sm",
                    m.senderId === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                    {m.text}
                    <p className={cn("text-[10px] mt-1", m.senderId === "me" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </CardContent>
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }} />
                <Button size="icon" onClick={handleSend}><Send size={16} /></Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a conversation
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatsTab;
