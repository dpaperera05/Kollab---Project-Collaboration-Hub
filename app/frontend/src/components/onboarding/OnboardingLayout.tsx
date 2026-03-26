import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import KollabLogo from "@/components/ui/KollabLogo";
import { useTheme } from "next-themes";

// Light theme images
import roleLight from "@/assets/onboarding/step-role.png";
import basicsLight from "@/assets/onboarding/step-basics.png";
import skillsLight from "@/assets/onboarding/step-skills.png";
import linksLight from "@/assets/onboarding/step-links.png";
import availabilityLight from "@/assets/onboarding/step-availability.png";
import interestsLight from "@/assets/onboarding/step-interests.png";

// Dark theme images
import roleDark from "@/assets/onboarding/step-role-dark.png";
import basicsDark from "@/assets/onboarding/step-basics-dark.png";
import skillsDark from "@/assets/onboarding/step-skills-dark.png";
import linksDark from "@/assets/onboarding/step-links-dark.png";
import availabilityDark from "@/assets/onboarding/step-availability-dark.png";
import interestsDark from "@/assets/onboarding/step-interests-dark.png";

const STEP_IMAGES_LIGHT = [roleLight, basicsLight, skillsLight, linksLight, availabilityLight, interestsLight];
const STEP_IMAGES_DARK = [roleDark, basicsDark, skillsDark, linksDark, availabilityDark, interestsDark];

interface OnboardingLayoutProps {
  leftHeadline?: string;
  leftTagline?: string;
  children: ReactNode;
  step: number;
  totalSteps: number;
}

const OnboardingLayout = ({
  leftHeadline,
  leftTagline,
  children,
  step,
  totalSteps,
}: OnboardingLayoutProps) => {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const images = isDark ? STEP_IMAGES_DARK : STEP_IMAGES_LIGHT;
  const stepImage = images[step - 1] || images[0];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left branded panel */}
      {!isMobile && (
        <div className="relative hidden lg:flex w-[45%] flex-col items-center justify-center overflow-hidden">
          {/* Full-bleed illustration as background */}
          <img
            src={stepImage}
            alt="Onboarding illustration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Bottom overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Text overlay */}
          <div className="relative z-10 mt-auto px-10 pb-10 max-w-lg">
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-tight text-center drop-shadow-lg">
              {leftHeadline || "Build your Kollab profile"}
            </h2>
            {leftTagline && (
              <p className="mt-2 text-sm xl:text-base text-white/80 leading-relaxed text-center drop-shadow">
                {leftTagline}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Right form panel ─── */}
      <div
        className={cn(
          "flex flex-1 flex-col h-screen overflow-hidden",
          isMobile ? "w-full" : "lg:w-[55%]"
        )}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-2 sm:px-10 sm:py-3 shrink-0">
          <KollabLogo size={26} textSize="text-lg" />
          <span className="hidden sm:inline text-sm text-muted-foreground">Need help?</span>
        </div>

        {/* Segmented progress bar */}
        <div className="px-6 sm:px-10 shrink-0">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i < step
                    ? "bg-primary"
                    : i === step
                    ? "bg-primary/30"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Form content — fits viewport, absolutely no scrolling */}
        <div className="flex flex-1 items-start px-6 pt-4 pb-3 sm:px-10 sm:pt-6 sm:pb-4 overflow-hidden min-h-0">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
