import { Router } from "express";
import {
  getJobMarketJobs,
  getJobMarketJobById,
  getJobMarketSummary,
  getJobMarketFilters,
  getJobMarketInsights,
  getRoleDistribution,
} from "../controllers/jobMarket.controller";

const router = Router();

router.get("/jobs", getJobMarketJobs);
router.get("/jobs/id/:id", getJobMarketJobById);
router.get("/insights", getJobMarketInsights);
router.get("/summary", getJobMarketSummary);
router.get("/filters", getJobMarketFilters);
router.get("/role-distribution", getRoleDistribution);

export default router;