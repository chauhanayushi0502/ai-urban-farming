import { Router } from "express";
import {
  createCategory, createProduct, deleteCategory, deleteProduct, getSummary,
  listMessages, listOrders, updateCategory, updateOrderStatus, updateProduct,
  updateSettings, updateStock,
} from "../controllers/admin.controller.js";
import {
  createAdminCoupon, deleteAdminCoupon, listAdminCoupons, updateAdminCoupon,
} from "../controllers/coupon.controller.js";
import { authenticate, requireAdmin } from "../auth/auth.middleware.js";
import { uploadCatalogImage } from "../middleware/uploads.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/summary", getSummary);
router.get("/orders", listOrders);
router.patch("/orders/:id", updateOrderStatus);
router.post("/categories", uploadCatalogImage("categories"), createCategory);
router.patch("/categories/:id", uploadCatalogImage("categories"), updateCategory);
router.delete("/categories/:id", deleteCategory);
router.post("/products", uploadCatalogImage("products"), createProduct);
router.patch("/products/:id", uploadCatalogImage("products"), updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/stock", updateStock);
router.put("/settings", updateSettings);
router.get("/messages", listMessages);

// Coupon management
router.get("/coupons", listAdminCoupons);
router.post("/coupons", createAdminCoupon);
router.patch("/coupons/:id", updateAdminCoupon);
router.delete("/coupons/:id", deleteAdminCoupon);

export default router;