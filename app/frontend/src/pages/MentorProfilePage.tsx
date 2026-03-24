import { useState, useCallback, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockMentors, type Mentor } from "@/data/mockMentors";
import { getLocalReviewsForMentor, getAverageRating, type MentorReview } from "@/lib/reviewStore";
import MentorHeader from "@/components/mentors/profile/MentorHeader";
import MentorAbout from "@/components/mentors/profile/MentorAbout";
import MentorExpertise from "@/components/mentors/profile/MentorExpertise";
import MentorBookingCard from "@/components/mentors/profile/MentorBookingCard";
import MentorBookingModal from "@/components/mentors/profile/MentorBookingModal";
import MentorReviews from "@/components/mentors/profile/MentorReviews";
import MentorChatWidget from "@/components/mentors/profile/MentorChatWidget";
import { apiGet } from "@/lib/api";
import type { KollabUser } from "@/lib/authStore";

function getMergedReviews(mentorId: string): MentorReview[] {
  const mentor = mockMentors.find((m) => m.id === mentorId);
  const mockReviews: MentorReview[] = (mentor?.reviews || []).map((r) => ({
    id: r.id,
    mentorId,
    reviewerName: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.date,
  }));
  const localReviews = getLocalReviewsForMentor(mentorId);
  return [...localReviews, ...mockReviews];
}

const formatSlot = (slot: { date: string; startTime: string; endTime: string; timezone?: string }) => {
  const dateStr = slot.date ? new Date(slot.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : slot.date;
  return `${dateStr} · ${slot.startTime} - ${slot.endTime}${slot.timezone ? ` (${slot.timezone})` : ""}`;
};

const mapUserToMentor = (user: KollabUser): Mentor => {
  const profile = user.profile || {};
  const availabilitySlots = (profile as any).availabilitySlots as Mentor["availabilitySlots"];

  return {
    id: user.id,
    name: profile.name || user.name || "Mentor",
    avatar: (profile.name || user.name || "M").charAt(0),
    avatarUrl: (profile as any).avatarUrl,
    headline: (profile as any).headline || "Mentor",
    expertiseTags: profile.expertiseSkills || [],
    domainTags: profile.domainInterests || [],
    languages: (profile as any).languages || [],
    rating: 5,
    reviewsCount: 0,
    rate: profile.rateType === "paid" ? (profile.rateNote || "Paid session") : "Free",
    timeSlots: availabilitySlots?.map((s) => formatSlot(s)) || [],
    availabilitySlots: availabilitySlots || [],
    bio: profile.bio || "This mentor hasn't added a bio yet.",
    reviews: [],
  };
};

const MentorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);

  useEffect(() => {
    if (!id) return;

    const loadMentor = async () => {
      setLoading(true);
      try {
        const response = await apiGet<{ success: boolean; data: { user: KollabUser } }>(`/profile/public/${id}`);
        setMentor(mapUserToMentor(response.data.user));
      } catch (err) {
        const fallback = mockMentors.find((m) => m.id === id) || null;
        setMentor(fallback);
      } finally {
        setLoading(false);
      }
    };

    void loadMentor();
  }, [id]);

  const refreshReviews = useCallback(() => setReviewKey((k) => k + 1), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading mentor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mentor) return <Navigate to="/mentors" replace />;

  const mockIndex = mockMentors.indexOf(mentor);
  const colorIndex = mockIndex >= 0 ? mockIndex : Math.abs(mentor.id?.charCodeAt(0) || 0);
  const reviews = getMergedReviews(mentor.id);
  const { avg } = getAverageRating(reviews, mentor.rating);

  const scrollToChat = () => {
    document.getElementById("mentor-chat")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <MentorHeader
          mentor={mentor}
          colorIndex={colorIndex}
          avgRating={avg}
          reviewCount={reviews.length}
          onBook={() => setBookModalOpen(true)}
          onMessage={scrollToChat}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0 space-y-6">
              <MentorAbout mentor={mentor} />
              <MentorExpertise mentor={mentor} />
              <MentorReviews
                key={reviewKey}
                mentor={mentor}
                reviews={getMergedReviews(mentor.id)}
                avgRating={getAverageRating(getMergedReviews(mentor.id), mentor.rating).avg}
                onRefresh={refreshReviews}
              />
            </div>

            <div className="w-full lg:w-[340px] flex-shrink-0 space-y-6">
              <MentorBookingCard mentor={mentor} />
              <div id="mentor-chat">
                <MentorChatWidget mentorId={mentor.id} mentorName={mentor.name} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <MentorBookingModal mentor={mentor} open={bookModalOpen} onOpenChange={setBookModalOpen} />
    </div>
  );
};

export default MentorProfilePage;
