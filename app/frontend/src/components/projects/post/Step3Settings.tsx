import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tag, ShieldCheck } from "lucide-react";

export interface SettingsData {
  tags: string[];
  agreedToTerms: boolean;
}

const SUGGESTED_TAGS = [
  "Beginner Friendly",
  "Intermediate",
  "Advanced",
  "Team Project",
  "Solo Project",
  "Looking for Team",
  "Mentor Needed",
  "Short-Term",
  "Long-Term",
  "Flexible",
  "In Progress",
  "Completed",
  "Actively Hiring",
  "Urgent Roles",
  "Open for Contributions",
  "Portfolio Project",
  "Resume Booster",
  "Industry Relevant",
  "Startup Potential",
  "Learning Project",
  "Skill Building",
  "Experimental",
  "Remote",
  "Hybrid",
  "In-Person",
  "Innovative",
  "AI-Powered",
];

interface Props {
  initialData: SettingsData | null;
  onNext: (data: SettingsData) => void;
  onBack: () => void;
}

const Step3Settings = ({ initialData, onNext, onBack }: Props) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [agreed, setAgreed] = useState(initialData?.agreedToTerms ?? false);
  const [errors, setErrors] = useState<{ terms?: string }>({});

  const toggleTag = (tag: string) =>
    setTags((ts) => ts.includes(tag) ? ts.filter((t) => t !== tag) : [...ts, tag]);

  const validate = () => {
    const errs: { terms?: string } = {};
    if (!agreed) errs.terms = "You must agree to the platform terms to continue.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext({ tags, agreedToTerms: agreed });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Tags card */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-5">
        <div className="flex items-start gap-3 pb-2 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-accent-brand/10 flex items-center justify-center flex-shrink-0">
            <Tag size={16} className="text-accent-brand" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Project Tags</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tags help people discover your project. Select any that apply.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                tags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary shadow-brand-sm"
                  : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary-soft"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {tags.length}
            </span>
            <p className="text-xs text-muted-foreground">
              tags selected:{" "}
              <span className="font-semibold text-foreground">{tags.join(", ")}</span>
            </p>
          </div>
        )}
      </div>

      {/* Status note */}
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Your project status will be set to{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Open</span>{" "}
          automatically upon publishing.
        </p>
      </div>

      {/* Terms card */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-4">
        <div className="flex items-start gap-3 pb-2 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Platform Agreement</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please confirm before going live.
            </p>
          </div>
        </div>

        <div className={cn(
          "flex items-start gap-4 p-4 rounded-xl border transition-colors",
          agreed
            ? "border-primary/30 bg-primary-soft"
            : errors.terms
            ? "border-destructive/30 bg-destructive/5"
            : "border-border bg-muted/30"
        )}>
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(val) => {
              setAgreed(val === true);
              if (val) setErrors({});
            }}
            className="mt-0.5 flex-shrink-0"
          />
          <label htmlFor="terms" className="text-sm text-foreground leading-relaxed cursor-pointer">
            I agree to the{" "}
            <span className="text-primary font-semibold">platform terms</span> and{" "}
            <span className="text-primary font-semibold">quality guidelines</span>.{" "}
            I confirm that this project is legitimate and I have the right to recruit collaborators for it.
          </label>
        </div>

        {errors.terms && (
          <p className="text-xs text-destructive flex items-center gap-1">⚠ {errors.terms}</p>
        )}
      </div>

      <div className="flex justify-between pt-2 pb-10">
        <Button variant="outline" onClick={onBack} className="px-6">← Back</Button>
        <Button
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand px-8 font-bold"
        >
          Next: Review →
        </Button>
      </div>
    </div>
  );
};

export default Step3Settings;
