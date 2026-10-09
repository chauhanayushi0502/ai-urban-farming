import { Router } from "express";
import {
  listGardenPlants,
  createGardenPlant,
  updateGardenPlant,
  deleteGardenPlant,
  waterGardenPlant,
  updateTelemetry,
  getPlantHistory,
  diagnosePlant,
  identifyAndAddPlant,
  askPlantDoctor,
  getDemoData,
  getLiveWeather,
} from "../controllers/garden.controller.js";
import { authenticate, optionalAuthenticate } from "../auth/auth.middleware.js";
import { plantPhotoUpload } from "../middleware/uploads.js";

const router = Router();

router.get("/weather", async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat) : 23.0225;
  const lon = req.query.lon ? parseFloat(req.query.lon) : 72.5714;
  const location = req.query.location || "";
  const weather = await getLiveWeather(lat, lon, location);
  res.json(weather);
});
router.get("/demo-data", getDemoData);

router.get("/plants", authenticate, listGardenPlants);
router.post("/plants", authenticate, createGardenPlant);
router.post("/identify-and-add", optionalAuthenticate, plantPhotoUpload.single("plant_image"), identifyAndAddPlant);
router.patch("/plants/:id", authenticate, updateGardenPlant);
router.delete("/plants/:id", authenticate, deleteGardenPlant);
router.post("/plants/:id/water", authenticate, waterGardenPlant);
router.post("/plants/:id/telemetry", updateTelemetry); // Accessible for IoT hardware/simulations
router.get("/plants/:id/history", authenticate, getPlantHistory);

// Plant leaf diagnosis route - accepts image upload and optional authentication
router.post("/diagnose", optionalAuthenticate, plantPhotoUpload.single("plant_image"), diagnosePlant);
router.post("/ask-doctor", optionalAuthenticate, askPlantDoctor);

export default router;
