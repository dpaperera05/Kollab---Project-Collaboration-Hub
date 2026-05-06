import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TileOption {
  label: string;
  icon?: LucideIcon;
}

interface TileSelectProps {
  options: TileOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  minRequired?: number;
  columns?: 2 | 3;
}

const TileSelect = ({
  options,
  selected,
  onChange,
  label,
  minRequired,
  columns = 3,
}: TileSelectProps) => {
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    );
  };

  return (
    <div>
      {label && (
        <p className="mb-2 text-xs font-semibold text-foreground">
          {label}
          {minRequired ? (
            <span className="font-normal text-muted-foreground">
              {" "}(select at least {minRequired})
            </span>
          ) : null}
        </p>
      )}
      <div
        className={cn(
          "grid gap-2",
          columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {options.map(({ label: optLabel, icon: Icon }) => {
          const isSelected = selected.includes(optLabel);
          return (
            <button
              key={optLabel}
              type="button"
              onClick={() => toggle(optLabel)}
              className={cn(
                "group relative flex min-h-[72px] flex-col items-start justify-center gap-1.5 overflow-hidden rounded-xl border px-2.5 py-2 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "hover:border-primary/30 hover:bg-muted/70",
                isSelected
                  ? "border-primary/70 bg-primary/15 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]"
                  : "border-border bg-card"
              )}
              aria-pressed={isSelected}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
                  "bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.3),transparent_65%)]",
                  isSelected && "opacity-100"
                )}
              />

              <div
                className={cn(
                  "absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground scale-100"
                    : "scale-0 border-border bg-muted text-muted-foreground"
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </div>

              <div className="relative z-10 flex items-center gap-2.5">
                {Icon && (
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors duration-200",
                      isSelected
                        ? "border-primary/40 bg-primary/20 text-primary"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                )}

                <span
                  className={cn(
                    "text-xs font-semibold leading-tight transition-colors duration-200",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {optLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TileSelect;
