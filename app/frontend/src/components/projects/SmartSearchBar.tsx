import { useState } from "react";
import { Sparkles, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  /** Called when the user explicitly presses Search or hits Enter. Falls back to onChange if omitted. */
  onSearch?: (val: string) => void;
}

const suggestions = [
  "Beginner AI project with React",
  "Robotics team looking for designers",
  "Remote IoT project short-term",
  "Open Data Science project with Python",
];

const SmartSearchBar = ({ value, onChange, onSearch }: SmartSearchBarProps) => {
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
          "flex items-center gap-3 w-full rounded-xl border bg-card px-4 py-3 transition-all duration-200",
          focused
            ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ring-0"
            : "border-border shadow-sm hover:border-primary/40"
        )}
      >
        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Sparkles size={16} className="text-primary" />
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Try: 'Beginner AI project with React'"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex-shrink-0 p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={triggerSearch}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <Search size={13} />
          Search
        </button>
      </div>

      {/* Suggestion dropdown */}
      {focused && !value && (
        <div className="absolute top-full mt-2 left-0 right-0 z-30 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Try searching for
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { onChange(s); if (onSearch) onSearch(s); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-foreground hover:bg-accent transition-colors"
            >
              <Sparkles size={13} className="text-primary flex-shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
