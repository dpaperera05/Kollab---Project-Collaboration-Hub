import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import posterResumeAi from "@/assets/posters/poster-resume-ai.jpg";
import posterCodeReview from "@/assets/posters/poster-code-review.jpg";
import posterRobotDelivery from "@/assets/posters/poster-robot-delivery.jpg";
import posterJobMarket from "@/assets/posters/poster-job-market.jpg";
import posterElearning from "@/assets/posters/poster-elearning.jpg";
import posterArCampus from "@/assets/posters/poster-ar-campus.jpg";

export type RecommendationProject = {
  id: string;
  title: string;
  summary: string;
  problemStatement?: string;
  domain: string;
  difficulty: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
  technologies: string[];
  tags: string[];
  postedAt: string;
  compensation?: string;
  weeklyHours?: number;
  duration?: string;
  posterImage?: string;
  posterName?: string;
  posterAvatar?: string;
  roles: Array<{ title: string; status?: "Open" | "Filled"; total?: number; filled?: number }>;
  matchPercentage?: number;
  matchedSkills?: string[];
  matchedRoles?: string[];
  recommendationReasons?: string[];
};

interface RecommendedCarouselProps {
  projects: RecommendationProject[];
  title: string;
  subtitle: string;
  mode: "personalized" | "latest";
  loading?: boolean;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "text-emerald-600 dark:text-emerald-400",
  Intermediate: "text-amber-600 dark:text-amber-400",
  Advanced: "text-rose-600 dark:text-rose-400",
};

// Fallback posters cycle through for projects without a real posterImage
const FALLBACK_POSTERS = [
  posterResumeAi,
  posterCodeReview,
  posterRobotDelivery,
  posterJobMarket,
  posterElearning,
  posterArCampus,
];

const CarouselSkeleton = () => (
  <div className="flex gap-4 overflow-x-hidden pb-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-72 rounded-xl border border-border bg-card overflow-hidden">
        <Skeleton className="w-full h-32" />
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecommendedCarousel = ({ projects, title, subtitle, mode, loading = false }: RecommendedCarouselProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Sparkles size={14} className="text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            {mode === "personalized" && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">AI</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground pl-9">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <><ChevronDown size={14} /> Show</> : <><ChevronUp size={14} /> Hide</>}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {loading ? (
            <CarouselSkeleton />
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {mode === "personalized"
                ? "No recommendations available yet. Complete your profile or check back when more projects are posted."
                : "No open projects are available yet."}
            </p>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {projects.map((project, idx) => {
                const poster = project.posterImage || FALLBACK_POSTERS[idx % FALLBACK_POSTERS.length];
                const timeLabel = project.weeklyHours ? `${project.weeklyHours} hrs/week` : project.duration ?? "";
                const firstReason = project.recommendationReasons?.[0];

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className={cn(
                      "flex-shrink-0 w-72 text-left rounded-xl border border-border bg-card overflow-hidden",
                      "hover:border-primary/50 hover:shadow-brand-sm hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    {/* Poster thumbnail */}
                    <div className="w-full h-32 overflow-hidden relative">
                      <img
                        src={poster}
                        alt={`${project.title} cover`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Match percentage badge — personalized only */}
                      {mode === "personalized" && project.matchPercentage !== undefined && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow">
                          {project.matchPercentage}% Match
                        </span>
                      )}
                    </div>

                    {/* Card content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold truncate max-w-[55%]">
                          {project.domain}
                        </span>
                        <span className={cn("text-[11px] font-semibold flex-shrink-0", DIFFICULTY_COLOR[project.difficulty] ?? "text-muted-foreground")}>
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
                      {/* Recommendation reason — personalized only */}
                      {mode === "personalized" && firstReason && (
                        <p className="text-[10px] text-primary/70 italic leading-snug line-clamp-1">{firstReason}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">{timeLabel}</span>
                        <span className="text-xs font-semibold text-primary">View →</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendedCarousel;
