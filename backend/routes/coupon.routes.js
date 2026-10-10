import { Router } from "express";
import { validateCoupon, listPublicCoupons } from "../controllers/coupon.controller.js";
import { optionalAuthenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get("/coupons/public", listPublicCoupons);
router.post("/coupons/apply", optionalAuthenticate, validateCoupon);

export default router;
