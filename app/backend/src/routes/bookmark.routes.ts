import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { listBookmarks, addBookmark, removeBookmark } from "../controllers/bookmark.controller";

const router = Router();

router.use(authenticate);
router.get("/", listBookmarks);
router.post("/:projectId", addBookmark);
router.delete("/:projectId", removeBookmark);

export default router;
