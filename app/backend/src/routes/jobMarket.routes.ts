import { Router } from "express";
import {
  getJobMarketJobs,
  getJobMarketJobById,
  getJobMarketSummary,
} from "../controllers/jobMarket.controller";

const router = Router();

router.get("/jobs", getJobMarketJobs);
router.get("/jobs/id/:id", getJobMarketJobById);
router.get("/summary", getJobMarketSummary);

export default router;