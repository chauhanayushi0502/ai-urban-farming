import { GardenPlant, Notification, PlantDiagnosis, User, Product, Category, Setting } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { isValidPlantImage } from "../middleware/uploads.js";
import { BOTANICAL_DISEASE_DATASET, matchDatasetDisease } from "../data/botanical-dataset.js";

// Helper to execute Google Gemini API with fallback models
export async function callGeminiAI({ prompt, imageBuffer, imageMimeType, maxTokens = 1200, responseJson = false }) {
  let apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    try {
      const dbKey = await Setting.findOne({ key: "gemini_api_key" }).lean();
      if (dbKey?.value && String(dbKey.value).trim()) {
        apiKey = String(dbKey.value).trim();
      }
    } catch {
      // ignore db error
    }
  }
  if (!apiKey) return null;

  const models = [
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
  ];

  // 1. Try standard generateContent endpoint
  for (const model of models) {
    try {
      const parts = [{ text: prompt }];
      if (imageBuffer && imageMimeType) {
        const base64Data = Buffer.isBuffer(imageBuffer)
          ? imageBuffer.toString("base64")
          : String(imageBuffer).replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inline_data: {
            mime_type: imageMimeType,
            data: base64Data,
          },
        });
      }

      const bodyPayload = {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: maxTokens,
          ...(responseJson ? { responseMimeType: "application/json" } : {}),
        },
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } else {
        const errText = await res.text().catch(() => "");
        console.warn(`Gemini (${model}) generateContent HTTP ${res.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.warn(`Gemini (${model}) generateContent error:`, err.message);
    }
  }

  // 2. Fallback to interactions endpoint
  try {
    const input = [{ type: "text", text: prompt }];
    if (imageBuffer && imageMimeType) {
      const base64Data = Buffer.isBuffer(imageBuffer)
        ? imageBuffer.toString("base64")
        : String(imageBuffer).replace(/^data:image\/\w+;base64,/, "");
      input.push({ type: "image", data: base64Data, mime_type: imageMimeType });
    }
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        model: "gemini-3.1-flash-lite",
        input,
        generation_config: { thinking_level: "low", max_output_tokens: maxTokens },
        store: false,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const result = await res.json();
      let textOutput = String(result.output_text || "").trim();
      if (!textOutput) {
        textOutput = (result.steps || [])
          .filter((s) => s.type === "model_output")
          .flatMap((s) => s.content || [])
          .filter((p) => p.type === "text")
          .map((p) => p.text || "")
          .join("\n")
          .trim();
      }
      if (textOutput) return textOutput;
    }
  } catch (err) {
    console.warn("Gemini interactions error:", err.message);
  }

  return null;
}

// Helper to find matching nursery products based on plant care context, remedies, or species
// Exclusively recommends plant care & protection, fertilizers/tonics, pots & planters, and tools (NEVER live plants)
export async function findRelevantProducts(searchContext = "") {
  try {
    const text = String(searchContext).toLowerCase();

    // 1. Fetch category IDs for care & supplies
    const careCategories = await Category.find({
      name: { $in: ["Plant Care & Protection", "Pots & planters", "Seeds & tools"] },
    }).lean();
    const careCategoryIds = careCategories.map((c) => c._id);
    const careFilter = careCategoryIds.length > 0 ? { category: { $in: careCategoryIds } } : {};

    const queryList = [];

    if (text.includes("compost") || text.includes("vermicompost") || text.includes("fertiliz") || text.includes("food") || text.includes("nutrient") || text.includes("manure") || text.includes("tonic") || text.includes("feed") || text.includes("protein") || text.includes("yellow") || text.includes("growth")) {
      queryList.push("vermicompost", "seaweed", "booster", "compost", "tonic");
    }
    if (text.includes("neem") || text.includes("pest") || text.includes("fung") || text.includes("blight") || text.includes("spot") || text.includes("spray") || text.includes("mildew") || text.includes("aphid") || text.includes("disease") || text.includes("bug") || text.includes("mite") || text.includes("rot") || text.includes("rubber tree") || text.includes("care") || text.includes("doctor")) {
      queryList.push("neem", "spray", "protection", "fungicide", "booster");
    }
    if (text.includes("pot") || text.includes("repot") || text.includes("planter") || text.includes("container") || text.includes("clay") || text.includes("drainage") || text.includes("root")) {
      queryList.push("planter", "pot", "ceramic", "clay");
    }
    if (text.includes("prun") || text.includes("shear") || text.includes("tool") || text.includes("trowel") || text.includes("trim") || text.includes("snip") || text.includes("cut")) {
      queryList.push("shears", "tool", "hand tools");
    }
    if (text.includes("seed") || text.includes("sow") || text.includes("herb") || text.includes("starter")) {
      queryList.push("seed", "starter");
    }

    let products = [];
    if (queryList.length > 0) {
      const regexPatterns = queryList.map((q) => new RegExp(q, "i"));
      products = await Product.find({
        ...careFilter,
        $or: [
          { name: { $in: regexPatterns } },
          { description: { $in: regexPatterns } },
        ],
      }).populate("category").limit(4).lean();
    }

    // Fallback strictly from Plant Care & Protection, Pots & planters, Seeds & tools!
    if (products.length < 4) {
      const fallbackProducts = await Product.find(careFilter).populate("category").limit(4).lean();
      const existingIds = new Set(products.map((p) => p._id.toString()));
      for (const fp of fallbackProducts) {
        if (!existingIds.has(fp._id.toString()) && products.length < 4) {
          products.push(fp);
        }
      }
    }

    return products;
  } catch (err) {
    console.warn("Error finding relevant products:", err);
    return [];
  }
}

// Species baseline watering intervals (in days) under temperate conditions (~24°C, 50% humidity)
export const SPECIES_WATERING_DEFAULTS = {
  tomato: { name: "Tomato", interval: 2, advice: "Tomatoes need deep, consistent watering at the root base. Avoid wetting leaves." },
  basil: { name: "Basil / Tulsi", interval: 2, advice: "Keep soil consistently moist but never soggy. Pinch flower buds." },
  mint: { name: "Mint / Pudina", interval: 1, advice: "Mint loves moisture and filtered light. Check soil daily in warm weather." },
  rose: { name: "Rose", interval: 3, advice: "Water deeply around the root zone early in the morning to prevent black spot." },
  pepper: { name: "Chili / Pepper", interval: 3, advice: "Allow top inch of soil to dry slightly between waterings for spicier fruit." },
  aloe: { name: "Aloe Vera", interval: 12, advice: "Allow soil to completely dry out between waterings. Use gritty, fast-draining mix." },
  snake_plant: { name: "Snake Plant", interval: 14, advice: "Very drought tolerant. Water sparingly; root rot occurs easily in wet soil." },
  pothos: { name: "Money Plant / Pothos", interval: 6, advice: "Water when the top 50% of potting mix feels dry to touch." },
  peace_lily: { name: "Peace Lily", interval: 3, advice: "Prefers lightly moist soil. Leaves droop gracefully when it needs a drink." },
  hibiscus: { name: "Hibiscus", interval: 2, advice: "Heavy drinker when in active flowering cycle. Needs full sun and consistent water." },
  zz_plant: { name: "ZZ Plant", interval: 14, advice: "Tolerates low light and drought. Water thoroughly only when potting mix is fully dry." },
  areca_palm: { name: "Areca Palm", interval: 4, advice: "Prefers bright filtered sunlight and lightly moist, well-aerated potting mix." },
  ficus: { name: "Ficus Tree", interval: 5, advice: "Moderate watering; allow top 2 inches to dry. Shield from sudden cold drafts." },
  coriander: { name: "Coriander / Cilantro", interval: 2, advice: "Fast-draining moist soil in cool or partial sun conditions." },
  desiccated: { name: "Desiccated Nursery Plant", interval: 2, advice: "Emergency 30-minute bottom soak required immediately. Prune dead crispy leaves." },
  other: { name: "Urban Houseplant", interval: 3, advice: "Check moisture 2 inches below surface before watering." },
};

function normalizeSpeciesKey(species = "") {
  const lower = String(species).toLowerCase().trim();
  if (lower.includes("desiccat") || lower.includes("wither") || lower.includes("dried")) return "desiccated";
  if (lower.includes("tomato") || lower.includes("ટામેટા")) return "tomato";
  if (lower.includes("basil") || lower.includes("tulsi") || lower.includes("તુલસી")) return "basil";
  if (lower.includes("mint") || lower.includes("pudina") || lower.includes("ફુદીનો")) return "mint";
  if (lower.includes("rose") || lower.includes("ગુલાબ")) return "rose";
  if (lower.includes("pepper") || lower.includes("chili") || lower.includes("chilli") || lower.includes("મરચા")) return "pepper";
  if (lower.includes("aloe") || lower.includes("succulent") || lower.includes("cactus") || lower.includes("કુંવારપાઠું")) return "aloe";
  if (lower.includes("snake") || lower.includes("sansevieria")) return "snake_plant";
  if (lower.includes("pothos") || lower.includes("money plant") || lower.includes("મની પ્લાન્ટ")) return "pothos";
  if (lower.includes("zz") || lower.includes("zamioculcas")) return "zz_plant";
  if (lower.includes("palm") || lower.includes("areca")) return "areca_palm";
  if (lower.includes("ficus") || lower.includes("fig")) return "ficus";
  if (lower.includes("coriander") || lower.includes("cilantro") || lower.includes("કોથમીર")) return "coriander";
  if (lower.includes("hibiscus") || lower.includes("જાસૂદ")) return "hibiscus";
  if (lower.includes("peace lily") || lower.includes("spathiphyllum")) return "peace_lily";
  return "other";
}

export function sanitizeHealthStatus(status = "") {
  const s = String(status).toLowerCase().trim();
  if (s === "healthy") return "healthy";
  if (s === "recovering") return "recovering";
  if (s === "underwatered") return "underwatered";
  if (s === "overwatered") return "overwatered";
  if (s === "diseased" || s.includes("disease") || s.includes("fung") || s.includes("pest") || s.includes("rot")) return "diseased";
  return "needs_attention";
}

// Reverse geocode GPS coordinates to city / locality name
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name || "";
      const state = data.principalSubdivision || "";
      const country = data.countryName || "";
      
      const cleanCity = city.trim();
      const cleanState = state.trim();
      const cleanCountry = country.trim();

      if (cleanCity && cleanState && cleanCity.toLowerCase() !== cleanState.toLowerCase()) {
        return `${cleanCity}, ${cleanState}`;
      }
      if (cleanCity && cleanCountry) return `${cleanCity}, ${cleanCountry}`;
      if (cleanState && cleanCountry) return `${cleanState}, ${cleanCountry}`;
      if (cleanCity || cleanState) return cleanCity || cleanState;
    }
  } catch {}

  // Fallback to OpenStreetMap Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    const nomRes = await fetch(nomUrl, {
      headers: { "User-Agent": "AIUrbanFarming/1.0" },
      signal: AbortSignal.timeout(3500)
    });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || "";
      const state = addr.state || addr.region || addr.state_district || "";
      const country = addr.country || "";
      
      const cleanCity = city.trim();
      const cleanState = state.trim();

      if (cleanCity && cleanState && cleanCity.toLowerCase() !== cleanState.toLowerCase()) {
        return `${cleanCity}, ${cleanState}`;
      }
      if (cleanCity && country) return `${cleanCity}, ${country}`;
      if (cleanState || cleanCity) return cleanState || cleanCity;
    }
  } catch {}

  return "";
}

const weatherCache = new Map();
const locationSearchCache = new Map();

// Search locations / cities globally using Open-Meteo Geocoding
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const cacheKey = query.trim().toLowerCase();
  const cached = locationSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.data;
  }
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    const results = data.results.map((item) => {
      const parts = [item.name, item.admin1, item.country].filter(Boolean);
      return {
        id: item.id,
        name: item.name,
        state: item.admin1 || "",
        country: item.country || "",
        latitude: item.latitude,
        longitude: item.longitude,
        label: parts.join(", "),
      };
    });
    locationSearchCache.set(cacheKey, { timestamp: Date.now(), data: results });
    return results;
  } catch (err) {
    return [];
  }
}

// Fetch live weather data from Open-Meteo with automatic GPS/location coordinates
export async function getLiveWeather(lat = 23.0225, lon = 72.5714, locationLabel = "") {
  const roundedLat = lat.toFixed(2);
  const roundedLon = lon.toFixed(2);
  const cacheKey = `${roundedLat},${roundedLon}:${locationLabel}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 1200000) { // 20 minutes TTL
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
    const [weatherRes, detectedPlace] = await Promise.all([
      fetch(url, { signal: AbortSignal.timeout(6000) }),
      locationLabel ? Promise.resolve(locationLabel) : reverseGeocode(lat, lon),
    ]);

    if (!weatherRes.ok) throw new Error("Weather service status " + weatherRes.status);
    const data = await weatherRes.json();
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};
    const temp = current.temperature_2m ?? 28;
    const humidity = current.relative_humidity_2m ?? 55;
    const precipitation = current.precipitation ?? 0;
    const windSpeed = current.wind_speed_10m ?? 0;
    const rainToday = (daily.precipitation_sum && daily.precipitation_sum[0]) ?? precipitation;
    const maxTemp = (daily.temperature_2m_max && daily.temperature_2m_max[0]) ?? temp;
    const minTemp = (daily.temperature_2m_min && daily.temperature_2m_min[0]) ?? (temp - 5);

    // Build 12-hour forecast array
    const hourlyTimes = hourly.time || [];
    const hourlyTemps = hourly.temperature_2m || [];
    const hourlyRainProb = hourly.precipitation_probability || [];
    const nowHourStr = new Date().toISOString().slice(0, 13);
    let startIdx = hourlyTimes.findIndex((t) => t.startsWith(nowHourStr));
    if (startIdx === -1) startIdx = 0;

    const hourlyForecast = hourlyTimes.slice(startIdx, startIdx + 12).map((timeStr, i) => {
      const idx = startIdx + i;
      const hTemp = Math.round(hourlyTemps[idx] ?? temp);
      const rainChance = Math.round(hourlyRainProb[idx] ?? 0);
      const timeDate = new Date(timeStr);
      const hourLabel = timeDate.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });

      return {
        time: hourLabel,
        temp: hTemp,
        rainChance,
        icon: rainChance > 40 ? "🌧️" : (hTemp >= 32 ? "☀️" : (timeDate.getHours() < 6 || timeDate.getHours() > 19 ? "🌙" : "🌤️")),
      };
    });

    // Build 5-day forecast array
    const forecast = (daily.time || []).map((dateStr, idx) => {
      const max = Math.round(daily.temperature_2m_max?.[idx] ?? temp);
      const min = Math.round(daily.temperature_2m_min?.[idx] ?? (temp - 5));
      const rain = daily.precipitation_sum?.[idx] ?? 0;

      let dayCond = "Sunny";
      if (rain > 2.0) dayCond = "Rainy";
      else if (max >= 34) dayCond = "Hot";
      else if (min <= 16) dayCond = "Cool";
      else dayCond = "Pleasant";

      const dateObj = new Date(dateStr);
      const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : dateObj.toLocaleDateString("en-US", { weekday: "short" });

      return {
        date: dateStr,
        dayName,
        maxTemp: max,
        minTemp: min,
        rain,
        condition: dayCond,
      };
    });

    // Determine gardening conditions & alerts
    let condition = "Sunny / Pleasant";
    let wateringFactor = 1.0;
    let tip = "Standard watering routine suitable for most urban balcony plants.";
    let rainAlert = false;
    let fungalRisk = false;

    if (rainToday > 2.0 || precipitation > 1.0) {
      condition = "Rainy / Damp";
      wateringFactor = 1.7; // extend interval
      tip = "Rain detected. Outdoor and balcony plants can skip watering today to prevent root rot.";
      rainAlert = true;
    } else if (temp >= 32 || maxTemp >= 34) {
      condition = "Hot & Dry";
      wateringFactor = 0.65; // reduce interval (water more often)
      tip = "High heat alert (>32°C). Water plants deeply in early morning or evening to reduce heat stress.";
    } else if (temp <= 15) {
      condition = "Cool / Dormant";
      wateringFactor = 1.4;
      tip = "Cooler temperatures slow transpiration. Reduce watering frequency.";
    }

    if (humidity >= 80 && temp >= 22 && temp <= 30) {
      fungalRisk = true;
      tip += " High humidity warning: fungal spores (Blight, Leaf Mold) spread quickly. Avoid overhead watering.";
    }

    const tzCity = data.timezone ? data.timezone.replace("_", " ").split("/").pop() : "";
    const resolvedCity = locationLabel || detectedPlace || (tzCity ? `${tzCity} (Live Location)` : `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);

    const weatherResult = {
      temperature: Math.round(temp),
      maxTemperature: Math.round(maxTemp),
      minTemperature: Math.round(minTemp),
      humidity: Math.round(humidity),
      precipitation: rainToday,
      windSpeed: Math.round(windSpeed),
      condition,
      wateringFactor,
      tip,
      rainAlert,
      fungalRisk,
      city: resolvedCity,
      latitude: lat,
      longitude: lon,
      forecast,
      hourlyForecast,
    };
    weatherCache.set(cacheKey, { timestamp: Date.now(), data: weatherResult });
    return weatherResult;
  } catch (error) {
    // Fallback if offline
    return {
      temperature: 28,
      maxTemperature: 32,
      minTemperature: 22,
      humidity: 58,
      precipitation: 0,
      windSpeed: 8,
      condition: "Temperate Garden Weather",
      wateringFactor: 1.0,
      tip: "Check soil moisture before watering. Water at root level in early morning.",
      rainAlert: false,
      fungalRisk: false,
      city: locationLabel || "Live Local Climate",
      latitude: lat,
      longitude: lon,
    };
  }
}

// Compute dynamic watering status for a plant
function evaluatePlantWatering(plant, weather) {
  const baseInterval = plant.wateringIntervalDays || 2;
  const adjustedInterval = Math.max(1, Math.round(baseInterval * (weather.wateringFactor || 1.0)));
  const now = new Date();
  const last = plant.lastWateredAt ? new Date(plant.lastWateredAt) : new Date(now.getTime() - adjustedInterval * 86400000);
  const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);

  let isDue = false;
  let statusText = "Watering on schedule";

  if (diffHours >= adjustedInterval * 24) {
    isDue = true;
    statusText = "Watering due today";
  } else if (diffHours >= (adjustedInterval - 0.5) * 24) {
    isDue = true;
    statusText = "Watering due soon";
  } else {
    const hoursLeft = Math.round(adjustedInterval * 24 - diffHours);
    statusText = hoursLeft > 24 ? `Next water in ${Math.round(hoursLeft / 24)} days` : `Next water in ${hoursLeft} hours`;
  }

  // IoT Sensor check override
  if (plant.telemetry?.soilMoisturePercent != null) {
    if (plant.telemetry.soilMoisturePercent < 22) {
      isDue = true;
      statusText = `IoT Sensor Alert: Soil moisture critically low (${plant.telemetry.soilMoisturePercent}%)`;
    } else if (plant.telemetry.soilMoisturePercent > 70) {
      isDue = false;
      statusText = `IoT Sensor: Soil is sufficiently damp (${plant.telemetry.soilMoisturePercent}%)`;
    }
  }

  return {
    baseInterval,
    adjustedInterval,
    diffDays,
    isDue,
    statusText,
  };
}

// List user's plants
export const listGardenPlants = asyncHandler(async (req, res) => {
  const weather = await getLiveWeather();
  const plants = await GardenPlant.find({ user: req.auth.id }).sort({ createdAt: -1 }).lean();
  
  const enriched = plants.map((p) => {
    const evalData = evaluatePlantWatering(p, weather);
    return {
      ...p,
      wateringEvaluation: evalData,
    };
  });

  res.json({
    plants: enriched,
    weather,
    stats: {
      total: plants.length,
      needsWater: enriched.filter((p) => p.wateringEvaluation.isDue).length,
      diseased: enriched.filter((p) => p.healthStatus === "diseased" || p.healthStatus === "needs_attention").length,
      healthy: enriched.filter((p) => p.healthStatus === "healthy" || p.healthStatus === "recovering").length,
    },
  });
});

// Create new plant
export const createGardenPlant = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim().slice(0, 100);
  const species = String(req.body.species || "Tomato").trim();
  const location = req.body.location || "balcony";
  const potSize = req.body.potSize || "Medium (8-10 inch)";
  const soilType = req.body.soilType || "Potting Mix with Compost";
  const notes = String(req.body.notes || "").slice(0, 2000);

  if (!name) return res.status(400).json({ message: "Plant name is required." });

  const speciesKey = normalizeSpeciesKey(species);
  const speciesDefault = SPECIES_WATERING_DEFAULTS[speciesKey] || SPECIES_WATERING_DEFAULTS.other;
  const interval = Number(req.body.wateringIntervalDays) || speciesDefault.interval;

  const plant = await GardenPlant.create({
    user: req.auth.id,
    name,
    species,
    location,
    potSize,
    soilType,
    wateringIntervalDays: interval,
    healthStatus: sanitizeHealthStatus(req.body.healthStatus || "healthy"),
    notes,
    lastWateredAt: new Date(),
    nextWateringDue: new Date(Date.now() + interval * 86400000),
    telemetry: {
      soilMoisturePercent: 48,
      ambientTemperatureC: 28,
      ambientHumidityPercent: 60,
      lastReadingAt: new Date(),
    },
  });

  res.status(201).json(plant);
});

// AI Auto-Identification & Smart Care Setup from Photo (AI identifies botanical plant name & real health status)
export const identifyAndAddPlant = asyncHandler(async (req, res) => {
  if (!req.file || !isValidPlantImage(req.file.buffer)) {
    return res.status(400).json({ message: "Please upload a valid JPG, PNG, or WebP plant photo." });
  }

  const location = req.body.location || "balcony";
  const potSize = req.body.potSize || "Medium (8-10 inch)";
  const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  let clientVisualScan = null;
  if (req.body.visual_analysis) {
    try {
      clientVisualScan = typeof req.body.visual_analysis === "string" ? JSON.parse(req.body.visual_analysis) : req.body.visual_analysis;
    } catch {
      clientVisualScan = null;
    }
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  let aiData = null;
  let isNotPlantError = false;

  const prompt = `You are an expert botanical AI assistant and certified plant pathologist. Analyze the uploaded plant image with utmost accuracy.
Growing Location: "${location}".
${req.body.species ? `User Declared Plant Species: "${req.body.species}".` : ""}
${clientVisualScan?.isDesiccated ? "Visual Note: Check if foliage is dried, withered, or brown." : ""}

CRITICAL FIRST STEP - VERIFY PLANT:
Determine whether the image contains a plant, potted houseplant, leaf, stem, flower, vegetable, herb, tree, succulent, seedling, nursery pot, or an image/screenshot showing a plant.
- Even if the image is taken from a phone screen, screenshot, or contains surrounding margins, if there is ANY potted plant or foliage shown, classify as "isPlant": true and identify the plant.
- Only if the image has absolutely NO plant whatsoever (for example: pure human face, pure car, plain electronics without plant, blank paper):
  Respond with:
  {
    "isPlant": false,
    "errorMessage": "The uploaded image is not a plant. Please upload a clear photo of a plant, leaf, or flower."
  }

CRITICAL SECOND STEP - ACCURATE HEALTH & SPECIES IDENTIFICATION:
1. Identify the accurate botanical and common plant species name (e.g. 'Tomato', 'Money Plant', 'Snake Plant', 'Monstera Deliciosa', 'Dieffenbachia', 'Sweet Basil', 'Aloe Vera', 'Hibiscus', 'ZZ Plant', 'Areca Palm', 'Peace Lily', etc.). If the plant is completely dried/dead nursery plant, specify the plant species or 'Dried Nursery Plant'.
2. CAREFULLY EVALUATE THE HEALTH OF THE PLANT:
   - Check if foliage/stems are dried, crispy, brown, desiccated, or dead. If the plant is dried out or brown, currentHealthStatus MUST be "underwatered" (or "diseased" if pathogen/rot) and healthDiagnosis MUST state "Severe Desiccation & Foliage Necrosis (Dried Out / Withered Plant)". NEVER classify a dead/dried/brown plant as healthy!
   - Check if leaves are drooping, limp, hanging down, or wilted (loss of hydrostatic turgor pressure). If leaves are drooping downward, currentHealthStatus MUST be "underwatered", and healthDiagnosis MUST state "Severe Foliage Drooping & Dehydration (Loss of Turgor Pressure)". NEVER mark a drooping plant as healthy!
   - Check if leaves are yellowing (chlorosis / overwatering / nutrient deficiency). If yellowing, set currentHealthStatus to "needs_attention" or "overwatered".
   - Check if brown necrotic spots, leaf blight, or pests are visible. If so, set currentHealthStatus to "diseased".
   - ONLY if leaves are firmly erect, vibrant, spotless and thriving, set currentHealthStatus to "healthy".
3. Provide step-by-step care and revival guidelines tailored to growing location: "${location}".
4. Specify exact water quantity (in ml) and emergency watering instructions.

Respond with ONLY a valid, raw JSON object (NO markdown backticks, NO \`\`\`json wrappers):
{
  "isPlant": true,
  "identifiedSpecies": "Accurate Common Plant Name",
  "originalName": "Accurate Common Plant Name",
  "confidence": 95,
  "currentHealthStatus": "healthy" | "underwatered" | "overwatered" | "needs_attention" | "diseased",
  "healthDiagnosis": "Clear diagnosis of current condition",
  "careSummary": "2-sentence practical care summary for ${location}",
  "waterQuantity": "Exact volume in ml and method",
  "wateringSchedule": "When to water",
  "wateringIntervalDays": 2,
  "sunlightAdvice": "Sunlight requirements",
  "nutrientAdvice": "Plant food / fertilizer routine",
  "fertilizingIntervalDays": 14,
  "protectionAdvice": "Pest & health protection/revival tips"
}`;

  const rawAiOutput = await callGeminiAI({
    prompt,
    imageBuffer: req.file.buffer,
    imageMimeType: req.file.mimetype,
    maxTokens: 1400,
    responseJson: true,
  });

  if (rawAiOutput) {
    try {
      const cleanJson = rawAiOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.isPlant === false || (parsed.identifiedSpecies && parsed.identifiedSpecies.toLowerCase().includes("not a plant"))) {
        isNotPlantError = true;
      } else if (parsed.identifiedSpecies && parsed.identifiedSpecies.toLowerCase() !== "unidentified plant") {
        aiData = parsed;
      }
    } catch (parseErr) {
      console.warn("Gemini plant identification parse error:", parseErr.message);
    }
  }

  if (isNotPlantError) {
    // If client visual scan found plant tones or user chose species, do not reject: fallback to botanical dataset instead
    const hasVisualOrUserSpecies = Boolean(req.body.species || (clientVisualScan?.detectedSpecies && clientVisualScan.detectedSpecies !== "Houseplant"));
    if (!hasVisualOrUserSpecies) {
      return res.status(400).json({
        message: "The uploaded image does not appear to be a plant. Please upload a clear photo of your plant, leaf, or flower.",
      });
    }
  }

  // Fallback botanical dataset matching if API key exhausted or request timed out
  if (!aiData) {
    const userSpecifiedSpecies = String(req.body.species || req.body.name || "").trim();
    const candidateSpecies = userSpecifiedSpecies;

    const matched = matchDatasetDisease({
      cropName: candidateSpecies,
      visualScan: clientVisualScan,
    });

    const isDesiccated = Boolean(clientVisualScan?.isDesiccated);
    const resolvedSpeciesName = candidateSpecies || (matched.crop && !["Peace Lily", "Tomato", "Hibiscus"].includes(matched.crop) ? matched.crop : "Urban Houseplant");
    const key = normalizeSpeciesKey(resolvedSpeciesName);
    const defaults = SPECIES_WATERING_DEFAULTS[key] || SPECIES_WATERING_DEFAULTS.other;

    aiData = {
      isPlant: true,
      identifiedSpecies: resolvedSpeciesName,
      originalName: resolvedSpeciesName,
      confidence: matched.confidence || 95,
      currentHealthStatus: matched.isHealthy ? "healthy" : isDesiccated ? "underwatered" : "diseased",
      healthDiagnosis: matched.isHealthy
        ? "Optimal foliage vitality and healthy chlorophyll turgor."
        : `${matched.condition} (${matched.scientificName || ""})`,
      careSummary: `Care profile for ${resolvedSpeciesName} in ${location}. ${matched.wateringAdvice}`,
      waterQuantity: defaults.waterQuantity || "300ml - 500ml per watering",
      wateringSchedule: defaults.wateringSchedule || `Every ${defaults.interval || 2} days early morning`,
      wateringIntervalDays: defaults.interval || 2,
      sunlightAdvice: defaults.sunlightAdvice || "Bright indirect sunlight",
      nutrientAdvice: defaults.nutrientAdvice || "Feed monthly with organic vermicompost or seaweed tonic",
      fertilizingIntervalDays: defaults.fertilizingIntervalDays || 14,
      protectionAdvice: matched.organicTreatment?.[0] || "Spray preventive organic Neem oil once a month",
    };
  }

  const plantNameFetched = (aiData.originalName || aiData.identifiedSpecies || "Urban Plant").trim();
  const interval = Number(aiData.wateringIntervalDays) || 2;
  const nextWater = new Date(Date.now() + interval * 86400000);
  const nextFeed = new Date(Date.now() + (aiData.fertilizingIntervalDays || 14) * 86400000);

  const isUnderwatered = aiData.currentHealthStatus === "underwatered";
  const isDesiccatedPlant = Boolean(
    clientVisualScan?.isDesiccated ||
    aiData.healthDiagnosis?.toLowerCase().includes("desiccation") ||
    aiData.healthDiagnosis?.toLowerCase().includes("dried") ||
    aiData.healthDiagnosis?.toLowerCase().includes("wither")
  );

  // Step-by-step suggestions list
  const stepWiseCare = isDesiccatedPlant
    ? [
        {
          stepNumber: 1,
          title: "Emergency Rehydration (30-Minute Bottom Soak)",
          icon: "droplet",
          headline: aiData.waterQuantity || "500ml bottom-soak drench",
          schedule: "Perform immediately right now!",
          detail: `Place the pot in a shallow tub or tray filled with 500ml lukewarm water for 25–30 minutes. The hydrophobic dry root ball will re-absorb moisture from the base up without suffocating surviving root hairs.`,
        },
        {
          stepNumber: 2,
          title: "Pruning Dead Crispy Foliage",
          icon: "shield",
          headline: "Cut completely brown leaves",
          schedule: "Do this today",
          detail: "Using clean, sterilized scissors, cut away all completely dried, crispy brown leaves down at their stems. This halts pointless moisture evaporation and lets the plant channel all energy to surviving nodes.",
        },
        {
          stepNumber: 3,
          title: "Sheltered Indirect Lighting",
          icon: "sun",
          headline: "Shield from Harsh Afternoon Sun",
          schedule: "Temporary recovery location",
          detail: "Keep away from blazing direct sun, AC vents, or hot drying winds. Place in bright indirect or gentle morning light while roots re-establish water uptake.",
        },
        {
          stepNumber: 4,
          title: "Pause Fertilizers (Strictly No Plant Food)",
          icon: "sprout",
          headline: "Hold Plant Food",
          schedule: "Wait until new shoots appear",
          detail: "Do NOT feed chemical or heavy fertilizer to a dehydrated or withered plant. Fertilizer salts burn fragile recovering roots. Wait until you see fresh green shoots before giving gentle vermicompost.",
        },
        {
          stepNumber: 5,
          title: "Automated Revival Reminders",
          icon: "bell",
          headline: "Active Revival Schedule",
          schedule: "Scheduled in Garden",
          detail: `Revival tracking and in-app watering notifications have been set for ${plantNameFetched}. Check soil moisture every 2 days to sustain recovery.`,
        },
      ]
    : [
        {
          stepNumber: 1,
          title: isUnderwatered ? "Emergency Hydration (Revival Step)" : "Watering Routine (How Much & When)",
          icon: "droplet",
          headline: aiData.waterQuantity || (isUnderwatered ? "450ml deep soak" : "300ml - 400ml"),
          schedule: isUnderwatered ? "Water immediately right now!" : (aiData.wateringSchedule || `Every ${interval} days`),
          detail: isUnderwatered
            ? `Give ${aiData.waterQuantity || "450ml"}. Pour directly into the soil at the base until moisture drains from bottom holes. The limp drooping foliage will absorb water and perk upright within 2 to 4 hours!`
            : `Give ${aiData.waterQuantity || "300ml - 400ml"}. ${aiData.wateringSchedule || `Water every ${interval} days early in the morning`}. Water directly into the soil at the base without soaking leaves.`,
        },
        {
          stepNumber: 2,
          title: "Sunlight & Placement",
          icon: "sun",
          headline: isUnderwatered ? "Gentle Filtered Light" : "Optimal Lighting",
          schedule: location === "balcony" ? "Balcony container" : location === "indoor" ? "Indoor windowsill" : "Terrace garden",
          detail: aiData.sunlightAdvice || "Provide 4–6 hours of bright morning sunlight or filtered light away from hot drafts.",
        },
        {
          stepNumber: 3,
          title: "Soil Nutrition & Food (\"Protein\")",
          icon: "sprout",
          headline: isUnderwatered ? "Hold Feed Until Recovered" : "Fertilizer Schedule",
          schedule: `Every ${aiData.fertilizingIntervalDays || 14} days`,
          detail: isUnderwatered
            ? "Do not apply chemical fertilizer while leaves are limp. Once your plant stands upright and recovers, feed with 1-2 tbsp organic vermicompost every 14 days."
            : (aiData.nutrientAdvice || "Feed with balanced organic compost, vermicompost, or seaweed plant food every 14 days."),
        },
        {
          stepNumber: 4,
          title: isUnderwatered ? "Foliage Turgor & Humidity Support" : "Health Protection & Disease Prevention",
          icon: "shield",
          headline: isUnderwatered ? "Humidity Boost" : "Preventive Care",
          schedule: isUnderwatered ? "Gentle leaf misting" : "Weekly inspection",
          detail: aiData.protectionAdvice || "Inspect undersides of leaves weekly. Lightly mist foliage to maintain ambient humidity and prevent dry brown tips.",
        },
        {
          stepNumber: 5,
          title: "Automated In-App Reminders",
          icon: "bell",
          headline: "Active Reminders",
          schedule: "Scheduled in Garden",
          detail: `In-app watering notifications have been set for ${plantNameFetched} so you will never forget a watering cycle!`,
        },
      ];

  // Create the plant record
  let plant = null;
  if (req.auth?.id) {
    plant = await GardenPlant.create({
      user: req.auth.id,
      name: plantNameFetched,
      species: plantNameFetched,
      originalName: plantNameFetched,
      location,
      potSize,
      wateringIntervalDays: interval,
      waterQuantityMl: aiData.waterQuantity,
      waterScheduleAdvice: aiData.wateringSchedule,
      nutrientAdvice: aiData.nutrientAdvice,
      sunlightAdvice: aiData.sunlightAdvice,
      protectionAdvice: aiData.protectionAdvice,
      fertilizingIntervalDays: aiData.fertilizingIntervalDays || 14,
      lastWateredAt: new Date(),
      nextWateringDue: nextWater,
      nextFertilizingDue: nextFeed,
      healthStatus: sanitizeHealthStatus(aiData.currentHealthStatus || "healthy"),
      currentDisease: aiData.healthDiagnosis || "",
      notes: aiData.careSummary,
      image: imageBase64,
      telemetry: {
        soilMoisturePercent: isDesiccatedPlant ? 12 : isUnderwatered ? 25 : 55,
        ambientTemperatureC: 28,
        ambientHumidityPercent: 60,
        lastReadingAt: new Date(),
      },
    });

    // Generate in-app notifications so user never forgets!
    await Notification.create([
      {
        user: req.auth.id,
        type: "plant_watering_reminder",
        title: `💧 Water Reminder: ${plantNameFetched}`,
        message: `Time to give ${plantNameFetched} ${aiData.waterQuantity}. ${aiData.wateringSchedule}.`,
        link: "/garden",
      },
      {
        user: req.auth.id,
        type: "plant_nutrient_reminder",
        title: `🌿 Plant Food & Nutrients: ${plantNameFetched}`,
        message: `Nutrient routine set: ${aiData.nutrientAdvice}. Added to your garden schedule!`,
        link: "/garden",
      },
    ]);
  } else {
    // Guest object
    plant = {
      _id: `guest-ai-${Date.now()}`,
      name: plantNameFetched,
      species: plantNameFetched,
      originalName: plantNameFetched,
      location,
      potSize,
      wateringIntervalDays: interval,
      waterQuantityMl: aiData.waterQuantity,
      waterScheduleAdvice: aiData.wateringSchedule,
      nutrientAdvice: aiData.nutrientAdvice,
      sunlightAdvice: aiData.sunlightAdvice,
      protectionAdvice: aiData.protectionAdvice,
      fertilizingIntervalDays: aiData.fertilizingIntervalDays || 14,
      lastWateredAt: new Date().toISOString(),
      nextWateringDue: nextWater.toISOString(),
      nextFertilizingDue: nextFeed.toISOString(),
      healthStatus: sanitizeHealthStatus(aiData.currentHealthStatus || "healthy"),
      currentDisease: aiData.healthDiagnosis || "",
      notes: aiData.careSummary,
      image: imageBase64,
      telemetry: {
        soilMoisturePercent: isDesiccatedPlant ? 12 : isUnderwatered ? 25 : 55,
        ambientTemperatureC: 28,
        ambientHumidityPercent: 60,
      },
    };
  }

  res.status(201).json({
    plant,
    aiReport: {
      ...aiData,
      originalName: plantNameFetched,
      stepWiseCare,
    },
    notificationsGenerated: [
      {
        title: `💧 Water Reminder for ${plantNameFetched}`,
        message: `Give ${aiData.waterQuantity}. Schedule: ${aiData.wateringSchedule}.`,
      },
      {
        title: `🌿 Plant Food & Nutrients for ${plantNameFetched}`,
        message: `${aiData.nutrientAdvice}`,
      },
    ],
  });
});

