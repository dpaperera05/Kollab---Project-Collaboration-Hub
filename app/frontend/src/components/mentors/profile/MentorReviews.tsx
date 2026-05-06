import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentorReview } from "@/lib/reviewStore";
import {type Mentor } from "@/types/mentor";
import AddReviewForm from "./AddReviewForm";
import { formatDistanceToNow } from "date-fns";

interface MentorReviewsProps {
  mentor: Mentor;
  reviews: MentorReview[];
  avgRating: number;
  onRefresh: () => void;
}

const MentorReviews = ({ mentor, reviews, avgRating, onRefresh }: MentorReviewsProps) => {
  const totalCount = reviews.length > 0 ? reviews.length : mentor.reviewsCount;
  const displayRating = reviews.length > 0 ? avgRating : mentor.rating;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">Reviews</h2>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-foreground">{displayRating}</span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={cn(s <= Math.round(displayRating) ? "fill-amber-400 text-amber-400" : "text-border")} />
              ))}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{totalCount} review{totalCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{r.reviewerName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className={cn(s <= r.rating ? "fill-amber-400 text-amber-400" : "text-border")} />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{r.comment}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-border pt-5">
        <AddReviewForm mentorId={mentor.id} onAdded={onRefresh} />
      </div>
    </section>
  );
};

export default MentorReviews;
