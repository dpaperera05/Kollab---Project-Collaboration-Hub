import { Link } from "react-router-dom";
import { Clock, Zap, Layers, ClipboardList, ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SimulationSummary } from "@/services/simulationsApi";

// ── Difficulty styling ────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:
    "border-emerald-300/60 bg-emerald-500/10 text-emerald-700 dark:border-emerald-700/70 dark:bg-emerald-900/30 dark:text-emerald-300",
  Intermediate:
    "border-amber-300/60 bg-amber-500/10 text-amber-700 dark:border-amber-700/70 dark:bg-amber-900/30 dark:text-amber-300",
  Advanced:
    "border-rose-300/60 bg-rose-500/10 text-rose-700 dark:border-rose-700/70 dark:bg-rose-900/30 dark:text-rose-300",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface SimulationCardProps {
  simulation: SimulationSummary;
}

const SimulationCard = ({ simulation }: SimulationCardProps) => {
  const {
    slug,
    title,
    roleCategory,
    difficulty,
    estimatedMinutes,
    xp,
    overview,
    skillsAssessed,
    tags,
    totalStages,
    totalTasks,
  } = simulation;

  const difficultyClass =
    DIFFICULTY_STYLES[difficulty] ??
    "border-border bg-secondary text-secondary-foreground";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Coloured top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Role + difficulty */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground border-border bg-background/80">
              <BriefcaseBusiness size={10} className="mr-1" />
              {roleCategory}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                difficultyClass
              )}
            >
              {difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Overview */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[60px]">
          {overview}
        </p>

        {/* Skills */}
        {skillsAssessed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skillsAssessed.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary"
              >
                {skill}
              </span>
            ))}
            {skillsAssessed.length > 3 && (
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{skillsAssessed.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background/70 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground sm:grid-cols-4">
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-amber-400" />
            <span className="font-semibold text-foreground">{xp}</span> XP
          </span>
          <span className="flex items-center gap-1.5">
            <Layers size={12} />
            {totalStages} stage{totalStages !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <ClipboardList size={12} />
            {totalTasks} task{totalTasks !== 1 ? "s" : ""}
          </span>
        </div>

        {/* CTA */}
        <Button
          asChild
          className="w-full mt-2 gap-2 group/btn"
          size="sm"
        >
          <Link to={`/simulations/${slug}`}>
            View Simulation
            <ArrowRight
              size={14}
              className="transition-transform group-hover/btn:translate-x-0.5"
            />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SimulationCard;
