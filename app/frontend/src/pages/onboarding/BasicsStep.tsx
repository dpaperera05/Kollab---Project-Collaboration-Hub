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

const inputCls = "h-10 rounded-xl bg-background text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary border border-border";

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
      <StepHeader title="Tell us about yourself" subtitle="Fill in the basics so teams can find you." />

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs font-medium text-foreground">Full Name *</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="bio" className="text-xs font-medium text-foreground">Short Bio *</Label>
          <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="A brief intro…" rows={2}
            className="rounded-xl bg-background text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary border border-border resize-none" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tz" className="text-xs font-medium text-foreground">Timezone *</Label>
          <select id="tz" value={timezone} onChange={e => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="loc" className="text-xs font-medium text-foreground">Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA" className={inputCls} />
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={handleBack} className="h-10 px-5 rounded-xl text-sm">Back</Button>
        <Button onClick={handleNext} disabled={!isValid} className="h-10 px-6 rounded-xl text-sm font-semibold">Next</Button>
      </div>
    </OnboardingLayout>
  );
};

export default BasicsStep;
