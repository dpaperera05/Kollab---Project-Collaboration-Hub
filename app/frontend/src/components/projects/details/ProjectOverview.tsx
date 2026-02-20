import { Clock, MapPin, DollarSign, CheckCircle2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/mockProjects";
import { Separator } from "@/components/ui/separator";

const PROJECT_TYPE_CONFIG = {
  "Real-world": { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800" },
  "Coursework": { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  "Hackathon": { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  "Practice": { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
};

interface ProjectOverviewProps {
  project: Project;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-foreground mb-3">{children}</h2>
);

const MetaChip = ({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
    <span className="text-primary">{icon}</span>
    <span>{label}</span>
  </div>
);

const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  const typeConfig = PROJECT_TYPE_CONFIG[project.projectType];

  return (
    <section className="space-y-7">
      {/* Description */}
      <div>
        <SectionLabel>About this Project</SectionLabel>
        <p className="text-base text-muted-foreground leading-relaxed">{project.description}</p>
      </div>

      <Separator />

      {/* Problem Statement */}
      <div>
        <SectionLabel>Problem Statement</SectionLabel>
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-base text-muted-foreground leading-relaxed italic">"{project.problemStatement}"</p>
        </div>
      </div>

      <Separator />

      {/* Deliverables */}
      <div>
        <SectionLabel>Deliverables</SectionLabel>
        <ul className="space-y-2">
          {project.deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base text-foreground/80">
              <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Meta info grid */}
      <div>
        <SectionLabel>Project Details</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Type</p>
            <span className={cn("inline-block px-2.5 py-1 rounded-full text-xs font-semibold border", typeConfig.bg, typeConfig.color)}>
              {project.projectType}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Duration</p>
            <p className="text-sm font-medium text-foreground capitalize">{project.duration.replace("-", " ")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Time / Week</p>
            <p className="text-sm font-medium text-foreground">{project.timeCommitment}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</p>
            <MetaChip icon={<MapPin size={13} />} label={project.location} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Compensation</p>
            <MetaChip
              icon={<DollarSign size={13} />}
              label={project.compensation}
              className={project.compensation === "Paid" ? "text-emerald-600 dark:text-emerald-400" : ""}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Commitment</p>
            <MetaChip icon={<Clock size={13} />} label={project.timeCommitment} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Technologies */}
      <div>
        <SectionLabel>Technologies</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span key={tech} className="chip px-3 py-1 rounded-lg text-xs font-semibold">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Owner in overview */}
      <div>
        <SectionLabel>Posted by</SectionLabel>
        <div className="flex items-center gap-3">
          <img
            src={project.owner.avatar}
            alt={project.owner.name}
            className="w-11 h-11 rounded-full border border-border bg-muted"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{project.owner.name}</p>
            <p className="text-xs text-muted-foreground">{project.owner.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-muted-foreground">{project.owner.rating}</span>
              <span className="text-xs text-muted-foreground">· {project.owner.projectsPosted} projects posted</span>
            </div>
          </div>
          <Link
            to={`/people/${project.owner.id}`}
            className="flex-shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            View Profile →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectOverview;
