import { useState } from "react";
import { Sparkles, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  /** Called when the user explicitly presses Search or hits Enter. Falls back to onChange if omitted. */
  onSearch?: (val: string) => void;
  /** Override the input placeholder text. */
  placeholder?: string;
  /** Taller variant (h-12) for hero sections. Defaults to false (h-11). */
  large?: boolean;
}

const suggestions = [
  "Beginner AI project with React",
  "Robotics team looking for designers",
  "Remote IoT project short-term",
  "Open Data Science project with Python",
];

const SmartSearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search by skill, role, domain, or project idea\u2026",
  large = false,
}: SmartSearchBarProps) => {
  const [focused, setFocused] = useState(false);

  const triggerSearch = () => {
    if (onSearch) onSearch(value);
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") triggerSearch();
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "flex items-center w-full rounded-lg border bg-card overflow-hidden transition-all duration-150",
          focused
            ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
            : "border-border shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600"
        )}
      >
        <span className="flex-shrink-0 pl-3.5">
          <Search
            size={16}
            className={cn("transition-colors", focused ? "text-primary" : "text-muted-foreground")}
          />
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex-1 min-w-0 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none",
            large ? "h-12" : "h-11"
          )}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex-shrink-0 p-1 mr-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={triggerSearch}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-4 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors border-l border-primary/30 whitespace-nowrap",
            large ? "h-12" : "h-11"
          )}
        >
          <Sparkles size={12} />
          <span className="hidden sm:inline">AI Search</span>
          <span className="sm:hidden">Go</span>
        </button>
      </div>

      {/* Suggestion dropdown */}
      {focused && !value && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-30 rounded-lg border border-border bg-card shadow-md overflow-hidden">
          <p className="px-3.5 pt-2.5 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Try searching for
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { onChange(s); if (onSearch) onSearch(s); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-muted transition-colors"
            >
              <Sparkles size={12} className="text-primary flex-shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;

