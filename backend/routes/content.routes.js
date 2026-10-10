import { Router } from "express";
import { getSettings, submitContactMessage } from "../controllers/content.controller.js";
import { listPlantReviewHistory, reviewPlantPhoto } from "../controllers/review.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { plantPhotoUpload } from "../middleware/uploads.js";

const router = Router();

router.get("/settings", getSettings);
router.post("/contact", authenticate, submitContactMessage);
router.get("/plant-review/history", authenticate, listPlantReviewHistory);
router.post("/plant-review", authenticate, plantPhotoUpload.single("plant_image"), reviewPlantPhoto);

export default router;