import { Minimize2, RotateCcw, X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onNewChat: () => void;
  onMinimize: () => void;
}

const ChatHeader = ({ onClose, onNewChat, onMinimize }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
      {/* Bot avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-brand-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="9" width="14" height="10" rx="3" fill="white" fillOpacity="0.9" />
            <rect x="9" y="6" width="6" height="4" rx="2" fill="white" fillOpacity="0.7" />
            <circle cx="9.5" cy="13.5" r="1.5" fill="hsl(270 80% 60%)" />
            <circle cx="14.5" cy="13.5" r="1.5" fill="hsl(270 80% 60%)" />
            <line x1="8" y1="17" x2="16" y2="17" stroke="hsl(270 80% 60%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="6" x2="12" y2="4" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="3.5" r="1" fill="hsl(315 85% 65%)" />
          </svg>
        </div>
        {/* Online dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
      </div>

      {/* Title + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-none">Kollab Assistant</p>
        <p className="text-[11px] text-emerald-500 font-medium mt-0.5">Online · Responds instantly</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onNewChat}
          title="New chat"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="New chat"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onMinimize}
          title="Minimize"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Minimize"
        >
          <Minimize2 size={14} />
        </button>
        <button
          onClick={onClose}
          title="Close"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
