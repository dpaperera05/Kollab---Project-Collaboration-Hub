import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, setSession, type KollabUser } from "@/lib/authStore";
import { apiGet } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import MemberTabs from "@/components/profile/tabs/MemberTabs";
import MentorTabs from "@/components/profile/tabs/MentorTabs";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [session, setSessionState] = useState(getSession());

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate("/login", { replace: true }); return; }
    if (!s.isEmailVerified) { navigate("/verify-email", { replace: true }); return; }
    if (!s.onboardingCompleted && s.onboardingStep) {
      navigate(s.onboardingStep, { replace: true }); return;
    }
    if (!s.onboardingCompleted) {
      navigate("/onboarding/role", { replace: true }); return;
    }
    setSessionState(s);
  }, [navigate]);

  const refreshFromServer = useCallback(async () => {
    try {
      const res = await apiGet<{ success: boolean; data: { user: KollabUser } }>("/profile/me");
      const apiUser = res?.data?.user;
      if (apiUser?.id) {
        const session = getSession();
        const merged = session ? { ...session, ...apiUser } : apiUser;
        setSession(merged);
        setSessionState(merged);
      }
    } catch {
      // ignore; keep existing session
    }
  }, []);

  useEffect(() => {
    // Pull latest profile (including availability slots) from backend on load
    void refreshFromServer();
  }, [refreshFromServer]);

  const refresh = () => { void refreshFromServer(); };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
      <main className="relative pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <ProfileHeader user={session} onUpdate={refresh} />
          {session.userType === "mentor" ? (
            <MentorTabs user={session} onUpdate={refresh} />
          ) : (
            <MemberTabs user={session} onUpdate={refresh} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
