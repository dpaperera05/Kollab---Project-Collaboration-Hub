import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute, getPrevOnboardingRoute } from "@/lib/onboardingGuard";

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00 (PST)",
  "UTC-07:00 (MST)", "UTC-06:00 (CST)", "UTC-05:00 (EST)", "UTC-04:00",
  "UTC-03:00", "UTC-02:00", "UTC-01:00", "UTC+00:00 (GMT)", "UTC+01:00 (CET)",
  "UTC+02:00", "UTC+03:00", "UTC+04:00", "UTC+05:00", "UTC+05:30 (IST)",
  "UTC+06:00", "UTC+07:00", "UTC+08:00", "UTC+09:00 (JST)", "UTC+10:00",
  "UTC+11:00", "UTC+12:00",
];

function guessTimezone(): string {
  try {
    const offset = -(new Date().getTimezoneOffset() / 60);
    const sign = offset >= 0 ? "+" : "-";
    const abs = Math.abs(offset);
    const hrs = String(Math.floor(abs)).padStart(2, "0");
    const mins = (abs % 1) === 0.5 ? "30" : "00";
    const key = `UTC${sign}${hrs}:${mins}`;
    return TIMEZONES.find(t => t.startsWith(key)) || TIMEZONES[12];
  } catch {
    return TIMEZONES[12];
  }
}

const inputCls = "h-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0";
const backBtnCls = "h-10 rounded-xl border border-border bg-transparent px-5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const primaryBtnCls = "h-11 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50";

const BasicsStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [name, setName] = useState(session?.profile?.name || "");
  const [bio, setBio] = useState(session?.profile?.bio || "");
  const [timezone, setTimezone] = useState(session?.profile?.timezone || guessTimezone());
  const [location, setLocation] = useState(session?.profile?.location || "");

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/basics");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const isValid = name.trim().length > 0 && bio.trim().length > 0 && timezone.length > 0;

  const handleNext = () => {
    updateUserProfile({ name: name.trim(), bio: bio.trim(), timezone, location: location.trim() });
    setOnboardingStep("/onboarding/skills");
    navigate(getNextOnboardingRoute("/onboarding/basics"));
  };

  const handleBack = () => {
    const prev = getPrevOnboardingRoute("/onboarding/basics");
    if (prev) navigate(prev);
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={6}
      leftHeadline="Set up your profile"
      leftTagline="Help others get to know you."
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-invisible min-h-0 flex-1 overflow-y-auto pr-1">
          <StepHeader title="Tell us about yourself" subtitle="Fill in the basics so teams can find you." />

          <div className="space-y-2.5">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium text-foreground">Full Name *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className={inputCls} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio" className="text-xs font-medium text-foreground">Short Bio *</Label>
              <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="A brief intro…" rows={2}
                className="rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 resize-none" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tz" className="text-xs font-medium text-foreground">Timezone *</Label>
              <select id="tz" value={timezone} onChange={e => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&>option]:bg-[hsl(var(--card))] [&>option]:text-[hsl(var(--foreground))]">
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="loc" className="text-xs font-medium text-foreground">Location <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA" className={inputCls} />
            </div>
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

export default BasicsStep;