// Update plant
export const updateGardenPlant = asyncHandler(async (req, res) => {
  const plant = await GardenPlant.findOne({ _id: req.params.id, user: req.auth.id });
  if (!plant) return res.status(404).json({ message: "Plant not found." });

  if (req.body.name) plant.name = String(req.body.name).trim().slice(0, 100);
  if (req.body.species) plant.species = String(req.body.species).trim();
  if (req.body.location) plant.location = req.body.location;
  if (req.body.potSize) plant.potSize = req.body.potSize;
  if (req.body.soilType) plant.soilType = req.body.soilType;
  if (req.body.healthStatus) plant.healthStatus = sanitizeHealthStatus(req.body.healthStatus);
  if (req.body.currentDisease !== undefined) plant.currentDisease = req.body.currentDisease;
  if (req.body.notes !== undefined) plant.notes = String(req.body.notes).slice(0, 2000);
  if (req.body.wateringIntervalDays) {
    plant.wateringIntervalDays = Math.max(1, Number(req.body.wateringIntervalDays));
    plant.nextWateringDue = new Date(new Date(plant.lastWateredAt).getTime() + plant.wateringIntervalDays * 86400000);
  }

  await plant.save();
  res.json(plant);
});

// Delete plant
export const deleteGardenPlant = asyncHandler(async (req, res) => {
  const plant = await GardenPlant.findOneAndDelete({ _id: req.params.id, user: req.auth.id });
  if (!plant) return res.status(404).json({ message: "Plant not found." });
  await PlantDiagnosis.deleteMany({ gardenPlant: plant._id });
  res.json({ message: "Plant removed from garden." });
});

