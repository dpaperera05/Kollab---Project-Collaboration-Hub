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
  email?: string;
  avatar: string;
  avatarUrl?: string;
  headline: string;
  location?: string;
  timezone?: string;
  expertiseTags: string[];
  domainTags: string[];
  languages: string[];
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  rating: number;
  reviewsCount: number;
  rate: string;
  timeSlots: string[];
  availabilitySlots?: Array<{ date: string; startTime: string; endTime: string; timezone?: string; note?: string }>;
  bio: string;
  reviews: MentorReview[];
  /** 0–100 relevance score returned by smart search — absent in normal listing */
  smartScore?: number;
  /** Short explanations of why this mentor matched — absent in normal listing */
  searchReasons?: string[];
}
