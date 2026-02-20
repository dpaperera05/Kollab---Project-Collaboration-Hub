import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  ChevronRight,
  Calendar } from
"lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/mockProjects";
import { formatDistanceToNow } from "date-fns";

const DIFFICULTY_CONFIG = {
  Beginner: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  Intermediate: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  Advanced: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" }
};

const STATUS_CONFIG = {
  Open: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
  Ongoing: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
  Filled: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", dot: "bg-orange-500" },
  Finished: { color: "text-muted-foreground", bg: "bg-muted border-border", dot: "bg-muted-foreground" }
};

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  const difficultyConfig = DIFFICULTY_CONFIG[project.difficulty];
  const statusConfig = STATUS_CONFIG[project.status];
  const topTechs = project.technologies.slice(0, 3);
  const displayedRoles = project.roles.slice(0, 3);
  const postedAgo = formatDistanceToNow(new Date(project.postedAt), { addSuffix: true });

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-2.5">
            <img
              src={project.posterAvatar}
              alt={project.posterName}
              className="w-9 h-9 rounded-full border border-border bg-muted flex-shrink-0"
              loading="lazy" />

            <div>
              <p className="text-xs font-semibold text-foreground leading-none">{project.posterName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px] text-muted-foreground">{project.posterRating}</span>
              </div>
            </div>
          </div>

          {/* Status + difficulty badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", statusConfig.bg, statusConfig.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
              {project.status}
            </span>
            <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold border", difficultyConfig.bg, difficultyConfig.color)}>
              {project.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
          {/* Domain badge */}
          <span className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
            {project.domain}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 pt-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {project.summary}
        </p>
        


      </div>

      {/* Meta row */}
      <div className="px-5 pt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        <MetaItem icon={<Clock size={12} />} label={project.timeCommitment} />
        <MetaItem icon={<MapPin size={12} />} label={project.location} />
        <MetaItem
          icon={<DollarSign size={12} />}
          label={project.compensation}
          className={project.compensation === "Paid" ? "text-emerald-600 dark:text-emerald-400" : ""} />

        <div className="flex items-center gap-1">
          {topTechs.map((t) =>
          <span key={t} className="chip px-2 py-0.5 rounded-md text-[11px] font-medium">
              {t}
            </span>
          )}
          {project.technologies.length > 3 &&
          <span className="text-[11px] text-muted-foreground">+{project.technologies.length - 3}</span>
          }
        </div>
      </div>

      {/* Roles */}
      <div className="px-5 pt-3 space-y-1.5">
        {displayedRoles.map((role, i) =>
        <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              role.status === "Open" ? "bg-emerald-500" : "bg-muted-foreground"
            )} />
              <span className="text-xs text-foreground/80 truncate">{role.title}</span>
            </div>
            <span className={cn(
            "flex-shrink-0 text-[11px] font-medium",
            role.filled === role.total ? "text-muted-foreground" : "text-primary"
          )}>
              {role.filled}/{role.total} filled
            </span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Engagement */}
      <div className="px-5 pt-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm">

          View Details
          <ChevronRight size={13} />
        </button>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-lg border transition-colors",
            bookmarked ?
            "border-primary bg-primary/10 text-primary" :
            "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          )}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark project"}>

          {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
        {project.mentorLinked






        }
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar size={11} />
          <span>Posted {postedAgo}</span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {project.tags.slice(0, 2).map((tag) =>
          <span key={tag} className="px-2 py-0.5 rounded-full border border-border text-[10px] text-muted-foreground">
              {tag}
            </span>
          )}
        </div>
      </div>
    </article>);

};

const MetaItem = ({
  icon,
  label,
  className




}: {icon: React.ReactNode;label: string;className?: string;}) =>
<div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
    {icon}
    <span>{label}</span>
  </div>;


export default ProjectCard;