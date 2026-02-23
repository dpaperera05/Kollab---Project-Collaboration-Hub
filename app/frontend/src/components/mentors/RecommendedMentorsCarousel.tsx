import { Star, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockMentors, type Mentor } from "@/data/mockMentors";

const avatarColors = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-violet-500",
];

const RecommendedMentorsCarousel = ({ onBook }: { onBook: (mentor: Mentor) => void }) => {
  const recommended = mockMentors.filter((m) => m.rating >= 4.8).slice(0, 6);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Recommended mentors
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recommended.map((m, idx) => (
          <div
            key={m.id}
            className="flex-shrink-0 w-56 rounded-xl border border-border bg-card p-4 space-y-2 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              <div className={cn("w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold", avatarColors[idx % avatarColors.length])}>
                {m.avatar}
              </div>
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
