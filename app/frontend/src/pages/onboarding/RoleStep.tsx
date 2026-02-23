import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import TileSelect, { type TileOption } from "@/components/onboarding/TileSelect";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute } from "@/lib/onboardingGuard";
import {
  Monitor, Server, Layers, Palette, Smartphone, BarChart3,
  Brain, Cloud, ShieldCheck, PenTool, Gamepad2, FileCode,
  Compass, Code, Database, Users,
} from "lucide-react";

const MEMBER_ROLES: TileOption[] = [
  { label: "Frontend Developer", icon: Monitor },
  { label: "Backend Developer", icon: Server },
  { label: "Full-Stack Developer", icon: Layers },
  { label: "UI/UX Designer", icon: Palette },
  { label: "Mobile Developer", icon: Smartphone },
  { label: "Data Analyst", icon: BarChart3 },
  { label: "ML Engineer", icon: Brain },
  { label: "DevOps Engineer", icon: Cloud },
  { label: "QA Engineer", icon: ShieldCheck },
  { label: "Product Designer", icon: PenTool },
  { label: "Game Developer", icon: Gamepad2 },
  { label: "Cybersecurity", icon: ShieldCheck },
  { label: "Technical Writer", icon: FileCode },
  { label: "Project Manager", icon: Users },
];

const MENTOR_EXPERTISE: TileOption[] = [
  { label: "System Design", icon: Layers },
  { label: "React", icon: Code },
  { label: "Node.js", icon: Server },
  { label: "Python", icon: FileCode },
  { label: "Data Science", icon: BarChart3 },
  { label: "Machine Learning", icon: Brain },
  { label: "DevOps", icon: Cloud },
  { label: "UI/UX Design", icon: Palette },
  { label: "Career Guidance", icon: Compass },
  { label: "Cloud Architecture", icon: Cloud },
  { label: "Mobile Development", icon: Smartphone },
  { label: "Cybersecurity", icon: ShieldCheck },
  { label: "Backend Engineering", icon: Database },
  { label: "Frontend Engineering", icon: Monitor },
];

const RoleStep = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [selected, setSelected] = useState<string[]>(() => {
    if (!session?.profile) return [];
    return session.userType === "mentor"
      ? session.profile.expertiseSkills || []
      : session.profile.preferredRoles || [];
  });

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/role");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const isMentor = session.userType === "mentor";
  const options = isMentor ? MENTOR_EXPERTISE : MEMBER_ROLES;

  const handleNext = () => {
    const partial = isMentor
      ? { expertiseSkills: selected }
      : { preferredRoles: selected };
    updateUserProfile(partial);
    setOnboardingStep("/onboarding/basics");
    navigate(getNextOnboardingRoute("/onboarding/role"));
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={6}
      leftHeadline="Tell us what you're here for"
      leftTagline="Choose the roles that excite you."
    >
      <StepHeader
        title={isMentor ? "Select your expertise" : "Choose your roles"}
        subtitle={isMentor ? "Pick areas you can mentor others in." : "Select the roles that interest you."}
      />
      <TileSelect
        options={options}
        selected={selected}
        onChange={setSelected}
        label={isMentor ? "Expertise Areas" : "Preferred Roles"}
        minRequired={1}
      />
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={selected.length === 0}
          className="h-10 px-6 rounded-xl text-sm font-semibold"
        >
          Next
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default RoleStep;
