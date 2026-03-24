import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { changePassword, getMe, updateProfile, deleteAccount, uploadAvatar, getPublicProfile } from "../controllers/profile.controller";

const router = Router();

router.get("/public/:id", getPublicProfile);
router.use(authenticate);
router.get("/me", getMe);
router.put("/me", updateProfile);
router.post("/me/avatar", uploadAvatar);
router.post("/password", changePassword);
router.delete("/me", deleteAccount);

export default router;
