import { getSession } from "./authStore";

const ONBOARDING_ROUTES = [
  "/onboarding/role",
  "/onboarding/basics",
  "/onboarding/skills",
  "/onboarding/links",
  "/onboarding/availability",
  "/onboarding/interests",
];

export type OnboardingGuardResult =
  | { status: "ok" }
  | { status: "redirect"; to: string };

/**
 * Call from each onboarding step or protected route.
 * - No session → /login
 * - Onboarding complete → /profile (block re-entry)
 * - Onboarding incomplete → redirect to current step
 */
export function checkOnboardingAccess(currentPath: string): OnboardingGuardResult {
  const session = getSession();

  if (!session) {
    return { status: "redirect", to: "/login" };
  }

  const isOnboardingRoute = ONBOARDING_ROUTES.some((r) => currentPath.startsWith(r));
  const completed = !!(session as any).onboardingCompleted;
  const currentStep: string = (session as any).onboardingStep || "/onboarding/role";

  if (completed && isOnboardingRoute) {
    return { status: "redirect", to: "/profile" };
  }

  if (!completed && isOnboardingRoute) {
    // Allow access to current step or earlier
    const currentStepIdx = ONBOARDING_ROUTES.indexOf(currentStep);
    const requestedIdx = ONBOARDING_ROUTES.indexOf(currentPath);
    if (requestedIdx >= 0 && requestedIdx <= currentStepIdx) {
      return { status: "ok" };
    }
    return { status: "redirect", to: currentStep };
  }

  return { status: "ok" };
}

export function getNextOnboardingRoute(current: string): string {
  const idx = ONBOARDING_ROUTES.indexOf(current);
  if (idx >= 0 && idx < ONBOARDING_ROUTES.length - 1) {
    return ONBOARDING_ROUTES[idx + 1];
  }
  return "/onboarding/done";
}

export function getPrevOnboardingRoute(current: string): string | null {
  const idx = ONBOARDING_ROUTES.indexOf(current);
  if (idx > 0) {
    return ONBOARDING_ROUTES[idx - 1];
  }
  return null;
}
