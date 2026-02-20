import { useState } from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/data/mockProjects";

interface TeamRowProps {
  members: TeamMember[];
}

const VISIBLE_COUNT = 4;

const TeamRow = ({ members }: TeamRowProps) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? members : members.slice(0, VISIBLE_COUNT);
  const extra = members.length - VISIBLE_COUNT;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-foreground">Team</h2>
        <span className="text-xs text-muted-foreground">({members.length} member{members.length !== 1 ? "s" : ""})</span>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-1">
        {visible.map((member) => (
          <div
            key={member.id}
            className="relative group"
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-10 h-10 rounded-full border-2 border-background bg-muted ring-1 ring-border"
              loading="lazy"
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-foreground text-background text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                <p className="font-semibold">{member.name}</p>
                <p className="text-[10px] opacity-70">{member.role}</p>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
            </div>
          </div>
        ))}

        {!showAll && extra > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 ring-1 ring-border flex items-center justify-center text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            +{extra}
          </button>
        )}
      </div>

      {(showAll || members.length <= VISIBLE_COUNT) && (
        <div className="grid grid-cols-2 gap-2">
          {(showAll ? members : visible).map((member) => (
            <div key={member.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-7 h-7 rounded-full border border-border bg-muted flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAll && members.length > VISIBLE_COUNT && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-primary hover:underline font-medium"
        >
          Show less
        </button>
      )}
    </section>
  );
};

export default TeamRow;
