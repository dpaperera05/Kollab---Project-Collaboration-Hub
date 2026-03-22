import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { listPortfolio, createPortfolio, updatePortfolio, deletePortfolio } from "../controllers/portfolio.controller";

const router = Router();
router.use(authenticate);

router.get("/", listPortfolio);
router.post("/", createPortfolio);
router.put("/:id", updatePortfolio);
router.delete("/:id", deletePortfolio);

export default router;
