import { Router } from "express";
import { getProduct, listCategories, listProducts } from "../controllers/catalog.controller.js";
import { submitProductReview } from "../controllers/review.controller.js";
import { authenticate, optionalAuthenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get("/categories", listCategories);
router.get("/products", listProducts);
router.get("/products/:id", optionalAuthenticate, getProduct);
router.put("/products/:id/review", authenticate, submitProductReview);

export default router;