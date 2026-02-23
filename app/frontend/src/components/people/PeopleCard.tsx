import { useNavigate } from "react-router-dom";
import { Briefcase, Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PersonProfile } from "@/data/mockPeople";

interface PeopleCardProps {
  person: PersonProfile;
}

const PeopleCard = ({ person }: PeopleCardProps) => {
  const navigate = useNavigate();
  const roleChips = person.preferredRoles.slice(0, 2);
  const skillChips = [...person.skills, ...person.techStack]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0 flex items-start gap-3.5">
        <img
          src={person.avatar}
          alt={person.name}
          className="w-12 h-12 rounded-full border border-border bg-muted flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
            {person.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {person.bio}
          </p>
        </div>
      </div>

      {/* Role chips */}
      <div className="px-5 pt-3 flex flex-wrap gap-1.5">
        {roleChips.map((role) => (
          <span
            key={role}
            className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold"
          >
            {role}
          </span>
        ))}
      </div>

      {/* Skill chips */}
      <div className="px-5 pt-2.5 flex flex-wrap gap-1">
        {skillChips.map((skill) => (
          <span key={skill} className="chip px-2 py-0.5 rounded-md text-[11px] font-medium">
            {skill}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats row */}
      <div className="px-5 pt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Briefcase size={12} />
          Projects: <span className="font-semibold text-foreground">{person.stats.projectsCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <Layers size={12} />
          Showcases: <span className="font-semibold text-foreground">{person.stats.showcasesCount}</span>
        </span>
      </div>

      {/* Action */}
      <div className="px-5 pt-3 pb-5">
        <button
          onClick={() => navigate(`/people/${person.id}`)}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 h-9 rounded-lg",
            "bg-primary text-primary-foreground text-xs font-semibold",
            "hover:bg-primary/90 transition-colors shadow-brand-sm"
          )}
        >
          View Profile
          <ChevronRight size={13} />
        </button>
      </div>
    </article>
  );
};

export default PeopleCard;
