import { Star, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProjectOwner } from "@/data/mockProjects";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

interface OwnerCardProps {
  owner: ProjectOwner;
}

const OwnerCard = ({ owner }: OwnerCardProps) => {
  // Route to /mentors/:id if owner is a mentor, otherwise /people/:id
  const profilePath = owner.userType === "mentor" ? `/mentors/${owner.id}` : `/people/${owner.id}`;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Card header strip */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="w-[3px] h-4 rounded-full bg-primary flex-shrink-0" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Project Owner
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <img
            src={owner.avatar || getDefaultAvatarUrl(owner.id || owner.name)}
            alt={owner.name}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = getDefaultAvatarUrl(owner.id || owner.name); }}
            className="w-12 h-12 rounded-full border-2 border-border bg-muted flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground leading-tight">{owner.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{owner.title}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-foreground">{owner.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">&middot;</span>
              <span className="text-sm text-muted-foreground">{owner.projectsPosted} projects</span>
            </div>
          </div>
        </div>

        <Link
          to={profilePath}
          className="flex items-center justify-center gap-1.5 w-full h-10 rounded-xl border border-border text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ExternalLink size={14} />
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default OwnerCard;