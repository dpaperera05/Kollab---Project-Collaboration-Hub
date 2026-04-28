import { Link } from "react-router-dom";
import { Clock, Zap, Layers, ClipboardList, ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SimulationSummary } from "@/services/simulationsApi";

// ── Difficulty styling ────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  Intermediate:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  Advanced:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400",
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
    <div className="group flex flex-col rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover overflow-hidden">
      {/* Coloured top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-purple-400" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Role + difficulty */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground border-border">
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
        <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Overview */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {overview}
        </p>

        {/* Skills */}
        {skillsAssessed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skillsAssessed.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium text-primary border border-primary/20"
              >
                {skill}
              </span>
            ))}
            {skillsAssessed.length > 4 && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                +{skillsAssessed.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/60">
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
          className="w-full mt-1 gap-2 group/btn"
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
