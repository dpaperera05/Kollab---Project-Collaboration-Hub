import { ArrowLeft, Clock, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/mockProjects";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Open:     { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40",  border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500"         },
  Ongoing:  { color: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/40",        border: "border-blue-200 dark:border-blue-800",       dot: "bg-blue-500"            },
  Filled:   { color: "text-orange-700 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/40",    border: "border-orange-200 dark:border-orange-800",   dot: "bg-orange-500"          },
  Finished: { color: "text-zinc-500 dark:text-zinc-400",       bg: "bg-zinc-50 dark:bg-zinc-900/40",        border: "border-zinc-200 dark:border-zinc-700",        dot: "bg-zinc-400"            },
};
const DEFAULT_STATUS = { color: "text-muted-foreground", bg: "bg-muted", border: "border-border", dot: "bg-muted-foreground" };

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Beginner:     { color: "text-white",                              bg: "bg-emerald-500 dark:bg-emerald-600",     border: "border-emerald-600 dark:border-emerald-500" },
  Intermediate: { color: "text-white",                              bg: "bg-amber-500 dark:bg-amber-500",         border: "border-amber-600 dark:border-amber-400"     },
  Advanced:     { color: "text-white",                              bg: "bg-rose-500 dark:bg-rose-600",           border: "border-rose-600 dark:border-rose-500"        },
};
const DEFAULT_DIFFICULTY = { color: "text-white", bg: "bg-zinc-500", border: "border-zinc-600" };

interface ProjectHeroProps {
  project: Project;
}

const ProjectHero = ({ project }: ProjectHeroProps) => {
  const navigate = useNavigate();
  const statusCfg = STATUS_CONFIG[project.status]         ?? DEFAULT_STATUS;
  const diffCfg   = DIFFICULTY_CONFIG[project.difficulty] ?? DEFAULT_DIFFICULTY;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/projects");
  };

  return (
    <div>
      {/* ─── Header section ─── */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 pt-5 pb-5">

          {/* Row 1: back link (left) + type badges (right, desktop only) */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Projects
            </button>

            {/* Badges — right side on desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
                diffCfg.bg, diffCfg.border, diffCfg.color
              )}>
                {project.difficulty}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 border border-violet-300 text-violet-700 dark:bg-violet-900/50 dark:border-violet-700 dark:text-violet-300">
                {project.projectType}
              </span>
            </div>
          </div>

          {/* Mobile badges */}
          <div className="flex sm:hidden flex-wrap items-center gap-2 mb-2">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
              diffCfg.bg, diffCfg.border, diffCfg.color
            )}>
              {project.difficulty}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 border border-violet-300 text-violet-700 dark:bg-violet-900/50 dark:border-violet-700 dark:text-violet-300">
              {project.projectType}
            </span>
          </div>

          {/* Domain label above title */}
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
            {project.domain}
          </p>

          {/* Title */}
          <h1 className="text-[1.5rem] sm:text-[1.875rem] md:text-[2.125rem] font-extrabold text-foreground leading-tight tracking-tight mb-3 max-w-4xl">
            {project.title}
          </h1>

          {/* Status + meta + tags — single compact row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">

            {/* Status pill */}
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0",
              statusCfg.bg, statusCfg.border, statusCfg.color
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusCfg.dot)} />
              {project.status}
            </span>

            <span className="w-px h-3.5 bg-border/70 hidden sm:block flex-shrink-0" />

            {/* Meta chips */}
            {project.timeCommitment && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} className="flex-shrink-0 opacity-60" />
                {project.timeCommitment}
              </span>
            )}
            {project.location && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} className="flex-shrink-0 opacity-60" />
                {project.location}
              </span>
            )}
            {project.compensation && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs",
                project.compensation === "Paid"
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              )}>
                <DollarSign size={11} className="flex-shrink-0 opacity-70" />
                {project.compensation}
              </span>
            )}

            {/* Tags — subtle, inline */}
            {project.tags && project.tags.length > 0 && (
              <>
                <span className="w-px h-3.5 bg-border/70 hidden sm:block flex-shrink-0" />
                <div className="flex flex-wrap items-center gap-1">
                  {project.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium text-primary bg-primary/8 border border-primary/20 dark:bg-primary/15 dark:border-primary/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ─── Poster section ─── */}
      <div className="border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 pt-4 pb-5">
          <div className="w-full rounded-xl overflow-hidden border border-border shadow-sm bg-muted" style={{ aspectRatio: "21/5" }}>
            {project.posterImage ? (
              <img
                src={project.posterImage}
                alt={`${project.title} cover`}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-4 bg-gradient-to-br from-primary/[0.06] via-background to-muted/50 px-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{project.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{project.domain}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHero;