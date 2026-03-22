import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { changePassword, getMe, updateProfile } from "../controllers/profile.controller";

const router = Router();

router.use(authenticate);
router.get("/me", getMe);
router.put("/me", updateProfile);
router.post("/password", changePassword);

export default router;
