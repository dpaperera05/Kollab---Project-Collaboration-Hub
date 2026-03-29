import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
	listPortfolio,
	createPortfolio,
	updatePortfolio,
	deletePortfolio,
	getPortfolioById,
	getPublicPortfolio,
} from "../controllers/portfolio.controller";

const router = Router();

router.get("/public/:id", getPublicPortfolio);

router.use(authenticate);
router.get("/", listPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", createPortfolio);
router.put("/:id", updatePortfolio);
router.delete("/:id", deletePortfolio);

export default router;
