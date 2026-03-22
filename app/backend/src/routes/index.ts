import { Router } from "express";
import authRoutes from "./auth.routes";
import onboardingRoutes from "./onboarding.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);

export default router;