import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createTask, deleteTask, getWorkspace, sendWorkspaceMessage, updateTask } from "../controllers/workspace.controller";

const router = Router();

router.get("/:projectId", authenticate, getWorkspace);
router.post("/:projectId/tasks", authenticate, createTask);
router.patch("/:projectId/tasks/:taskId", authenticate, updateTask);
router.delete("/:projectId/tasks/:taskId", authenticate, deleteTask);
router.post("/:projectId/chat/messages", authenticate, sendWorkspaceMessage);

export default router;
