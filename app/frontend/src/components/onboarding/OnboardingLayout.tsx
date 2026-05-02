import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import KollabLogo from "@/components/ui/KollabLogo";

interface OnboardingLayoutProps {
  leftHeadline?: string;
  leftTagline?: string;
  children: ReactNode;
  step: number;
  totalSteps: number;
}

const SHARED_ONBOARDING_IMAGE_URL = "https://pub-4ac2f87a270844f29f818efacbb0c342.r2.dev/logos/step%203.png";  //onboarding images are currently all the same, but this allows us to easily switch to step-specific images in the future if desired

const ONBOARDING_IMAGES_BY_STEP: Record<number, string> = {
  1: SHARED_ONBOARDING_IMAGE_URL,
  2: SHARED_ONBOARDING_IMAGE_URL,
  3: SHARED_ONBOARDING_IMAGE_URL,
  4: SHARED_ONBOARDING_IMAGE_URL,
  5: SHARED_ONBOARDING_IMAGE_URL,
  6: SHARED_ONBOARDING_IMAGE_URL,
};

const OnboardingLayout = ({
  children,
  step,
  totalSteps,
}: OnboardingLayoutProps) => {
  const illustrationSrc = ONBOARDING_IMAGES_BY_STEP[step] || SHARED_ONBOARDING_IMAGE_URL;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background p-2 sm:p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto flex h-[calc(100dvh-16px)] max-h-[760px] w-[min(1200px,calc(100vw-16px))] max-w-full overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_54px_hsl(240_10%_10%/0.18)] sm:h-[calc(100dvh-32px)] sm:w-[min(1200px,calc(100vw-32px))] dark:shadow-[0_18px_54px_hsl(0_0%_0%/0.45)]">
        <section className="flex h-full min-w-0 flex-1 flex-col bg-card lg:w-1/2">
          <div className="shrink-0 px-4 pb-2 pt-3 sm:px-5 sm:pt-4 lg:px-6">
            <div className="mb-2.5 flex items-center gap-4">
              <KollabLogo size={26} textSize="text-lg" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      i < step - 1
                        ? "bg-primary"
                        : i === step - 1
                          ? "bg-primary/55"
                          : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-muted-foreground">Step {step} of {totalSteps}</p>
            </div>
          </div>

          <div className="min-h-0 flex-1 px-4 pb-3 sm:px-5 sm:pb-4 lg:px-6 lg:pb-5">
            <div className="flex h-full min-h-0 w-full max-w-xl flex-col">{children}</div>
          </div>
        </section>

        <aside className="relative hidden h-full overflow-hidden border-l border-border lg:flex lg:w-1/2">
          <img
            src={illustrationSrc}
            alt="Onboarding illustration"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />

        </aside>
      </div>
    </div>
  );
};

export default OnboardingLayout;
