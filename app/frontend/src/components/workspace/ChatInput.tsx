import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: Props) => {
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border p-3 bg-card">
      <div className="flex items-end gap-2">
        <textarea
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[40px] max-h-[120px]"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={disabled}
        />
        <Button size="icon" className="h-10 w-10 shrink-0" onClick={submit} disabled={!text.trim() || disabled}>
          <SendHorizontal size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
