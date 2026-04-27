import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  listPublicProjects,
  smartSearchPublicProjects,
  getPublicProjectById,
  listOwnedProjects,
  listJoinedProjects,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  updateApplicant,
  addApplicant,
  leaveProject,
} from "../controllers/project.controller";

const router = Router();

router.get("/public", listPublicProjects);
// smart-search must be registered before /public/:id so "smart-search" is not
// interpreted as a project id by the dynamic route below.
router.get("/public/smart-search", smartSearchPublicProjects);
router.get("/public/:id", getPublicProjectById);

router.use(authenticate);
router.get("/owned", listOwnedProjects);
router.get("/joined", listJoinedProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.patch("/:id/status", updateProjectStatus);
router.delete("/:id", deleteProject);
router.post("/:id/applicants", addApplicant);
router.patch("/:id/applicants/:applicantId", updateApplicant);
router.delete("/:id/members/me", leaveProject);

export default router;
