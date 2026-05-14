import { Link } from "react-router-dom";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/data/mockJobMarket";

const seniorityColor: Record<string, string> = {
  Intern: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Junior: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  Mid: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Senior: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Lead: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Staff: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
};

const workModeColor: Record<string, string> = {
  Remote: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  Hybrid: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
  "On-site": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
};

// Role category label mappings
const ROLE_CATEGORY_LABELS: Record<string, string> = {
  devopscloud: "DevOps & Cloud Engineer",
  devopsandcloud: "DevOps & Cloud Engineer",
  dataai: "AI/ML Engineer",
  dataandai: "AI/ML Engineer",
  aianddata: "AI/ML Engineer",
  othertech: "Other Tech Jobs",
  otherengineering: "Other Tech Jobs",
  programmanagement: "Project Manager",
  frontend: "Front-End Development",
  frontenddev: "Front-End Development",
  frontenddeveloper: "Front-End Development",
  frontendengineer: "Front-End Development",
  frontendengineering: "Front-End Development",
  frontendweb: "Front-End Development",
  webfrontend: "Front-End Development",
  uiengineer: "Front-End Development",
  uideveloper: "Front-End Development",
  backend: "Back-End Development",
  backenddev: "Back-End Development",
  backenddeveloper: "Back-End Development",
  backendengineer: "Back-End Development",
  backendengineering: "Back-End Development",
  serverside: "Back-End Development",
  fullstack: "Full-Stack Development",
  fullstackdev: "Full-Stack Development",
  fullstackdeveloper: "Full-Stack Development",
  fullstackengineer: "Full-Stack Development",
  fullstackengineering: "Full-Stack Development",
  webdeveloper: "Full-Stack Development",
  webdevelopment: "Full-Stack Development",
  softwareengineer: "Full-Stack Development",
  softwaredeveloper: "Full-Stack Development",
  softwareengineering: "Software Engineer",
  softwaredevelopment: "Full-Stack Development",
  generalengineer: "Full-Stack Development",
  general: "Full-Stack Development",
  devops: "DevOps & Cloud Engineer",
  devopsengineer: "DevOps & Cloud Engineer",
  devopsengineering: "DevOps & Cloud Engineer",
  cloud: "DevOps & Cloud",
  cloudengineer: "DevOps & Cloud",
  cloudarchitect: "DevOps & Cloud",
  cloudengineering: "DevOps & Cloud",
  sre: "DevOps & Cloud",
  sitereliability: "DevOps & Cloud",
  sitereliabilityengineer: "DevOps & Cloud",
  platformengineer: "DevOps & Cloud",
  infrastructure: "DevOps & Cloud",
};

const toReadableLabel = (value: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeCategoryKey = (raw: string): string =>
  raw.toLowerCase().replace(/[\s_\-\/]+/g, "");

const labelForCategory = (raw: string): string =>
  ROLE_CATEGORY_LABELS[normalizeCategoryKey(raw)] ?? toReadableLabel(raw);

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const postedMs = Date.now() - new Date(job.postedDate).getTime();
  const postedHours = Number.isFinite(postedMs) ? Math.max(0, Math.floor(postedMs / 3600000)) : 0;
  const postedDays = Math.floor(postedHours / 24);
  const posted =
    postedHours < 1
      ? "Posted just now"
      : postedHours < 24
        ? `Posted ${postedHours}h ago`
        : postedDays === 1
          ? "Posted 1 day ago"
          : `Posted ${postedDays} days ago`;

  const preview = job.shortDescription?.trim() || "No description available for this role yet.";

  return (
    <Card className="h-full p-5 border hover:shadow-md transition-all group">
      <div className="h-full flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              to={`/insights/jobs/${job.id}`}
              className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">{job.company}</p>
          </div>
          <Badge variant="outline" className={`text-[11px] shrink-0 ${workModeColor[job.workMode] || ""}`}>
            {job.workMode}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
          <span>•</span>
          <span>{job.employmentType}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={12} />{posted}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${seniorityColor[job.seniority] || "bg-muted text-muted-foreground"}`}>
            {job.seniority}
          </span>
          <Badge variant="secondary" className="text-[11px]">{labelForCategory(job.roleCategory)}</Badge>
          {job.isTechJob && <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">Tech</Badge>}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[64px]">{preview}</p>

        {/* Skills & Tech chips */}
        <div className="flex flex-wrap gap-1">
          {job.technologies.slice(0, 4).map((t) => (
            <span key={t} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-primary/8 text-primary border border-primary/15">
              {t}
            </span>
          ))}
          {job.technologies.length > 4 && (
            <span className="px-2 py-0.5 text-[11px] text-muted-foreground">+{job.technologies.length - 4}</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button size="sm" variant="outline" className="text-xs flex-1" asChild>
            <Link to={`/insights/jobs/${job.id}`}>View Details</Link>
          </Button>
          <Button size="sm" className="text-xs gap-1 flex-1" asChild>
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply <ExternalLink size={12} />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
