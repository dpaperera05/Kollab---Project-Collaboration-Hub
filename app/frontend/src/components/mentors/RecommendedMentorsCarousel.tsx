import { Star, CalendarCheck } from "lucide-react";
import type { Mentor } from "@/types/mentor";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

const RecommendedMentorsCarousel = ({ mentors, onBook }: { mentors: Mentor[]; onBook: (mentor: Mentor) => void }) => {
  const recommended = mentors.filter((m) => m.rating >= 4.8).slice(0, 6);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Recommended mentors
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recommended.map((m) => (
          <div
            key={m.id}
            className="flex-shrink-0 w-56 rounded-xl border border-border bg-card p-4 space-y-2 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="w-9 h-9 rounded-full border border-border object-cover"
                  loading="lazy"
                />
              ) : (
                <img
                  src={getDefaultAvatarUrl(m.id || m.name)}
                  alt={m.name}
                  className="w-9 h-9 rounded-full border border-border object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{m.name}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[11px] text-muted-foreground">{m.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {m.expertiseTags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[9px] font-medium">{t}</span>
              ))}
            </div>
            <button
              onClick={() => onBook(m)}
              className="w-full flex items-center justify-center gap-1.5 h-7 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
            >
              <CalendarCheck size={11} />
              Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedMentorsCarousel;
