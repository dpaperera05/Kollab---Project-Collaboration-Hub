import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { listEvents, createEvent, updateEvent, deleteEvent, listPublicEvents } from "../controllers/event.controller";

const router = Router();

router.get("/public", listPublicEvents);

router.use(authenticate);
router.get("/", listEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
