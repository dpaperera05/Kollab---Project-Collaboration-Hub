import { useState } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import type { WorkspaceChatMessage } from "@/data/workspaceData";

interface Props {
  initialMessages: WorkspaceChatMessage[];
}

const ChatPanel = ({ initialMessages }: Props) => {
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>(initialMessages);

  const handleSend = (text: string) => {
    const newMsg: WorkspaceChatMessage = {
      id: `cm-${Date.now()}`,
      senderId: "u-owner",
      senderName: "You",
      senderAvatar: "",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Group Chat</h2>
        <p className="text-xs text-muted-foreground">{messages.length} messages</p>
      </div>
      <ChatMessageList messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatPanel;
