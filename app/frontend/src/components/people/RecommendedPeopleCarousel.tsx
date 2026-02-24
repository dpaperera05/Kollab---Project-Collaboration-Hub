import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonProfile } from "@/data/mockPeople";

interface Props {
  people: PersonProfile[];
}

const RecommendedPeopleCarousel = ({ people }: Props) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  const recommended = people.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Sparkles size={14} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Recommended for you</h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => scroll("left")} className="p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => scroll("right")} className="p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {collapsed ? <><ChevronDown size={14} /> Show</> : <><ChevronUp size={14} /> Hide</>}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recommended.map((person) => (
            <button
              key={person.id}
              onClick={() => navigate(`/people/${person.id}`)}
              className={cn(
                "flex-shrink-0 w-64 text-left rounded-xl border border-border bg-card overflow-hidden p-4 space-y-3",
                "hover:border-primary/50 hover:shadow-brand-sm hover:-translate-y-0.5 transition-all duration-200"
              )}
            >
              <div className="flex items-center gap-3">
                <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-full border border-border bg-muted" loading="lazy" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{person.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{person.preferredRoles[0]}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{person.bio}</p>
              <div className="flex flex-wrap gap-1">
                {person.skills.slice(0, 3).map((s) => (
                  <span key={s} className="chip px-2 py-0.5 rounded-md text-[10px] font-medium">{s}</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-primary">View →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedPeopleCarousel;
