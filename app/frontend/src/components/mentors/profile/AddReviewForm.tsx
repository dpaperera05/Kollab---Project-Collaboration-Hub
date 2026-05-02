import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { addReview } from "@/lib/reviewStore";
import { toast } from "@/hooks/use-toast";

interface AddReviewFormProps {
  mentorId: string;
  onAdded: () => void;
}

const AddReviewForm = ({ mentorId, onAdded }: AddReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0 || !comment.trim()) return;
    addReview({
      id: `rev-${Date.now()}`,
      mentorId,
      reviewerName: "You",
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });
    setRating(0);
    setComment("");
    onAdded();
    toast({ title: "Review submitted", description: "Thank you for your feedback!" });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-background p-5 shadow-sm">
      <h3 className="text-base font-bold text-foreground">Write a Review</h3>
      <p className="mt-1 text-xs text-muted-foreground">Share your mentoring experience to help other members.</p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-colors"
          >
            <Star
              size={19}
              className={cn(
                "transition-colors",
                s <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-border"
              )}
            />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-xs font-medium text-muted-foreground">{rating}/5</span>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="mt-3 w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || !comment.trim()}
        className="mt-3 h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-brand-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit Review
      </button>
    </div>
  );
};

export default AddReviewForm;
