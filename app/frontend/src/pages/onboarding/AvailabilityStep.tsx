import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute, getPrevOnboardingRoute } from "@/lib/onboardingGuard";

const backBtnCls = "h-10 rounded-xl border border-border bg-transparent px-5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const primaryBtnCls = "h-11 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50";

const AvailabilityStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [hours, setHours] = useState<string>(
    () => session?.profile?.availabilityHoursPerWeek?.toString() || ""
  );

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/availability");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const numHours = parseInt(hours, 10);
  const isValid = !isNaN(numHours) && numHours >= 1 && numHours <= 40;

  const handleNext = () => {
    updateUserProfile({ availabilityHoursPerWeek: numHours });
    setOnboardingStep("/onboarding/interests");
    navigate(getNextOnboardingRoute("/onboarding/availability"));
  };

  const handleBack = () => {
    const prev = getPrevOnboardingRoute("/onboarding/availability");
    if (prev) navigate(prev);
  };

  return (
    <OnboardingLayout
      step={5}
      totalSteps={6}
      leftHeadline="Plan your time"
      leftTagline="Let us know your weekly availability."
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-invisible min-h-0 flex-1 overflow-y-auto pr-1">
          <StepHeader title="How much time can you commit?" subtitle="This helps match you with fitting projects." />

          <div className="space-y-1.5">
            <Label htmlFor="hours" className="text-xs font-medium text-foreground">Weekly hours available *</Label>
            <Input
              id="hours"
              type="number"
              min={1}
              max={40}
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder="e.g. 10"
              className="h-10 max-w-[180px] rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            />
            <p className="text-xs text-muted-foreground">Between 1 and 40 hours per week.</p>
          </div>
        </div>

        <div className="mt-3 shrink-0 flex justify-between border-t border-border/70 pt-2.5">
          <Button variant="ghost" onClick={handleBack} className={backBtnCls}>Back</Button>
          <Button onClick={handleNext} disabled={!isValid} className={primaryBtnCls}>Next</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default AvailabilityStep;
