import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, ChevronRight, Clock, DollarSign, Sparkles, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export type ProjectCardProject = {
  id: string;
  title: string;
  summary: string;
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
  posterRating?: number;
  timeCommitment?: string;
  location?: string;
  roles: Array<{ title: string; status?: "Open" | "Filled"; filled?: number; total?: number; seats?: number }>;
  /** AI Smart Search relevance score (0–100). Only present when smart search is active. */
  smartScore?: number;
  /** Short user-friendly reasons for this result. Only present when smart search is active. */
  searchReasons?: string[];
};

// Domain-based gradient covers for cards without a poster image
const DOMAIN_COVER: Record<string, string> = {
  "AI & ML":              "from-violet-500/20 via-indigo-500/10 to-violet-500/5",
  "Software Engineering": "from-slate-500/15 via-slate-400/10 to-zinc-500/5",
  "Robotics":             "from-cyan-500/20 via-blue-500/10 to-cyan-500/5",
  "IoT":                  "from-teal-500/20 via-emerald-500/10 to-teal-500/5",
  "Data Science":         "from-blue-500/20 via-indigo-500/10 to-blue-500/5",
  "Cybersecurity":        "from-red-500/15 via-orange-500/10 to-red-500/5",
  "Web Dev":              "from-indigo-500/20 via-purple-500/10 to-indigo-500/5",
  "Mobile Dev":           "from-emerald-500/20 via-teal-500/10 to-emerald-500/5",
};

const DOMAIN_ABBR: Record<string, string> = {
  "AI & ML":              "AI",
  "Software Engineering": "SE",
  "Robotics":             "RB",
  "IoT":                  "IoT",
  "Data Science":         "DS",
  "Cybersecurity":        "CY",
  "Web Dev":              "WD",
  "Mobile Dev":           "MD",
};

const DIFFICULTY_CONFIG = {
  Beginner:     "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  Intermediate: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  Advanced:     "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
};

const STATUS_CONFIG = {
  Open:     { dot: "bg-emerald-500", cls: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
  Ongoing:  { dot: "bg-blue-500",    cls: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
  Filled:   { dot: "bg-orange-500",  cls: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800" },
  Finished: { dot: "bg-zinc-400",    cls: "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700" },
};

interface ProjectCardProps {
  project: ProjectCardProject;
  bookmarked?: boolean;
  onToggleBookmark?: (projectId: string, next: boolean) => Promise<void> | void;
}

const ProjectCard = ({ project, bookmarked = false, onToggleBookmark }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);

  useEffect(() => { setIsBookmarked(bookmarked); }, [bookmarked]);

  const handleBookmark = async () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      await onToggleBookmark?.(project.id, next);
    } catch {
      setIsBookmarked(!next);
    }
  };

  const diffCls    = DIFFICULTY_CONFIG[project.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.Beginner;
  const statusCfg  = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.Open;
  const topTechs   = (project.technologies ?? []).slice(0, 3);
  const extraTechs = Math.max(0, (project.technologies ?? []).length - 3);
  const openRoles  = (project.roles ?? []).filter(r => r.status !== "Filled").slice(0, 2);
  const postedAgo  = formatDistanceToNow(new Date(project.postedAt), { addSuffix: true });
  const coverGrad  = DOMAIN_COVER[project.domain] ?? "from-primary/15 via-primary/10 to-primary/5";
  const domAbbr    = DOMAIN_ABBR[project.domain] ?? project.domain.slice(0, 2).toUpperCase();
  const posterName = project.posterName || "Project owner";
  const posterInit = (posterName[0] || "P").toUpperCase();

  return (
    <article className={cn(
      "group flex flex-col rounded-xl border border-border bg-card overflow-hidden",
      "hover:border-primary/30 hover:shadow-[0_2px_16px_hsl(var(--primary)/0.08),0_1px_3px_hsl(240_10%_10%/0.05)]",
      "transition-all duration-200"
    )}>
      {/* ── Cover ─────────────────────────────────────────────── */}
      {project.posterImage ? (
        <div className="relative w-full h-36 flex-shrink-0 overflow-hidden">
          <img
            src={project.posterImage}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className={cn("absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-sm", statusCfg.cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusCfg.dot)} />
            {project.status}
          </span>
          {project.smartScore !== undefined && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles size={9} />{project.smartScore}%
            </span>
          )}
        </div>
      ) : (
        <div className={cn("relative w-full h-28 flex-shrink-0 overflow-hidden bg-gradient-to-br", coverGrad)}>
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Domain watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-4xl font-black tracking-tighter text-foreground/[0.06]">{domAbbr}</span>
          </div>
          <span className={cn("absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border", statusCfg.cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusCfg.dot)} />
            {project.status}
          </span>
          {project.smartScore !== undefined && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
              <Sparkles size={9} />{project.smartScore}%
            </span>
          )}
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
        {/* Creator row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {project.posterAvatar ? (
              <img
                src={project.posterAvatar}
                alt={posterName}
                className="w-6 h-6 rounded-full border border-border bg-muted flex-shrink-0 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-6 h-6 rounded-full border border-border bg-muted/80 flex-shrink-0 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                {posterInit}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">{posterName}</span>
          </div>
          <span className={cn("flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-semibold border", diffCls)}>
            {project.difficulty}
          </span>
        </div>

        {/* Title + domain */}
        <div>
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20">
            {project.domain}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{project.summary}</p>

        {/* Smart search reason */}
        {project.smartScore !== undefined && project.searchReasons?.[0] && (
          <p className="text-[11px] text-primary/70 italic line-clamp-1 leading-snug">{project.searchReasons[0]}</p>
        )}

        {/* Tech stack */}
        {(topTechs.length > 0 || extraTechs > 0) && (
          <div className="flex flex-wrap items-center gap-1">
            {topTechs.map(t => <span key={t} className="chip px-2 py-0.5 rounded-md text-[11px] font-medium">{t}</span>)}
            {extraTechs > 0 && <span className="text-[11px] text-muted-foreground">+{extraTechs}</span>}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {project.weeklyHours != null && (
            <span className="flex items-center gap-1"><Clock size={10} />{project.weeklyHours} hrs/wk</span>
          )}
          {project.duration && (
            <span className="capitalize">{project.duration.replace("-", " ")}</span>
          )}
          {project.compensation && (
            <span className={cn("flex items-center gap-1", project.compensation.toLowerCase().includes("paid") ? "text-emerald-600 dark:text-emerald-400" : "")}>
              <DollarSign size={10} />{project.compensation}
            </span>
          )}
        </div>

        {/* Open roles */}
        {openRoles.length > 0 && (
          <div className="border-t border-border/60 pt-2.5 space-y-1.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Users size={10} />Open roles
            </p>
            {openRoles.map((role, i) => {
              const total = role.total ?? role.seats ?? 0;
              const filled = role.filled ?? 0;
              return (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground/80 truncate">{role.title}</span>
                  <span className="text-[11px] text-primary font-medium flex-shrink-0">
                    {total > 0 ? `${Math.min(filled, total)}/${total}` : "Open"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Spacer pushes CTA to bottom */}
        <div className="flex-1" />

        {/* CTA row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            View project
            <ChevronRight size={13} />
          </button>
          <button
            onClick={handleBookmark}
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-lg border transition-colors",
              isBookmarked
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
            )}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark project"}
          >
            {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>

        {/* Posted timestamp */}
        <p className="text-[11px] text-muted-foreground/70">{postedAgo}</p>
      </div>
    </article>
  );
};

export default ProjectCard;
