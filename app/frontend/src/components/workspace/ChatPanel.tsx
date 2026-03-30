import { useState } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import type { WorkspaceChatMessage } from "@/data/workspaceData";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authStore";

interface Props {
  projectId: string;
  initialMessages: WorkspaceChatMessage[];
}

const ChatPanel = ({ projectId, initialMessages }: Props) => {
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>(initialMessages);
  const [sending, setSending] = useState(false);
  const session = getSession();
  const currentUserId = session?.id || "u-owner";

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await apiPost<{ success: boolean; data: { chat: { messages: WorkspaceChatMessage[] } } }>(
        `/workspace/${projectId}/chat/messages`,
        { text }
      );
      setMessages(res.data.chat.messages || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Could not send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Group Chat</h2>
        <p className="text-xs text-muted-foreground">{messages.length} messages</p>
      </div>
      <ChatMessageList messages={messages} currentUserId={currentUserId} />
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
};

export default ChatPanel;