// Log watering action
export const waterGardenPlant = asyncHandler(async (req, res) => {
  const plant = await GardenPlant.findOne({ _id: req.params.id, user: req.auth.id });
  if (!plant) return res.status(404).json({ message: "Plant not found." });

  plant.lastWateredAt = new Date();
  const interval = plant.wateringIntervalDays || 2;
  plant.nextWateringDue = new Date(Date.now() + interval * 86400000);

  // If telemetry exists, simulate moisture bump
  if (plant.telemetry) {
    plant.telemetry.soilMoisturePercent = 75;
    plant.telemetry.lastReadingAt = new Date();
  }

  await plant.save();
  res.json({ message: `Watered ${plant.name} successfully!`, plant });
});

// IoT Telemetry update endpoint (can be called by simulated UI or external ESP32 sensor)
export const updateTelemetry = asyncHandler(async (req, res) => {
  const plantId = req.params.id;
  const plant = await GardenPlant.findById(plantId);
  if (!plant) return res.status(404).json({ message: "Plant not found." });

  const moisture = Number(req.body.soilMoisturePercent ?? req.body.moisture);
  const temp = Number(req.body.ambientTemperatureC ?? req.body.temperature);
  const humidity = Number(req.body.ambientHumidityPercent ?? req.body.humidity);

  plant.telemetry = {
    soilMoisturePercent: isNaN(moisture) ? plant.telemetry?.soilMoisturePercent : Math.max(0, Math.min(100, moisture)),
    ambientTemperatureC: isNaN(temp) ? plant.telemetry?.ambientTemperatureC : temp,
    ambientHumidityPercent: isNaN(humidity) ? plant.telemetry?.ambientHumidityPercent : Math.max(0, Math.min(100, humidity)),
    lastReadingAt: new Date(),
  };

  // Automated health warning based on telemetry
  if (plant.telemetry.soilMoisturePercent != null && plant.telemetry.soilMoisturePercent < 20) {
    if (plant.healthStatus === "healthy") plant.healthStatus = "needs_attention";
  }

  await plant.save();
  res.json({ message: "Telemetry updated successfully.", telemetry: plant.telemetry, healthStatus: plant.healthStatus });
});

// Get plant care & diagnosis history
export const getPlantHistory = asyncHandler(async (req, res) => {
  const diagnoses = await PlantDiagnosis.find({ gardenPlant: req.params.id }).sort({ createdAt: -1 }).limit(20).lean();
  res.json(diagnoses);
});

// Botanical Disease Expert Knowledge Base (Used for diagnosis & reliable fallback)
const BOTANICAL_KNOWLEDGE = {
  tomato_early_blight: {
    identifiedPlant: "Tomato",
    diseaseName: "Early Blight",
    isHealthy: false,
    confidence: 94,
    severity: "Moderate",
    symptoms: [
      "Dark brown to black necrotic spots with concentric ring patterns ('target' or 'bullseye' lesions)",
      "Pronounced yellow chlorotic halos surrounding lesions",
      "Older, lower leaves yellowing and dropping prematurely",
      "Stems developing dark sunken spots near ground level",
    ],
    causes: [
      "Fungal pathogen Alternaria solani surviving in soil and plant debris",
      "Warm temperatures (24°C–29°C) combined with high humidity or wet foliage",
      "Rain or overhead watering splashing contaminated soil onto lower leaves",
    ],
    organicTreatment: [
      "Prune and discard all infected lower leaves immediately (burn or bin, never compost).",
      "Apply organic Cold-Pressed Neem Oil spray (5ml + 2ml mild liquid soap per 1 Liter water) every 5-7 days at sunset.",
      "Spray Potassium Bicarbonate or Copper Soap fungicide to arrest fungal spore germination.",
      "Apply 2 inches of clean straw mulch around the base to prevent soil splashback.",
    ],
    chemicalTreatment: [
      "Apply Chlorothalonil or Mancozeb protective fungicide spray according to nursery label instructions if spreading.",
    ],
    preventiveCare: [
      "Water exclusively at ground level using drip or bottom-watering — never wet tomato foliage.",
      "Maintain 45–60cm spacing between plants to maximize airflow and sunlight penetration.",
      "Stake or cage tomato plants to keep foliage elevated off wet soil.",
      "Sanitize garden shears with 70% isopropyl alcohol between plants.",
    ],
    wateringAdvice: "Reduce watering frequency slightly if soil is damp. Water deeply at root base early in the morning so surface moisture evaporates quickly.",
    smartFarmingInsight: "Microclimate risk: Alternaria sporulation index spikes when leaf surface wetness exceeds 5 continuous hours at 22°C–28°C. IoT moisture monitoring recommended.",
  },
  tomato_late_blight: {
    identifiedPlant: "Tomato",
    diseaseName: "Late Blight",
    isHealthy: false,
    confidence: 91,
    severity: "Severe",
    symptoms: [
      "Large, irregularly shaped water-soaked lesions that turn dark brown/purplish",
      "White cottony fungal bloom visible on undersides of leaves during high humidity",
      "Rapid wilting and collapse of entire foliage canopy within days",
    ],
    causes: [
      "Oomycete Phytophthora infestans",
      "Cool, rainy or damp weather (15°C–22°C) with prolonged relative humidity (>85%)",
    ],
    organicTreatment: [
      "Immediately isolate affected plant and destroy heavily diseased stems.",
      "Spray copper-based biofungicide on remaining healthy foliage to protect new growth.",
      "Improve air circulation and shelter plant from rain.",
    ],
    chemicalTreatment: [
      "Apply systemic fungicides containing Dimethomorph or Cymoxanil under professional guidance.",
    ],
    preventiveCare: [
      "Plant certified blight-resistant tomato cultivars.",
      "Avoid overhead watering and provide roof/terrace overhang during rainy spells.",
    ],
    wateringAdvice: "Stop overhead watering completely. Allow top 2 inches of soil to dry before adding water strictly at the soil line.",
    smartFarmingInsight: "Immediate quarantine recommended: Late Blight spores can spread aerially to neighboring nightshades within a 100m radius.",
  },
  tomato_healthy: {
    identifiedPlant: "Tomato",
    diseaseName: "Healthy Leaf",
    isHealthy: true,
    confidence: 96,
    severity: "None",
    symptoms: [
      "Vibrant green leaves with firm turgor pressure",
      "No visible fungal spores, lesions, chlorosis, or necrotic spots",
      "Normal leaf venation and vigorous apical growth",
    ],
    causes: ["Optimal sunlight, proper aeration, and balanced nutrient/moisture regimen."],
    organicTreatment: [
      "Maintain routine organic nourishment: apply diluted seaweed extract or vermicompost tea every 14 days.",
    ],
    chemicalTreatment: ["No chemical treatment needed."],
    preventiveCare: [
      "Continue deep root-level watering every 2 days.",
      "Ensure 6–8 hours of direct daily sunlight.",
      "Mulch soil to regulate root temperature.",
    ],
    wateringAdvice: "Water every 2 days in moderate weather. Check top 2 inches of soil with your finger before watering.",
    smartFarmingInsight: "Crop health baseline optimal. Maintain standard IoT soil moisture target between 40%–65%.",
  },
};

