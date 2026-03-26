import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { completeOnboarding, getOnboardingProfile, updateOnboardingProfile } from "../controllers/onboarding.controller";

const router = Router();

router.use(authenticate);

router.get("/me", getOnboardingProfile);
router.put("/me", updateOnboardingProfile);
router.post("/complete", completeOnboarding);

export default router;
