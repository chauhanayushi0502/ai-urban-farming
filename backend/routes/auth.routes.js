import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
	currentUser, login, logout, register, requestPasswordReset, resendVerification,
	resetPassword, updateProfile, updateLanguage, verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate, optionalAuthenticate } from "../auth/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }), login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false }), resendVerification);
router.post("/forgot-password", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false }), requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", optionalAuthenticate, currentUser);
router.patch("/profile", authenticate, updateProfile);
router.patch("/language", authenticate, updateLanguage);

export default router;