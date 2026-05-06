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

const backBtnCls = "h-10 rounded-xl border border-border bg-transparent px-5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const primaryBtnCls = "h-11 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50";

const InterestsStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [selected, setSelected] = useState<string[]>(
    () => session?.profile?.domainInterests || []
  );

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/interests");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const handleNext = () => {
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
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-invisible min-h-0 flex-1 overflow-y-auto pr-1">
          <StepHeader title="What domains excite you?" subtitle="Pick areas you'd like to work in or explore." />

          <TileSelect
            options={DOMAINS}
            selected={selected}
            onChange={setSelected}
            label="Domain Interests"
            minRequired={1}
          />
        </div>

        <div className="mt-3 shrink-0 flex justify-between border-t border-border/70 pt-2.5">
          <Button variant="ghost" onClick={handleBack} className={backBtnCls}>Back</Button>
          <Button onClick={handleNext} disabled={selected.length === 0} className={primaryBtnCls}>Finish</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default InterestsStep;
