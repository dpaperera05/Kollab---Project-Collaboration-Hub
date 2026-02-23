import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentorReview, getReviewsForMentor } from "@/lib/reviewStore";
import {type Mentor } from "@/data/mockMentors";
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
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {/* Rating summary */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-foreground">Reviews</h2>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold text-foreground">{displayRating}</span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={cn(s <= Math.round(displayRating) ? "fill-amber-400 text-amber-400" : "text-border")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{totalCount} review{totalCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="space-y-4 border-t border-border pt-4">
          {reviews.map((r) => (
            <div key={r.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{r.reviewerName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className={cn(s <= r.rating ? "fill-amber-400 text-amber-400" : "text-border")} />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add review form */}
      <div className="border-t border-border pt-5">
        <AddReviewForm mentorId={mentor.id} onAdded={onRefresh} />
      </div>
    </div>
  );
};

export default MentorReviews;
