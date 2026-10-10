import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes.js";
import catalogRoutes from "./catalog.routes.js";
import customerRoutes from "./customer.routes.js";
import contentRoutes from "./content.routes.js";
import adminRoutes from "./admin.routes.js";
import gardenRoutes from "./garden.routes.js";
import couponRoutes from "./coupon.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
router.use("/auth", authRoutes);
router.use(catalogRoutes);
router.use(customerRoutes);
router.use(contentRoutes);
router.use(couponRoutes);
router.use("/admin", adminRoutes);
router.use("/garden", gardenRoutes);

export default router;