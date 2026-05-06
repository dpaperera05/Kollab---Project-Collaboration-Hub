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

const inputCls = "h-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0";
const backBtnCls = "h-10 rounded-xl border border-border bg-transparent px-5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const primaryBtnCls = "h-11 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50";

const LinksStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [github, setGithub] = useState(session?.profile?.links?.github || "");
  const [linkedin, setLinkedin] = useState(session?.profile?.links?.linkedin || "");
  const [portfolio, setPortfolio] = useState(session?.profile?.links?.portfolio || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    return Object.keys(e).length === 0;
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
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-invisible min-h-0 flex-1 overflow-y-auto pr-1">
          <StepHeader title="Add your links" subtitle="All optional, but at least one is recommended." />

          <div className="space-y-2.5">
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
        </div>

        <div className="mt-3 shrink-0 flex justify-between border-t border-border/70 pt-2.5">
          <Button variant="ghost" onClick={handleBack} className={backBtnCls}>Back</Button>
          <Button onClick={handleNext} className={primaryBtnCls}>Next</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default LinksStep;