// Main AI Leaf Disease Diagnosis Controller
export const diagnosePlant = asyncHandler(async (req, res) => {
  if (!req.file || !isValidPlantImage(req.file.buffer)) {
    return res.status(400).json({ message: "Please upload a valid JPG, PNG, or WebP plant leaf photo." });
  }

  const plantId = req.body.plant_id;
  const location = req.body.location || "balcony";
  const plantNameFromReq = req.body.plant_name || "";

  let clientVisualScan = null;
  if (req.body.visual_analysis) {
    try {
      clientVisualScan = typeof req.body.visual_analysis === "string" ? JSON.parse(req.body.visual_analysis) : req.body.visual_analysis;
    } catch {
      clientVisualScan = null;
    }
  }

  let diagnosisResult = null;
  let isNotPlantDiag = false;

  // Attempt multimodal diagnosis via Gemini
  const prompt = `You are a world-class plant pathologist and urban gardening AI assistant. Analyze this scanned plant/leaf image.
Growing Location: "${location}".
${plantNameFromReq ? `User Garden Plant Reference: "${plantNameFromReq}".` : ""}
${clientVisualScan?.isDesiccated ? "CRITICAL BOTANICAL OBSERVATION: Plant tissue is brown, dry, crispy, and severely desiccated / dehydrated (withered plant). Check for severe dehydration / drought stress." : ""}
${clientVisualScan?.isSeverelyDrooping ? "CRITICAL BOTANICAL OBSERVATION: Foliage shows severe downward drooping and limp petioles (dehydration / loss of hydrostatic turgor pressure)." : ""}
${clientVisualScan?.isYellowing ? "CRITICAL BOTANICAL OBSERVATION: Foliage shows noticeable yellowing (chlorosis / overwatering / nutrient depletion)." : ""}
${clientVisualScan?.isBrowning ? "CRITICAL BOTANICAL OBSERVATION: Foliage displays brown necrotic spots, scorched margins, or fungal lesions." : ""}

CRITICAL FIRST STEP:
Check if this image depicts a plant leaf, plant stem, flower, or live/dry botanical foliage.
If the image is NOT a plant or leaf (e.g. human face, car, animal, furniture, screen, document, receipt, random non-plant object):
Respond with ONLY:
{
  "isPlant": false,
  "errorMessage": "The uploaded image is not a plant or leaf. Please upload a clear photo of a plant leaf to diagnose."
}

If the image IS a plant or leaf:
1. Identify the accurate botanical and common plant species name from the photo (e.g. 'Tomato', 'Money Plant', 'Sweet Basil', 'Rose', 'Monstera Deliciosa', 'Hibiscus', 'ZZ Plant', 'Snake Plant', etc.). If completely dry/dead nursery plant, specify the plant species or 'Dried Nursery Plant'.
2. Detect the exact condition (e.g. 'Severe Desiccation / Drought Necrosis', 'Loss of Turgor / Acute Wilting', 'Early Blight', 'Powdery Mildew', 'Leaf Spot', 'Foliar Chlorosis', or 'Healthy Leaf'). If dry/brown/withered, NEVER report Healthy!
3. Tailor watering and care advice specifically for "${location}" growing conditions.

Respond with ONLY a valid, raw JSON object (NO markdown backticks, NO \`\`\`json wrappers, NO conversational text):
{
  "isPlant": true,
  "identifiedPlant": "Accurate common plant name identified from image",
  "diseaseName": "Clear condition name (e.g. 'Severe Desiccation & Wither', 'Early Blight', 'Leaf Spot') or 'Healthy Leaf'",
  "isHealthy": false,
  "confidence": 94,
  "severity": "Mild" | "Moderate" | "Severe" | "None",
  "symptoms": ["Specific visible symptom 1", "Symptom 2", "Symptom 3"],
  "causes": ["Pathogen or environmental cause 1", "Trigger 2"],
  "organicTreatment": ["Actionable urban organic remedy 1", "Remedy 2", "Remedy 3"],
  "chemicalTreatment": ["Safe fungicide, nutrient spray, or none needed"],
  "preventiveCare": ["Cultural practice 1", "Pruning/watering practice 2"],
  "wateringAdvice": "Specific watering frequency and method recommendation tailored to ${location}",
  "smartFarmingInsight": "Microclimate placement advice for ${location}"
}`;

  const rawAiOutput = await callGeminiAI({
    prompt,
    imageBuffer: req.file.buffer,
    imageMimeType: req.file.mimetype,
    maxTokens: 1500,
    responseJson: true,
  });

  if (rawAiOutput) {
    try {
      const cleanJson = rawAiOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.isPlant === false) {
        isNotPlantDiag = true;
      } else if (parsed.diseaseName) {
        diagnosisResult = parsed;
      }
    } catch (parseErr) {
      console.warn("Gemini diagnosis parse error:", parseErr.message);
    }
  }

  if (isNotPlantDiag) {
    return res.status(400).json({ message: "The uploaded image is not a plant or leaf. Please upload a clear photo of a plant leaf to diagnose." });
  }

  // If Gemini was unavailable, quota-limited, or failed, match against Botanical Pathology Dataset:
  if (!diagnosisResult) {
    const userCrop = req.body.species || req.body.plant_name || plantNameFromReq;
    const matched = matchDatasetDisease({
      cropName: userCrop,
      visualScan: clientVisualScan,
      queryText: req.body.condition || req.body.disease,
    });

    diagnosisResult = {
      identifiedPlant: matched.crop,
      diseaseName: matched.condition,
      isHealthy: matched.isHealthy,
      confidence: matched.confidence || 95,
      severity: matched.severity || (matched.isHealthy ? "None" : "Moderate"),
      scientificName: matched.scientificName,
      symptoms: matched.symptoms || [],
      causes: matched.causes || [],
      organicTreatment: matched.organicTreatment || [],
      chemicalTreatment: matched.chemicalTreatment || [],
      preventiveCare: matched.preventiveCare || [],
      wateringAdvice: matched.wateringAdvice || `Water ${matched.crop} at root level every 2-3 days in ${location}.`,
      smartFarmingInsight: matched.smartFarmingInsight || `Urban farming insight: Maintain balanced humidity and container drainage in ${location}.`,
      fromDataset: true,
      datasetId: matched.id,
    };
  }

  const finalPlantName = diagnosisResult.identifiedPlant || plantNameFromReq || "Urban Garden Plant";
  const finalSpecies = diagnosisResult.identifiedPlant || "Houseplant";

  // Save diagnosis to database
  let savedDiagnosis = null;
  if (req.auth?.id) {
    savedDiagnosis = await PlantDiagnosis.create({
      user: req.auth.id,
      gardenPlant: plantId || null,
      plantName: finalPlantName,
      plantSpecies: finalSpecies,
      diseaseName: diagnosisResult.diseaseName,
      isHealthy: diagnosisResult.isHealthy,
      confidence: diagnosisResult.confidence,
      severity: diagnosisResult.severity,
      symptoms: diagnosisResult.symptoms || [],
      causes: diagnosisResult.causes || [],
      organicTreatment: diagnosisResult.organicTreatment || [],
      chemicalTreatment: diagnosisResult.chemicalTreatment || [],
      preventiveCare: diagnosisResult.preventiveCare || [],
      wateringAdvice: diagnosisResult.wateringAdvice || "",
      smartFarmingInsight: diagnosisResult.smartFarmingInsight || "",
    });

    // If plant_id provided, update plant's health status in Garden
    if (plantId) {
      const plant = await GardenPlant.findOne({ _id: plantId, user: req.auth.id });
      if (plant) {
        plant.healthStatus = diagnosisResult.isHealthy
          ? "healthy"
          : (diagnosisResult.diseaseName.includes("Desiccation") || diagnosisResult.diseaseName.includes("Wilting") || diagnosisResult.diseaseName.includes("Dehydration"))
            ? "underwatered"
            : "diseased";
        plant.currentDisease = diagnosisResult.diseaseName;
        await plant.save();
      }
    }
  }

  const recommendedProducts = await findRelevantProducts(
    `${diagnosisResult.diseaseName} ${(diagnosisResult.organicTreatment || []).join(" ")} ${finalSpecies} ${finalPlantName}`
  );

  res.json({
    diagnosis: diagnosisResult,
    savedId: savedDiagnosis?._id || null,
    plantUpdated: Boolean(plantId),
    recommendedProducts,
  });
});

// Provide sample demo data and sample leaf images for instant 1-click test
export const getDemoData = asyncHandler(async (_req, res) => {
  res.json({
    demoPlant: {
      name: "Roma Tomato Plant",
      species: "Tomato",
      location: "balcony",
      potSize: "Large (12 inch pot)",
      soilType: "Organic Potting Mix + Perlite",
      healthStatus: "healthy",
      wateringIntervalDays: 2,
    },
    sampleScenarios: [
      {
        id: "tomato_early_blight",
        title: "Tomato Early Blight (Demo)",
        description: "Classic concentric target rings and yellow halos on tomato foliage.",
        sampleDiagnosis: BOTANICAL_KNOWLEDGE.tomato_early_blight,
      },
      {
        id: "tomato_late_blight",
        title: "Tomato Late Blight (Demo)",
        description: "Water-soaked dark lesions with white spore margins.",
        sampleDiagnosis: BOTANICAL_KNOWLEDGE.tomato_late_blight,
      },
      {
        id: "tomato_healthy",
        title: "Healthy Tomato (Demo)",
        description: "Clean, vigorous green leaf without spots or distress.",
        sampleDiagnosis: BOTANICAL_KNOWLEDGE.tomato_healthy,
      },
    ],
  });
});

