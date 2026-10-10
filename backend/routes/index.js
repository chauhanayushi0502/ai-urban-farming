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

router.get("/health", async (_req, res) => {
  let dbErr = null;
  if (mongoose.connection.readyState !== 1 && process.env.MONGO_URI) {
    try {
      const { connectDatabase } = await import("../config/database.js");
      await connectDatabase();
    } catch (e) {
      dbErr = e.message;
    }
  }
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    hasMongoUri: Boolean(process.env.MONGO_URI),
    mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 18) + "..." : "not set",
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    dbError: dbErr,
  });
});
router.use("/auth", authRoutes);
router.use(catalogRoutes);
router.use(customerRoutes);
router.use(contentRoutes);
router.use(couponRoutes);
router.use("/admin", adminRoutes);
router.use("/garden", gardenRoutes);

export default router;