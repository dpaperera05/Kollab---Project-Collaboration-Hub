import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

const OtpInput = ({ length = 6, value, onChange }: OtpInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const focusInput = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      inputsRef.current[clamped]?.focus();
    },
    [length]
  );

  useEffect(() => {
    // Auto-focus first input on mount
    focusInput(0);
  }, [focusInput]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const arr = digits.slice();
    arr[index] = char.slice(-1);
    const next = arr.join("").slice(0, length);
    onChange(next);

    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = digits.slice();
      if (arr[index]) {
        arr[index] = "";
        onChange(arr.join(""));
      } else if (index > 0) {
        arr[index - 1] = "";
        onChange(arr.join(""));
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(null)}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={cn(
            "h-13 w-11 sm:h-14 sm:w-12 rounded-xl border-2 bg-background/60 text-center text-xl font-bold text-foreground transition-all duration-200",
            "outline-none",
            focused === i
              ? "border-primary ring-2 ring-primary/30 shadow-[0_0_10px_hsl(270_80%_60%/0.15)]"
              : digits[i]
                ? "border-primary/50"
                : "border-border dark:border-[hsl(240_8%_24%)]",
            "hover:border-primary/40"
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;
