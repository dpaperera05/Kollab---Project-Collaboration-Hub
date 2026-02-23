import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Send, MessageCircle, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { type KollabUser } from "@/lib/authStore";
import { getConversationsForUser, createConversation, sendMessage, getConversation, type Conversation } from "@/lib/messageStore";
import { cn } from "@/lib/utils";

interface Props { user: KollabUser; }

const ChatsTab = ({ user }: Props) => {
  const [convos, setConvos] = useState(() => getConversationsForUser(user.id));
  const [activeId, setActiveId] = useState<string | null>(convos[0]?.id || null);
  const [input, setInput] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  const active = activeId ? getConversation(activeId) : null;
  const refresh = () => setConvos(getConversationsForUser(user.id));

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    sendMessage(activeId, user.id, input.trim());
    setInput("");
    refresh();
  };

  const handleNewConvo = () => {
    if (!newName.trim()) return;
    const c = createConversation(user.id, user.profile?.name || user.email, newName.trim());
    setNewOpen(false);
    setNewName("");
    refresh();
    setActiveId(c.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Messages</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => toast({ title: "Full messages page coming soon" })}>
            <ExternalLink size={12} /> Full Messages
          </Button>
          <Button size="sm" className="gap-1" onClick={() => setNewOpen(true)}><Plus size={14} /> New Chat</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
        {/* Conversation List */}
        <Card className="border-border card-shadow md:col-span-1">
          <CardContent className="p-0">
            {convos.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {convos.map(c => {
                  const otherName = c.participantNames.find((_, i) => c.participants[i] !== user.id) || c.participantNames[1] || "Unknown";
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <button key={c.id} onClick={() => setActiveId(c.id)}
                      className={cn("w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors", activeId === c.id && "bg-primary/5 border-l-2 border-primary")}>
                      <p className="font-medium text-sm text-foreground truncate">{otherName}</p>
                      <p className="text-xs text-muted-foreground truncate">{lastMsg?.text || "No messages"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="border-border card-shadow md:col-span-2 flex flex-col">
          {active ? (
            <>
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground">
                  {active.participantNames.find((_, i) => active.participants[i] !== user.id) || "Chat"}
                </p>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                {active.messages.map(m => (
                  <div key={m.id} className={cn("max-w-[75%] rounded-xl px-3 py-2 text-sm",
                    m.senderId === user.id ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                    {m.text}
                    <p className={cn("text-[10px] mt-1", m.senderId === user.id ? "text-primary-foreground/60" : "text-muted-foreground")}>
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
              Select a conversation or start a new one
            </CardContent>
          )}
        </Card>
      </div>

      {/* New conversation dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Conversation</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Recipient Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter name..." /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button onClick={handleNewConvo}>Start Chat</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatsTab;
