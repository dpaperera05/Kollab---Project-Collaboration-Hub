import { ArrowLeft, Star, CalendarCheck, MessageSquare, Mail, MapPin, Clock3, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Mentor } from "@/types/mentor";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

interface MentorHeaderProps {
  mentor: Mentor;
  colorIndex: number;
  avgRating: number;
  reviewCount: number;
  onBook: () => void;
  onMessage: () => void;
  canBook?: boolean;
}

const MentorHeader = ({ mentor, colorIndex: _colorIndex, avgRating, reviewCount, onBook, onMessage, canBook = true }: MentorHeaderProps) => {
  const navigate = useNavigate();
  const totalReviews = reviewCount > 0 ? reviewCount : mentor.reviewsCount;
  const displayRating = reviewCount > 0 ? avgRating : mentor.rating;
  const meta = [
    mentor.location ? { key: "location", label: mentor.location, icon: MapPin } : null,
    mentor.timezone ? { key: "timezone", label: mentor.timezone, icon: Clock3 } : null,
    mentor.email ? { key: "email", label: mentor.email, icon: Mail } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; icon: typeof MapPin }>;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/mentors");
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 pb-2 pt-2 text-xs text-muted-foreground sm:text-sm">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-medium transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to Mentors
        </button>
        <span className="text-border">/</span>
        <span className="font-medium text-foreground/80">Public Profile</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_88%_12%,hsl(270_75%_58%/0.12),transparent_42%),linear-gradient(160deg,hsl(var(--card)),hsl(var(--muted)/0.3))]" />
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/70 bg-muted shadow-lg sm:h-28 sm:w-28">
                <img
                  src={mentor.avatarUrl || getDefaultAvatarUrl(mentor.id || mentor.name)}
                  alt={mentor.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 space-y-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <BadgeCheck size={13} />
                  Mentor
                </span>
                <div className="space-y-1.5">
                  <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{mentor.name}</h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{mentor.headline}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={cn(s <= Math.round(displayRating) ? "fill-amber-400 text-amber-400" : "text-border")} />
                    ))}
                    <span className="ml-1 text-sm font-semibold text-foreground">{displayRating}</span>
                    <span className="text-xs text-muted-foreground">({totalReviews} reviews)</span>
                  </div>
                  <span className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-semibold",
                    mentor.rate === "Free"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-border bg-secondary text-foreground"
                  )}>
                    {mentor.rate}
                  </span>
                </div>

                {meta.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {meta.map(({ key, label, icon: Icon }) => (
                      <span key={key} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        <Icon size={12} className="text-primary" />
                        <span className="truncate">{label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full space-y-2.5 lg:w-auto lg:min-w-[220px]">
              {canBook ? (
                <button
                  onClick={onBook}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <CalendarCheck size={16} />
                  Book a Session
                </button>
              ) : (
                <div className="rounded-xl border border-border bg-background/80 px-3 py-2 text-center text-xs text-muted-foreground">
                  This is your public mentor profile.
                </div>
              )}
              <button
                onClick={onMessage}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <MessageSquare size={15} />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorHeader;
