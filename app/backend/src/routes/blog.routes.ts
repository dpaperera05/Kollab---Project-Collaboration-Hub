import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { listBlogs, createBlog, updateBlog, deleteBlog } from "../controllers/blog.controller";

const router = Router();
router.use(authenticate);

router.get("/", listBlogs);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
