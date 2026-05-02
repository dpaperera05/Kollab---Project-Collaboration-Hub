import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ChipMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  minRequired?: number;
}

const ChipMultiSelect = ({ options, selected, onChange, label, minRequired }: ChipMultiSelectProps) => {
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
          {minRequired ? <span className="font-normal text-muted-foreground"> (select at least {minRequired})</span> : null}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "border-primary/60 bg-primary/15 text-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/70 hover:text-foreground"
              )}
              aria-pressed={isSelected}
            >
              {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChipMultiSelect;
