import { useNavigate } from "react-router-dom";
import { ChevronRight, Pin } from "lucide-react";
import type { PinnedShowcase } from "@/types/personProfile";

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
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
        <Pin size={15} className="text-primary" />
        Pinned Showcases
      </h3>
      <p className="text-xs text-muted-foreground -mt-2">Highlighted portfolio work with real project outcomes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showcases.slice(0, 4).map((s) => (
          <div
            key={s.id}
            className="group rounded-xl border border-border bg-background overflow-hidden hover:border-primary/35 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/portfolio/${s.id}`)}
          >
            <div className="relative w-full h-40 overflow-hidden">
              <img
                src={s.coverImage || posterMap[showcases.indexOf(s) % 4]}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
            </div>
            <div className="p-4 space-y-3.5">
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {s.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.4rem]">
                {s.summary}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {s.techStack.slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-1 rounded-md border border-border bg-muted/25 text-[10px] font-medium text-foreground/80">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1.5 flex-wrap">
                  {s.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full border border-border text-[10px] text-muted-foreground bg-background">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                  View details <ChevronRight size={13} />
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
