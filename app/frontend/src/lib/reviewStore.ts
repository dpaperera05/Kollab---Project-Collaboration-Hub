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

// ── Review data for presentation ──────────────────────────────────────────────

interface MentorReviewTemplate {
  mentorName: string;
  reviews: Array<{
    reviewerName: string;
    rating: number;
    comment: string;
    daysAgo: number;
  }>;
}

const PREPARED_REVIEWS: MentorReviewTemplate[] = [
  {
    mentorName: "Sarah Chen",
    reviews: [
      {
        reviewerName: "Alex Rivera",
        rating: 5,
        comment: "Sarah helped me understand how to structure an AI project from data preparation to deployment. Her feedback made my project scope much clearer.",
        daysAgo: 12
      },
      {
        reviewerName: "Jordan Kim",
        rating: 5,
        comment: "Excellent guidance on machine learning workflows. Sarah explained complex concepts in a way that was easy to understand and apply.",
        daysAgo: 18
      },
      {
        reviewerName: "Taylor Bennett",
        rating: 4,
        comment: "Very knowledgeable about NLP and deep learning. The session was packed with practical insights I could use right away.",
        daysAgo: 25
      },
      {
        reviewerName: "Morgan Lee",
        rating: 5,
        comment: "Sarah's expertise in AI really shines through. She helped me identify gaps in my model architecture and suggested practical improvements.",
        daysAgo: 31
      }
    ]
  },
  {
    mentorName: "James Okonkwo",
    reviews: [
      {
        reviewerName: "Casey Harper",
        rating: 5,
        comment: "James explained deployment pipelines in a practical way and helped me identify what was missing from my project setup.",
        daysAgo: 8
      },
      {
        reviewerName: "Riley Martinez",
        rating: 4,
        comment: "Great session on DevOps practices. James walked me through CI/CD concepts and helped me set up automated testing for my project.",
        daysAgo: 14
      },
      {
        reviewerName: "Drew Phillips",
        rating: 5,
        comment: "His cloud architecture knowledge is impressive. James helped me design a scalable infrastructure for my final year project.",
        daysAgo: 22
      }
    ]
  },
  {
    mentorName: "Maria Gonzalez",
    reviews: [
      {
        reviewerName: "Quinn Sullivan",
        rating: 5,
        comment: "Maria gave clear feedback on my interface flow and helped me improve the user journey before implementation.",
        daysAgo: 5
      },
      {
        reviewerName: "Avery Thompson",
        rating: 5,
        comment: "Wonderful mentor for UX design. She reviewed my wireframes and pointed out usability issues I hadn't considered.",
        daysAgo: 11
      },
      {
        reviewerName: "Jamie Chen",
        rating: 4,
        comment: "Maria's design thinking approach helped me create a more intuitive interface. Her feedback was direct and actionable.",
        daysAgo: 19
      },
      {
        reviewerName: "Dakota Ellis",
        rating: 5,
        comment: "She has a great eye for detail and helped me refine my design system. The session was incredibly valuable for my project.",
        daysAgo: 27
      }
    ]
  },
  {
    mentorName: "Rajesh Kumar",
    reviews: [
      {
        reviewerName: "Skylar Adams",
        rating: 5,
        comment: "Rajesh helped me optimize database queries that were slowing down my application. His performance tuning advice was spot on.",
        daysAgo: 7
      },
      {
        reviewerName: "Reese Wilson",
        rating: 4,
        comment: "Solid understanding of distributed systems. Rajesh explained how to handle concurrent requests and avoid race conditions.",
        daysAgo: 15
      },
      {
        reviewerName: "Cameron Foster",
        rating: 5,
        comment: "His backend architecture knowledge is excellent. Rajesh guided me through microservices design patterns for my capstone.",
        daysAgo: 23
      }
    ]
  },
  {
    mentorName: "Emily Thompson",
    reviews: [
      {
        reviewerName: "Finley Brooks",
        rating: 5,
        comment: "Emily helped me understand React patterns that made my code much cleaner. Her component composition advice was transformative.",
        daysAgo: 9
      },
      {
        reviewerName: "Parker Rodriguez",
        rating: 5,
        comment: "Fantastic mentor for frontend development. She reviewed my React code and suggested performance optimizations I hadn't thought of.",
        daysAgo: 16
      },
      {
        reviewerName: "Sage Mitchell",
        rating: 4,
        comment: "Very helpful session on state management. Emily explained when to use context vs. external state libraries.",
        daysAgo: 24
      },
      {
        reviewerName: "River Patel",
        rating: 5,
        comment: "She understands modern web development deeply. Emily helped me architect my frontend in a way that's maintainable and scalable.",
        daysAgo: 33
      }
    ]
  },
  {
    mentorName: "Hana Kobayashi",
    reviews: [
      {
        reviewerName: "Phoenix Carter",
        rating: 5,
        comment: "Hana's mobile development expertise is outstanding. She helped me understand Flutter navigation and state management patterns.",
        daysAgo: 10
      },
      {
        reviewerName: "Sage Turner",
        rating: 4,
        comment: "Great guidance on cross-platform development. Hana showed me how to share code between iOS and Android effectively.",
        daysAgo: 17
      },
      {
        reviewerName: "Rowan Hayes",
        rating: 5,
        comment: "She reviewed my app architecture and suggested improvements that made my codebase much more organized.",
        daysAgo: 26
      }
    ]
  },
  {
    mentorName: "Ahmed Nasser",
    reviews: [
      {
        reviewerName: "Indigo Wells",
        rating: 4,
        comment: "Ahmed helped me understand blockchain fundamentals and how to implement smart contracts safely.",
        daysAgo: 6
      },
      {
        reviewerName: "Kai Morgan",
        rating: 5,
        comment: "His cryptography knowledge is impressive. Ahmed explained secure authentication patterns that I implemented in my project.",
        daysAgo: 13
      },
      {
        reviewerName: "Ellis Cooper",
        rating: 4,
        comment: "Very knowledgeable about Web3 technologies. The session helped me decide which blockchain platform suited my use case.",
        daysAgo: 21
      }
    ]
  },
  {
    mentorName: "Priya Menon",
    reviews: [
      {
        reviewerName: "Lennox Gray",
        rating: 5,
        comment: "Priya's data visualization expertise helped me present my research findings in a much more compelling way.",
        daysAgo: 4
      },
      {
        reviewerName: "Marlowe Stone",
        rating: 5,
        comment: "Excellent mentor for analytics projects. She taught me how to choose the right charts and avoid common visualization mistakes.",
        daysAgo: 11
      },
      {
        reviewerName: "Scout Anderson",
        rating: 4,
        comment: "Priya helped me build interactive dashboards that made my project stand out. Her D3.js knowledge is exceptional.",
        daysAgo: 20
      },
      {
        reviewerName: "Winter Blake",
        rating: 5,
        comment: "She reviewed my data pipeline and suggested optimizations that cut processing time significantly.",
        daysAgo: 28
      }
    ]
  },
  {
    mentorName: "Marcus Reed",
    reviews: [
      {
        reviewerName: "Echo Rivera",
        rating: 5,
        comment: "Marcus helped me understand game development physics and collision detection in Unity. His explanations were crystal clear.",
        daysAgo: 8
      },
      {
        reviewerName: "True Bennett",
        rating: 4,
        comment: "Great session on game optimization. Marcus showed me how to profile my game and fix performance bottlenecks.",
        daysAgo: 15
      },
      {
        reviewerName: "Nova Collins",
        rating: 5,
        comment: "His game design insights were invaluable. Marcus helped me refine my gameplay mechanics to be more engaging.",
        daysAgo: 23
      }
    ]
  },
  {
    mentorName: "Lina Alvarez",
    reviews: [
      {
        reviewerName: "Cypress Ward",
        rating: 5,
        comment: "Lina helped me structure my computer vision project and choose the right model architecture for object detection.",
        daysAgo: 7
      },
      {
        reviewerName: "Atlas Young",
        rating: 4,
        comment: "Very helpful with image processing techniques. She explained preprocessing steps that improved my model accuracy.",
        daysAgo: 14
      },
      {
        reviewerName: "Zephyr Price",
        rating: 5,
        comment: "Lina's expertise in OpenCV and deep learning for vision tasks is remarkable. The session was extremely productive.",
        daysAgo: 22
      }
    ]
  },
  {
    mentorName: "Daniel Foster",
    reviews: [
      {
        reviewerName: "Ocean Wright",
        rating: 4,
        comment: "Daniel helped me design API contracts that made integration between frontend and backend much smoother.",
        daysAgo: 5
      },
      {
        reviewerName: "Ember Hughes",
        rating: 5,
        comment: "Excellent guidance on RESTful API design. He reviewed my endpoints and suggested improvements for consistency.",
        daysAgo: 12
      },
      {
        reviewerName: "Sage Peterson",
        rating: 4,
        comment: "Daniel's system design knowledge helped me plan a scalable API architecture. His feedback was practical and actionable.",
        daysAgo: 19
      },
      {
        reviewerName: "Sterling Ross",
        rating: 5,
        comment: "He taught me proper error handling and validation patterns that made my API much more robust.",
        daysAgo: 29
      }
    ]
  },
  {
    mentorName: "Chen Wei",
    reviews: [
      {
        reviewerName: "Raven Murphy",
        rating: 5,
        comment: "Chen helped me understand distributed algorithms and consensus protocols for my blockchain project.",
        daysAgo: 9
      },
      {
        reviewerName: "Harbor Jenkins",
        rating: 4,
        comment: "Solid mentor for systems programming. He explained memory management and concurrency patterns clearly.",
        daysAgo: 16
      },
      {
        reviewerName: "Journey Barnes",
        rating: 5,
        comment: "Chen's low-level programming expertise is outstanding. He helped me optimize my code for better performance.",
        daysAgo: 24
      }
    ]
  }
];

