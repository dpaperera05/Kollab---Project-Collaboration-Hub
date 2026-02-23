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
        <p className="text-xs font-medium text-foreground mb-2">
          {label}
          {minRequired ? (
            <span className="text-muted-foreground font-normal">
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
                "group relative flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition-all duration-200",
                "hover:border-primary/40 hover:bg-primary/[0.03]",
                isSelected
                  ? "border-primary bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
                  : "border-border bg-card"
              )}
            >
              {/* Checkmark */}
              <div
                className={cn(
                  "absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground scale-100"
                    : "scale-0"
                )}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </div>

              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={1.5}
                />
              )}

              <span
                className={cn(
                  "text-xs font-medium leading-tight transition-colors duration-200",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {optLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TileSelect;