// High-Speed Botanical Mind Engine (Domain-Expert Gardening Intelligence)
export function generateBotanicalMindReply({ question = "", plantTitle = "Urban Plant", species = "Plant", healthStatus = "healthy", weather = null, targetLang = "gu" }) {
  const q = String(question).toLowerCase().trim();
  const lang = targetLang || "gu";

  // Microclimate note
  let weatherNote = "";
  if (weather && weather.temperature) {
    const temp = Math.round(weather.temperature);
    if (lang === "gu") {
      weatherNote = temp >= 32
        ? `\n\n☀️ **ગરમી ચેતવણી (${temp}°C):** હાલના ગરમ તાપમાનને લીધે પાંદડા ઝડપથી પાણી ગુમાવે છે, માટે દિવસમાં 1 વાર સવારે કૂંડામાં પૂરતો ભેજ ચકાસો.`
        : `\n\n🌤️ **સ્થાનિક હવામાન (${temp}°C, ભેજ: ${weather.humidity || 50}%):** હાલનું વાતાવરણ છોડના સ્વસ્થ વિકાસ માટે એકદમ અનુકૂળ છે.`;
    } else if (lang === "hi") {
      weatherNote = temp >= 32
        ? `\n\n☀️ **गर्मी चेतावनी (${temp}°C):** तेज तापमान में पत्तियां जल्दी सूखती हैं, इसलिए सुबह मिट्टी की नमी जरूर जांचें।`
        : `\n\n🌤️ **स्थानीय मौसम (${temp}°C):** वर्तमान मौसम पौधों के विकास के लिए बहुत अनुकूल है।`;
    } else {
      weatherNote = temp >= 32
        ? `\n\n☀️ **Heat Advisory (${temp}°C):** Warm temps accelerate evaporation; inspect soil moisture daily before 9 AM.`
        : `\n\n🌤️ **Microclimate (${temp}°C, ${weather.humidity || 50}% humidity):** Current weather is highly supportive for active growth.`;
    }
  }

  // 1. YELLOW LEAVES / પીળા પાંદડા / पीली पत्तियां
  if (q.includes("yellow") || q.includes("peela") || q.includes("pila") || q.includes("pili") || q.includes("peeli") || q.includes("પીળા") || q.includes("પીળુ") || q.includes("પીળું") || q.includes("પીળાશ") || q.includes("पीले") || q.includes("पीली")) {
    if (lang === "gu") {
      return `🌱 **${plantTitle} ના પાંદડા પીળા પડવાના મુખ્ય 3 કારણો અને ઉપાય:**\n1. **વધુ પડતું પાણી (સૌથી સામાન્ય કારણ):** કુંડાની ઉપરની 2 ઇંચ માટી સુકાય ત્યારે જ પાણી આપો. કુંડાના તળિયે કાણું (ડ્રેનેજ) ખુલ્લું રાખો જેથી મૂળ સડે નહીં.\n2. **નાઇટ્રોજન પોષણની જરૂર:** છોડને 1 મુઠ્ઠી વર્મીકમ્પોસ્ટ (અળસિયાનું ખાતર) અથવા લીક્વિડ સીવીડ આપો.\n3. **હળવો સૂર્યપ્રકાશ:** છોડને દરરોજ સવારે 3-4 કલાક કુમળો તડકો મળવો જરૂરી છે.\n💡 **ત્વરિત સલાહ:** નીચેના જૂના પીળા પાંદડા કાતરથી કાપી નાખો જેથી છોડ નવા સ્વસ્થ પાંદડા ઉગાડવામાં પોતાની શક્તિ વાપરે!${weatherNote}`;
    }
    if (lang === "hi") {
      return `🌱 **${plantTitle} की पत्तियां पीली पड़ने के मुख्य 3 कारण और समाधान:**\n1. **अधिक पानी (सबसे आम वजह):** गमले की ऊपरी 2 इंच मिट्टी सूखने पर ही पानी दें। गमले का ड्रेनेज होल खुला रखें ताकि जड़ें न गलें।\n2. **नाइट्रोजन पोषण की कमी:** पौधे में 1 मुट्ठी जैविक वर्मीकंपोस्ट या लिक्विड सीवीड टॉनिक डालें।\n3. **धूप का चक्र:** पौधे को रोजाना सुबह 3-4 घंटे की हल्की धूप जरूर दिखाएं।\n💡 **त्वरित टिप:** नीचे की पीली पत्तियों को कैंची से हटा दें ताकि पौधा नई पत्तियों के विकास में ऊर्जा लगाए!${weatherNote}`;
    }
    return `🌱 **Top 3 Causes & Cures for Yellow Leaves on your ${plantTitle}:**\n1. **Overwatering (Most Frequent):** Only hydrate when the top 2 inches of soil feel dry. Ensure drainage holes allow free runoff so roots breathe.\n2. **Nutrient Deficiency (Nitrogen):** Top-dress with 1 handful of organic Vermicompost or feed with diluted Liquid Seaweed.\n3. **Gentle Sunlight:** Ensure the plant receives 3–4 hours of bright morning illumination.\n💡 **Quick Action:** Gently prune lower yellow leaves to redirect vital energy into crisp new growth!${weatherNote}`;
  }

  // 2. WATERING / પાણી / पानी कब दें
  if (q.includes("water") || q.includes("pani") || q.includes("sinchan") || q.includes("droop") || q.includes("પાણી") || q.includes("સિંચન") || q.includes("પાણીનો") || q.includes("पानी") || q.includes("सींच")) {
    if (lang === "gu") {
      return `💧 **${plantTitle} ને પાણી આપવાનો સુવર્ણ નિયમ:**\n1. **સવારનો શ્રેષ્ઠ સમય:** હંમેશા સવારે 6 થી 8 વાગ્યાની વચ્ચે મૂળ પાસે પાણી આપો. પાંદડા પર પાણી છાંટવાનું ટાળો જેથી ફૂગ ન લાગે.\n2. **ફિંગર ટેસ્ટ (Finger Test):** માટીમાં આંગળી 1-2 ઇંચ અંદર નાખો; જો માટી ભીની લાગે તો પાણી ન આપો, જો સૂકી લાગે તો જ પૂરતું પાણી આપો.\n3. **હવામાન મુજબ:** ગરમીમાં દર 1-2 દિવસે અને ઠંડી/ચોમાસામાં દર 3-4 દિવસે માટી ચકાસીને પાણી આપો.${weatherNote}`;
    }
    if (lang === "hi") {
      return `💧 **${plantTitle} को पानी देने का स्वर्णिम नियम:**\n1. **सुबह का सही समय:** हमेशा सुबह 6 से 8 बजे के बीच सीधे जड़ों में पानी दें। पत्तियों पर पानी न डालें ताकि फंगस न लगे।\n2. **फिंगर टेस्ट (उंगली से जांच):** मिट्टी में 1-2 इंच उंगली डालकर देखें। अगर मिट्टी सूखी लगे तभी पानी दें, गीली होने पर न दें।\n3. **मौसम के अनुसार:** गर्मियों में 1-2 दिन में और सर्दियों/बरसात में 3-4 दिन में मिट्टी जांचकर पानी दें।${weatherNote}`;
    }
    return `💧 **Golden Watering Protocol for your ${plantTitle}:**\n1. **Morning Root Hydration:** Water deeply between 6 AM – 8 AM directly at the root zone. Avoid wetting the leaves to prevent mildew.\n2. **The 2-Inch Finger Test:** Insert your finger 2 inches into soil. If damp, wait! If dry, water thoroughly until it drains out the base.\n3. **Seasonal Rhythm:** Hydrate every 1–2 days during peak heat, and every 3–4 days during milder weather.${weatherNote}`;
  }

  // 3. NEEM OIL / લીમડાનું તેલ / नीम तेल
  if (q.includes("neem") || q.includes("limda") || q.includes("spray") || q.includes("recipe") || q.includes("લીમડો") || q.includes("લીમડા") || q.includes("નીમ") || q.includes("नीम")) {
    if (lang === "gu") {
      return `🌿 **શુદ્ધ લીમડાના તેલનો ઓર્ગેનિક સ્પ્રે બનાવવાની સરળ રીત:**\n1. **મિશ્રણ:** 1 લિટર નવશેકા ગરમ પાણીમાં 5 મિલી શુદ્ધ લીમડાનું તેલ (Pure Cold-Pressed Neem Oil) અને 2-3 ટીપાં હળવો લિક્વિડ સાબુ ઉમેરો.\n2. **સારી રીતે હલાવો:** બોટલને બરાબર હલાવો જેથી તેલ અને પાણી સંપૂર્ણપણે ભળી જાય.\n3. **છંટકાવનો સમય:** હંમેશા સાંજે સૂર્યાસ્ત પછી જ છંટકાવ કરો (પાંદડાની ઉપર અને નીચે બંને તરફ). તેજ તડકામાં છાંટવાથી પાંદડા બળી શકે છે.\n💡 દર 7-10 દિવસે એકવાર છંટકાવ કરવાથી કોઈ પણ જીવાત નજીક નહીં આવે!`;
    }
    if (lang === "hi") {
      return `🌿 **ऑर्गेनिक नीम तेल स्प्रे बनाने की आसान विधि:**\n1. **घोल तैयार करें:** 1 लीटर हल्के गुनगुने पानी में 5 मिली शुद्ध नीम का तेल और 2-3 बूंदें हल्का लिक्विड सोप मिलाएं।\n2. **अच्छी तरह हिलाएं:** बोतल को अच्छी तरह शेक करें ताकि तेल पानी में घुल जाए।\n3. **छिड़काव का सही समय:** हमेशा शाम को सूर्यास्त के बाद पत्तियों के ऊपर और नीचे दोनों तरफ स्प्रे करें। तेज धूप में पत्तियां झुलस सकती हैं।\n💡 हर 7-10 दिन में एक बार स्प्रे करने से पौधे पूरी तरह सुरक्षित रहेंगे!`;
    }
    return `🌿 **Organic Neem Oil Foliar Spray Recipe:**\n1. **The Formula:** Mix 5ml pure cold-pressed neem oil + 2–3 drops of mild liquid soap (as an emulsifier) into 1 liter of lukewarm water.\n2. **Shake Thoroughly:** Shake vigorously until the solution turns milky.\n3. **Application Golden Rule:** Spray in the late evening / sunset on both the top and underside of foliage. Never spray under harsh direct sun.\n💡 Repeat every 7–10 days to shield against 200+ varieties of urban garden pests!`;
  }

  // 4. PESTS / INSECTS / MEALYBUGS / જીવાત / કીડા / कीड़े
  if (q.includes("pest") || q.includes("bug") || q.includes("mealy") || q.includes("aphid") || q.includes("mite") || q.includes("insect") || q.includes("jivat") || q.includes("kida") || q.includes("keeda") || q.includes("જીવાત") || q.includes("કીડા") || q.includes("ઇયળ") || q.includes("कीड़े") || q.includes("मिलीबग")) {
    if (lang === "gu") {
      return `🐛 **${plantTitle} પર જીવાત (મીલીબગ, માહો, સફેદ માખી) થી મુક્તિ મેળવવાનો રામબાણ ઈલાજ:**\n1. **હાથથી સફાઈ:** જો સફેદ મીલીબગ કે માહો દેખાય તો રૂ (કોટન) ને હળવા સાબુના પાણી કે આલ્કોહોલમાં પલાળીને સીધા સાફ કરી લો.\n2. **ઓર્ગેનિક લીમડાના તેલનો સ્પ્રે:** 5ml લીમડાનું તેલ 1 લિટર પાણીમાં મેળવીને સાંજે પાંદડાની નીચે અને ડાળીઓ પર છાંટો.\n3. **અલગ રાખો:** રોગગ્રસ્ત છોડને થોડા દિવસ માટે બીજા સ્વસ્થ છોડથી થોડો દૂર રાખો જેથી જીવાત ફેલાય નહીં.\n💡 5 દિવસના અંતરે 2 વાર છંટકાવ કરવાથી છોડ એકદમ સાફ થઈ જશે!`;
    }
    if (lang === "hi") {
      return `🐛 **${plantTitle} के कीड़ों (मिलीबग, एफिड्स, सफेद मक्खी) का पक्का जैविक इलाज:**\n1. **प्राथमिक सफाई:** सफेद मिलीबग दिखने पर रुई को पानी या हल्के एल्कोहल में भिगोकर पत्तियों से सीधे हटा दें।\n2. **नीम तेल का छिड़काव:** 5ml नीम का तेल 1 लीटर पानी और 2 बूंद लिक्विड सोप में मिलाकर शाम के समय छिड़कें।\n3. **पौधे को अलग रखें:** संक्रमित पौधे को कुछ दिन अन्य पौधों से अलग रखें ताकि कीड़े न फैलें।\n💡 7 दिनों में 2 बार छिड़काव करने से सभी कीड़े पूरी तरह खत्म हो जाएंगे!`;
    }
    return `🐛 **Organic Pest Cure for your ${plantTitle} (Mealybugs, Aphids & Mites):**\n1. **Manual Spot Clean:** For cottony white mealybugs, dab them directly with a cotton swab dipped in rubbing alcohol or mild soapy water.\n2. **Evening Neem Shield:** Spray cold-pressed neem oil solution (5ml/L) focusing heavily on leaf undersides and branch nodes.\n3. **Isolation Protocol:** Quarantine the affected plant 2–3 feet away from others to prevent cross-contamination.\n💡 Repeat twice a week until clear, then once every fortnight for preventive defense!`;
  }

  // 5. POTTING SOIL MIX / કુંડાની માટી / गमले की मिट्टी
  if (q.includes("soil") || q.includes("potting") || q.includes("mix") || q.includes("mati") || q.includes("mitti") || q.includes("કુંડાની માટી") || q.includes("માટી") || q.includes("માટીનું") || q.includes("माटी") || q.includes("मिट्टी") || q.includes("पॉटिंग")) {
    if (lang === "gu") {
      return `🪴 **શહેરી કુંડા માટેનું શ્રેષ્ઠ અને પૌષ્ટિક માટીનું મિશ્રણ (40:30:20:10):**\n• **40% સામાન્ય બગીચાની માટી** (છોડને મજબૂત આધાર માટે)\n• **30% વર્મીકમ્પોસ્ટ અથવા જૂનું છાણીયું ખાતર** (ભરપૂર ઓર્ગેનિક પોષણ માટે)\n• **20% કોકોપીટ** (ભેજ જાળવી રાખવા અને કુંડું હળવું રાખવા માટે)\n• **10% નદીની રેતી અથવા પરલાઇટ** (સરળ ડ્રેનેજ માટે જેથી મૂળ સડે નહીં)\n• **બોનસ ટીપ:** મિશ્રણમાં 1 મુઠ્ઠી લીમડાનો ખોળ ઉમેરો જેથી માટીમાં કીડા કે ઉધઈ ન થાય!`;
    }
    if (lang === "hi") {
      return `🪴 **शहरी गमलों के लिए सर्वोत्तम जैविक मिट्टी का अनुपात (40:30:20:10):**\n• **40% सामान्य बगीचे की मिट्टी** (पौधे की जड़ को पकड़ के लिए)\n• **30% वर्मीकंपोस्ट या पुरानी गोबर खाद** (समृद्ध पोषण के लिए)\n• **20% कोकोपीट** (नमी बनाए रखने और मिट्टी को हल्का रखने के लिए)\n• **10% नदी की रेत या परलाइट** (उत्तम ड्रेनेज के लिए)\n• **बोनस टिप:** 1 मुट्ठी नीम की खली मिलाएं ताकि मिट्टी में कीड़े और फंगस न लगे!`;
    }
    return `🪴 **The Ideal 40:30:20:10 Urban Potting Mix Formula:**\n• **40% Garden Soil:** Provides foundational root anchorage.\n• **30% Organic Vermicompost:** Dense organic macronutrients.\n• **20% Cocopeat:** Retains moisture while remaining light and airy.\n• **10% Perlite or Coarse Sand:** Guarantees razor-sharp drainage.\n• **Bonus:** Blend in 1 handful of Neem Cake Powder to naturally inoculate against soil-borne root grubs and fungus!`;
  }

  // 6. FERTILIZER / ખાતર / खाद
  if (q.includes("fertiliz") || q.includes("compost") || q.includes("khad") || q.includes("khatar") || q.includes("manure") || q.includes("nutrient") || q.includes("tonic") || q.includes("food") || q.includes("feed") || q.includes("ખાતર") || q.includes("ખાતરનું") || q.includes("ખાતરનો") || q.includes("खाद") || q.includes("फर्टिलाइजर")) {
    if (lang === "gu") {
      return `🌱 **${plantTitle} માટે શ્રેષ્ઠ ઓર્ગેનિક ખાતર અને આપવાની રીત:**\n1. **વર્મીકમ્પોસ્ટ (અળસિયાનું ખાતર):** દર 15-20 દિવસે 1-2 મુઠ્ઠી કુંડાની ઉપરની માટી હળવી ગોડી કરીને આપો.\n2. **લિક્વિડ સીવીડ ટોનિક:** દર મહિને 3ml સીવીડ 1 લિટર પાણીમાં ભેળવીને મૂળમાં રેડો, તેનાથી પાંદડા ચમકદાર અને લીલાછમ બનશે.\n3. **ઘરેલુ કેળાની છાલનું પાણી:** ફૂલો અને ફળો માટે કેળાની છાલને 2 દિવસ પાણીમાં પલાળીને તે પાણી આપો (પોટેશિયમથી ભરપૂર).\n💡 ક્યારેય વધુ રાસાયણિક ખાતર ન આપવું, ઓર્ગેનિક પદ્ધતિથી છોડ દીર્ઘાયુ રહે છે!`;
    }
    if (lang === "hi") {
      return `🌱 **${plantTitle} के लिए सर्वश्रेष्ठ जैविक खाद और उपयोग का तरीका:**\n1. **वर्मीकंपोस्ट (केंचुआ खाद):** हर 15-20 दिन में 1-2 मुट्ठी गमले की गुड़ाई करके मिट्टी में मिलाएं।\n2. **लिक्विड सीवीड टॉनिक:** महीने में एक बार 3ml सीवीड को 1 लीटर पानी में मिलाकर जड़ों में डालें, पत्तियां हरी-भरी रहेंगी।\n3. **केले के छिलके का पानी:** फूल और फल वाले पौधों के लिए केले के छिलके का पानी (पोटेशियम से भरपूर) सर्वोत्तम है।\n💡 रासायनिक खाद से बचें, जैविक खाद से पौधे सालों-साल स्वस्थ रहते हैं!`;
    }
    return `🌱 **Organic Nutrient Protocol for your ${plantTitle}:**\n1. **Vermicompost Feeding:** Top-dress 1–2 handfuls around the pot perimeter every 15–20 days after lightly loosening topsoil.\n2. **Liquid Seaweed Tonic:** Dilute 3ml/L water once a month to supply 60+ trace minerals and stimulate vibrant chlorophyll.\n3. **Potassium Boost for Blooms:** Use steeped banana peel water for flowering and fruiting plants to accelerate buds.\n💡 Always water thoroughly immediately after applying organic nutrients!`;
  }

  // 7. TULSI / તુલસી / तुलसी
  if (q.includes("tulsi") || q.includes("basil") || q.includes("manjari") || q.includes("તુલસી") || q.includes("તુલસીનો") || q.includes("तुलसी")) {
    if (lang === "gu") {
      return `🌿 **પવિત્ર તુલસીના છોડની વિશેષ કાળજી:**\n1. **મંજરી ઉતારવી:** તુલસી પર બીજ (મંજરી) આવે ત્યારે તેને ઉપરથી તરત જ કાપી લો, જેથી છોડ સુકાઈ ન જાય અને ઘટાદાર બને.\n2. **સૂર્યપ્રકાશ:** તુલસીને સવારે 4-5 કલાક સારો કુમળો તડકો ખૂબ ગમે છે.\n3. **પાણીનો નિયમ:** માત્ર ઉપરની માટી સુકાય ત્યારે જ પાણી આપો. વધુ પડતા પાણીથી તુલસીના મૂળ સડી જાય છે.\n4. **જીવાતથી રક્ષણ:** પાંદડા પર કાળી કે સફેદ જીવાત દેખાય તો સાંજે હળવો લીમડાના તેલનો સ્પ્રે કરો.`;
    }
    if (lang === "hi") {
      return `🌿 **पवित्र तुलसी के पौधे की विशेष देखभाल:**\n1. **मंजरी हटाना:** तुलसी पर जैसे ही बीज (मंजरी) आए, उसे ऊपर से पिंच करके हटा दें। इससे पौधा कभी सूखेगा नहीं और घना बना रहेगा।\n2. **धूप:** सुबह की 4-5 घंटे की सीधी धूप तुलसी के लिए वरदान है।\n3. **पानी का ध्यान:** बहुत ज्यादा पानी न दें; ऊपरी मिट्टी सूखने पर ही जल अर्पित करें।\n4. **सुरक्षा:** कीड़ों से बचाव के लिए महीने में दो बार शाम को हल्का नीम तेल स्प्रे करें।`;
    }
    return `🌿 **Holy Basil / Tulsi Vitality Care Guide:**\n1. **Pinch Seed Heads (Manjari):** As soon as flowering seed pods appear, snip them off! This redirects vital energy into bushy growth and prevents desiccation.\n2. **Morning Sunlight:** Tulsi thrives under 4–5 hours of direct morning sunshine.\n3. **Moisture Rhythm:** Only water when topsoil feels dry. Saturated roots cause premature stem dieback.\n4. **Pest Shield:** Apply mild neem foliar spray in the evening if tiny black aphids or white spots appear on stems.`;
  }

  // 8. TOMATO / ટામેટા / ટમેટા / टमाटर
  if (q.includes("tomato") || q.includes("tamatar") || q.includes("ટામેટા") || q.includes("ટમેટા") || q.includes("ટમેટાં") || q.includes("ટમેટાનો") || q.includes("टमाटर")) {
    if (lang === "gu") {
      return `🍅 **ટામેટાના છોડની બમ્પર ઉપજ માટેની ટિપ્સ:**\n1. **સૂર્યપ્રકાશ:** ટામેટાને ઓછામાં ઓછો 6-8 કલાક સીધો તડકો મળવો જરૂરી છે.\n2. **પાણી મૂળ પાસે આપો:** ક્યારેય પાંદડા પર પાણી ન રેડવું, માત્ર મૂળના થડ પાસે ઊંડે સુધી પાણી આપો.\n3. **સપોર્ટ અને કાપણી:** છોડને લાકડીનો ટેકો આપો અને નીચેથી વધારાની ડાળખીઓ (સકર્સ) હટાવી દો.\n4. **કેલ્શિયમ અને ખાતર:** દર 15 દિવસે વર્મીકમ્પોસ્ટ આપો જેથી ટામેટા મોટા અને મીઠા આવે!`;
    }
    if (lang === "hi") {
      return `🍅 **टमाटर के पौधे की भरपूर पैदावार के लिए खास टिप्स:**\n1. **धूप:** रोजाना 6-8 घंटे की सीधी धूप टमाटर के लिए अनिवार्य है।\n2. **जड़ों में पानी दें:** पत्तियों पर पानी डालने से फंगस लगती है, केवल जड़ों में गहरा पानी दें।\n3. **सहारा और कटाई:** पौधे को लकड़ी का सहारा दें और निचली गैर-जरूरी शाखाओं को काटें।\n4. **पोषण:** हर 15 दिन में वर्मीकंपोस्ट दें ताकि फल बड़े और स्वस्थ आएं!`;
    }
    return `🍅 **High-Yield Tomato Container Guide:**\n1. **Full Sun Power:** Demands 6–8 hours of unfiltered sunlight daily.\n2. **Root-Level Hydration:** Never wet the foliage. Water deeply at the root base to keep fungal blight at bay.\n3. **Staking & Pruning:** Stake firmly and prune lower suckers to channel energy into fruiting clusters.\n4. **Calcium & Compost:** Feed with vermicompost every 14 days and supply calcium to prevent blossom end rot!`;
  }

  // 9. MONEY PLANT / મની પ્લાન્ટ / मनी प्लांट
  if (q.includes("money") || q.includes("pothos") || q.includes("મની પ્લાન્ટ") || q.includes("મનીપ્લાન્ટ") || q.includes("मनी प्लांट")) {
    if (lang === "gu") {
      return `🌱 **મની પ્લાન્ટને ઘટાદાર અને ચમકદાર બનાવવાની રીત:**\n1. **અજવાળું:** મની પ્લાન્ટને સીધા આકરા તડકામાં ન રાખો, બારી પાસેના અજવાળામાં રાખો.\n2. **પાણી:** કુંડાની ઉપરની 50% માટી સુકાય ત્યારે જ પાણી આપો. પાણીમાં ઉગાડતા હોવ તો દર અઠવાડિયે પાણી બદલો.\n3. **મોસ સ્ટીક (Moss Stick):** છોડને મોસ સ્ટીકનો આધાર આપો જેથી તેના પાંદડા મોટા અને લીલાછમ થાય.\n4. **પાંદડા સાફ રાખો:** ભીના સુતરાઉ કાપડથી પાંદડા લૂછો જેથી પ્રકાશસંશ્લેષણ સારું થાય!`;
    }
    if (lang === "hi") {
      return `🌱 **मनी प्लांट को घना और चमकदार बनाने के उपाय:**\n1. **रोशनी:** तेज सीधी धूप से बचाएं, खिड़की के पास ब्राइट इनडायरेक्ट रोशनी में रखें।\n2. **पानी:** ऊपरी 50% मिट्टी सूखने पर ही पानी दें। अगर बोतल के पानी में है तो हर हफ्ते पानी बदलें।\n3. **मॉस स्टिक का सहारा:** मॉस पोल लगाने से मनी प्लांट की पत्तियां दोगुनी बड़ी और घनी हो जाती हैं।\n4. **पत्तियों की सफाई:** पत्तियों पर धूल न जमने दें, हल्के गीले कपड़े से साफ रखें।`;
    }
    return `🌱 **Money Plant (Golden Pothos) Care Secrets:**\n1. **Light Preference:** Thrives in bright indirect filtered light. Direct scorching sun bleaches the leaves.\n2. **Watering:** Water only when the top 50% of the soil has dried out. In water vessels, refresh water weekly.\n3. **Moss Pole Climbing:** Train aerial roots onto a damp moss pole for jumbo leaves.\n4. **Leaf Polish:** Gently wipe broad leaves with a damp cloth to boost photosynthesis and gloss!`;
  }

  // 10. WILTING / DROOPING / કરમાઈ ગયેલા / मुरझाया पौधा
  if (q.includes("wilt") || q.includes("droop") || q.includes("karmai") || q.includes("sukay") || q.includes("કરમાઈ") || q.includes("સુકાઈ") || q.includes("સુકાય") || q.includes("મુરઝા") || q.includes("मुरझाया") || q.includes("मुरझाना")) {
    if (lang === "gu") {
      return `🌱 **કરમાઈ ગયેલા ${plantTitle} ને પુનર્જીવિત કરવાની ઈમરજન્સી પદ્ધતિ:**\n1. **માટી તપાસો:** જો માટી પથ્થર જેવી સૂકી હોય, તો કુંડાને 20 મિનિટ પાણી ભરેલી ટબમાં નીચેથી પાણી શોષવા મૂકો (Bottom Watering).\n2. **જો માટી વધુ ભીની અને ચીકણી હોય:** તો છોડને તરત જ છાંયડાવાળી હવાદાર જગ્યાએ ખસેડો અને માટી સુકાય ત્યાં સુધી પાણી બિલકુલ ન આપો.\n3. **સૂકા પાંદડા દૂર કરો:** સુકાઈ ગયેલા કે પીળા પડી ગયેલા પાંદડા કાપી નાખો.\n4. **હળવો છાંયડો:** છોડ સ્વસ્થ ન થાય ત્યાં સુધી તેને સીધા આકરા તડકાથી દૂર રાખો!${weatherNote}`;
    }
    if (lang === "hi") {
      return `🌱 **मुरझाए ${plantTitle} को दोबारा हरा-भरा करने के इमरजेंसी टिप्स:**\n1. **मिट्टी की जांच:** अगर मिट्टी बहुत सूखी और सख्त है, तो गमले को 20 मिनट पानी के टब में रखें ताकि जड़ें नीचे से पानी सोख लें।\n2. **अगर मिट्टी दलदली और चिपचिपी है:** तो पौधे को खुली हवादार जगह पर रखें और मिट्टी सूखने तक पानी बिल्कुल न दें।\n3. **सूखे पत्ते हटाएं:** सूखे या सड़े हुए पत्तों को कैंची से हटा दें ताकि पौधे का तनाव कम हो।\n4. **धूप से बचाव:** पौधा संभलने तक उसे तेज धूप की बजाय रोशनीदार छाया में रखें!${weatherNote}`;
    }
    return `🌱 **Emergency Revival for Wilting ${plantTitle}:**\n1. **Diagnose Soil First:** If bone dry, submerge the lower third of the pot in a basin of water for 20 minutes (bottom watering soak).\n2. **If Soil is Waterlogged:** Relocate immediately to a bright, breezy shaded spot and hold all watering until upper soil aerates.\n3. **Prune Crispy Stems:** Snip fully desiccated foliage to halt moisture loss.\n4. **Temporary Filtered Shade:** Shield from direct scorching rays for 3–4 days until turgor pressure returns!${weatherNote}`;
  }

  // 11. FUNGUS / MILDEW / ફૂગ / फफूंद
  if (q.includes("fung") || q.includes("mildew") || q.includes("mold") || q.includes("blight") || q.includes("fug") || q.includes("ફૂગ") || q.includes("फफूंद") || q.includes("फंगस")) {
    if (lang === "gu") {
      return `🍄 **${plantTitle} પર ફૂગ અને માટીની બીમારીનો કુદરતી ઈલાજ:**\n1. **બેકિંગ સોડા સ્પ્રે:** 1 લિટર પાણીમાં 1 ચમચી બેકિંગ સોડા (ખાવાનો સોડા) અને 2-3 ટીપાં લિક્વિડ સાબુ મેળવીને ફૂગવાળા પાંદડા પર સાંજે સ્પ્રે કરો.\n2. **હવાની અવરજવર:** છોડને હવાદાર જગ્યાએ રાખો અને કુંડા એકબીજા સાથે ચોંટાડીને ન રાખો.\n3. **પાણી ઓછું કરો:** માટી ઉપર સફેદ ફૂગ હોય તો ઉપરની 1 ઇંચ માટી ખોતરીને કાઢી નાખો અને નવો વર્મીકમ્પોસ્ટ ઉમેરો.\n4. **લીમડાના તેલનો છંટકાવ:** દર 5 દિવસે નિયમિત છાંટવાથી ફૂગ જડમૂળથી દૂર થશે!`;
    }
    if (lang === "hi") {
      return `🍄 **${plantTitle} पर फंगस और फफूंद का असरदार प्राकृतिक इलाज:**\n1. **बेकिंग सोडा स्प्रे:** 1 लीटर पानी में 1 चम्मच बेकिंग सोडा और 2 बूंद लिक्विड सोप मिलाकर फंगस वाली पत्तियों पर शाम को छिड़कें।\n2. **हवा का संचार:** पौधों को खुली हवा में रखें और बहुत पास-पास न रखें।\n3. **मिट्टी की फंगस:** अगर मिट्टी में सफेद फफूंद दिखे तो ऊपरी 1 इंच परत हटाकर नई सूखी मिट्टी व वर्मीकंपोस्ट डालें।\n4. **नीम तेल:** हर 5 दिन में नीम तेल का छिड़काव करें ताकि फंगस दोबारा न आए।`;
    }
    return `🍄 **Organic Antifungal Protocol for your ${plantTitle}:**\n1. **Baking Soda Spray:** Dissolve 1 tsp baking soda + 2 drops mild dish soap in 1L water; mist evenly over affected foliage.\n2. **Increase Air Circulation:** Space containers at least 1 foot apart so air circulates freely between leaves.\n3. **Soil Surface Remediation:** Scrape away top 1 inch of moldy soil crust and top-dress with dry vermicompost and neem cake.\n4. **Water at the Base:** Keep foliage dry when hydrating the pot.`;
  }

  // 12. GREETINGS / હેલો / કેમ છો / नमस्ते / Hi / Hello
  if (q.includes("hi") || q.includes("hello") || q.includes("kem cho") || q.includes("namaste") || q.includes("કેમ છો") || q.includes("નમસ્તે") || q.includes("नमस्ते")) {
    if (lang === "gu") {
      return `નમસ્તે! 🌱 હું **ગ્રીનબોટ (GreenBot)**, તમારો AI પ્લાન્ટ ડોક્ટર છું. તમારા બગીચાના છોડની કાળજી, પીળા પાંદડા, ખાતર, પાણી કે કીટકોના સચોટ ઉપાય વિશે મને પૂછી શકો છો! આજે હું તમારા છોડ માટે શું મદદ કરી શકું?`;
    }
    if (lang === "hi") {
      return `नमस्ते! 🌱 मैं **ग्रीनबॉट (GreenBot)**, आपका AI प्लांट डॉक्टर हूँ। पौधों की देखभाल, पीली पत्तियां, खाद, पानी या कीड़ों के जैविक उपचार के बारे में आप मुझसे कभी भी पूछ सकते हैं! आज आपके बगीचे के लिए क्या सहायता करूँ?`;
    }
    return `Hello! 🌱 I'm **GreenBot**, your AI Botanical Doctor. Ask me anything about plant care, yellow leaves, organic fertilizers, watering schedules, or pest remedies! How can I assist your garden today?`;
  }

  // 13. GRATITUDE / આભાર / धन्यवाद
  if (q.includes("thank") || q.includes("aabhar") || q.includes("dhanyawad") || q.includes("આભાર") || q.includes("ધન્યવાદ") || q.includes("धन्यवाद")) {
    if (lang === "gu") {
      return `તમારો ખૂબ ખૂબ આભાર! 🌸 તમારા છોડ હંમેશા લીલાછમ અને ખીલતા રહે એવી શુભકામનાઓ! ભવિષ્યમાં કોઈપણ પ્રશ્ન હોય તો હું હંમેશા અહીં તમારી સેવામાં હાજર છું. આનંદથી બાગકામ કરો! 🌿`;
    }
    if (lang === "hi") {
      return `आपका बहुत-बहुत धन्यवाद! 🌸 आपके पौधे हमेशा हरे-भरे और फूलों से लदे रहें! भविष्य में किसी भी सहायता के लिए मैं हमेशा यहाँ उपलब्ध हूँ। हैप्पी गार्डनिंग! 🌿`;
    }
    return `You're very welcome! 🌸 Wishing your garden lush foliage and abundant blooms. Whenever you need botanical guidance, I'm right here for you. Happy gardening! 🌿`;
  }

  // 14. DEFAULT INTELLIGENT MIND-READING BOTANICAL CARE
  if (lang === "gu") {
    return `🌿 **${plantTitle} ની તંદુરસ્તી અને વૃદ્ધિ માટે વિશેષ માર્ગદર્શન:**\n• **પાણીનો નિયમ:** કુંડાની ઉપરની 1-2 ઇંચ માટી સૂકી લાગે ત્યારે જ સવારે મૂળ પાસે પૂરતું પાણી આપો.\n• **સૂર્યપ્રકાશ:** છોડને તેજસ્વી કુદરતી અજવાળું અથવા સવારનો 3-4 કલાક કુમળો તડકો આપો.\n• **ઓર્ગેનિક પોષણ:** દર 15-20 દિવસે 1 મુઠ્ઠી વર્મીકમ્પોસ્ટ અને મહિનામાં એકવાર લીમડાના તેલનો સ્પ્રે કરવાથી છોડ કીટકો મુક્ત અને સદાબહાર રહેશે!${weatherNote}\n💡 જો પાંદડા પીળા પડી રહ્યા હોય કે કોઈ જીવાત હોય, તો મને વિગતવાર જણાવો!`;
  }
  if (lang === "hi") {
    return `🌿 **${plantTitle} के स्वस्थ विकास और देखभाल के खास टिप्स:**\n• **पानी का नियम:** गमले की ऊपरी 1-2 इंच मिट्टी सूखने पर ही सुबह जड़ों में पानी दें।\n• **धूप की जरूरत:** पौधे को अच्छी प्राकृतिक रोशनी या सुबह की 3-4 घंटे हल्की धूप में रखें।\n• **जैविक पोषण:** हर 15-20 दिन में 1 मुट्ठी वर्मीकंपोस्ट और महीने में एक बार नीम तेल का स्प्रे करने से पौधा हमेशा हरा-भरा रहेगा!${weatherNote}\n💡 यदि पत्तियां पीली पड़ रही हों या कोई कीड़ा लगा हो, तो मुझे जरूर बताएं!`;
  }
  return `🌿 **Tailored Botanical Care for your ${plantTitle}:**\n• **Hydration:** Always follow the 2-inch dry test before morning watering directly at the base.\n• **Lighting:** Provide bright filtered sunlight or gentle morning exposure.\n• **Organic Nutrition:** Nourish with organic vermicompost every 15–20 days and apply preventive neem spray once a month to keep pests away!${weatherNote}\n💡 Ask me about yellow leaves, organic fertilizers, pest remedies, or potting mixes anytime!`;
}

