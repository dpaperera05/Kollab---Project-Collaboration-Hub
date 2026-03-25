import { useState, useCallback, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Mentor } from "@/types/mentor";
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
import { mapUserToMentor } from "@/lib/mentorMapper";

function getMergedReviews(mentorId: string): MentorReview[] {
  const localReviews = getLocalReviewsForMentor(mentorId);
  return [...localReviews];
}


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
        setMentor(null);
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

  const colorIndex = Math.abs(mentor.id?.charCodeAt(0) || 0);
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
