import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import type { Project } from "@/data/mockProjects";
import { cn } from "@/lib/utils";

import posterResumeAi from "@/assets/posters/poster-resume-ai.jpg";
import posterCodeReview from "@/assets/posters/poster-code-review.jpg";
import posterRobotDelivery from "@/assets/posters/poster-robot-delivery.jpg";
import posterJobMarket from "@/assets/posters/poster-job-market.jpg";
import posterElearning from "@/assets/posters/poster-elearning.jpg";
import posterArCampus from "@/assets/posters/poster-ar-campus.jpg";

interface RecommendedCarouselProps {
  projects: Project[];
}

const DIFFICULTY_COLOR = {
  Beginner: "text-emerald-600 dark:text-emerald-400",
  Intermediate: "text-amber-600 dark:text-amber-400",
  Advanced: "text-rose-600 dark:text-rose-400",
};

// Map project IDs to their specific poster image
const PROJECT_POSTERS: Record<string, string> = {
  "1": posterResumeAi,
  "3": posterCodeReview,
  "4": posterRobotDelivery,
  "5": posterJobMarket,
  "7": posterElearning,
  "9": posterArCampus,
};

// Fallback order for any other open projects
const FALLBACK_POSTERS = [
  posterResumeAi,
  posterCodeReview,
  posterRobotDelivery,
  posterJobMarket,
  posterElearning,
  posterArCampus,
];

const RecommendedCarousel = ({ projects }: RecommendedCarouselProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const recommended = projects.filter((p) => p.status === "Open").slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Sparkles size={14} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Recommended for you</h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <><ChevronDown size={14} /> Show</> : <><ChevronUp size={14} /> Hide</>}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recommended.map((project, idx) => {
            const poster = PROJECT_POSTERS[project.id] ?? FALLBACK_POSTERS[idx % FALLBACK_POSTERS.length];
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className={cn(
                  "flex-shrink-0 w-72 text-left rounded-xl border border-border bg-card overflow-hidden",
                  "hover:border-primary/50 hover:shadow-brand-sm hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                {/* Poster thumbnail */}
                <div className="w-full h-32 overflow-hidden">
                  <img
                    src={poster}
                    alt={`${project.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Card content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
                      {project.domain}
                    </span>
                    <span className={cn("text-[11px] font-semibold", DIFFICULTY_COLOR[project.difficulty])}>
                      {project.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((t) => (
                      <span key={t} className="chip px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{project.timeCommitment}</span>
                    <span className="text-xs font-semibold text-primary">View →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendedCarousel;