// AI Plant Doctor Assistant for specific questions (Weather, Photo & Microclimate Aware)
export const askPlantDoctor = asyncHandler(async (req, res) => {
  let { question, plantName, plantSpecies, originalName, healthStatus, currentDisease, weather } = req.body;
  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: "Please enter a question for the Plant Doctor." });
  }

  let parsedWeather = weather;
  if (typeof weather === "string") {
    try {
      parsedWeather = JSON.parse(weather);
    } catch {
      parsedWeather = null;
    }
  }

  let plantTitle = plantName || originalName || plantSpecies || "Urban Plant";
  let species = originalName || plantSpecies || "Plant";

  const weatherContext = parsedWeather
    ? `Local Climate (Auto-Detected): ${parsedWeather.temperature || 28}°C, ${parsedWeather.humidity || 55}% humidity, ${parsedWeather.condition || "Pleasant"}, ${parsedWeather.precipitation ? `${parsedWeather.precipitation}mm rain` : "no rain"}.`
    : "";

  let isGenericPlant = !plantName || plantName === "Garden Houseplant" || plantName === "Urban Plant";
  let hasPhoto = Boolean(req.file && isValidPlantImage(req.file.buffer));

  let prompt = "";
  if (hasPhoto) {
    prompt = `You are a certified Botanical Doctor, plant pathologist, and master horticulturist named GreenBot AI Doctor.
The user uploaded a plant photo and asked: "${String(question).trim()}".
${weatherContext}

CRITICAL INSTRUCTIONS:
1. First, accurately identify the exact common and botanical species of the plant shown in the photo (e.g. "🌱 Identified: [Plant Name] ([Botanical Name])"). For example, if it is sweet basil, identify it as Sweet Basil (Ocimum basilicum). If tomato, identify as Tomato (Solanum lycopersicum). Do NOT guess Peace Lily unless the photo is truly a Spathiphyllum peace lily.
2. Assess its visual health: state whether it is healthy, dehydrated/drooping, overwatered, suffering from nutrient deficiency, or affected by any visible pests or fungal spots.
3. Provide concise, highly actionable care instructions: exact watering frequency, light needs, and organic remedies (such as cold-pressed neem oil spray, vermicompost, seaweed tonic, or well-draining soil mix).
4. Keep the response direct, helpful, and under 3 to 4 sentences. Do not use markdown backticks.`;
  } else {
    prompt = `You are a certified Botanical Doctor and master horticulturist named GreenBot AI Doctor.
User Question: "${String(question).trim()}".
${!isGenericPlant ? `Plant Context: ${plantTitle} (Species: ${species}).` : "Note: If the user's question names a specific plant (e.g., Basil, Tomato, Aloe, Snake Plant, Money Plant, Rose), tailor all advice to that specific plant."}
${healthStatus && healthStatus !== "healthy" ? `Current Health: ${healthStatus}${currentDisease ? `, Condition: ${currentDisease}` : ""}.` : ""}
${weatherContext}

TASK:
Provide an accurate, reassuring, and practical diagnostic answer directly addressing the user's question in 2 to 4 sentences. Explicitly mention organic remedies (e.g. Organic Neem Oil spray, Vermicompost / compost feeding, Seaweed tonic, balanced watering, or well-drained pot) where applicable. Do not use markdown backticks or bullet points.`;
  }

  let targetLang = req.body.language || "gu";
  let langInstruction = "";
  if (targetLang === "gu") {
    langInstruction = "IMPORTANT: Write your response entirely in natural Gujarati (ગુજરાતી) language so a Gujarati home gardener can understand easily.";
  } else if (targetLang === "hi") {
    langInstruction = "IMPORTANT: Write your response entirely in natural Hindi (हिन्दी) language so an Indian home gardener can understand easily.";
  } else {
    langInstruction = "Write your response in clear, friendly English.";
  }

  prompt += `\n${langInstruction}`;

  // Call Gemini AI
  let answer = null;
  try {
    answer = await callGeminiAI({
      prompt,
      imageBuffer: req.file ? req.file.buffer : null,
      imageMimeType: req.file ? req.file.mimetype : null,
      maxTokens: 400,
    });
  } catch (err) {
    console.warn("Gemini call error in askPlantDoctor:", err.message);
    answer = null;
  }

  // Botanical Mind Engine instant generation (< 5ms) if Gemini times out or is offline
  if (!answer || !answer.trim()) {
    answer = generateBotanicalMindReply({
      question,
      plantTitle,
      species,
      healthStatus,
      weather: parsedWeather,
      targetLang,
    });
  }

  answer = answer.replace(/```/g, "").trim();

  // Find matching nursery products strictly from Care & Protection, Pots, and Tools
  const recommendedProducts = await findRelevantProducts(
    `${question} ${answer} ${plantTitle} ${species} ${currentDisease || ""} compost neem pot fertilizer tonic`
  );

  res.json({
    answer,
    plantName: plantTitle,
    plantSpecies: species,
    weatherUsed: parsedWeather,
    recommendedProducts,
  });
});

// Comprehensive Botanical Name Auto-Correction & Normalization Dictionary
export function autoCorrectPlantName(inputName = "") {
  const raw = String(inputName || "").trim();
  const lower = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  const dictionary = [
    { regex: /\b(chilly|chili|chilli|chillies|chilies|peper|pepers|bell pepper|mirch|mirchi|capsicum|jalapeno|cayenne)\b/i, corrected: "Chili Pepper", species: "Capsicum annuum", type: "crop" },
    { regex: /\b(bonzai|bonsai|bonsaye|miniature tree|ficus bonsai|juniper bonsai|jade bonsai)\b/i, corrected: "Bonsai Tree", species: "Bonsai Specimen (Ficus / Juniper)", type: "bonsai" },
    { regex: /\b(tomatto|tometo|tomatoe|tomatos|tomatoes|tamatar|cherry tomato|roma tomato)\b/i, corrected: "Tomato", species: "Solanum lycopersicum", type: "crop" },
    { regex: /\b(bazzil|basill|basilik|tulsi|sweet basil|thai basil|holy basil)\b/i, corrected: "Sweet Basil", species: "Ocimum basilicum", type: "herb" },
    { regex: /\b(straberry|strawbery|strawberries|strawberry)\b/i, corrected: "Strawberry", species: "Fragaria × ananassa", type: "berry" },
    { regex: /\b(borag|borage|starflower)\b/i, corrected: "Borage", species: "Borago officinalis", type: "herb" },
    { regex: /\b(aloevera|aloe vera|aloe|alo)\b/i, corrected: "Aloe Vera", species: "Aloe barbadensis Miller", type: "succulent" },
    { regex: /\b(peacelily|peace lily|peace-lily|spathiphyllum)\b/i, corrected: "Peace Lily", species: "Spathiphyllum wallisii", type: "houseplant" },
    { regex: /\b(snakeplant|snake plant|sansevieria|mother in law tongue)\b/i, corrected: "Snake Plant", species: "Sansevieria trifasciata", type: "succulent" },
    { regex: /\b(moneyplant|money plant|pothos|devils ivy|devil ivy|golden pothos)\b/i, corrected: "Money Plant (Devil's Ivy)", species: "Epipremnum aureum", type: "vine" },
    { regex: /\b(hibicus|hibiscus|gudhal|china rose|tropical hibiscus)\b/i, corrected: "Hibiscus", species: "Hibiscus rosa-sinensis", type: "flower" },
    { regex: /\b(rubbertree|rubber tree|rubber plant|variegated rubber|ficus elastica)\b/i, corrected: "Variegated Rubber Tree", species: "Ficus elastica 'Variegata'", type: "houseplant" },
    { regex: /\b(lavendar|lavender|lavendula)\b/i, corrected: "Lavender", species: "Lavandula angustifolia", type: "herb" },
    { regex: /\b(marigold|genda|tagetes)\b/i, corrected: "Marigold", species: "Tagetes erecta", type: "flower" },
    { regex: /\b(garlic|lahsun|allium)\b/i, corrected: "Garlic", species: "Allium sativum", type: "allium" },
    { regex: /\b(onion|pyaz|shallot)\b/i, corrected: "Onion", species: "Allium cepa", type: "allium" },
    { regex: /\b(cucmber|cucuber|cucumber|khira)\b/i, corrected: "Cucumber", species: "Cucumis sativus", type: "vine_crop" },
    { regex: /\b(spinich|palak|spinach)\b/i, corrected: "Spinach", species: "Spinacia oleracea", type: "leafy" },
    { regex: /\b(coriander|dhaniya|cilantro)\b/i, corrected: "Coriander (Cilantro)", species: "Coriandrum sativum", type: "herb" },
    { regex: /\b(pudina|spearmint|peppermint|mint)\b/i, corrected: "Spearmint", species: "Mentha spicata", type: "herb" },
    { regex: /\b(monstara|monstera|cheese plant)\b/i, corrected: "Monstera Deliciosa", species: "Monstera deliciosa", type: "houseplant" },
    { regex: /\b(zzplant|zz plant|zamioculcas)\b/i, corrected: "ZZ Plant", species: "Zamioculcas zamiifolia", type: "houseplant" },
    { regex: /\b(rose|gulab|rosa)\b/i, corrected: "Rose", species: "Rosa chinensis", type: "flower" },
    { regex: /\b(ficus|weeping fig|benjamina)\b/i, corrected: "Ficus Tree", species: "Ficus benjamina", type: "houseplant" },
    { regex: /\b(rosemary|rosemari)\b/i, corrected: "Rosemary", species: "Salvia rosmarinus", type: "herb" },
    { regex: /\b(thyme|thymi)\b/i, corrected: "Thyme", species: "Thymus vulgaris", type: "herb" },
    { regex: /\b(oregano|origano)\b/i, corrected: "Oregano", species: "Origanum vulgare", type: "herb" },
  ];

  for (const entry of dictionary) {
    if (entry.regex.test(lower)) {
      const wasAutoCorrected = raw.toLowerCase() !== entry.corrected.toLowerCase();
      return {
        original: raw,
        corrected: entry.corrected,
        species: entry.species,
        type: entry.type,
        wasAutoCorrected,
      };
    }
  }

  const capitalized = raw
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    original: raw,
    corrected: capitalized || "Urban Plant",
    species: `${capitalized} Botanical Specimen`,
    type: "general",
    wasAutoCorrected: false,
  };
}

// Comprehensive AI & Botanical Database for Pairing Any Two Plants
export const generateCompanionSynergy = asyncHandler(async (req, res) => {
  const rawPlantA = String(req.body.plantA || req.body.plant1 || "").trim();
  const rawPlantB = String(req.body.plantB || req.body.plant2 || "").trim();

  if (!rawPlantA || !rawPlantB) {
    return res.status(400).json({ message: "Please provide both plant names (Plant 1 and Plant 2)." });
  }

  // Pre-normalize and auto-correct misspelled input names
  const normA = autoCorrectPlantName(rawPlantA);
  const normB = autoCorrectPlantName(rawPlantB);

  const plantA = normA.corrected;
  const plantB = normB.corrected;

  let aiPairing = null;

const prompt = `You are a certified botanical agronomist and urban container gardening scientist.
The user wants to analyze companion planting synergy between two plants:
Plant 1: "${plantA}" (Inputted as: "${rawPlantA}")
Plant 2: "${plantB}" (Inputted as: "${rawPlantB}")

CRITICAL BOTANICAL RULES:
1. Auto-correct spelling typos into proper botanical and standard common names.
2. Scientific Compatibility Evaluation:
   - If one is a Bonsai / miniature tree and the other is a heavy feeding vegetable crop (e.g. Chili, Tomato): Explain that they must NOT be co-planted in the same pot due to aggressive root competition and bonsai soil constraints, but can sit side-by-side in separate pots.
   - If pairing heavy feeders with aromatic herbs (e.g., Tomato + Basil, Chili + Basil, Rose + Garlic): Highlight pest deterrence and natural terpenes.
   - If pairing plants with opposing moisture needs (e.g., Cactus/Succulent + Fern/Lily): Mark as Antagonistic due to watering conflicts.

Respond ONLY with a valid, raw JSON object (no markdown backticks, no \`\`\`json):
{
  "name": "${plantA}",
  "species": "${normA.species}",
  "companionName": "${plantB}",
  "companionSpecies": "${normB.species}",
  "synergyScore": 95,
  "synergyBadge": "🌟 Specific Descriptive Badge (e.g. ⚠️ Separate Pots Only or 🌿 Pest Deterrence)",
  "whyItWorks": "2-sentence scientific biological explanation of how they interact.",
  "potRecommendation": "Specific container and spacing advice",
  "waterNeedPerWeekLiters": 2.5,
  "repottingIntervalMonths": 8,
  "wateringAdvice": "Watering advice",
  "smartGardenTip": "Urban container tip"
}`;

  const rawAiOutput = await callGeminiAI({
    prompt,
    maxTokens: 1000,
    responseJson: true,
  });

  if (rawAiOutput) {
    try {
      const cleanJson = rawAiOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      aiPairing = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn("Gemini companion synergy parse error:", parseErr.message);
    }
  }

  if (!aiPairing) {
    aiPairing = {
      name: plantA,
      species: normA.species,
      companionName: plantB,
      companionSpecies: normB.species,
      synergyScore: 88,
      synergyBadge: "🌿 Beneficial Garden Companion",
      whyItWorks: `${plantA} and ${plantB} complement each other with balanced microclimate dynamics.`,
      potRecommendation: "Maintain separate containers or a large 14-inch planter box with 20cm spacing.",
      waterNeedPerWeekLiters: 2.2,
      repottingIntervalMonths: 10,
      wateringAdvice: "Water at root base in the early morning.",
      smartGardenTip: "Provide bright indirect or morning sunlight.",
    };
  }

  res.json(aiPairing);
});

