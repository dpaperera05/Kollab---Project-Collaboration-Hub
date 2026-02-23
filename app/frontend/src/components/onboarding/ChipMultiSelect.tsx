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
        <p className="text-xs font-medium text-foreground mb-2">
          {label}
          {minRequired ? <span className="text-muted-foreground font-normal"> (select at least {minRequired})</span> : null}
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
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                isSelected
                  ? "bg-primary/[0.08] text-primary border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              )}
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
