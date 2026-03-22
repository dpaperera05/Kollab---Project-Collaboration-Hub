import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { listChats, sendMessage, createChat } from "../controllers/chat.controller";

const router = Router();
router.use(authenticate);

router.get("/", listChats);
router.post("/", createChat);
router.post("/:id/messages", sendMessage);

export default router;
