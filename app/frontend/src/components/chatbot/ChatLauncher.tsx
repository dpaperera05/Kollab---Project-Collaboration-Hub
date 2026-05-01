import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatLauncherProps {
  isOpen: boolean;
  hasUnread: boolean;
  onClick: () => void;
}



const ChatLauncher = ({ isOpen, hasUnread, onClick }: ChatLauncherProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Launcher button */}
      <button
        onClick={onClick}
        aria-label={isOpen ? "Close Kollab Assistant" : "Open Kollab Assistant"}
        className="relative w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-110 bg-transparent border-none shadow-none"
      >
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300 bg-muted rounded-full",
            isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90 scale-50"
          )}
        >
          <X size={22} className="text-foreground" />
        </span>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isOpen ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0"
          )}
        >
          <img src="https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/kollab-bot.png" alt="Kollab Assistant" className="w-16 h-16 object-contain" />
        </span>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-background animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default ChatLauncher;
