import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import ChipMultiSelect from "@/components/onboarding/ChipMultiSelect";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute, getPrevOnboardingRoute } from "@/lib/onboardingGuard";

const SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "R", "SQL", "HTML/CSS",
  "React", "Vue", "Angular", "Svelte", "Next.js",
  "Node.js", "Express", "Django", "FastAPI", "Spring Boot",
];

const TECH_STACK = [
  "React", "Next.js", "Vue", "Node.js", "Express", "Java", "Spring",
  "Python", "Django", "FastAPI", "MongoDB", "PostgreSQL", "MySQL",
  "Firebase", "Docker", "AWS", "Git", "Figma", "Flutter",
  "React Native", "TensorFlow", "Pandas", "Redis", "GraphQL",
];

const SkillsStep = () => {
  const navigate = useNavigate();
  const session = getSession();
  const isMentor = session?.userType === "mentor";

  const [skills, setSkills] = useState<string[]>(
    () => (isMentor ? session?.profile?.expertiseSkills : session?.profile?.skills) || []
  );
  const [techStack, setTechStack] = useState<string[]>(
    () => session?.profile?.techStack || []
  );
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/skills");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const isValid = skills.length >= 3 && (isMentor || techStack.length >= 3);

  const handleNext = () => {
    if (!isValid) {
      setError(isMentor ? "Select at least 3 expertise skills." : "Select at least 3 skills and 3 tools/tech stack.");
      return;
    }
    setError(undefined);
    const partial = isMentor
      ? { expertiseSkills: skills, techStack }
      : { skills, techStack };
    updateUserProfile(partial);
    setOnboardingStep("/onboarding/links");
    navigate(getNextOnboardingRoute("/onboarding/skills"));
  };

  const handleBack = () => {
    const prev = getPrevOnboardingRoute("/onboarding/skills");
    if (prev) navigate(prev);
  };

  return (
    <OnboardingLayout
      step={3}
      totalSteps={6}
      leftHeadline="Show off your skills"
      leftTagline="Your skills help us find perfect matches."
    >
      <StepHeader
        title={isMentor ? "Your expertise" : "Your skills & tools"}
        subtitle={isMentor ? "Select skills you can mentor others in." : "Help us match you with the right projects."}
      />

      <div className="space-y-4">
        <ChipMultiSelect
          options={SKILLS}
          selected={skills}
          onChange={(next) => {
            setSkills(next);
            const valid = next.length >= 3 && (isMentor || techStack.length >= 3);
            setError(valid ? undefined : (isMentor ? "Select at least 3 expertise skills." : "Select at least 3 skills and 3 tools/tech stack."));
          }}
          label={isMentor ? "Expertise Skills" : "Skills"}
          minRequired={3}
        />
        <ChipMultiSelect
          options={TECH_STACK}
          selected={techStack}
          onChange={(next) => {
            setTechStack(next);
            const valid = skills.length >= 3 && (isMentor || next.length >= 3);
            setError(valid ? undefined : (isMentor ? "Select at least 3 expertise skills." : "Select at least 3 skills and 3 tools/tech stack."));
          }}
          label="Tech Stack"
          minRequired={isMentor ? 0 : 3}
        />
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

export default SkillsStep;