// AI Profile Generator for a SINGLE Plant (Used by Companion Planting Matcher)
export const generateSinglePlantProfile = asyncHandler(async (req, res) => {
  const rawPlantName = String(req.body.plantName || req.body.name || req.body.plant || "").trim();
  if (!rawPlantName) {
    return res.status(400).json({ message: "Please provide a plant name." });
  }

  const norm = autoCorrectPlantName(rawPlantName);
  const plantName = norm.corrected;

  let aiProfile = null;

  const prompt = `You are an expert botanical agronomist and companion planting scientist.
The user wants to add a plant to their Companion Planting Matcher:
Plant: "${plantName}" (Original input: "${rawPlantName}").

Generate a complete urban companion planting profile for this SINGLE plant in strict JSON format.
Respond ONLY with a valid, raw JSON object (no markdown backticks, no \`\`\`json):
{
  "name": "${plantName}",
  "species": "${norm.species}",
  "goodNeighbors": ["Best companion 1", "Best companion 2", "Best companion 3", "Best companion 4"],
  "badNeighbors": ["Incompatible plant 1 to avoid", "Incompatible plant 2", "Incompatible plant 3"],
  "synergyScore": 95,
  "synergyBadge": "🌟 Specific Ecological Badge (e.g. 🌿 Aromatic Pest Shield or 🪴 Canopy Shade Harmony)",
  "whyItWorks": "2-sentence scientific explanation of how this plant benefits its companion neighbors (pest repulsion, root aeration, pollinator attraction).",
  "potRecommendation": "Container size, drainage, and soil type recommendations",
  "waterNeedPerWeekLiters": 2.5,
  "repottingIntervalMonths": 8,
  "wateringAdvice": "How to water this plant properly",
  "smartGardenTip": "Practical urban container placement tip"
}`;

  const rawAiOutput = await callGeminiAI({
    prompt,
    maxTokens: 1000,
    responseJson: true,
  });

  if (rawAiOutput) {
    try {
      const cleanJson = rawAiOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      aiProfile = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn("Gemini single plant profile parse error:", parseErr.message);
    }
  }

  if (!aiProfile) {
    const isBonsai = plantName.toLowerCase().includes("bonsai");
    const isChili = plantName.toLowerCase().includes("chili") || plantName.toLowerCase().includes("pepper");
    const isSucculent = norm.type === "succulent";

    aiProfile = {
      name: plantName,
      species: norm.species,
      goodNeighbors: isBonsai
        ? ["Cushion Moss", "Miniature Sedum", "Thyme (adjacent pot)", "Sweet Alyssum"]
        : isChili
        ? ["Sweet Basil", "Marigold", "Garlic", "Rose", "Oregano"]
        : isSucculent
        ? ["ZZ Plant", "Sansevieria", "Jade Plant", "Sedum"]
        : ["Sweet Basil", "Marigold", "Spearmint", "Spinach"],
      badNeighbors: isBonsai
        ? ["Chili Pepper (same pot)", "Tomato (same pot)", "Aggressive Climbing Vines", "Deep Taproots"]
        : isChili
        ? ["Bonsai (same pot)", "Fennel", "Kohlrabi", "Pole Beans"]
        : isSucculent
        ? ["High-moisture Ferns", "Peace Lily", "Calathea"]
        : ["Fennel", "Aggressive Weeds"],
      synergyScore: isBonsai ? 92 : 95,
      synergyBadge: isBonsai ? "🪴 Miniature Architectural Harmony" : "🌟 Beneficial Urban Garden Synergy",
      whyItWorks: isBonsai
        ? "Bonsai trees flourish with shallow aeration and bright filtered light. Compact companion mosses regulate surface humidity without competing for root depth."
        : `${plantName} fosters a balanced container microclimate, naturally repelling garden pests and optimizing soil aeration.`,
      potRecommendation: isBonsai ? "Shallow glazed bonsai ceramic tray with Akadama mix" : "10-12 inch container with drainage and rich compost",
      waterNeedPerWeekLiters: isBonsai ? 1.2 : isSucculent ? 0.6 : 3.0,
      repottingIntervalMonths: isBonsai ? 24 : 8,
      wateringAdvice: "Water deeply at root base in the early morning.",
      smartGardenTip: `Keep ${plantName} in well-draining soil with bright filtered sunlight.`,
    };
  }

  aiProfile.id = `custom_${Date.now()}`;
  aiProfile.isCustom = true;
  aiProfile.autoCorrectInfo = norm.wasAutoCorrected ? {
    originalA: rawPlantName,
    correctedA: plantName,
    wasCorrectedA: true,
  } : null;

  res.json(aiProfile);
});

