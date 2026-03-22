import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  listOwnedProjects,
  listJoinedProjects,
  createProject,
  updateProjectStatus,
  deleteProject,
  updateApplicant,
  addApplicant,
  leaveProject,
} from "../controllers/project.controller";

const router = Router();
router.use(authenticate);

router.get("/owned", listOwnedProjects);
router.get("/joined", listJoinedProjects);
router.post("/", createProject);
router.patch("/:id/status", updateProjectStatus);
router.delete("/:id", deleteProject);
router.post("/:id/applicants", addApplicant);
router.patch("/:id/applicants/:applicantId", updateApplicant);
router.delete("/:id/members/me", leaveProject);

export default router;
