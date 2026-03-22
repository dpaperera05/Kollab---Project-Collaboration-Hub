import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute, getPrevOnboardingRoute } from "@/lib/onboardingGuard";

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try { new URL(url); return true; } catch { return false; }
}

const inputCls = "h-10 rounded-xl bg-background text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary border border-border";

const LinksStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [github, setGithub] = useState(session?.profile?.links?.github || "");
  const [linkedin, setLinkedin] = useState(session?.profile?.links?.linkedin || "");
  const [portfolio, setPortfolio] = useState(session?.profile?.links?.portfolio || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/links");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (github && !isValidUrl(github)) e.github = "Invalid URL";
    if (linkedin && !isValidUrl(linkedin)) e.linkedin = "Invalid URL";
    if (portfolio && !isValidUrl(portfolio)) e.portfolio = "Invalid URL";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setFormError(undefined);
      return true;
    }
    setFormError("Fix the invalid links to continue.");
    return false;
  };

  const handleNext = () => {
    if (!validate()) return;
    updateUserProfile({
      links: {
        github: github.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
      },
    });
    setOnboardingStep("/onboarding/availability");
    navigate(getNextOnboardingRoute("/onboarding/links"));
  };

  const handleBack = () => {
    const prev = getPrevOnboardingRoute("/onboarding/links");
    if (prev) navigate(prev);
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={6}
      leftHeadline="Connect your profiles"
      leftTagline="Share your online presence."
    >
      <StepHeader title="Add your links" subtitle="All optional, but at least one is recommended." />

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="gh" className="text-xs font-medium text-foreground">GitHub</Label>
          <Input id="gh" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" className={inputCls} />
          {errors.github && <p className="text-xs text-destructive">{errors.github}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="li" className="text-xs font-medium text-foreground">LinkedIn</Label>
          <Input id="li" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" className={inputCls} />
          {errors.linkedin && <p className="text-xs text-destructive">{errors.linkedin}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="pf" className="text-xs font-medium text-foreground">Portfolio</Label>
          <Input id="pf" value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://yoursite.com" className={inputCls} />
          {errors.portfolio && <p className="text-xs text-destructive">{errors.portfolio}</p>}
        </div>
      </div>

      {formError && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={handleBack} className="h-10 px-5 rounded-xl text-sm">Back</Button>
        <Button onClick={handleNext} className="h-10 px-6 rounded-xl text-sm font-semibold">Next</Button>
      </div>
    </OnboardingLayout>
  );
};

export default LinksStep;
