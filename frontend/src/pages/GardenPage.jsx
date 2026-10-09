import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Droplets,
  AlertTriangle,
  HeartPulse,
  Sun,
  Plus,
  CheckCircle2,
  X,
  UploadCloud,
  History,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Leaf,
  Bell,
  Camera,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Check,
  MapPin,
  RefreshCw,
  CloudRain,
  Wind,
  Search,
  Navigation,
  Thermometer,
} from "lucide-react";
import { useToast, useApp } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";
import { validatePlantImageFile, compressAndOptimizeImage } from "../lib/image-optimizer.js";

const SPECIES_OPTIONS = [
  { id: "Tomato", label: "ટમેટા (Tomato)", defaultInterval: 2 },
  { id: "Sweet Basil", label: "તુલસી / બેસિલ (Sweet Basil)", defaultInterval: 2 },
  { id: "Mint", label: "ફુદીનો (Mint)", defaultInterval: 1 },
  { id: "Rose", label: "ગુલાબ (Rose)", defaultInterval: 3 },
  { id: "Chili / Pepper", label: "મરચાં (Chili / Pepper)", defaultInterval: 3 },
  { id: "Aloe Vera", label: "એલોવેરા / કુંવારપાઠું (Aloe Vera)", defaultInterval: 12 },
  { id: "Snake Plant", label: "સ્નેક પ્લાન્ટ (Snake Plant)", defaultInterval: 14 },
  { id: "Money Plant", label: "મની પ્લાન્ટ (Money Plant)", defaultInterval: 6 },
  { id: "Peace Lily", label: "પીસ લીલી (Peace Lily)", defaultInterval: 3 },
  { id: "Hibiscus", label: "જાસૂદ (Hibiscus)", defaultInterval: 2 },
  { id: "Houseplant", label: "ઘરગથ્થુ છોડ (Houseplant)", defaultInterval: 3 },
];

