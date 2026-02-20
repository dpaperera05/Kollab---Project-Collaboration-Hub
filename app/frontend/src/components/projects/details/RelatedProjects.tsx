import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/mockProjects";

const STATUS_CONFIG = {
  Open: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
  Ongoing: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
  Filled: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", dot: "bg-orange-400" },
  Finished: { color: "text-muted-foreground", bg: "bg-muted border-border", dot: "bg-muted-foreground" },
};

const DIFFICULTY_CONFIG = {
  Beginner: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  Intermediate: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  Advanced: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" },
};

interface RelatedProjectsProps {
  projects: Project[];
}

const RelatedProjects = ({ projects }: RelatedProjectsProps) => {
  const navigate = useNavigate();

  if (!projects.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-base font-bold text-foreground">Related Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const statusConfig = STATUS_CONFIG[project.status];
          const diffConfig = DIFFICULTY_CONFIG[project.difficulty];
          return (
            <button
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              {/* Poster thumbnail */}
              <div className="relative h-28 overflow-hidden">
                <img
                  src={project.posterImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Chips overlay */}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm", statusConfig.bg, statusConfig.color)}>
                    {project.status}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm", diffConfig.bg, diffConfig.color)}>
                    {project.difficulty}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-primary">{project.domain}</p>
                <p className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {project.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{project.summary}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProjects;
