import { Clock, MapPin, DollarSign, CheckCircle2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/mockProjects";
import { Separator } from "@/components/ui/separator";

const PROJECT_TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  "Real-World Project":                { color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800"   },
  "Startup / Product Idea":            { color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"           },
  "Hackathon Project":                 { color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"       },
  "Open Source Contribution":          { color: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"},
  "Practice / Learning Project":       { color: "text-sky-600 dark:text-sky-400",        bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800"               },
  "Research Project":                  { color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800"   },
  "Prototype / MVP":                   { color: "text-fuchsia-600 dark:text-fuchsia-400",bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-200 dark:border-fuchsia-800"},
  "Competition Project":               { color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800"   },
  "Freelance Client Project":          { color: "text-teal-600 dark:text-teal-400",      bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800"           },
  "Experimental / Exploration":        { color: "text-rose-600 dark:text-rose-400",      bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"           },
  "Community / Social Impact Project": { color: "text-emerald-700 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"},
};

const DEFAULT_TYPE_CONFIG = { color: "text-muted-foreground", bg: "bg-muted/50 border-border" };

interface ProjectOverviewProps {
  project: Project;
}

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="w-[3px] h-5 rounded-full bg-primary flex-shrink-0" />
    <h2 className="text-[15px] font-bold text-foreground">{children}</h2>
  </div>
);

const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  const typeConfig = PROJECT_TYPE_CONFIG[project.projectType] ?? DEFAULT_TYPE_CONFIG;
  const safeDuration = project.duration ? project.duration.replace("-", " ") : "Not specified";

  return (
    <section className="space-y-8">

      {/* About */}
      <div>
        <SectionHeading>About this Project</SectionHeading>
        <p className="text-[15px] text-muted-foreground leading-relaxed">{project.description}</p>
      </div>

      <Separator />

      {/* Problem Statement */}
      <div>
        <SectionHeading>Problem Statement</SectionHeading>
        <div className="border-l-[3px] border-primary bg-primary/[0.03] dark:bg-primary/[0.06] rounded-r-xl px-5 py-4">
          <p className="text-[15px] text-foreground/80 leading-relaxed italic">
            &ldquo;{project.problemStatement}&rdquo;
          </p>
        </div>
      </div>

      <Separator />

      {/* Deliverables */}
      <div>
        <SectionHeading>Deliverables</SectionHeading>
        <ul className="space-y-2.5">
          {project.deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-[1px] w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[15px] text-foreground/80 leading-snug">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Project Details */}
      <div>
        <SectionHeading>Project Details</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Type</span>
            <span className={cn("inline-block self-start px-2 py-0.5 rounded-full text-xs font-semibold border mt-0.5", typeConfig.bg, typeConfig.color)}>
              {project.projectType}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Duration</span>
            <span className="text-sm font-semibold text-foreground capitalize">{safeDuration}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Location</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <MapPin size={12} className="text-primary flex-shrink-0" />
              {project.location}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Time / Week</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Clock size={12} className="text-primary flex-shrink-0" />
              {project.timeCommitment}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Compensation</span>
            <span className={cn("text-sm font-semibold flex items-center gap-1.5 mt-0.5",
              project.compensation === "Paid" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
            )}>
              <DollarSign size={12} className="flex-shrink-0" />
              {project.compensation}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Commitment</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Clock size={12} className="text-primary flex-shrink-0" />
              {project.timeCommitment}
            </span>
          </div>

        </div>
      </div>

      <Separator />

      {/* Technologies */}
      <div>
        <SectionHeading>Technologies</SectionHeading>
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
            <SectionHeading>Tags</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full border border-border bg-muted/30 text-xs text-muted-foreground hover:bg-muted transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Posted by */}
      <div>
        <SectionHeading>Posted by</SectionHeading>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <img
            src={project.owner.avatar}
            alt={project.owner.name}
            className="w-11 h-11 rounded-full border-2 border-border bg-muted flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{project.owner.name}</p>
            <p className="text-xs text-muted-foreground">{project.owner.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-foreground">{project.owner.rating}</span>
              <span className="text-xs text-muted-foreground">
                &middot; {project.owner.projectsPosted} projects posted
              </span>
            </div>
          </div>
          <Link
            to={`/people/${project.owner.id}`}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
          >
            View Profile &rarr;
          </Link>
        </div>
      </div>

    </section>
  );
};

export default ProjectOverview;