export default function GardenPage() {
  const { user, syncCart, settings } = useApp();
  const { t } = useLanguage();
  const notify = useToast();

  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({ total: 0, needsWater: 0, diseased: 0, healthy: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Auto-Detected Weather & Microclimate State
  const [weather, setWeather] = useState(null);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Category-Wise Nursery Products State
  const [categories, setCategories] = useState([]);
  const [nurseryProducts, setNurseryProducts] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");

  // Modals: 'add', 'stepWiseCare', 'doctor', 'diagnose', 'history'
  const [modalType, setModalType] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantHistory, setPlantHistory] = useState([]);

  // Step-by-Step Care Suggestion Pop-up State
  const [stepCarePlant, setStepCarePlant] = useState(null);
  const [stepCareReport, setStepCareReport] = useState(null);

  // Ask AI Plant Doctor State
  const [doctorPlant, setDoctorPlant] = useState(null);
  const [doctorQuestion, setDoctorQuestion] = useState("");
  const [doctorMessages, setDoctorMessages] = useState([]);
  const [doctorBusy, setDoctorBusy] = useState(false);

  // Add Plant Form State (Manual)
  const [addMode, setAddMode] = useState("ai");
  const [plantForm, setPlantForm] = useState({
    name: "",
    species: "Tomato",
    location: "balcony",
    potSize: "Medium (8-10 inch)",
    soilType: "Organic Potting Mix + Compost",
    wateringIntervalDays: 2,
    notes: "",
  });

  // AI Auto-Add State (Photo + Nickname)
  const [aiPhoto, setAiPhoto] = useState(null);
  const [aiPreview, setAiPreview] = useState("");
  const [aiNickname, setAiNickname] = useState("");
  const [aiLocation, setAiLocation] = useState("balcony");
  const [aiAddBusy, setAiAddBusy] = useState(false);
  const [aiPhotoError, setAiPhotoError] = useState("");
  const [aiNicknameError, setAiNicknameError] = useState("");
  const [isDraggingAi, setIsDraggingAi] = useState(false);

  // Diagnosis Modal State
  const [diagFile, setDiagFile] = useState(null);
  const [diagPreview, setDiagPreview] = useState("");
  const [diagPlantId, setDiagPlantId] = useState("");
  const [diagSpecies, setDiagSpecies] = useState("");
  const [diagBusy, setDiagBusy] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [diagFileError, setDiagFileError] = useState("");
  const [isDraggingDiag, setIsDraggingDiag] = useState(false);

  // Live Camera Capture State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null); // 'ai' or 'diag'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!aiPhoto) {
      setAiPreview("");
      return;
    }
    const url = URL.createObjectURL(aiPhoto);
    setAiPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [aiPhoto]);

  useEffect(() => {
    if (!diagFile) {
      setDiagPreview("");
      return;
    }
    const url = URL.createObjectURL(diagFile);
    setDiagPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [diagFile]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Automatic Location & Weather Detection via Browser Geolocation
  async function detectLocationAndWeather(showNotify = false) {
    setLocationDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const data = await api(`/garden/weather?lat=${lat}&lon=${lon}`);
            setWeather(data);
            setLocationDetected(true);
            if (showNotify) notify(`Live GPS Location detected: ${data.city || "Current Location"}`, "success");
          } catch (err) {
            console.warn("Weather fetch error with GPS:", err);
            if (showNotify) notify("Could not fetch live weather from GPS.", "error");
          } finally {
            setLocationDetecting(false);
          }
        },
        async (err) => {
          console.warn("Browser geolocation permission not granted, using default coordinates:", err.message);
          try {
            const data = await api("/garden/weather");
            setWeather(data);
            setLocationDetected(false);
            if (showNotify) notify("GPS access denied or unavailable. Using default city climate.", "info");
          } catch (e) {
            console.warn(e);
          } finally {
            setLocationDetecting(false);
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      try {
        const data = await api("/garden/weather");
        setWeather(data);
        if (showNotify) notify("Geolocation is not supported by your browser.", "info");
      } catch (e) {
        console.warn(e);
      } finally {
        setLocationDetecting(false);
      }
    }
  }

  // Location search input handler
  async function handleLocationSearch(query) {
    setLocationSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const results = await api(`/garden/weather/locations?q=${encodeURIComponent(query)}`);
      setLocationSuggestions(results || []);
    } catch (err) {
      console.warn("Location search error:", err);
    } finally {
      setIsSearchingLocation(false);
    }
  }

  // Select location from search suggestions
  async function selectLocation(loc) {
    setLocationDetecting(true);
    setShowLocationSearch(false);
    setLocationSearchQuery("");
    setLocationSuggestions([]);
    try {
      const data = await api(`/garden/weather?lat=${loc.latitude}&lon=${loc.longitude}&location=${encodeURIComponent(loc.label)}`);
      setWeather(data);
      setLocationDetected(true);
      notify(`Updated live weather for ${loc.label}!`, "success");
    } catch (err) {
      notify("Failed to fetch weather for selected location: " + err.message, "error");
    } finally {
      setLocationDetecting(false);
    }
  }

  // Fetch Nursery Products & Categories for Category-Wise Display
  async function loadNurseryCatalog() {
    try {
      const [cats, prods] = await Promise.all([
        api("/categories").catch(() => []),
        api("/products").catch(() => []),
      ]);
      setCategories(cats || []);
      setNurseryProducts(prods || []);
    } catch (err) {
      console.warn("Catalog fetch error:", err);
    }
  }

  useEffect(() => {
    loadData();
    detectLocationAndWeather();
    loadNurseryCatalog();
  }, [user]);

  async function startCamera(target) {
    setCameraTarget(target);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      notify("Could not access camera. Please allow camera permissions or upload an image file.", "error");
      stopCamera();
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraTarget(null);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-plant-${Date.now()}.jpg`, { type: "image/jpeg" });
        if (cameraTarget === "ai") {
          setAiPhoto(file);
          setAiPhotoError("");
        } else if (cameraTarget === "diag") {
          setDiagFile(file);
          setDiagFileError("");
        }
        stopCamera();
        notify("Photo captured from camera!", "success");
      },
      "image/jpeg",
      0.92
    );
  }

  // Load garden plants
  async function loadData() {
    setLoading(true);
    try {
      if (user) {
        const res = await api("/garden/plants");
        const list = res.plants || [];
        setPlants(list);
        setStats(res.stats || calculateStatsFromList(list));
      } else {
        const stored = localStorage.getItem("guest_plants");
        const savedPlants = stored ? JSON.parse(stored) : [];
        const initial = savedPlants.filter((plant) => !plant._id?.startsWith("demo-"));
        if (initial.length !== savedPlants.length) {
          localStorage.setItem("guest_plants", JSON.stringify(initial));
        }
        calculateGuestStats(initial);
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function calculateStatsFromList(items) {
    return {
      total: items.length,
      needsWater: items.filter((p) => p.wateringEvaluation?.isDue).length,
      diseased: items.filter((p) => p.healthStatus === "diseased" || p.healthStatus === "needs_attention").length,
      healthy: items.filter((p) => p.healthStatus === "healthy" || p.healthStatus === "recovering").length,
    };
  }

  function calculateGuestStats(items) {
    const evaluated = items.map((p) => {
      const interval = Math.max(1, p.wateringIntervalDays || 2);
      const hoursSince = (Date.now() - new Date(p.lastWateredAt || Date.now()).getTime()) / (3600 * 1000);
      const isDue = hoursSince >= interval * 24;
      return {
        ...p,
        wateringEvaluation: {
          baseInterval: interval,
          isDue,
          statusText: isDue ? "Watering due today" : `Next water in ${Math.round(interval * 24 - hoursSince)} hours`,
        },
      };
    });
    setPlants(evaluated);
    setStats({
      total: evaluated.length,
      needsWater: evaluated.filter((p) => p.wateringEvaluation?.isDue).length,
      diseased: evaluated.filter((p) => p.healthStatus === "diseased" || p.healthStatus === "needs_attention").length,
      healthy: evaluated.filter((p) => p.healthStatus === "healthy" || p.healthStatus === "recovering").length,
    });
  }

  // 1-Click Add Product to Cart with Toast and Cart Sync
  async function handleAddProductToCart(product) {
    if (!user) return notify("Please sign in to add products to your cart.", "error");
    try {
      await api("/cart/items", {
        method: "POST",
        body: { productId: product._id, quantity: 1 },
      });
      await syncCart();
      notify(`Added "${product.name}" to your cart!`, "success");
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // AI Auto-Add Plant: Upload Photo + Nickname -> Open Step-by-Step Suggestions Popup
  async function handleAiAddPlant(e) {
    if (e) e.preventDefault();
    setAiPhotoError("");
    setAiNicknameError("");

    // 1. Strict Plant Photo Validation
    const photoValidation = validatePlantImageFile(aiPhoto);
    if (!photoValidation.valid) {
      const errMsg = photoValidation.error || "Plant photo is required. Please upload or take a photo of your plant.";
      setAiPhotoError(errMsg);
      alert(`⚠️ Validation Error:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    // 2. Nickname Validation
    if (!aiNickname.trim()) {
      const nameErr = "Please enter a nickname for your plant (e.g. Balcony Tomato, Sweet Basil).";
      setAiNicknameError(nameErr);
      alert(`⚠️ Required Field:\n\n${nameErr}`);
      notify("⚠️ Please give your plant a nickname.", "error");
      return;
    }

    setAiAddBusy(true);

    try {
      // 3. Client-side ultra-fast image compression (10x faster uploads & AI turnaround)
      const optimizedPhoto = await compressAndOptimizeImage(aiPhoto, 1200, 0.85);

      const form = new FormData();
      form.append("plant_image", optimizedPhoto);
      form.append("nickname", aiNickname.trim());
      form.append("location", aiLocation);

      const res = await api("/garden/identify-and-add", {
        method: "POST",
        body: form,
      });

      if (user) {
        await loadData();
      } else {
        const updated = [res.plant, ...plants];
        setPlants(updated);
        localStorage.setItem("guest_plants", JSON.stringify(updated));
        calculateGuestStats(updated);
      }

      // Reset form states
      setAiPhoto(null);
      setAiNickname("");
      setAiPhotoError("");
      setAiNicknameError("");

      // Open the Step-by-Step Suggestion Pop-up immediately!
      setStepCarePlant(res.plant);
      setStepCareReport(res.aiReport);
      setModalType("stepWiseCare");

      notify(`Identified as ${res.plant.originalName || res.plant.species}! Step-by-step care guide ready.`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setAiAddBusy(false);
    }
  }

  // Open Step-by-Step Care Guide Modal for any plant card
  function openStepCareModal(plant) {
    setStepCarePlant(plant);
    const interval = plant.wateringIntervalDays || 2;
    const species = plant.originalName || plant.species || "Urban Plant";
    const waterQty = plant.waterQuantityMl || "300ml - 400ml at root base";
    const waterSched = plant.waterScheduleAdvice || `Every ${interval} days early in the morning`;

    setStepCareReport({
      originalName: species,
      confidence: 96,
      waterQuantity: waterQty,
      wateringSchedule: waterSched,
      sunlightAdvice: plant.sunlightAdvice || "4–6 hours of bright morning sunlight or filtered light.",
      nutrientAdvice: plant.nutrientAdvice || "Apply 1-2 tbsp organic compost or seaweed plant food every 14 days.",
      protectionAdvice: plant.protectionAdvice || "Inspect leaves weekly. Spray organic neem oil solution if pests appear.",
      fertilizingIntervalDays: plant.fertilizingIntervalDays || 14,
      stepWiseCare: [
        {
          stepNumber: 1,
          title: "Watering Routine (How Much & When)",
          headline: waterQty,
          schedule: waterSched,
          detail: `Give ${waterQty}. ${waterSched}. Pour directly at the base of the plant without excessively wetting leaves.`,
        },
        {
          stepNumber: 2,
          title: "Sunlight & Placement",
          headline: "Optimal Lighting",
          schedule: plant.location === "balcony" ? "Balcony Container" : plant.location === "indoor" ? "Indoor Windowsill" : "Terrace Garden",
          detail: plant.sunlightAdvice || "Provide 4–6 hours of bright morning sunlight or bright indirect light.",
        },
        {
          stepNumber: 3,
          title: "Soil Nutrition & Food (\"Protein\")",
          headline: "Fertilizer Schedule",
          schedule: `Every ${plant.fertilizingIntervalDays || 14} days`,
          detail: plant.nutrientAdvice || "Feed with balanced organic compost, vermicompost, or seaweed plant food every 14 days.",
        },
        {
          stepNumber: 4,
          title: "Health Protection & Disease Prevention",
          headline: "Preventive Care",
          schedule: "Weekly Inspection",
          detail: plant.protectionAdvice || "Inspect undersides of leaves weekly. Apply organic neem oil spray (5ml/L) if pests or leaf spots appear.",
        },
        {
          stepNumber: 5,
          title: "Automated In-App Reminders",
          headline: "Active Reminders",
          schedule: "Scheduled in Garden",
          detail: `In-app watering notifications are active for ${plant.name} (${species}) so you will never forget a watering cycle!`,
        },
      ],
    });
    setModalType("stepWiseCare");
  }

  // Open Ask AI Plant Doctor Modal (Can be opened for a specific plant or general clinic)
  function openDoctorModal(plant = null) {
    setSelectedPlant(plant);
    setDoctorPlant(plant);
    setDoctorQuestion("");

    const greeting = plant
      ? `Hello! I'm your AI Plant Doctor. Ask me anything about your ${plant.name} (Original: ${plant.originalName || plant.species}) — watering, yellow leaves, pests, or fertilizing!`
      : `Hello! I'm your AI Plant Doctor. Ask me any question about your urban garden plants, pest treatments, soil mix, or care schedules!`;

    setDoctorMessages([
      {
        role: "assistant",
        text: greeting,
      },
    ]);
    setModalType("doctor");
  }

  // Submit Question to Plant Doctor (Includes Auto-Detected Weather Context)
  async function handleDoctorSubmit(e) {
    if (e) e.preventDefault();
    if (!doctorQuestion.trim() || doctorBusy) return;

    const q = doctorQuestion.trim();
    setDoctorQuestion("");
    setDoctorMessages((prev) => [...prev, { role: "user", text: q }]);
    setDoctorBusy(true);

    try {
      const res = await api("/garden/ask-doctor", {
        method: "POST",
        body: {
          question: q,
          plantName: doctorPlant?.name || "Urban Garden Plant",
          plantSpecies: doctorPlant?.species || "Houseplant",
          originalName: doctorPlant?.originalName || doctorPlant?.species,
          healthStatus: doctorPlant?.healthStatus || "healthy",
          currentDisease: doctorPlant?.currentDisease || "",
          weather: weather || { temperature: 28, humidity: 55, condition: "Pleasant" },
        },
      });

      setDoctorMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.answer || "Maintain bright light and steady moisture, and watch for healthy new growth!" },
      ]);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDoctorBusy(false);
    }
  }

  // Log watering action
  async function handleWaterPlant(plant) {
    try {
      if (user && !plant._id?.startsWith("guest-")) {
        await api(`/garden/plants/${plant._id}/water`, { method: "POST" });
        notify(`Watered ${plant.name}! Schedule refreshed.`, "success");
        await loadData();
      } else {
        const updated = plants.map((p) =>
          p._id === plant._id
            ? {
                ...p,
                lastWateredAt: new Date().toISOString(),
                telemetry: { ...p.telemetry, soilMoisturePercent: 75 },
                wateringEvaluation: { ...p.wateringEvaluation, isDue: false, statusText: "Watered today" },
              }
            : p
        );
        setPlants(updated);
        calculateGuestStats(updated);
        localStorage.setItem("guest_plants", JSON.stringify(updated));
        notify(`Watered ${plant.name}! Schedule refreshed.`, "success");
      }
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Delete plant
  async function handleDeletePlant(plantId) {
    if (!window.confirm("Remove this plant from your garden?")) return;
    try {
      if (user && !plantId.startsWith("guest-")) {
        await api(`/garden/plants/${plantId}`, { method: "DELETE" });
      } else {
        const remaining = plants.filter((p) => p._id !== plantId);
        setPlants(remaining);
        localStorage.setItem("guest_plants", JSON.stringify(remaining));
        calculateGuestStats(remaining);
      }
      notify("Plant removed.", "success");
      if (user) await loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Submit Manual Add Plant Form
  async function handleCreatePlant(e) {
    e.preventDefault();
    if (!plantForm.name.trim()) return notify("Please enter a plant nickname or name.", "error");

    try {
      if (user) {
        await api("/garden/plants", {
          method: "POST",
          body: plantForm,
        });
        notify(`Added ${plantForm.name} to your garden!`, "success");
        setModalType(null);
        await loadData();
      } else {
        const newPlant = {
          _id: `guest-${Date.now()}`,
          name: plantForm.name,
          species: plantForm.species,
          originalName: plantForm.species,
          location: plantForm.location,
          potSize: plantForm.potSize,
          soilType: plantForm.soilType,
          healthStatus: "healthy",
          wateringIntervalDays: Number(plantForm.wateringIntervalDays) || 2,
          lastWateredAt: new Date().toISOString(),
          waterQuantityMl: "300ml - 400ml",
          waterScheduleAdvice: `Every ${plantForm.wateringIntervalDays || 2} days in morning`,
          nutrientAdvice: "Apply 1-2 tbsp organic compost or seaweed fertilizer every 14 days.",
          sunlightAdvice: "4-6 hours direct or bright indirect light.",
          protectionAdvice: "Inspect leaves weekly; spray neem oil if pests appear.",
          telemetry: { soilMoisturePercent: 50, ambientTemperatureC: 28, ambientHumidityPercent: 60 },
          notes: plantForm.notes,
        };
        const updated = [newPlant, ...plants];
        setPlants(updated);
        localStorage.setItem("guest_plants", JSON.stringify(updated));
        calculateGuestStats(updated);
        notify(`Added ${plantForm.name} to your garden!`, "success");
        setModalType(null);
      }
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Open diagnosis modal for a plant
  function openDiagnosisModal(plant = null) {
    setSelectedPlant(plant);
    setDiagPlantId(plant ? plant._id : "");
    setDiagSpecies(plant ? (plant.originalName || plant.species) : "");
    setDiagFile(null);
    setDiagPreview("");
    setDiagResult(null);
    setModalType("diagnose");
  }

  // Run AI Leaf Disease Diagnosis
  async function handleDiagnoseSubmit(e) {
    if (e) e.preventDefault();
    setDiagFileError("");

    // 1. Strict Leaf Photo Validation
    const fileValidation = validatePlantImageFile(diagFile);
    if (!fileValidation.valid) {
      const errMsg = fileValidation.error || "Leaf photo is required. Please upload or snap a photo of the affected plant leaf.";
      setDiagFileError(errMsg);
      alert(`⚠️ Validation Error:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    setDiagBusy(true);
    setDiagResult(null);

    try {
      // 2. Ultra-Fast Client-Side Compression for instant diagnosis
      const optimizedFile = await compressAndOptimizeImage(diagFile, 1200, 0.85);

      const form = new FormData();
      form.append("plant_image", optimizedFile);
      form.append("species", diagSpecies || "Urban Houseplant");
      if (diagPlantId && !diagPlantId.startsWith("guest-")) {
        form.append("plant_id", diagPlantId);
      }
      form.append("plant_name", selectedPlant?.name || diagSpecies);

      const res = await api("/garden/diagnose", {
        method: "POST",
        body: form,
      });

      setDiagResult(res.diagnosis);

      const updatedStatus = res.diagnosis.isHealthy ? "healthy" : "diseased";
      if (diagPlantId) {
        setPlants((prev) =>
          prev.map((p) =>
            p._id === diagPlantId
              ? {
                  ...p,
                  healthStatus: updatedStatus,
                  currentDisease: res.diagnosis.diseaseName,
                }
              : p
          )
        );

        if (!user || diagPlantId.startsWith("guest-")) {
          const updated = plants.map((p) =>
            p._id === diagPlantId
              ? {
                  ...p,
                  healthStatus: updatedStatus,
                  currentDisease: res.diagnosis.diseaseName,
                }
              : p
          );
          localStorage.setItem("guest_plants", JSON.stringify(updated));
          calculateGuestStats(updated);
        } else {
          await loadData();
        }
      }

      notify(
        res.diagnosis.isHealthy
          ? "Analysis Complete: Plant appears healthy!"
          : `Diagnosis Complete: Detected ${res.diagnosis.diseaseName}`,
        res.diagnosis.isHealthy ? "success" : "error"
      );
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDiagBusy(false);
    }
  }

  // Open Care History Modal
  async function openHistoryModal(plant) {
    setSelectedPlant(plant);
    setPlantHistory([]);
    setModalType("history");

    if (user && !plant._id?.startsWith("guest-")) {
      try {
        const history = await api(`/garden/plants/${plant._id}/history`);
        setPlantHistory(history || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      if (plant.currentDisease) {
        setPlantHistory([
          {
            _id: "hist-1",
            diseaseName: plant.currentDisease,
            confidence: 94,
            severity: "Moderate",
            createdAt: new Date().toISOString(),
            symptoms: ["Observation logged in care session"],
            organicTreatment: ["Neem oil spray 5ml/L once per week"],
          },
        ]);
      } else {
        setPlantHistory([]);
      }
    }
  }

  // Filtered plants list
  const filteredPlants = plants.filter((p) => {
    if (filter === "needs_water") return p.wateringEvaluation?.isDue;
    if (filter === "diseased") return p.healthStatus === "diseased" || p.healthStatus === "needs_attention";
    if (filter === "healthy") return p.healthStatus === "healthy" || p.healthStatus === "recovering";
    return true;
  });

  // Filtered Nursery Products for Category-Wise Section
  const filteredNurseryProducts = nurseryProducts.filter((prod) => {
    if (selectedCategoryTab === "all") return true;
    const catName = prod.category?.name || "";
    return catName.toLowerCase() === selectedCategoryTab.toLowerCase();
  });

  return (
    <main className="page garden-page">
      {/* Header */}
      <div className="garden-header">
        <div className="garden-title">
          <p className="eyebrow">
            <Sprout size={15} /> {t("garden_eyebrow", "Urban Agriculture & AI Care")}
          </p>
          <h1>{t("garden_h1", "AI Plant Doctor & Garden Assistant")}</h1>
          <p>
            {t("garden_desc", "Upload your plant photo and nickname to get instant botanical species detection, step-by-step care routines, and automated reminders.")}
          </p>
        </div>
        <div className="garden-header-actions">
          <button
            className="button button-outline button-small"
            onClick={() => openDoctorModal(null)}
          >
            <HeartPulse size={15} /> {t("garden_btn_doctor", "🩺 AI Doctor & Climate Clinic")}
          </button>
          <button
            className="button button-outline button-small"
            onClick={() => openDiagnosisModal()}
          >
            <Sparkles size={15} /> {t("garden_btn_scan", "Quick Leaf Scan")}
          </button>
          <button
            className="button button-small"
            onClick={() => {
              setAddMode("ai");
              setAiPhoto(null);
              setAiPreview("");
              setAiNickname("");
              stopCamera();
              setPlantForm({
                name: "",
                species: "Tomato",
                location: "balcony",
                potSize: "Medium (8-10 inch)",
                soilType: "Organic Potting Mix + Compost",
                wateringIntervalDays: 2,
                notes: "",
              });
              setModalType("add");
            }}
          >
            <Plus size={16} /> {t("garden_btn_add", "Add Plant (Photo & Name)")}
          </button>
        </div>
      </div>

      {/* ========================================================
          LIVE GPS LOCATION & MICROCLIMATE WEATHER BANNER
         ======================================================== */}
      {weather && (
        <section className="garden-weather-banner">
          <div className="garden-weather-top">
            <div className="garden-weather-loc-badge">
              <span className="live-gps-dot" title="લાઈવ GPS અને વાતાવરણ સિગ્નલ" />
              <div className="garden-weather-city-title">
                <MapPin size={17} color="var(--green)" />
                <span>{weather.city || (locationDetected ? "લાઈવ GPS સ્થાન" : "ઓટો-ડિટેક્ટેડ વાતાવરણ")}</span>
              </div>
            </div>

            <div className="garden-weather-controls">
              {/* Location Search Bar Dropdown */}
              <div className="weather-search-dropdown-wrap">
                {showLocationSearch ? (
                  <div className="weather-search-input-box">
                    <Search size={14} color="var(--muted)" />
                    <input
                      type="text"
                      placeholder="શહેર/વિસ્તાર શોધો (દા.ત. અમદાવાદ, મુંબઈ)..."
                      value={locationSearchQuery}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}
                      onClick={() => {
                        setShowLocationSearch(false);
                        setLocationSuggestions([]);
                        setLocationSearchQuery("");
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="button button-outline button-small"
                    style={{ fontSize: "12px", padding: "5px 10px" }}
                    onClick={() => setShowLocationSearch(true)}
                    title="બીજા શહેરનું હવામાન શોધો"
                  >
                    <Search size={13} /> શહેર બદલો
                  </button>
                )}

                {/* Suggestions List */}
                {showLocationSearch && locationSuggestions.length > 0 && (
                  <div className="weather-suggestions-menu">
                    {locationSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        className="weather-suggestion-item"
                        onClick={() => selectLocation(loc)}
                      >
                        <MapPin size={12} color="var(--green)" />
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showLocationSearch && isSearchingLocation && (
                  <div className="weather-suggestions-menu" style={{ padding: "8px 12px", fontSize: "12px", color: "var(--muted)" }}>
                    સ્થાન શોધાઈ રહ્યું છે...
                  </div>
                )}
              </div>

              {/* Live GPS Button */}
              <button
                type="button"
                className="button button-small"
                style={{ fontSize: "12px", padding: "5px 11px" }}
                onClick={() => detectLocationAndWeather(true)}
                disabled={locationDetecting}
                title="બ્રાઉઝરમાંથી લાઈવ GPS સ્થાન શોધો"
              >
                <Navigation size={13} className={locationDetecting ? "spin" : ""} />
                {locationDetecting ? "સ્થાન શોધી રહ્યું છે…" : "મારું લાઈવ સ્થાન ઉપયોગ કરો"}
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                className="button button-outline button-small"
                style={{ padding: "5px 8px" }}
                onClick={() => detectLocationAndWeather(true)}
                disabled={locationDetecting}
                title="હાલનું હવામાન રીફ્રેશ કરો"
              >
                <RefreshCw size={13} className={locationDetecting ? "spin" : ""} />
              </button>
            </div>
          </div>

          {/* 5 Weather Metrics Grid */}
          <div className="garden-weather-stats-row">
            <div className="garden-weather-stat-card">
              <span className="w-label"><Thermometer size={12} color="#d9534f" /> તાપમાન</span>
              <span className="w-val">{weather.temperature}°C</span>
              <span className="w-sub">
                {weather.minTemperature !== undefined && weather.maxTemperature !== undefined
                  ? `ન્યૂનતમ: ${weather.minTemperature}° • મહત્તમ: ${weather.maxTemperature}°`
                  : "લાઈવ વાતાવરણ"}
              </span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Droplets size={12} color="#2b75a0" /> ભેજ</span>
              <span className="w-val">{weather.humidity}%</span>
              <span className="w-sub">{weather.humidity > 75 ? "વધારે ભેજ" : "યોગ્ય"}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Sun size={12} color="#f0ad4e" /> સ્થિતિ</span>
              <span className="w-val" style={{ fontSize: "13px" }}>{weather.condition}</span>
              <span className="w-sub">{weather.rainAlert ? "વરસાદની ચેતવણી" : "છોડ માટે અનુકૂળ"}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><CloudRain size={12} color="#5bc0de" /> વરસાદ</span>
              <span className="w-val">{weather.precipitation || 0} mm</span>
              <span className="w-sub">{weather.precipitation > 0 ? "આજે વરસાદ છે" : "આજે વરસાદ નથી"}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Wind size={12} color="#6c757d" /> પવનની ગતિ</span>
              <span className="w-val">{weather.windSpeed || 8} km/h</span>
              <span className="w-sub">હળવી પવનની લહેર</span>
            </div>
          </div>

          {/* AI Microclimate Advisory */}
          <div className="garden-weather-advice-box">
            <HeartPulse size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              <strong>🩺 લાઈવ ક્લાઇમેટ AI સલાહ: </strong>
              {weather.tip}
            </div>
          </div>
        </section>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="garden-overview-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>કુલ છોડ</span>
            <Sprout size={20} />
          </div>
          <div className="stat-card-num">{stats.total}</div>
          <div className="stat-card-desc">તમારા બગીચામાં સક્રિય</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>આજે પાણી આપવાનું બાકી</span>
            <Droplets size={20} color="#2b75a0" />
          </div>
          <div className="stat-card-num">{stats.needsWater}</div>
          <div className="stat-card-desc">
            {stats.needsWater > 0 ? "આજે પાણી આપવું જરૂરી છે" : "બધા છોડ માટે પૂરતું પાણી છે"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>ધ્યાન આપવાની જરૂર</span>
            <AlertTriangle size={20} color="var(--rust)" />
          </div>
          <div className="stat-card-num">{stats.diseased}</div>
          <div className="stat-card-desc">
            {stats.diseased > 0 ? "તબીબી નિરીક્ષણ હેઠળ" : "કોઈ રોગ મળ્યો નથી"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>બગીચાનું સ્વાસ્થ્ય</span>
            <HeartPulse size={20} color="#358044" />
          </div>
          <div className="stat-card-num">
            {stats.total > 0 ? `${Math.round(((stats.healthy || 0) / stats.total) * 100)}%` : "100%"}
          </div>
          <div className="stat-card-desc">કુલ તંદુરસ્તી સ્કોર</div>
        </div>
      </div>

      {/* Garden Plant Cards & Tabs */}
      <div className="garden-tabs-bar">
        <div className="garden-filter-tabs">
          <button
            className={`garden-tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            બધા છોડ ({plants.length})
          </button>
          <button
            className={`garden-tab-btn ${filter === "needs_water" ? "active" : ""}`}
            onClick={() => setFilter("needs_water")}
          >
            પાણીની જરૂર ({stats.needsWater})
          </button>
          <button
            className={`garden-tab-btn ${filter === "diseased" ? "active" : ""}`}
            onClick={() => setFilter("diseased")}
          >
            સંભાળ હેઠળ / રોગગ્રસ્ત ({stats.diseased})
          </button>
          <button
            className={`garden-tab-btn ${filter === "healthy" ? "active" : ""}`}
            onClick={() => setFilter("healthy")}
          >
            તંદુરસ્ત ({stats.healthy})
          </button>
        </div>

        <span className="muted" style={{ fontSize: "12px" }}>
          {plants.length} છોડ નોંધાયેલ છે
        </span>
      </div>

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: "8px", border: "1px solid var(--line)" }}>
          <Sprout size={36} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
          <h3>આ વ્યુમાં કોઈ છોડ મળ્યા નથી</h3>
          <p className="muted" style={{ fontSize: "13px" }}>
            ફોટો અપલોડ કરીને અને હુલામણું નામ આપીને તમારો છોડ ઉમેરો.
          </p>
        </div>
      ) : (
        <div className="garden-plants-grid">
          {filteredPlants.map((plant) => {
            const isDue = plant.wateringEvaluation?.isDue;
            const statusClass = plant.healthStatus || "healthy";
            const moisture = plant.telemetry?.soilMoisturePercent;
            const origName = plant.originalName || plant.species;

            return (
              <div key={plant._id} className="garden-plant-card">
                <div>
                  {/* Plant Photo if available */}
                  {plant.image && (
                    <img src={plant.image} alt={plant.name} className="plant-card-media" />
                  )}

                  <div className="plant-card-head">
                    <div className="plant-card-title">
                      <h3>{plant.name}</h3>
                      <div className="plant-card-species">
                        <span className="plant-card-original-badge">
                          🌱 મૂળ છોડ: {origName}
                        </span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "11px", color: "var(--muted)" }}>
                          સ્થાન: {plant.location === "balcony" ? "બાલ્કની કન્ટેનર" : plant.location === "indoor" ? "ઇન્ડોર બારી" : plant.location === "terrace" ? "ટેરેસ ગાર્ડન" : plant.location || "બાલ્કની"}
                        </span>
                      </div>
                    </div>
                    <span className={`health-pill ${statusClass}`}>
                      {statusClass === "healthy" && "🟢 તંદુરસ્ત"}
                      {statusClass === "diseased" && "🔴 રોગગ્રસ્ત"}
                      {statusClass === "needs_attention" && "🟡 સંભાળ જરૂરી"}
                      {statusClass === "recovering" && "🔵 સુધારો થઈ રહ્યો છે"}
                    </span>
                  </div>

                  {plant.currentDisease && (
                    <div className="disease-alert-tag">
                      <ShieldAlert size={14} />
                      <span>{plant.currentDisease}</span>
                    </div>
                  )}

                  {/* Watering Status Box */}
                  <div className="watering-box">
                    <div className="watering-box-row">
                      <span>💧 કેટલું પાણી આપવું:</span>
                      <strong>{plant.waterQuantityMl || "300ml - 400ml"}</strong>
                    </div>
                    <div className="watering-box-row" style={{ marginTop: "4px" }}>
                      <span>⏰ ક્યારે પાણી આપવું:</span>
                      <strong>
                        {isDue ? (
                          <span style={{ color: "var(--rust)" }}>💧 આજે આપવાનું છે</span>
                        ) : (
                          <span style={{ color: "var(--green)" }}>{plant.wateringEvaluation?.statusText || "✓ યોગ્ય સમયે"}</span>
                        )}
                      </strong>
                    </div>
                    {plant.waterScheduleAdvice && (
                      <div className="watering-box-hint" style={{ marginTop: "4px" }}>
                        {plant.waterScheduleAdvice}
                      </div>
                    )}
                  </div>

                  {/* Nutrients / Plant Food ("Protein") */}
                  {plant.nutrientAdvice && (
                    <div className="nutrient-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "#6a521a" }}>
                        <Sparkles size={13} color="#a07c2a" />
                        <span>પોષક તત્વો અને પ્લાન્ટ ફૂડ:</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a4d2e", marginTop: "3px", lineHeight: "1.4" }}>
                        {plant.nutrientAdvice}
                      </div>
                    </div>
                  )}

                  {/* In-app Notification status */}
                  <div className="notification-status-tag">
                    <Bell size={12} color="var(--green)" />
                    <span>ઇન-એપ રીમાઇન્ડર્સ સક્રિય છે ✓</span>
                  </div>

                  {/* IoT Moisture Reading */}
                  {moisture != null && (
                    <div className="plant-iot-bar">
                      <div className="plant-iot-label">
                        <span>IoT માટીનો ભેજ:</span>
                        <strong>
                          {moisture}%{" "}
                          {moisture < 20 ? "(સૂકી)" : moisture > 70 ? "(ભીની)" : "(યોગ્ય)"}
                        </strong>
                      </div>
                      <div className="plant-iot-progress">
                        <div
                          className="plant-iot-fill"
                          style={{
                            width: `${Math.min(100, moisture)}%`,
                            background: moisture < 20 ? "var(--rust)" : "var(--green)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Card Actions */}
                <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
                  <button
                    className="button button-small"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => openStepCareModal(plant)}
                  >
                    <Sparkles size={14} /> પગલાંવાર સંભાળ માર્ગદર્શિકા જુઓ
                  </button>

                  <div className="plant-card-actions" style={{ paddingTop: "8px" }}>
                    <button
                      className="btn-water"
                      onClick={() => handleWaterPlant(plant)}
                      title="પાણી આપ્યાની નોંધ કરો"
                    >
                      <Droplets size={14} /> પાણી આપ્યું
                    </button>
                    <button
                      className="btn-scan"
                      onClick={() => openDoctorModal(plant)}
                      title="આ છોડ માટે AI ડોક્ટરની સલાહ લો"
                    >
                      <MessageSquare size={14} /> ડોક્ટર
                    </button>
                    <button
                      className="btn-mini-icon"
                      onClick={() => openDiagnosisModal(plant)}
                      title="રોગ માટે પાંદડું સ્કેન કરો"
                    >
                      <Sparkles size={14} />
                    </button>
                    <button
                      className="btn-mini-icon"
                      onClick={() => openHistoryModal(plant)}
                      title="ઇતિહાસ જુઓ"
                    >
                      <History size={14} />
                    </button>
                    <button
                      className="btn-mini-icon danger"
                      onClick={() => handleDeletePlant(plant._id)}
                      title="છોડ દૂર કરો"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          SECTION: RECOMMENDED NURSERY PRODUCTS (CATEGORY-WISE)
         ======================================================== */}
      <section className="nursery-category-section">
        <div className="nursery-section-head">
          <div>
            <p className="eyebrow">
              <ShoppingBag size={14} /> ગ્રીન લીફ નર્સરી કેટેલોગ
            </p>
            <h2>સૂચવેલ સંભાળ પ્રોડક્ટ્સ અને છોડ (કેટેગરી મુજબ)</h2>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "13px" }}>
              જૈવિક દવાઓ, પોષક ખોરાક, હવામાન-અનુકૂળ કુંડાં અને અમારી નર્સરીમાંથી સીધા જ તંદુરસ્ત છોડ.
            </p>
          </div>
          <Link to="/products" className="button button-outline button-small">
            સંપૂર્ણ સ્ટોર જુઓ <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="nursery-cat-tabs">
          <button
            type="button"
            className={`nursery-cat-btn ${selectedCategoryTab === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategoryTab("all")}
          >
            બધી પ્રોડક્ટ્સ ({nurseryProducts.length})
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              className={`nursery-cat-btn ${selectedCategoryTab.toLowerCase() === c.name.toLowerCase() ? "active" : ""}`}
              onClick={() => setSelectedCategoryTab(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Category-Wise Product Grid */}
        <div className="nursery-prod-grid">
          {filteredNurseryProducts.slice(0, 8).map((product) => (
            <article key={product._id} className="nursery-prod-card">
              <Link to={`/products/${product._id}`}>
                <img
                  src={imageSource(product.image)}
                  alt={product.name}
                  className="nursery-prod-img"
                  loading="lazy"
                />
              </Link>
              <div className="nursery-prod-body">
                <span className="nursery-prod-category">
                  {product.category?.name || "નર્સરી છોડ"}
                </span>
                <Link to={`/products/${product._id}`} className="nursery-prod-title">
                  {product.name}
                </Link>
                <p className="nursery-prod-desc">{product.description}</p>

                <div className="nursery-prod-footer">
                  <span className="nursery-prod-price">
                    {money(product.price, settings?.currency || "₹")}
                  </span>
                  <button
                    type="button"
                    className="nursery-prod-buy-btn"
                    onClick={() => handleAddProductToCart(product)}
                  >
                    <Plus size={14} /> કાર્ટમાં ઉમેરો
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================================
          MODAL: ADD NEW PLANT (AI PHOTO + NICKNAME OR MANUAL)
         ======================================================== */}
      {modalType === "add" && (
        <div className="modal-overlay" onClick={() => { stopCamera(); setModalType(null); }}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { stopCamera(); setModalType(null); }}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <Plus size={14} /> મારો બગીચો
            </p>
            <h2 style={{ margin: "4px 0 14px" }}>બગીચામાં છોડ ઉમેરો</h2>

            {/* Mode Switch Tabs */}
            <div className="ai-mode-tabs">
              <button
                type="button"
                className={`ai-mode-tab ${addMode === "ai" ? "active" : ""}`}
                onClick={() => setAddMode("ai")}
              >
                ✨ AI ઓટો-સેટઅપ (માત્ર ફોટો અને નામ)
              </button>
              <button
                type="button"
                className={`ai-mode-tab ${addMode === "manual" ? "active" : ""}`}
                onClick={() => { stopCamera(); setAddMode("manual"); }}
              >
                📝 જાતે એન્ટ્રી કરો
              </button>
            </div>

            {addMode === "ai" ? (
              <div>
                <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
                  તમારા છોડનો ફોટો અપલોડ કરો અને હુલામણું નામ આપો. AI મૂળ છોડનું નામ ઓળખશે, પગલાંવાર સંભાળ યોજના બનાવશે (પાણી, સૂર્યપ્રકાશ, ખાતર) અને રીમાઇન્ડર્સ સેટ કરશે!
                </p>

                {/* Live Camera Viewfinder Box */}
                {cameraActive && cameraTarget === "ai" && (
                  <div className="camera-capture-box">
                    <video ref={videoRef} autoPlay playsInline className="camera-video" />
                    <div className="camera-actions-bar">
                      <button type="button" className="button button-small" onClick={capturePhoto}>
                        <Camera size={15} /> હમણાં ફોટો પાડો
                      </button>
                      <button type="button" className="button button-outline button-small" onClick={stopCamera}>
                        કેમેરો બંધ કરો
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAiAddPlant} className="diagnosis-form">
                  {/* Photo Upload Dropzone with Live Camera Option */}
                  <div>
                    <label
                      className={`drag-drop-zone ${aiPhotoError ? "has-error" : ""} ${isDraggingAi ? "active-drag" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingAi(true);
                      }}
                      onDragLeave={() => setIsDraggingAi(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingAi(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const v = validatePlantImageFile(file);
                          if (!v.valid) {
                            const err = v.error || "અમાન્ય ઇમેજ ફાઇલ";
                            setAiPhotoError(err);
                            alert(`⚠️ ફાઇલ ભૂલ:\n\n${err}`);
                            notify(`⚠️ ${err}`, "error");
                          } else {
                            setAiPhotoError("");
                            setAiPhoto(file);
                          }
                        }
                      }}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            const v = validatePlantImageFile(file);
                            if (!v.valid) {
                              const err = v.error || "અમાન્ય ઇમેજ ફાઇલ";
                              setAiPhotoError(err);
                              alert(`⚠️ ફાઇલ ભૂલ:\n\n${err}`);
                              notify(`⚠️ ${err}`, "error");
                            } else {
                              setAiPhotoError("");
                              setAiPhoto(file);
                            }
                          }
                        }}
                      />
                      {aiPreview ? (
                        <div>
                          <img src={aiPreview} alt="પસંદ કરેલ છોડ" />
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                            <span className="dropzone-file-pill">
                              <Leaf size={13} color="var(--green)" />
                              {aiPhoto?.name ? aiPhoto.name.slice(0, 24) : "ફોટો તૈયાર છે"}
                              {aiPhoto?.size && ` (${(aiPhoto.size / 1024).toFixed(0)} KB)`}
                            </span>
                            <button
                              type="button"
                              className="dropzone-remove-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAiPhoto(null);
                                setAiPhotoError("");
                              }}
                              title="ફોટો દૂર કરો"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--green)", marginTop: "4px", display: "block" }}>
                            બદલવા માટે બીજી ઇમેજ પર ક્લિક કરો અથવા ડ્રોપ કરો
                          </span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={36} color={aiPhotoError ? "var(--rust)" : "var(--green)"} />
                          <strong style={{ fontSize: "13px", color: aiPhotoError ? "var(--rust)" : "var(--green-deep)" }}>
                            છોડનો ફોટો અપલોડ કરો *
                          </strong>
                          <span className="muted" style={{ fontSize: "11px" }}>
                            JPG, PNG, WebP · ડ્રેગ અને ડ્રોપ કરો અથવા પસંદ કરવા ક્લિક કરો
                          </span>
                        </>
                      )}
                    </label>

                    {/* Explicit Validation Error Alert */}
                    {aiPhotoError && (
                      <div className="dropzone-error-msg">
                        <AlertTriangle size={15} />
                        <span>{aiPhotoError}</span>
                      </div>
                    )}

                    {!cameraActive && (
                      <div style={{ textAlign: "center", marginTop: "8px" }}>
                        <button
                          type="button"
                          className="button button-outline button-small"
                          onClick={() => startCamera("ai")}
                        >
                          <Camera size={15} /> લાઈવ કેમેરા સ્કેનર ખોલો
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label>
                      છોડનું હુલામણું નામ *
                      <input
                        placeholder="દા.ત. ટામેટી, હરિયાળો, ફુદીનો"
                        value={aiNickname}
                        onChange={(e) => {
                          setAiNickname(e.target.value);
                          if (e.target.value.trim()) setAiNicknameError("");
                        }}
                        style={aiNicknameError ? { borderColor: "var(--rust)" } : {}}
                      />
                      {aiNicknameError && (
                        <span style={{ color: "var(--rust)", fontSize: "11px", marginTop: "2px", display: "block" }}>
                          {aiNicknameError}
                        </span>
                      )}
                    </label>

                    <label>
                      ઉગાડવાનું સ્થાન
                      <select
                        value={aiLocation}
                        onChange={(e) => setAiLocation(e.target.value)}
                      >
                        <option value="balcony">બાલ્કની કન્ટેનર</option>
                        <option value="indoor">ઇન્ડોર બારી</option>
                        <option value="terrace">ટેરેસ ગાર્ડન</option>
                        <option value="garden_bed">જમીન / બગીચો</option>
                      </select>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="button full-button"
                    disabled={aiAddBusy}
                  >
                    {aiAddBusy ? "AI છોડની ઓળખ કરી રહ્યું છે અને માર્ગદર્શિકા બનાવી રહ્યું છે…" : "✨ છોડ ઓળખો અને સંભાળ ગાઇડ મેળવો"}
                    <Sparkles size={16} />
                  </button>
                </form>
              </div>
            ) : (
              /* Manual Entry Form */
              <form onSubmit={handleCreatePlant} className="diagnosis-form">
                <label>
                  છોડનું નામ અથવા હુલામણું નામ *
                  <input
                    required
                    placeholder="દા.ત. બાલ્કની ટામેટી"
                    value={plantForm.name}
                    onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
                  />
                </label>

                <label>
                  છોડનો પ્રકાર / પ્રજાતિ
                  <select
                    value={plantForm.species}
                    onChange={(e) => {
                      const sp = e.target.value;
                      const opt = SPECIES_OPTIONS.find((o) => o.id === sp);
                      setPlantForm({
                        ...plantForm,
                        species: sp,
                        wateringIntervalDays: opt ? opt.defaultInterval : 2,
                      });
                    }}
                  >
                    {SPECIES_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label>
                    સ્થાન
                    <select
                      value={plantForm.location}
                      onChange={(e) => setPlantForm({ ...plantForm, location: e.target.value })}
                    >
                      <option value="balcony">બાલ્કની કન્ટેનર</option>
                      <option value="indoor">ઇન્ડોર બારી</option>
                      <option value="terrace">ટેરેસ ગાર્ડન</option>
                      <option value="garden_bed">જમીન / બગીચો</option>
                    </select>
                  </label>

                  <label>
                    કુંડાંનું માપ
                    <select
                      value={plantForm.potSize}
                      onChange={(e) => setPlantForm({ ...plantForm, potSize: e.target.value })}
                    >
                      <option value="Small (4-6 inch)">નાનું (4–6 ઇંચ)</option>
                      <option value="Medium (8-10 inch)">મધ્યમ (8–10 ઇંચ)</option>
                      <option value="Large (12+ inch)">મોટું (12+ ઇંચ)</option>
                      <option value="Raised Bed">જમીન / ક્યારી</option>
                    </select>
                  </label>
                </div>

                <label>
                  પાણી આપવાનો દિવસોનો તફાવત
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={plantForm.wateringIntervalDays}
                    onChange={(e) =>
                      setPlantForm({ ...plantForm, wateringIntervalDays: Number(e.target.value) })
                    }
                  />
                </label>

                <label>
                  માળીની નોંધો (વૈકલ્પિક)
                  <textarea
                    rows="2"
                    placeholder="દા.ત. માર્ચમાં બીજ વાવ્યા, બપોરનો તડકો પસંદ છે."
                    value={plantForm.notes}
                    onChange={(e) => setPlantForm({ ...plantForm, notes: e.target.value })}
                  />
                </label>

                <button type="submit" className="button full-button">
                  બગીચામાં છોડ સાચવો
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP: STEP-BY-STEP CARE SUGGESTIONS
         ======================================================== */}
      {modalType === "stepWiseCare" && stepCarePlant && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card stepwise-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>

            <p className="eyebrow">
              <Sparkles size={14} /> AI વનસ્પતિ આસિસ્ટન્ટ
            </p>
            <h2 style={{ margin: "4px 0 16px" }}>પગલાંવાર સંભાળ માર્ગદર્શિકા</h2>

            {/* Plant Identity Hero Banner */}
            <div className="stepwise-hero">
              {stepCarePlant.image ? (
                <img src={stepCarePlant.image} alt={stepCarePlant.name} className="stepwise-hero-thumb" />
              ) : (
                <div className="stepwise-hero-thumb" style={{ display: "grid", placeItems: "center" }}>
                  <Sprout size={36} color="var(--green)" />
                </div>
              )}
              <div className="stepwise-hero-info">
                <span className="muted" style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                  હુલામણું નામ:
                </span>
                <h3>{stepCarePlant.name}</h3>

                <div className="stepwise-hero-tags">
                  <span className="plant-card-original-badge">
                    🌱 મૂળ છોડ: {stepCarePlant.originalName || stepCarePlant.species}
                  </span>
                  <span className="health-pill healthy">
                    ✓ {stepCareReport?.confidence || 96}% મેળ
                  </span>
                  <span className="health-pill healthy">
                    🟢 {stepCarePlant.healthStatus === "healthy" ? "તંદુરસ્ત" : stepCarePlant.healthStatus || "તંદુરસ્ત"}
                  </span>
                </div>
              </div>
            </div>

            {/* Numbered Steps (1 to 5) */}
            <div className="stepwise-steps-container">
              {(stepCareReport?.stepWiseCare || []).map((step) => (
                <div key={step.stepNumber} className="stepwise-step-card">
                  <div className="stepwise-step-num">{step.stepNumber}</div>
                  <div className="stepwise-step-content">
                    <div className="stepwise-step-head">
                      <h4>
                        {step.stepNumber === 1 && <Droplets size={16} color="#2b75a0" />}
                        {step.stepNumber === 2 && <Sun size={16} color="var(--gold)" />}
                        {step.stepNumber === 3 && <Sprout size={16} color="var(--green)" />}
                        {step.stepNumber === 4 && <ShieldCheck size={16} color="var(--rust)" />}
                        {step.stepNumber === 5 && <Bell size={16} color="var(--green)" />}
                        {step.title}
                      </h4>
                      <span className="stepwise-step-badge">{step.headline || step.schedule}</span>
                    </div>
                    <p className="stepwise-step-detail">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Products in Nursery Catalog */}
            <div className="stepwise-nursery-strip">
              <div className="stepwise-nursery-head">
                <ShoppingBag size={16} color="#8a6616" />
                <span>નર્સરીમાંથી સૂચવેલ સંભાળ પ્રોડક્ટ્સ:</span>
              </div>
              <div className="stepwise-products-pills">
                <Link to="/products?q=neem" className="stepwise-prod-pill">
                  🌿 જૈવિક કોલ્ડ-પ્રેસ્ડ લીમડાનું તેલ સ્પ્રે
                </Link>
                <Link to="/products?q=fertilizer" className="stepwise-prod-pill">
                  🧪 સીવીડ અને વર્મીકમ્પોસ્ટ પ્લાન્ટ ફૂડ
                </Link>
                <Link to="/products?q=potting" className="stepwise-prod-pill">
                  🪴 હવાયુક્ત ઓર્ગેનિક પોટિંગ મિક્સ
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between" }}>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => openDoctorModal(stepCarePlant)}
              >
                <MessageSquare size={15} /> AI પ્લાન્ટ ડોક્ટરને પૂછો
              </button>
              <button
                type="button"
                className="button button-small"
                onClick={() => setModalType(null)}
              >
                <Check size={15} /> પૂર્ણ અને બગીચામાં જુઓ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ASK AI PLANT DOCTOR & AUTO-DETECTED WEATHER CLINIC
         ======================================================== */}
      {modalType === "doctor" && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card doctor-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <HeartPulse size={14} /> AI પ્લાન્ટ ડોક્ટર ક્લિનિક
            </p>
            <h2 style={{ margin: "4px 0 6px" }}>
              {doctorPlant ? `ડોક્ટરની સલાહ: ${doctorPlant.name}` : "AI પ્લાન્ટ ડોક્ટર અને ક્લાઇમેટ ક્લિનિક"}
            </h2>
            {doctorPlant && (
              <p className="muted" style={{ fontSize: "12px", margin: "0 0 14px" }}>
                મૂળ છોડ: <strong>{doctorPlant.originalName || doctorPlant.species}</strong> • સ્વાસ્થ્ય: {doctorPlant.healthStatus}
              </p>
            )}

            {/* Live Auto-Detected Weather & Microclimate Card */}
            {weather && (
              <div className="doctor-weather-box">
                <div className="doctor-weather-head">
                  <span className="doctor-weather-location">
                    <MapPin size={14} color="var(--green)" />
                    {weather.city || (locationDetected ? "GPS દ્વારા શોધાયેલ" : "ઓટો-ડિટેક્ટેડ વાતાવરણ")}
                  </span>
                  <button
                    type="button"
                    className="button button-outline button-small"
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={detectLocationAndWeather}
                    disabled={locationDetecting}
                    title="GPS સ્થાન અને લાઈવ હવામાન રીફ્રેશ કરો"
                  >
                    <RefreshCw size={11} className={locationDetecting ? "spin" : ""} />
                    {locationDetecting ? "શોધાઈ રહ્યું છે…" : "GPS રીફ્રેશ કરો"}
                  </button>
                </div>

                <div className="doctor-weather-grid">
                  <div className="doctor-weather-metric">
                    <span>તાપમાન</span>
                    <strong>{weather.temperature}°C</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>ભેજ</span>
                    <strong>{weather.humidity}%</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>સ્થિતિ</span>
                    <strong style={{ fontSize: "12px" }}>{weather.condition}</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>વરસાદ</span>
                    <strong>{weather.precipitation || 0}mm</strong>
                  </div>
                </div>

                <div className="doctor-weather-advisory">
                  <strong>🩺 માઇક્રોક્લાઇમેટ ડોક્ટર સલાહ: </strong>
                  {weather.tip}
                </div>
              </div>
            )}

            <div className="doctor-chat-box">
              {doctorMessages.map((msg, idx) => (
                <div key={idx} className={`doctor-msg ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {doctorBusy && (
                <div className="doctor-msg assistant">
                  <em>AI ડોક્ટર છોડના લક્ષણો અને વાતાવરણનું વિશ્લેષણ કરી રહ્યા છે…</em>
                </div>
              )}
            </div>

            <form onSubmit={handleDoctorSubmit} className="doctor-input-row">
              <input
                required
                placeholder="દા.ત. ગરમીમાં નીચેના પાંદડા પીળા કેમ પડી રહ્યા છે?"
                value={doctorQuestion}
                onChange={(e) => setDoctorQuestion(e.target.value)}
              />
              <button type="submit" className="button button-small" disabled={doctorBusy || !doctorQuestion.trim()}>
                પ્રશ્ન પૂછો
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: AI LEAF DISEASE DIAGNOSIS
         ======================================================== */}
      {modalType === "diagnose" && (
        <div className="modal-overlay" onClick={() => { stopCamera(); setModalType(null); }}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { stopCamera(); setModalType(null); }}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <Sparkles size={14} /> AI પ્લાન્ટ પેથોલોજિસ્ટ
            </p>
            <h2 style={{ margin: "4px 0 14px" }}>
              {selectedPlant ? `નિદાન: ${selectedPlant.name} (${selectedPlant.originalName || selectedPlant.species})` : "પાંદડાનું નિદાન કરો"}
            </h2>

            {/* Live Camera Viewfinder */}
            {cameraActive && cameraTarget === "diag" && (
              <div className="camera-capture-box">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <div className="camera-actions-bar">
                  <button type="button" className="button button-small" onClick={capturePhoto}>
                    <Camera size={15} /> પાંદડાનો ફોટો પાડો
                  </button>
                  <button type="button" className="button button-outline button-small" onClick={stopCamera}>
                    કેમેરો બંધ કરો
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleDiagnoseSubmit} className="diagnosis-form">
              {/* Upload Drop Zone */}
              <div>
                <label
                  className={`drag-drop-zone ${diagFileError ? "has-error" : ""} ${isDraggingDiag ? "active-drag" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingDiag(true);
                  }}
                  onDragLeave={() => setIsDraggingDiag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingDiag(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const v = validatePlantImageFile(file);
                      if (!v.valid) {
                        const err = v.error || "અમાન્ય ઇમેજ ફાઇલ";
                        setDiagFileError(err);
                        alert(`⚠️ ફાઇલ ભૂલ:\n\n${err}`);
                        notify(`⚠️ ${err}`, "error");
                      } else {
                        setDiagFileError("");
                        setDiagFile(file);
                      }
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const v = validatePlantImageFile(file);
                        if (!v.valid) {
                          const err = v.error || "અમાન્ય ઇમેજ ફાઇલ";
                          setDiagFileError(err);
                          alert(`⚠️ ફાઇલ ભૂલ:\n\n${err}`);
                          notify(`⚠️ ${err}`, "error");
                        } else {
                          setDiagFileError("");
                          setDiagFile(file);
                        }
                      }
                    }}
                  />
                  {diagPreview ? (
                    <div>
                      <img src={diagPreview} alt="પાંદડાનું પ્રિવ્યૂ" />
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span className="dropzone-file-pill">
                          <Leaf size={13} color="var(--green)" />
                          {diagFile?.name ? diagFile.name.slice(0, 24) : "પાંદડાનો ફોટો તૈયાર છે"}
                          {diagFile?.size && ` (${(diagFile.size / 1024).toFixed(0)} KB)`}
                        </span>
                        <button
                          type="button"
                          className="dropzone-remove-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDiagFile(null);
                            setDiagFileError("");
                          }}
                          title="ફોટો દૂર કરો"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--green)", marginTop: "4px", display: "block" }}>
                        બદલવા માટે બીજી ઇમેજ પર ક્લિક કરો અથવા ડ્રોપ કરો
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={38} color={diagFileError ? "var(--rust)" : "var(--green)"} />
                      <strong style={{ fontSize: "13px", color: diagFileError ? "var(--rust)" : "var(--green-deep)" }}>
                        છોડ અથવા પાંદડાનો ફોટો અપલોડ કરો (JPG, PNG, WebP) *
                      </strong>
                      <span className="muted" style={{ fontSize: "11px" }}>
                        ડ્રેગ અને ડ્રોપ કરો અથવા પસંદ કરવા ક્લિક કરો
                      </span>
                    </>
                  )}
                </label>

                {/* Explicit Validation Error Alert */}
                {diagFileError && (
                  <div className="dropzone-error-msg">
                    <AlertTriangle size={15} />
                    <span>{diagFileError}</span>
                  </div>
                )}

                {!cameraActive && (
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <button
                      type="button"
                      className="button button-outline button-small"
                      onClick={() => startCamera("diag")}
                    >
                      <Camera size={15} /> લાઈવ કેમેરા વડે પાંદડાનો ફોટો પાડો
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  છોડનો પ્રકાર / પ્રજાતિ
                  <select
                    value={diagSpecies}
                    onChange={(e) => setDiagSpecies(e.target.value)}
                  >
                    {SPECIES_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  બગીચાના છોડ સાથે લિંક કરો
                  <select
                    value={diagPlantId}
                    onChange={(e) => {
                      setDiagPlantId(e.target.value);
                      const found = plants.find((p) => p._id === e.target.value);
                      if (found) setSelectedPlant(found);
                    }}
                  >
                    <option value="">-- ઝડપી સ્કેન (લિંક વગર) --</option>
                    {plants.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (મૂળ: {p.originalName || p.species})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="button full-button"
                disabled={diagBusy}
              >
                {diagBusy ? "AI પેથોલોજિસ્ટ વિશ્લેષણ કરી રહ્યા છે…" : "AI નિદાન ચલાવો"}
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Structured Diagnosis Results */}
            {diagResult && (
              <div className="diagnosis-box">
                <div
                  className={`diagnosis-banner ${
                    diagResult.isHealthy ? "healthy" : "diseased"
                  }`}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: diagResult.isHealthy ? "#2b6d27" : "var(--rust)",
                      }}
                    >
                      {diagResult.isHealthy ? "✓ તંદુરસ્ત સ્થિતિ" : "⚠️ રોગચાળો મળ્યો"}
                    </span>
                    <h3>{diagResult.diseaseName}</h3>
                    <span style={{ fontSize: "12px", color: "#545e51" }}>
                      ગંભીરતા: <strong>{diagResult.severity || "મધ્યમ"}</strong>
                    </span>
                  </div>

                  <div className="confidence-gauge">
                    <span style={{ fontSize: "10px", display: "block", color: "#646d60" }}>
                      AI ચોકસાઈ
                    </span>
                    <strong>{diagResult.confidence || 93}%</strong>
                  </div>
                </div>

                <div className="diagnosis-sections">
                  {/* Symptoms & Causes */}
                  <div className="diagnosis-sect-card">
                    <h4>🔍 દૃશ્યમાન લક્ષણો અને કારણો</h4>
                    <ul>
                      {(diagResult.symptoms || []).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                    {diagResult.causes?.length > 0 && (
                      <p style={{ marginTop: "8px" }}>
                        <strong>મુખ્ય કારણો: </strong>
                        {diagResult.causes.join(" • ")}
                      </p>
                    )}
                  </div>

                  {/* Organic & Home Treatments */}
                  <div className="diagnosis-sect-card" style={{ background: "#f5f8f3" }}>
                    <h4 style={{ color: "var(--green-deep)" }}>
                      🌿 જૈવિક અને ઘરગથ્થુ ઉપચારો
                    </h4>
                    <ul>
                      {(diagResult.organicTreatment || []).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Treatment & Prevention */}
                  <div className="diagnosis-sect-card">
                    <h4>🧪 નર્સરી સારવાર અને સંભાળ</h4>
                    {diagResult.chemicalTreatment?.length > 0 && (
                      <p style={{ marginBottom: "6px" }}>
                        <strong>રક્ષણાત્મક દ્રવ્યો: </strong>
                        {diagResult.chemicalTreatment.join(" • ")}
                      </p>
                    )}
                    <ul>
                      {(diagResult.preventiveCare || []).map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Smart Watering Directive */}
                  {diagResult.wateringAdvice && (
                    <div className="diagnosis-sect-card" style={{ background: "#f2f7fc" }}>
                      <h4 style={{ color: "#235496" }}>💧 સૂચવેલ પાણી આપવાની દિનચર્યા</h4>
                      <p>{diagResult.wateringAdvice}</p>
                    </div>
                  )}

                  {/* Recommended Products in Nursery */}
                  <div className="stepwise-nursery-strip" style={{ margin: "10px 0 0" }}>
                    <div className="stepwise-nursery-head">
                      <ShoppingBag size={16} color="#8a6616" />
                      <span>નર્સરીમાંથી સૂચવેલ ઇલાજ પ્રોડક્ટ્સ:</span>
                    </div>
                    <div className="stepwise-products-pills">
                      <Link to="/products?q=neem" className="stepwise-prod-pill">
                        🌿 જૈવિક લીમડાનું તેલ સ્પ્રે
                      </Link>
                      <Link to="/products?q=fungicide" className="stepwise-prod-pill">
                        🛡️ બાયો-ફંગસાઇડ પાવડર
                      </Link>
                      <Link to="/products?q=fertilizer" className="stepwise-prod-pill">
                        🧪 ઓર્ગેનિક પ્લાન્ટ ફૂડ અને વર્મીકમ્પોસ્ટ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PLANT CARE & DIAGNOSIS HISTORY
         ======================================================== */}
      {modalType === "history" && selectedPlant && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <History size={14} /> તબીબી લોગ
            </p>
            <h2 style={{ margin: "4px 0 16px" }}>સંભાળ ઇતિહાસ: {selectedPlant.name}</h2>
            <p className="muted" style={{ fontSize: "12px", margin: "-10px 0 14px" }}>
              મૂળ પ્રજાતિ: <strong>{selectedPlant.originalName || selectedPlant.species}</strong>
            </p>

            {plantHistory.length === 0 ? (
              <p className="muted">આ છોડ માટે હજુ સુધી ભૂતકાળના કોઈ નિદાન નોંધાયેલ નથી.</p>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {plantHistory.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "6px",
                      padding: "14px",
                      background: "#fafaf6",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong>{item.diseaseName}</strong>
                      <span className="muted" style={{ fontSize: "11px" }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                      ચોકસાઈ: {item.confidence}% • ગંભીરતા: {item.severity}
                    </span>
                    {item.symptoms?.length > 0 && (
                      <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#545d51" }}>
                        લક્ષણો: {item.symptoms.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
