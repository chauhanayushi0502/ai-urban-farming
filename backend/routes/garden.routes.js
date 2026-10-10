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
  generateCompanionSynergy,
  generateSinglePlantProfile,
  testTwoPlantSynergy,
  getDemoData,
  getLiveWeather,
  searchLocations,
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

router.get("/weather/locations", async (req, res) => {
  const query = req.query.q || "";
  const results = await searchLocations(query);
  res.json(results);
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

// Plant leaf diagnosis & Ask Doctor route
router.post("/diagnose", optionalAuthenticate, plantPhotoUpload.single("plant_image"), diagnosePlant);
router.post("/ask-doctor", optionalAuthenticate, plantPhotoUpload.single("plant_image"), askPlantDoctor);
router.post("/generate-companion", generateCompanionSynergy);
router.post("/generate-plant-profile", generateSinglePlantProfile);
router.post("/test-synergy", testTwoPlantSynergy);

export default router;
