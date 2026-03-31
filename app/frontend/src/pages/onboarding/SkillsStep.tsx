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
      <StepHeader
        title={isMentor ? "Your expertise" : "Your skills & tools"}
        subtitle={isMentor ? "Select skills you can mentor others in." : "Help us match you with the right projects."}
      />

      <div className="space-y-4">
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

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={handleBack} className="h-10 px-5 rounded-xl text-sm">Back</Button>
        <Button onClick={handleNext} disabled={!isValid} className="h-10 px-6 rounded-xl text-sm font-semibold">Next</Button>
      </div>
    </OnboardingLayout>
  );
};

export default SkillsStep;
