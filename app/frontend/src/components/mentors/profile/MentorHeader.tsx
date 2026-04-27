import { ArrowLeft, Star, CalendarCheck, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Mentor } from "@/types/mentor";

const avatarColors = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-violet-500",
];

interface MentorHeaderProps {
  mentor: Mentor;
  colorIndex: number;
  avgRating: number;
  reviewCount: number;
  onBook: () => void;
  onMessage: () => void;
}

const MentorHeader = ({ mentor, colorIndex, avgRating, reviewCount, onBook, onMessage }: MentorHeaderProps) => {
  const navigate = useNavigate();
  const totalReviews = reviewCount > 0 ? reviewCount : mentor.reviewsCount;
  const displayRating = reviewCount > 0 ? avgRating : mentor.rating;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/mentors");
    }
  };

  return (
    <div className="border-b border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        {/* Back button */}
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Mentors
          </button>
        </div>

        {/* Profile row */}
        <div className="pb-6 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          {mentor.avatarUrl ? (
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-brand">
              <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={cn("flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold shadow-brand", avatarColors[colorIndex % avatarColors.length])}>
              {mentor.avatar}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{mentor.name}</h1>
            <p className="text-sm text-muted-foreground">{mentor.headline}</p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {/* Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={cn(s <= Math.round(displayRating) ? "fill-amber-400 text-amber-400" : "text-border")} />
                ))}
                <span className="ml-1 text-sm font-semibold text-foreground">{displayRating}</span>
                <span className="text-xs text-muted-foreground">({totalReviews} reviews)</span>
              </div>
              {/* Rate */}
              <span className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                mentor.rate === "Free"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                  : "text-foreground bg-secondary border-border"
              )}>
                {mentor.rate}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <button
              onClick={onBook}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
            >
              <CalendarCheck size={16} />
              Book a Session
            </button>
            <button
              onClick={onMessage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <MessageSquare size={15} />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorHeader;
