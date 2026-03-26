export interface MentorReview {
  id: string;
  mentorId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  headline: string;
  expertiseTags: string[];
  domainTags: string[];
  languages: string[];
  rating: number;
  reviewsCount: number;
  rate: string;
  timeSlots: string[];
  availabilitySlots?: Array<{ date: string; startTime: string; endTime: string; timezone?: string; note?: string }>;
  bio: string;
  reviews: MentorReview[];
}
