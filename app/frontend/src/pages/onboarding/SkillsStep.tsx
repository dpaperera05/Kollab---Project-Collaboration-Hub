import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import ChipMultiSelect from "@/components/onboarding/ChipMultiSelect";
import { getSession, updateUserProfile, setOnboardingStep } from "@/lib/authStore";
import { checkOnboardingAccess, getNextOnboardingRoute, getPrevOnboardingRoute } from "@/lib/onboardingGuard";

const SKILLS = [
  "System Design",
  "API Design",
  "Database Design",
  "Data Modeling",
  "Testing & QA",
  "Debugging",
  "Performance Tuning",
  "Security / Threat Modeling",
  "DevOps & CI/CD",
  "Cloud Architecture",
  "Observability",
  "Product Thinking",
  "Project Management",
  "Mentoring & Leadership",
  "Technical Writing",
  "UX Collaboration",
];

const TECH_STACK = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "FastAPI",
  "Spring Boot",
  "Kotlin",
  "Swift",
  "React Native",
  "Flutter",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Kafka",
  "GraphQL",
  "gRPC",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "Tailwind CSS",
  "Vite",
];

const backBtnCls = "h-10 rounded-xl border border-border bg-transparent px-5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const primaryBtnCls = "h-11 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50";

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

  useEffect(() => {
    const guard = checkOnboardingAccess("/onboarding/skills");
    if (guard.status === "redirect") navigate(guard.to, { replace: true });
  }, [navigate]);

  if (!session) return null;

  const isValid = skills.length >= 3 && (isMentor || techStack.length >= 3);

  const handleNext = () => {
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
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-invisible min-h-0 flex-1 overflow-y-auto pr-1">
          <StepHeader
            title={isMentor ? "Your expertise" : "Your skills & tools"}
            subtitle={isMentor ? "Select skills you can mentor others in." : "Help us match you with the right projects."}
          />

          <div className="space-y-3">
            <ChipMultiSelect
              options={SKILLS}
              selected={skills}
              onChange={setSkills}
              label={isMentor ? "Expertise Skills" : "Skills"}
              minRequired={3}
            />
            <ChipMultiSelect
              options={TECH_STACK}
              selected={techStack}
              onChange={setTechStack}
              label="Tech Stack"
              minRequired={isMentor ? 0 : 3}
            />
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

export default SkillsStep;
