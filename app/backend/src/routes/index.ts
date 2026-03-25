import { Router } from "express";
import authRoutes from "./auth.routes";
import onboardingRoutes from "./onboarding.routes";
import profileRoutes from "./profile.routes";
import portfolioRoutes from "./portfolio.routes";
import bookingRoutes from "./booking.routes";
import projectRoutes from "./project.routes";
import blogRoutes from "./blog.routes";
import eventRoutes from "./event.routes";
import chatRoutes from "./chat.routes";
import bookmarkRoutes from "./bookmark.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/profile", profileRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/bookings", bookingRoutes);
router.use("/projects", projectRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/blogs", blogRoutes);
router.use("/events", eventRoutes);
router.use("/chats", chatRoutes);

export default router;