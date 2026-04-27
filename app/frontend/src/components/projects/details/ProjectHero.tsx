import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/mockProjects";

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  Open:     { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/20 border-emerald-400/40", dot: "bg-emerald-500" },
  Ongoing:  { color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/20 border-blue-400/40",      dot: "bg-blue-500"   },
  Filled:   { color: "text-orange-400",                        bg: "bg-orange-500/20 border-orange-400/40",  dot: "bg-orange-400" },
  Finished: { color: "text-zinc-300",                          bg: "bg-zinc-500/20 border-zinc-400/40",      dot: "bg-zinc-400"   },
};
const DEFAULT_STATUS_CONFIG  = { color: "text-white/80",  bg: "bg-white/10 border-white/20",  dot: "bg-white/60" };

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string }> = {
  Beginner:     { color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-400/40" },
  Intermediate: { color: "text-amber-300",   bg: "bg-amber-500/20 border-amber-400/40"   },
  Advanced:     { color: "text-rose-300",    bg: "bg-rose-500/20 border-rose-400/40"     },
};
const DEFAULT_DIFFICULTY_CONFIG = { color: "text-white/80", bg: "bg-white/10 border-white/20" };

interface ProjectHeroProps {
  project: Project;
}

const ProjectHero = ({ project }: ProjectHeroProps) => {
  const statusConfig = STATUS_CONFIG[project.status]   ?? DEFAULT_STATUS_CONFIG;
  const diffConfig   = DIFFICULTY_CONFIG[project.difficulty] ?? DEFAULT_DIFFICULTY_CONFIG;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 300 }}>
      {/* Background poster — clearly visible */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02]"
        style={{ backgroundImage: `url(${project.posterImage})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
      {/* Bottom fade for status badge area */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 md:pb-14">

        <div className="mb-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Projects
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/30 border border-primary/40 text-white backdrop-blur-sm">
                {project.domain}
              </span>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm",
                diffConfig.bg, diffConfig.color
              )}>
                {project.difficulty}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white backdrop-blur-sm">
                {project.projectType}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              {project.title}
            </h1>

            {/* Status badge */}
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border backdrop-blur-sm",
              statusConfig.bg, statusConfig.color
            )}>
              <span className={cn("w-2 h-2 rounded-full", statusConfig.dot)} />
              {project.status}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectHero;
