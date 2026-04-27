import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, CalendarCheck, ChevronRight, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mentor } from "@/types/mentor";
import BookSessionModal from "./BookSessionModal";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";

const avatarColors = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-violet-500",
];

interface MentorCardProps {
  mentor: Mentor;
  index: number;
}

const MentorCard = ({ mentor, index }: MentorCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookOpen, setBookOpen] = useState(false);
  const colorIdx = index % avatarColors.length;

  const handleBookClick = () => {
    const session = getSession();
    if (!session?.token) {
      toast({ title: "Login required", description: "Please login to book a session.", variant: "destructive" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setBookOpen(true);
  };

  return (
    <>
      <article className="group flex flex-col rounded-2xl border border-border bg-card card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        <div className="p-5 space-y-3 flex-1">
          {/* Avatar + name */}
          <div className="flex items-start gap-3">
            {mentor.avatarUrl ? (
              <img
                src={mentor.avatarUrl}
                alt={mentor.name}
                className="w-12 h-12 rounded-full border border-border bg-muted flex-shrink-0 object-cover"
                loading="lazy"
              />
            ) : (
              <div className={cn("flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br text-white text-sm font-bold shadow-brand-sm", avatarColors[colorIdx])}>
                {mentor.avatar}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground truncate">{mentor.name}</h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{mentor.headline}</p>
            </div>
            {/* Smart search relevance badge */}
            {mentor.smartScore !== undefined && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                <Sparkles size={9} />
                {mentor.smartScore}%
              </span>
            )}
          </div>

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-1.5">
            {mentor.expertiseTags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-[10px] font-medium">
                {tag}
              </span>
            ))}
            {mentor.expertiseTags.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{mentor.expertiseTags.length - 5}</span>
            )}
          </div>

          {/* Domain tags */}
          <div className="flex flex-wrap gap-1.5">
            {mentor.domainTags.slice(0, 3).map((tag) => (
              <span key={tag} className="chip px-2 py-0.5 rounded-md text-[10px] font-medium">
                {tag}
              </span>
            ))}
          </div>

          {/* Smart search: first reason */}
          {mentor.searchReasons && mentor.searchReasons.length > 0 && (
            <p className="text-[11px] text-muted-foreground italic truncate">
              {mentor.searchReasons[0]}
            </p>
          )}

          {/* Languages */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe size={11} />
            {mentor.languages.slice(0, 3).join(", ")}
            {mentor.languages.length > 3 && ` +${mentor.languages.length - 3}`}
          </div>

          {/* Rating + Rate */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{mentor.rating}</span>
              <span className="text-xs text-muted-foreground">({mentor.reviewsCount})</span>
            </div>
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

        {/* CTA buttons */}
        <div className="px-5 pb-5 flex items-center gap-2">
          <button
            onClick={handleBookClick}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
          >
            <CalendarCheck size={13} />
            Book Session
          </button>
          <button
            onClick={() => navigate(`/mentors/${mentor.id}`)}
            className="h-9 px-3 flex items-center gap-1 rounded-lg border border-border text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            Profile
            <ChevronRight size={13} />
          </button>
        </div>
      </article>

      <BookSessionModal mentor={mentor} open={bookOpen} onOpenChange={setBookOpen} />
    </>
  );
};

export default MentorCard;