// Dynamic AI 2-Plant Synergy Evaluation Controller
export const testTwoPlantSynergy = asyncHandler(async (req, res) => {
  const rawA = String(req.body.plantA || req.body.plant1 || "").trim();
  const rawB = String(req.body.plantB || req.body.plant2 || "").trim();

  if (!rawA || !rawB) {
    return res.status(400).json({ message: "Please provide both plant names." });
  }

  const normA = autoCorrectPlantName(rawA);
  const normB = autoCorrectPlantName(rawB);
  const plantA = normA.corrected;
  const plantB = normB.corrected;

  const n1 = plantA.toLowerCase();
  const n2 = plantB.toLowerCase();

  // If same plant
  if (n1 === n2) {
    return res.json({
      type: "neutral",
      score: 80,
      title: "Same Species Cohort",
      reason: `Growing multiple ${plantA} specimens together is harmonious. Maintain 30–45cm pot spacing for optimal airflow.`,
      plantA,
      plantB,
      autoCorrected: (normA.wasAutoCorrected || normB.wasAutoCorrected) ? { plantA: normA.wasAutoCorrected, plantB: normB.wasAutoCorrected } : null,
    });
  }

  let aiEvaluation = null;

  const prompt = `You are a certified master horticulturist and botanical scientist.
Evaluate the real container gardening compatibility and companion planting interaction between:
Plant 1: "${plantA}"
Plant 2: "${plantB}"

EVALUATION CRITERIA:
1. Container & Root Dynamics: Do they have conflicting root systems (e.g. shallow bonsai roots vs aggressive crop taproots, or climbing vines that strangle/shade delicate trees)?
2. Watering & Sunlight: Do they have conflicting moisture or sunlight requirements (e.g. desert succulent vs tropical high-moisture fern)?
3. Pest Protection / Terpenes: Do aromatic herbs (basil, garlic, mint, marigold) repel pests for nightshades or flowers?
4. Generate a REAL, scientifically accurate score (between 20% and 98%) reflecting true compatibility. Do NOT default to generic 82%.

Respond ONLY with a raw JSON object (no markdown backticks, no \`\`\`json):
{
  "type": "synergistic" | "antagonistic" | "compatible",
  "score": 42,
  "title": "Clear Headline (e.g. '⚠️ Climbing Canopy Conflict' or '🌟 Beneficial Pest Shield')",
  "reason": "Accurate 2-sentence biological explanation of why they interact this way."
}`;

  const rawAiOutput = await callGeminiAI({
    prompt,
    maxTokens: 500,
    responseJson: true,
  });

  if (rawAiOutput) {
    try {
      const cleanJson = rawAiOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      aiEvaluation = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn("Gemini 2-plant test parse error:", parseErr.message);
    }
  }

  // Botanical Knowledge Base Fallback
  if (!aiEvaluation) {
    const isMoneyAndBonsai = (n1.includes("money") || n1.includes("pothos")) && (n2.includes("bonsai") || n2.includes("tree")) ||
                             (n2.includes("money") || n2.includes("pothos")) && (n1.includes("bonsai") || n1.includes("tree"));

    const isChiliAndBonsai = (n1.includes("chili") || n1.includes("pepper")) && (n2.includes("bonsai") || n2.includes("tree")) ||
                             (n2.includes("chili") || n2.includes("pepper")) && (n1.includes("bonsai") || n1.includes("tree"));

    const isSucculentAndMoisture = ((n1.includes("succulent") || n1.includes("snake") || n1.includes("aloe") || n1.includes("cactus")) &&
                                    (n2.includes("fern") || n2.includes("peace lily") || n2.includes("mint"))) ||
                                   ((n2.includes("succulent") || n2.includes("snake") || n2.includes("aloe") || n2.includes("cactus")) &&
                                    (n1.includes("fern") || n1.includes("peace lily") || n1.includes("mint")));

    const isTomatoAndBasil = (n1.includes("tomato") && n2.includes("basil")) || (n1.includes("basil") && n2.includes("tomato"));
    const isRoseAndGarlic = (n1.includes("rose") && n2.includes("garlic")) || (n1.includes("garlic") && n2.includes("rose"));

    if (isMoneyAndBonsai) {
      aiEvaluation = {
        type: "antagonistic",
        score: 36,
        title: "⚠️ Canopy Shading & Climbing Vine Conflict",
        reason: `Money Plant is a fast-growing, vigorous climbing vine that will quickly wrap around branches and shade out the delicate foliage of a Bonsai tree. Grow them in separate areas of your home.`,
      };
    } else if (isChiliAndBonsai) {
      aiEvaluation = {
        type: "antagonistic",
        score: 42,
        title: "⚠️ Separate Pots Only (Root & Feeding Incompatibility)",
        reason: `Chili is a heavy-feeding crop with deep, aggressive roots that choke delicate Bonsai roots in the same pot. Place them in separate adjacent pots on a sunny balcony.`,
      };
    } else if (isSucculentAndMoisture) {
      aiEvaluation = {
        type: "antagonistic",
        score: 28,
        title: "⚠️ Conflicting Watering Cycles",
        reason: `${plantA} and ${plantB} have completely opposing moisture requirements. Co-planting will cause root rot in the drought-tolerant plant or dehydration in the moisture lover.`,
      };
    } else if (isTomatoAndBasil) {
      aiEvaluation = {
        type: "synergistic",
        score: 98,
        title: "🌟 Highly Synergistic Companions!",
        reason: `Sweet Basil emits natural aromatic terpenes that deter tomato hornworms and whiteflies while enhancing tomato growth vigor.`,
      };
    } else if (isRoseAndGarlic) {
      aiEvaluation = {
        type: "synergistic",
        score: 97,
        title: "🌹 Aphid & Fungal Barrier",
        reason: `Garlic root exudates and allicin sulfur vapors repel aphids and suppress black spot spores on rose foliage.`,
      };
    } else {
      aiEvaluation = {
        type: "compatible",
        score: 76,
        title: "🤝 Harmonious Co-Existence",
        reason: `${plantA} and ${plantB} share compatible sunlight and container soil requirements. Safe to cultivate side by side in container setups.`,
      };
    }
  }

  aiEvaluation.plantA = plantA;
  aiEvaluation.plantB = plantB;
  aiEvaluation.autoCorrected = (normA.wasAutoCorrected || normB.wasAutoCorrected) ? {
    originalA: rawA,
    correctedA: plantA,
    originalB: rawB,
    correctedB: plantB,
  } : null;

  res.json(aiEvaluation);
});

// GET /api/garden/dataset - Returns Botanical Pathology Dataset
export const getBotanicalDataset = asyncHandler(async (req, res) => {
  const crop = req.query.crop ? String(req.query.crop).toLowerCase().trim() : "";
  const q = req.query.q ? String(req.query.q).toLowerCase().trim() : "";
  let results = BOTANICAL_DISEASE_DATASET;
  if (crop) {
    results = results.filter((d) => d.crop.toLowerCase().includes(crop));
  }
  if (q) {
    results = results.filter(
      (d) =>
        d.crop.toLowerCase().includes(q) ||
        d.condition.toLowerCase().includes(q) ||
        d.scientificName.toLowerCase().includes(q) ||
        d.symptoms.some((s) => s.toLowerCase().includes(q))
    );
  }
  res.json({ total: results.length, dataset: results });
});

// GET /api/garden/dataset/:id - Returns specific pathology entry
export const getBotanicalDatasetItem = asyncHandler(async (req, res) => {
  const item = BOTANICAL_DISEASE_DATASET.find((d) => d.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Disease class not found in dataset." });
  res.json(item);
});
