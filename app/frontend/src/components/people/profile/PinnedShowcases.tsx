import { useNavigate } from "react-router-dom";
import { ChevronRight, Pin } from "lucide-react";
import { PinnedShowcase } from "@/data/mockPeople";
import { cn } from "@/lib/utils";

import posterAi from "@/assets/posters/poster-ai-sentiment.jpg";
import posterCode from "@/assets/posters/poster-code-review.jpg";
import posterElearn from "@/assets/posters/poster-elearning.jpg";
import posterIot from "@/assets/posters/poster-iot.jpg";

const posterMap: Record<number, string> = {
  0: posterAi,
  1: posterCode,
  2: posterElearn,
  3: posterIot,
};

interface Props {
  showcases: PinnedShowcase[];
}

const PinnedShowcases = ({ showcases }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Pin size={14} className="text-primary" />
        Pinned Showcases
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {showcases.slice(0, 4).map((s) => (
          <div
            key={s.id}
            className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-brand-sm transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/portfolio/${s.id}`)}
          >
            <div className="w-full h-32 overflow-hidden">
              <img src={posterMap[showcases.indexOf(s) % 4]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 space-y-3">
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {s.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {s.summary}
            </p>
            <div className="flex flex-wrap gap-1">
              {s.techStack.map((t) => (
                <span key={t} className="chip px-2 py-0.5 rounded-md text-[10px] font-medium">{t}</span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-1">
                {s.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full border border-border text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
                View <ChevronRight size={12} />
              </span>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedShowcases;
