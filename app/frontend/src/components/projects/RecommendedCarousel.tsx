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
  <div className="flex gap-3 overflow-x-hidden">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-60 rounded-xl border border-border bg-card overflow-hidden">
        <Skeleton className="w-full h-28" />
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3.5 w-12 rounded" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
          <div className="flex gap-1 pt-0.5">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const STATUS_DOT: Record<string, string> = {
  Open:     "bg-emerald-500",
  Ongoing:  "bg-blue-500",
  Filled:   "bg-orange-500",
  Finished: "bg-zinc-400",
};

const RecommendedCarousel = ({ projects, title, subtitle, mode, loading = false }: RecommendedCarouselProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
  };

  const headingText = mode === "personalized" ? "Recommended matches" : title;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">{headingText}</h2>
              {mode === "personalized" && (
                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">AI</span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {mode === "personalized"
                  ? "Based on your skills, interests, and preferred roles."
                  : subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-md border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-md border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? "Show recommendations" : "Hide recommendations"}
          >
            {collapsed ? <><ChevronDown size={13} />Show</> : <><ChevronUp size={13} />Hide</>}
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        loading ? (
          <CarouselSkeleton />
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            {mode === "personalized"
              ? "Complete your profile to get personalized project matches."
              : "No open projects available yet."}
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {projects.map((project, idx) => {
              const poster = project.posterImage || FALLBACK_POSTERS[idx % FALLBACK_POSTERS.length];
              const firstReason = project.recommendationReasons?.[0];
              const matchedSkills = (project.matchedSkills ?? []).slice(0, 3);
              const statusDot = STATUS_DOT[project.status] ?? "bg-zinc-400";

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className={cn(
                    "flex-shrink-0 w-60 text-left rounded-xl border border-border bg-card overflow-hidden",
                    "hover:border-primary/30 hover:shadow-[0_2px_12px_hsl(var(--primary)/0.08)] transition-all duration-200"
                  )}
                >
                  {/* Cover */}
                  <div className="relative w-full h-28 overflow-hidden">
                    <img
                      src={poster}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    {/* Match badge */}
                    {mode === "personalized" && project.matchPercentage !== undefined && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
                        {project.matchPercentage}% match
                      </span>
                    )}
                    {/* Status indicator */}
                    <span className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[10px] font-semibold text-white">
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusDot)} />
                      {project.status}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-primary truncate max-w-[60%]">{project.domain}</span>
                      <span className={cn("text-[11px] font-semibold flex-shrink-0", DIFFICULTY_COLOR[project.difficulty] ?? "text-muted-foreground")}>
                        {project.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{project.title}</h3>

                    {/* Matched skills (personalized) or reason, fallback to summary */}
                    {mode === "personalized" && matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {matchedSkills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    ) : firstReason ? (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 italic">{firstReason}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.summary}</p>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {project.weeklyHours ? `${project.weeklyHours} hrs/wk` : project.duration ?? ""}
                      </span>
                      <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
                        View <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default RecommendedCarousel;
