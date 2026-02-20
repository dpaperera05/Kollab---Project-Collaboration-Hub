import { Star, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProjectOwner } from "@/data/mockProjects";

interface OwnerCardProps {
  owner: ProjectOwner;
}

const OwnerCard = ({ owner }: OwnerCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project Owner</span>
      </div>

      <div className="flex items-start gap-3">
        <img
          src={owner.avatar}
          alt={owner.name}
          className="w-12 h-12 rounded-full border-2 border-border bg-muted flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-foreground leading-tight">{owner.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{owner.title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-foreground">{owner.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{owner.projectsPosted} projects</span>
          </div>
        </div>
      </div>

      <Link
        to={`/people/${owner.id}`}
        className="flex items-center justify-center gap-1.5 w-full h-10 rounded-lg border border-border text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <ExternalLink size={14} />
        View Profile
      </Link>
    </div>
  );
};

export default OwnerCard;
