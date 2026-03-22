import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import TileSelect, {type TileOption } from "@/components/onboarding/TileSelect";
import { getSession, updateUserProfile, setOnboardingCompleted } from "@/lib/authStore";
import { checkOnboardingAccess, getPrevOnboardingRoute } from "@/lib/onboardingGuard";
import {
  Code, Brain, Cpu, Bot, Database, ShieldCheck,
  Globe, Smartphone, Cloud, Palette, Gamepad2, GitBranch, FlaskConical,
} from "lucide-react";

const DOMAINS: TileOption[] = [
  { label: "Software Engineering", icon: Code },
  { label: "AI & ML", icon: Brain },
  { label: "IoT", icon: Cpu },
  { label: "Robotics", icon: Bot },
  { label: "Data Science", icon: Database },
  { label: "Cybersecurity", icon: ShieldCheck },
  { label: "Web Development", icon: Globe },
  { label: "Mobile Apps", icon: Smartphone },
  { label: "Cloud / DevOps", icon: Cloud },
  { label: "UI/UX Design", icon: Palette },
  { label: "Game Development", icon: Gamepad2 },
  { label: "Open Source", icon: GitBranch },
  { label: "Research", icon: FlaskConical },
];

const InterestsStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [selected, setSelected] = useState<string[]>(
    () => session?.profile?.domainInterests || []
  );
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/interests");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const handleNext = () => {
    if (selected.length === 0) {
      setError("Select at least one interest to continue.");
      return;
    }
    setError(undefined);
    updateUserProfile({ domainInterests: selected });
    setOnboardingCompleted();
    navigate("/profile");
  };

  const handleBack = () => {
    const prev = getPrevOnboardingRoute("/onboarding/interests");
    if (prev) navigate(prev);
  };

  return (
    <OnboardingLayout
      step={6}
      totalSteps={6}
      leftHeadline="Explore your interests"
      leftTagline="Pick the domains you're passionate about."
    >
      <StepHeader title="What domains excite you?" subtitle="Pick areas you'd like to work in or explore." />

      <TileSelect
        options={DOMAINS}
        selected={selected}
        onChange={(next) => {
          setSelected(next);
          setError(next.length ? undefined : "Select at least one interest to continue.");
        }}
        label="Domain Interests"
        minRequired={1}
      />

      {error && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={handleBack} className="h-10 px-5 rounded-xl text-sm">Back</Button>
        <Button onClick={handleNext} disabled={selected.length === 0} className="h-10 px-6 rounded-xl text-sm font-semibold">Finish</Button>
      </div>
    </OnboardingLayout>
  );
};

export default InterestsStep;