/**
 * Seeds prepared reviews into localStorage for loaded mentors.
 * Only adds reviews if they don't already exist for a given mentor.
 * Call after mentors are loaded and mapped to ensure mentor IDs are available.
 * 
 * @param mentors - Array of Mentor objects with id and name fields
 * @returns Number of new reviews added
 */
export function seedMentorReviewsForLoadedMentors(mentors: Array<{ id: string; name: string }>): number {
  if (mentors.length === 0) return 0;

  const all = getAll();
  let addedCount = 0;

  for (const template of PREPARED_REVIEWS) {
    // Find matching mentor by name
    const mentor = mentors.find((m) => m.name === template.mentorName);
    if (!mentor) continue;

    // Skip if reviews already exist for this mentor
    if (all[mentor.id] && all[mentor.id].length > 0) continue;

    // Create reviews for this mentor
    const mentorReviews: MentorReview[] = template.reviews.map((r, idx) => {
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - r.daysAgo);

      return {
        id: `review-${mentor.id}-${idx + 1}`,
        mentorId: mentor.id,
        reviewerName: r.reviewerName,
        rating: r.rating,
        comment: r.comment,
        createdAt: reviewDate.toISOString()
      };
    });

    all[mentor.id] = mentorReviews;
    addedCount += mentorReviews.length;
  }

  if (addedCount > 0) {
    saveAll(all);
  }

  return addedCount;
}
