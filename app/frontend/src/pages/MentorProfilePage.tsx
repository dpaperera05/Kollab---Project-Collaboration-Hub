import { useState, useCallback, useEffect } from "react";
import { useParams, Navigate, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import type { Mentor } from "@/types/mentor";
import { getLocalReviewsForMentor, getAverageRating, type MentorReview } from "@/lib/reviewStore";
import MentorHeader from "@/components/mentors/profile/MentorHeader";
import MentorAbout from "@/components/mentors/profile/MentorAbout";
import MentorAvailability from "@/components/mentors/profile/MentorAvailability";
import MentorExpertise from "@/components/mentors/profile/MentorExpertise";
import MentorBookingCard from "@/components/mentors/profile/MentorBookingCard";
import MentorBookingModal from "@/components/mentors/profile/MentorBookingModal";
import MentorReviews from "@/components/mentors/profile/MentorReviews";
import MentorChatWidget from "@/components/mentors/profile/MentorChatWidget";
import { apiGet } from "@/lib/api";
import type { KollabUser } from "@/lib/authStore";
import { mapUserToMentor } from "@/lib/mentorMapper";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const location = useLocation();


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

  const openBookingModal = () => {
    const session = getSession();
    if (!session?.token) {
      toast({ title: "Login required", description: "Please login to book a session.", variant: "destructive" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setBookModalOpen(true);
  };

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

  const session = getSession();
  const isOwnMentorProfile = Boolean(session?.id && mentor.id && session.id === mentor.id);
  const colorIndex = Math.abs(mentor.id?.charCodeAt(0) || 0);
  const reviews = getMergedReviews(mentor.id);
  const { avg } = getAverageRating(reviews, mentor.rating);

  const scrollToChat = () => {
    const chatRoot = document.getElementById("mentor-chat");
    if (!chatRoot) return;
    chatRoot.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      const input = chatRoot.querySelector("input") as HTMLInputElement | null;
      input?.focus();
    }, 450);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-10">
        <Container className="space-y-4 py-2 md:py-3">
          <MentorHeader
            mentor={mentor}
            colorIndex={colorIndex}
            avgRating={avg}
            reviewCount={reviews.length}
            onBook={openBookingModal}
            onMessage={scrollToChat}
            canBook={!isOwnMentorProfile}
            canMessage={!isOwnMentorProfile}
          />

          <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <MentorAbout mentor={mentor} />
              <MentorExpertise mentor={mentor} />
              <MentorAvailability mentor={mentor} />
              <MentorReviews
                key={reviewKey}
                mentor={mentor}
                reviews={getMergedReviews(mentor.id)}
                avgRating={getAverageRating(getMergedReviews(mentor.id), mentor.rating).avg}
                onRefresh={refreshReviews}
              />
            </div>

            <aside className="space-y-4 self-start xl:sticky xl:top-24">
              {!isOwnMentorProfile && <MentorBookingCard mentor={mentor} />}
              {!isOwnMentorProfile && (
                <div id="mentor-chat">
                  <MentorChatWidget mentorId={mentor.id} mentorName={mentor.name} />
                </div>
              )}
            </aside>
          </div>
        </Container>
      </main>
      <Footer />

      <MentorBookingModal mentor={mentor} open={!isOwnMentorProfile && bookModalOpen} onOpenChange={setBookModalOpen} />
    </div>
  );
};

export default MentorProfilePage;
