const STORAGE_KEY = "kollab_mentor_reviews";

export interface MentorReview {
  id: string;
  mentorId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function getAll(): Record<string, MentorReview[]> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveAll(data: Record<string, MentorReview[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getLocalReviewsForMentor(mentorId: string): MentorReview[] {
  return getAll()[mentorId] || [];
}

/** @deprecated Use getMergedReviews helper in components instead */
export function getReviewsForMentor(mentorId: string): MentorReview[] {
  return getLocalReviewsForMentor(mentorId);
}

export function addReview(review: MentorReview): void {
  const all = getAll();
  const existing = all[review.mentorId] || [];
  all[review.mentorId] = [review, ...existing];
  saveAll(all);
}

export function getAverageRating(reviews: MentorReview[], fallback: number): { avg: number; count: number } {
  if (reviews.length === 0) return { avg: fallback, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
