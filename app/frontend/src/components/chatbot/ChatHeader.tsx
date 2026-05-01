import { Minus, RotateCcw } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onNewChat: () => void;
  onMinimize: () => void;
}

const ChatHeader = ({ onMinimize, onNewChat }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0 bg-gradient-to-r from-[hsl(270_80%_40%)] to-[hsl(245_70%_55%)]">
      {/* Bot avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-white/15 flex items-center justify-center ring-2 ring-white/30">
          <img
            src="https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/kollab-bot.png"
            alt="Kollab Bot"
            className="w-10 h-10 object-contain"
          />
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
      </div>

      {/* Title + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-none">Kollab Assistant</p>
        <p className="text-[11px] text-emerald-300 font-medium mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Online
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onNewChat}
          title="New chat"
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="New chat"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={onMinimize}
          title="Minimize"
          className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
