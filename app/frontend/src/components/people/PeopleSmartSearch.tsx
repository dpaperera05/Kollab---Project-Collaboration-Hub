import { useState } from "react";
import { Sparkles, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeopleSmartSearchProps {
  value: string;
  onChange: (val: string) => void;
}

const suggestions = [
  "Frontend React builders interested in AI",
  "Backend engineers with DevOps skills",
  "UI/UX designers who code in React",
  "Data scientists with Python and ML",
];

const PeopleSmartSearch = ({ value, onChange }: PeopleSmartSearchProps) => {
  const [focused, setFocused] = useState(false);

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
          placeholder="Try: 'Frontend React builders interested in AI'"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="flex-shrink-0 p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}

        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Search size={13} />
          Search
        </button>
      </div>

      {focused && !value && (
        <div className="absolute top-full mt-2 left-0 right-0 z-30 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Try searching for
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => onChange(s)}
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

export default PeopleSmartSearch;
