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

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(job.postedDate).getTime()) / 86400000));
  const posted = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <Card className="p-5 border hover:shadow-md transition-all group">
      <div className="flex flex-col gap-3">
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
          <Badge variant="secondary" className="text-[11px]">{job.roleCategory}</Badge>
          {job.isTechJob && <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">Tech</Badge>}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.shortDescription}</p>

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
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="outline" className="text-xs" asChild>
            <Link to={`/insights/jobs/${job.id}`}>View Details</Link>
          </Button>
          <Button size="sm" className="text-xs gap-1" asChild>
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
