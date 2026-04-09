import { Router } from "express";
import {
  getJobMarketJobs,
  getJobMarketJobById,
  getJobMarketSummary,
  getJobMarketFilters,
} from "../controllers/jobMarket.controller";

const router = Router();

router.get("/jobs", getJobMarketJobs);
router.get("/jobs/id/:id", getJobMarketJobById);
router.get("/summary", getJobMarketSummary);
router.get("/filters", getJobMarketFilters);

export default router;