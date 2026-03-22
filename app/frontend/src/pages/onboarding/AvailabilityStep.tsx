import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute, getPrevOnboardingRoute } from "@/lib/onboardingGuard";

const AvailabilityStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [hours, setHours] = useState<string>(
    () => session?.profile?.availabilityHoursPerWeek?.toString() || ""
  );
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/availability");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const numHours = parseInt(hours, 10);
  const isValid = !isNaN(numHours) && numHours >= 1 && numHours <= 40;

  const handleNext = () => {
    if (!isValid) {
      setError("Enter weekly hours between 1 and 40.");
      return;
    }
    setError(undefined);
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
      <StepHeader title="How much time can you commit?" subtitle="This helps match you with fitting projects." />

      <div className="space-y-1.5">
        <Label htmlFor="hours" className="text-xs font-medium text-foreground">Weekly hours available *</Label>
        <Input
          id="hours"
          type="number"
          min={1}
          max={40}
          value={hours}
          onChange={e => {
            const value = e.target.value;
            setHours(value);
            const parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed < 1 || parsed > 40) {
              setError("Enter weekly hours between 1 and 40.");
            } else {
              setError(undefined);
            }
          }}
          placeholder="e.g. 10"
          className="h-10 rounded-xl bg-background text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary border border-border max-w-[180px]"
        />
        <p className="text-xs text-muted-foreground">Between 1 and 40 hours per week.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={handleBack} className="h-10 px-5 rounded-xl text-sm">Back</Button>
        <Button onClick={handleNext} disabled={!isValid} className="h-10 px-6 rounded-xl text-sm font-semibold">Next</Button>
      </div>
    </OnboardingLayout>
  );
};

export default AvailabilityStep;
