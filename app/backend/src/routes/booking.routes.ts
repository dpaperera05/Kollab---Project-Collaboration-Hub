import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { listMemberBookings, listMentorBookings, createBooking, updateBookingStatus } from "../controllers/booking.controller";

const router = Router();
router.use(authenticate);

router.get("/member", listMemberBookings);
router.get("/mentor", listMentorBookings);
router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
