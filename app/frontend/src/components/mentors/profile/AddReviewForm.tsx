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
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Write a Review</h3>

      {/* Star selector */}
      <div className="flex items-center gap-1">
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
              size={20}
              className={cn(
                "transition-colors",
                s <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-border"
              )}
            />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-xs text-muted-foreground">{rating}/5</span>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || !comment.trim()}
        className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-brand-sm"
      >
        Submit Review
      </button>
    </div>
  );
};

export default AddReviewForm;
