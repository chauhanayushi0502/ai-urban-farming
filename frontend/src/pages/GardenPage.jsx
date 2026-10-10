import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { api } from "../lib/api.js";
import { imageSource, money, formatNameByLanguage, formatDescriptionByLanguage, formatWeatherCondition, formatWeatherTip } from "../lib/format.js";
import { validatePlantImageFile, compressAndOptimizeImage, checkIsLikelyPlantImage, analyzePlantFoliageHealth } from "../lib/image-optimizer.js";
import GardenSynergyWidget from "../components/GardenSynergy.jsx";
import PrintableCareGuide from "../components/PrintableCareGuide.jsx";
import GardenCalendar from "../components/GardenCalendar.jsx";
import SoilPottingCalculator from "../components/SoilPottingCalculator.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Calendar, Calculator } from "lucide-react";

const SPECIES_OPTIONS = [
  { id: "Tomato", label: "Tomato", defaultInterval: 2 },
  { id: "Sweet Basil", label: "Sweet Basil", defaultInterval: 2 },
  { id: "Mint", label: "Mint", defaultInterval: 1 },
  { id: "Rose", label: "Rose", defaultInterval: 3 },
  { id: "Chili / Pepper", label: "Chili / Pepper", defaultInterval: 3 },
  { id: "Aloe Vera", label: "Aloe Vera / Succulent", defaultInterval: 12 },
  { id: "Snake Plant", label: "Snake Plant", defaultInterval: 14 },
  { id: "Money Plant", label: "Money Plant", defaultInterval: 6 },
  { id: "Peace Lily", label: "Peace Lily", defaultInterval: 3 },
  { id: "Hibiscus", label: "Hibiscus", defaultInterval: 2 },
  { id: "Houseplant", label: "Houseplant", defaultInterval: 3 },
];

export default function GardenPage({ initialTab }) {
  const { user, syncCart, settings } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();
  const [searchParams] = useSearchParams();

  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({ total: 0, needsWater: 0, diseased: 0, healthy: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeGardenTab, setActiveGardenTab] = useState(
    initialTab || searchParams.get("tab") || "plants"
  ); // 'plants' | 'calendar' | 'calculator' | 'synergy'

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
  // Step-by-Step Care Suggestion Pop-up State
  const [stepCarePlant, setStepCarePlant] = useState(null);
  const [stepCareReport, setStepCareReport] = useState(null);
  const [stepCareProducts, setStepCareProducts] = useState([]);

  // Ask AI Plant Doctor State
  const [doctorPlant, setDoctorPlant] = useState(null);
  const [doctorCustomPlant, setDoctorCustomPlant] = useState("");
  const [doctorPhoto, setDoctorPhoto] = useState(null);
  const [doctorPhotoPreview, setDoctorPhotoPreview] = useState("");
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

  // AI Auto-Add State (Plant Photo Only)
  const [aiPhoto, setAiPhoto] = useState(null);
  const [aiPreview, setAiPreview] = useState("");
  const [aiLocation, setAiLocation] = useState("balcony");
  const [aiAddBusy, setAiAddBusy] = useState(false);
  const [aiPhotoError, setAiPhotoError] = useState("");
  const [isDraggingAi, setIsDraggingAi] = useState(false);
  const [aiScanPreview, setAiScanPreview] = useState(null);
  const [userSpeciesChoice, setUserSpeciesChoice] = useState("");

  // Diagnosis Modal State
  const [diagFile, setDiagFile] = useState(null);
  const [diagPreview, setDiagPreview] = useState("");
  const [diagPlantId, setDiagPlantId] = useState("");
  const [diagSpecies, setDiagSpecies] = useState("");
  const [diagLocation, setDiagLocation] = useState("balcony");
  const [diagBusy, setDiagBusy] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [diagProducts, setDiagProducts] = useState([]);
  const [diagFileError, setDiagFileError] = useState("");
  const [isDraggingDiag, setIsDraggingDiag] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [datasetList, setDatasetList] = useState([]);
  const [datasetSearch, setDatasetSearch] = useState("");
  const [datasetCropFilter, setDatasetCropFilter] = useState("all");

  // Live Camera Capture State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null); // 'ai', 'diag', or 'doctor'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const tabParam = initialTab || searchParams.get("tab");
    if (tabParam && ["plants", "calendar", "calculator", "synergy"].includes(tabParam)) {
      setActiveGardenTab(tabParam);
    }
  }, [initialTab, searchParams]);

  useEffect(() => {
    if (!aiPhoto) {
      setAiPreview("");
      setAiScanPreview(null);
      return;
    }
    const url = URL.createObjectURL(aiPhoto);
    setAiPreview(url);
    let isCurrent = true;
    analyzePlantFoliageHealth(aiPhoto)
      .then((scan) => {
        if (isCurrent && scan) {
          setAiScanPreview(scan);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
      URL.revokeObjectURL(url);
    };
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

  useEffect(() => {
    if (!doctorPhoto) {
      setDoctorPhotoPreview("");
      return;
    }
    const url = URL.createObjectURL(doctorPhoto);
    setDoctorPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [doctorPhoto]);

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
        } else if (cameraTarget === "doctor") {
          setDoctorPhoto(file);
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
        setPlants([]);
        setStats({ total: 0, needsWater: 0, diseased: 0, healthy: 0 });
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

  // 1-Click Add Product to Cart with Toast and Cart Sync
  // 1-Click Add Product to Cart with Toast and Cart Sync
  async function handleAddProductToCart(product) {
    if (!user) {
      alert("Please sign in or create an account to add products to your cart.");
      setModalType("authPrompt");
      return notify("Please sign in to add products to your cart.", "error");
    }
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

  // AI Auto-Add Plant: Upload Photo -> Auto-Identify Real Botanical Name & Generate Care Plan
  async function handleAiAddPlant(e) {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please sign in or create an account to add plants to your garden.");
      setModalType("authPrompt");
      return;
    }
    setAiPhotoError("");

    // 1. Strict Plant Photo Validation
    const photoValidation = validatePlantImageFile(aiPhoto);
    if (!photoValidation.valid) {
      const errMsg = photoValidation.error || "Plant photo is required. Please upload or take a photo of your plant.";
      setAiPhoto(null);
      setAiPreview("");
      setAiPhotoError(errMsg);
      alert(`⚠️ Validation Error:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    const plantVerification = await checkIsLikelyPlantImage(aiPhoto);
    if (!plantVerification.isPlant) {
      const errMsg = plantVerification.reason || "The uploaded image is not a plant. Please upload a clear photo of a live plant, leaf, or flower.";
      setAiPhoto(null);
      setAiPreview("");
      setAiPhotoError(errMsg);
      alert(`⚠️ Image Verification Failed:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    setAiAddBusy(true);

    try {
      // 2. Client-side ultra-fast image compression (10x faster uploads & AI turnaround)
      const optimizedPhoto = await compressAndOptimizeImage(aiPhoto, 1200, 0.85);

      // 3. Client-side foliage turgor and health analysis
      const visualAnalysis = aiScanPreview || (await analyzePlantFoliageHealth(aiPhoto));

      const form = new FormData();
      form.append("plant_image", optimizedPhoto);
      form.append("location", aiLocation);
      if (userSpeciesChoice && userSpeciesChoice.trim()) {
        form.append("species", userSpeciesChoice.trim());
      }
      if (visualAnalysis) {
        form.append("visual_analysis", JSON.stringify(visualAnalysis));
      }

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
      setAiPreview("");
      setAiPhotoError("");
      setAiScanPreview(null);
      setUserSpeciesChoice("");

      // Open the Step-by-Step Suggestion Pop-up immediately with the identified plant name!
      setStepCarePlant(res.plant);
      setStepCareReport(res.aiReport);
      setModalType("stepWiseCare");

      notify(`Identified as ${res.plant.originalName || res.plant.species || res.plant.name}! Step-by-step care guide ready.`, "success");
    } catch (err) {
      setAiPhotoError(err.message || "Failed to identify plant.");
      notify(err.message || "Failed to identify plant. Please check your image.", "error");
    } finally {
      setAiAddBusy(false);
    }
  }

  // Open Step-by-Step Care Guide Modal for any plant card
  function openStepCareModal(plant) {
    setStepCarePlant(plant);
    const interval = plant.wateringIntervalDays || 2;
    const species = plant.originalName || plant.species || plant.name || "Urban Plant";
    const waterQty = plant.waterQuantityMl || "300ml - 400ml at root base";
    const waterSched = plant.waterScheduleAdvice || `Every ${interval} days early in the morning`;

    // Pick top matching care & compost products from nursery catalog
    const matching = (nurseryProducts || []).filter((p) => {
      const n = (p.name || "").toLowerCase();
      const c = (p.category?.name || "").toLowerCase();
      return c.includes("care") || c.includes("pot") || c.includes("seed") || n.includes("neem") || n.includes("compost") || n.includes("food") || n.includes("tonic");
    }).slice(0, 4);
    setStepCareProducts(matching.length > 0 ? matching : (nurseryProducts || []).slice(0, 4));

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
          detail: `In-app watering notifications are active for ${species} so you will never forget a watering cycle!`,
        },
      ],
    });
    setModalType("stepWiseCare");
  }

  // Open Ask AI Plant Doctor Modal (Can be opened for a specific plant or general clinic)
  function openDoctorModal(plant = null) {
    if (!user) {
      alert("Please sign in or create an account to consult the AI Plant Doctor.");
      setModalType("authPrompt");
      return;
    }
    setSelectedPlant(plant);
    setDoctorPlant(plant);
    setDoctorCustomPlant(plant ? (plant.name || plant.originalName || plant.species) : "");
    setDoctorQuestion("");
    setDoctorPhoto(null);
    setDoctorPhotoPreview("");

    const plantLabel = plant ? (plant.name || plant.originalName || plant.species) : "";
    const greeting = plant
      ? `Hello! I'm your AI Plant Doctor. Ask me anything about your ${plant.name} (Species: ${plant.originalName || plant.species}) — watering, yellow leaves, pests, or attach a photo for a live diagnosis!`
      : `Hello! I'm your AI Plant Doctor & Climate Clinic. You can select any plant or type your own custom plant name, ask any question, or upload a plant/leaf photo to diagnose issues and receive tailored organic remedies!`;

    setDoctorMessages([
      {
        role: "assistant",
        text: greeting,
      },
    ]);
    setModalType("doctor");
  }

  // Submit Question to Plant Doctor (Includes Auto-Detected Weather Context & Image Support)
  async function handleDoctorSubmit(e) {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please sign in or create an account to use the AI Plant Doctor.");
      setModalType("authPrompt");
      return;
    }
    if ((!doctorQuestion.trim() && !doctorPhoto) || doctorBusy) return;

    const photoToSubmit = doctorPhoto;
    const photoPreviewToDisplay = doctorPhotoPreview;

    if (photoToSubmit) {
      const plantVerification = await checkIsLikelyPlantImage(photoToSubmit);
      if (!plantVerification.isPlant) {
        const errMsg = plantVerification.reason || "The uploaded image is not a plant. Please upload a clear photo of a live plant, leaf, or flower.";
        setDoctorPhoto(null);
        setDoctorPhotoPreview("");
        alert(`⚠️ Image Verification Failed:\n\n${errMsg}`);
        notify(`⚠️ ${errMsg}`, "error");
        return;
      }
    }

    const q = doctorQuestion.trim() || (doctorPhoto ? "Please analyze this plant photo, diagnose any disease/pest issues, and tell me the required care and organic remedies." : "How do I take care of this plant in this weather?");

    setDoctorQuestion("");
    setDoctorPhoto(null);
    setDoctorPhotoPreview("");

    setDoctorMessages((prev) => [
      ...prev,
      { role: "user", text: q, photo: photoPreviewToDisplay },
    ]);
    setDoctorBusy(true);

    try {
      const targetPlantName = doctorCustomPlant.trim() || doctorPlant?.name || "Urban Garden Plant";
      const targetSpecies = doctorCustomPlant.trim() || doctorPlant?.species || doctorPlant?.originalName || "Houseplant";
      let res;

      if (photoToSubmit) {
        const optimizedFile = await compressAndOptimizeImage(photoToSubmit, 1200, 0.85);
        const form = new FormData();
        form.append("plant_image", optimizedFile);
        form.append("question", q);
        form.append("plantName", targetPlantName);
        form.append("plantSpecies", targetSpecies);
        form.append("originalName", targetSpecies);
        form.append("healthStatus", doctorPlant?.healthStatus || "healthy");
        form.append("currentDisease", doctorPlant?.currentDisease || "");
        form.append("weather", JSON.stringify(weather || { temperature: 28, humidity: 55, condition: "Pleasant" }));

        res = await api("/garden/ask-doctor", {
          method: "POST",
          body: form,
        });
      } else {
        res = await api("/garden/ask-doctor", {
          method: "POST",
          body: {
            question: q,
            plantName: targetPlantName,
            plantSpecies: targetSpecies,
            originalName: targetSpecies,
            healthStatus: doctorPlant?.healthStatus || "healthy",
            currentDisease: doctorPlant?.currentDisease || "",
            weather: weather || { temperature: 28, humidity: 55, condition: "Pleasant" },
          },
        });
      }

      setDoctorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer || "Maintain bright light and steady moisture, and watch for healthy new growth!",
          recommendedProducts: res.recommendedProducts || [],
        },
      ]);
    } catch (err) {
      alert(`⚠️ Error: ${err.message}`);
      notify(err.message, "error");
    } finally {
      setDoctorBusy(false);
    }
  }

  // Log watering action
  async function handleWaterPlant(plant) {
    if (!user) {
      alert("Please sign in or create an account to log watering actions.");
      setModalType("authPrompt");
      return;
    }
    try {
      await api(`/garden/plants/${plant._id}/water`, { method: "POST" });
      notify(`Watered ${plant.name}! Schedule refreshed.`, "success");
      await loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Delete plant
  async function handleDeletePlant(plantId) {
    if (!user) {
      alert("Please sign in or create an account to manage your garden.");
      setModalType("authPrompt");
      return;
    }
    if (!window.confirm("Remove this plant from your garden?")) return;
    try {
      await api(`/garden/plants/${plantId}`, { method: "DELETE" });
      notify("Plant removed.", "success");
      await loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Submit Manual Add Plant Form
  async function handleCreatePlant(e) {
    e.preventDefault();
    if (!user) {
      alert("Please sign in or create an account to add plants to your garden.");
      setModalType("authPrompt");
      return;
    }
    if (!plantForm.name.trim()) return notify("Please enter a plant name.", "error");

    try {
      await api("/garden/plants", {
        method: "POST",
        body: plantForm,
      });
      notify(`Added ${plantForm.name} to your garden!`, "success");
      setModalType(null);
      await loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Open diagnosis modal for a plant
  function openDiagnosisModal(plant = null) {
    if (!user) {
      alert("Please sign in or create an account to scan and diagnose plant leaves.");
      setModalType("authPrompt");
      return;
    }
    setSelectedPlant(plant);
    setDiagPlantId(plant ? plant._id : "");
    setDiagSpecies(plant?.species || "");
    setDiagLocation(plant?.location || "balcony");
    setDiagFile(null);
    setDiagPreview("");
    setDiagResult(null);
    setDiagProducts([]);
    setDiagFileError("");
    setModalType("diagnose");
  }

  // Run AI Leaf Disease Diagnosis
  async function handleDiagnoseSubmit(e) {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please sign in or create an account to scan and diagnose plant leaves.");
      setModalType("authPrompt");
      return;
    }
    setDiagFileError("");

    // 1. Strict Leaf Photo Validation
    const fileValidation = validatePlantImageFile(diagFile);
    if (!fileValidation.valid) {
      const errMsg = fileValidation.error || "Leaf photo is required. Please upload or snap a photo of the affected plant leaf.";
      setDiagFile(null);
      setDiagPreview("");
      setDiagResult(null);
      setDiagProducts([]);
      setDiagFileError(errMsg);
      alert(`⚠️ Validation Error:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    const plantVerification = await checkIsLikelyPlantImage(diagFile);
    if (!plantVerification.isPlant) {
      const errMsg = plantVerification.reason || "The uploaded image is not a plant or leaf. Please upload a clear photo of a plant leaf.";
      setDiagFile(null);
      setDiagPreview("");
      setDiagResult(null);
      setDiagProducts([]);
      setDiagFileError(errMsg);
      alert(`⚠️ Image Verification Failed:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    setDiagBusy(true);
    setDiagResult(null);
    setDiagProducts([]);

    try {
      // 2. Ultra-Fast Client-Side Compression for instant diagnosis
      const optimizedFile = await compressAndOptimizeImage(diagFile, 1200, 0.85);

      // 3. Client-Side Foliage & Distress Scanner
      const visualAnalysis = await analyzePlantFoliageHealth(diagFile);

      const form = new FormData();
      form.append("plant_image", optimizedFile);
      form.append("location", diagLocation);
      if (visualAnalysis) {
        form.append("visual_analysis", JSON.stringify(visualAnalysis));
      }
      if (diagPlantId && !diagPlantId.startsWith("guest-")) {
        form.append("plant_id", diagPlantId);
      }
      if (selectedPlant?.name) {
        form.append("plant_name", selectedPlant.name);
      }
      if (diagSpecies || selectedPlant?.species) {
        form.append("species", diagSpecies || selectedPlant.species);
      }

      const res = await api("/garden/diagnose", {
        method: "POST",
        body: form,
      });

      setDiagResult(res.diagnosis);
      setDiagProducts(res.recommendedProducts || []);

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

        await loadData();
      }

      notify(
        res.diagnosis.isHealthy
          ? "Analysis Complete: Plant appears healthy!"
          : `Diagnosis Complete: Detected ${res.diagnosis.diseaseName}`,
        res.diagnosis.isHealthy ? "success" : "error"
      );
    } catch (err) {
      setDiagFile(null);
      setDiagPreview("");
      setDiagResult(null);
      setDiagProducts([]);
      alert(`⚠️ Diagnosis Error:\n\n${err.message || "The uploaded image is not a plant or leaf. Please upload a clear photo of a plant leaf to diagnose."}`);
      notify(err.message, "error");
    } finally {
      setDiagBusy(false);
    }
  }

  // Open Care History Modal
  async function openHistoryModal(plant) {
    if (!user) {
      alert("Please sign in or create an account to view plant history.");
      setModalType("authPrompt");
      return;
    }
    setSelectedPlant(plant);
    setPlantHistory([]);
    setModalType("history");

    try {
      const history = await api(`/garden/plants/${plant._id}/history`);
      setPlantHistory(history || []);
    } catch (err) {
      console.error(err);
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
            {t("garden_desc", "Upload your plant leaf photo to let AI identify the botanical plant species, diagnose diseases, provide tailored care routines, and set automated reminders.")}
          </p>
        </div>
        <div className="garden-header-actions">
          <button
            className="button button-outline button-small"
            onClick={() => openDoctorModal(null)}
          >
            <HeartPulse size={15} /> {t("btn_ai_doctor", "🩺 AI Doctor & Climate Clinic")}
          </button>
          <button
            className="button button-outline button-small"
            onClick={() => openDiagnosisModal()}
          >
            <Sparkles size={15} /> {t("btn_quick_scan", "Quick Leaf Scan")}
          </button>
          <button
            className="button button-small"
            onClick={() => {
              if (!user) {
                alert("Please sign in or create an account to add plants to your garden.");
                setModalType("authPrompt");
                return;
              }
              setAddMode("ai");
              setAiPhoto(null);
              setAiPreview("");
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
            <Plus size={16} /> {t("btn_add_plant_scanner", "Add Plant (AI Photo Scanner)")}
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
              <span className="live-gps-dot" title="Live GPS & Climate Signal" />
              <div className="garden-weather-city-title">
                <MapPin size={17} color="var(--green)" />
                <span>{weather.city || (locationDetected ? t("live_gps_loc", "Live GPS Location") : t("auto_detected_climate", "Auto-Detected Climate"))}</span>
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
                      placeholder={t("search_city_placeholder", "Search city/area (e.g. Mumbai, Pune)...")}
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
                    title="Search weather for another city or locality"
                  >
                    <Search size={13} /> {t("change_city", "Change City")}
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
                    Searching locations...
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
                title="Detect live GPS location from browser"
              >
                <Navigation size={13} className={locationDetecting ? "spin" : ""} />
                {locationDetecting ? t("locating", "Locating…") : t("use_live_location", "Use My Live Location")}
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                className="button button-outline button-small"
                style={{ padding: "5px 8px" }}
                onClick={() => detectLocationAndWeather(true)}
                disabled={locationDetecting}
                title="Refresh current live weather"
              >
                <RefreshCw size={13} className={locationDetecting ? "spin" : ""} />
              </button>
            </div>
          </div>

          {/* 5 Weather Metrics Grid */}
          <div className="garden-weather-stats-row">
            <div className="garden-weather-stat-card">
              <span className="w-label"><Thermometer size={12} color="#d9534f" /> {t("weather_temp", "Temperature")}</span>
              <span className="w-val">{weather.temperature}°C</span>
              <span className="w-sub">
                {weather.minTemperature !== undefined && weather.maxTemperature !== undefined
                  ? `L: ${weather.minTemperature}° • H: ${weather.maxTemperature}°`
                  : t("live_ambient", "Live Ambient")}
              </span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Droplets size={12} color="#2b75a0" /> {t("weather_humidity", "Humidity")}</span>
              <span className="w-val">{weather.humidity}%</span>
              <span className="w-sub">{weather.humidity > 75 ? t("high_moisture", "High moisture") : t("optimal_moisture", "Optimal")}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Sun size={12} color="#f0ad4e" /> {t("weather_condition", "Condition")}</span>
              <span className="w-val" style={{ fontSize: "13px" }}>{formatWeatherCondition(weather.condition, language)}</span>
              <span className="w-sub">{weather.rainAlert ? t("rain_alert", "Rain alert") : t("gardening_friendly", "Gardening friendly")}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><CloudRain size={12} color="#5bc0de" /> {t("weather_rain", "Rainfall")}</span>
              <span className="w-val">{weather.precipitation || 0} mm</span>
              <span className="w-sub">{weather.precipitation > 0 ? t("precip_today", "Precipitation today") : t("no_rain_today", "No rain today")}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Wind size={12} color="#6c757d" /> {t("weather_wind", "Wind Speed")}</span>
              <span className="w-val">{weather.windSpeed || 8} km/h</span>
              <span className="w-sub">{t("gentle_breeze", "Gentle breeze")}</span>
            </div>
          </div>

          {/* AI Microclimate Advisory */}
          <div className="garden-weather-advice-box">
            <HeartPulse size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              <strong>{t("live_climate_advisory", "🩺 Live Climate AI Advisory:")} </strong>
              {formatWeatherTip(weather.tip, language)}
            </div>
          </div>
        </section>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="garden-overview-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_total_plants", "Total Plants")}</span>
            <Sprout size={20} />
          </div>
          <div className="stat-card-num">{stats.total}</div>
          <div className="stat-card-desc">{t("stat_active_in_garden", "Active in your garden")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_water_due_today", "Water Due Today")}</span>
            <Droplets size={20} color="#2b75a0" />
          </div>
          <div className="stat-card-num">{stats.needsWater}</div>
          <div className="stat-card-desc">
            {stats.needsWater > 0 ? t("stat_needs_hydration", "Needs hydration today") : t("stat_all_hydrated", "All plants sufficiently hydrated")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_needs_attention", "Needs Attention")}</span>
            <AlertTriangle size={20} color="var(--rust)" />
          </div>
          <div className="stat-card-num">{stats.diseased}</div>
          <div className="stat-card-desc">
            {stats.diseased > 0 ? t("stat_under_obs", "Under medical observation") : t("stat_no_diseases", "No diseases detected")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_garden_health", "Garden Health")}</span>
            <HeartPulse size={20} color="#358044" />
          </div>
          <div className="stat-card-num">
            {stats.total > 0 ? `${Math.round(((stats.healthy || 0) / stats.total) * 100)}%` : "100%"}
          </div>
          <div className="stat-card-desc">{t("stat_vitality_score", "Overall vitality score")}</div>
        </div>
      </div>

      {/* Garden Plant Cards & Tabs or Guest Showcase Banner */}
      {!user ? (
        <section className="guest-garden-preview-card" style={{
          background: "linear-gradient(135deg, #f3f9f4 0%, #e8f4eb 100%)",
          borderRadius: "12px",
          border: "1px solid #cce5d3",
          padding: "36px 24px",
          marginBottom: "36px",
          textAlign: "center"
        }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#2e7d32", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)" }}>
              <Sprout size={28} />
            </div>
            <h2 style={{ fontSize: "24px", color: "var(--foreground)", margin: "0 0 10px" }}>
              {t("unlock_smart_garden", "Unlock Your Personal AI Smart Garden")}
            </h2>
            <p className="muted" style={{ fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" }}>
              {t("unlock_smart_garden_desc", "You can view live climate data and explore all nursery products below. To add your own plants, diagnose leaf diseases with AI, consult the AI Plant Doctor, and receive automated watering alerts, please sign in to your account.")}
            </p>

            {/* 4 Feature highlight pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", textAlign: "left", marginBottom: "28px" }}>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: "8px", border: "1px solid #d4ebd8" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--green-deep)", fontSize: "14px" }}>
                  <Sparkles size={16} /> {t("feature_ai_scanner", "AI Disease Scanner")}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>{t("feature_ai_scanner_sub", "Snap leaf photos for instant pathogen analysis & organic remedies.")}</p>
              </div>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: "8px", border: "1px solid #d4ebd8" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2563eb", fontSize: "14px" }}>
                  <HeartPulse size={16} /> {t("feature_ai_doctor", "AI Plant Doctor")}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>{t("feature_ai_doctor_sub", "Ask unlimited questions tailored to your plant species & city climate.")}</p>
              </div>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: "8px", border: "1px solid #d4ebd8" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0891b2", fontSize: "14px" }}>
                  <Droplets size={16} /> {t("feature_smart_watering", "Smart Watering")}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>{t("feature_smart_watering_sub", "Get automated notifications so you never over- or under-water.")}</p>
              </div>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: "8px", border: "1px solid #d4ebd8" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", fontSize: "14px" }}>
                  <ShieldCheck size={16} /> {t("feature_care_history", "Care History Logs")}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>{t("feature_care_history_sub", "Track growth, treatments, and recoveries over time.")}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/login?redirect=/garden" className="button" style={{ padding: "10px 22px", fontSize: "14px" }}>
                {t("signin_to_access", "Sign In to Access Features")} <ArrowRight size={16} />
              </Link>
              <Link to="/register?redirect=/garden" className="button button-outline" style={{ padding: "10px 22px", fontSize: "14px" }}>
                {t("create_free_acc", "Create Free Account")}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Master Garden Tools Navigation Tabs */}
          <div className="garden-feature-nav-bar">
            <button
              type="button"
              className={`garden-feature-nav-btn ${activeGardenTab === "plants" ? "active" : ""}`}
              onClick={() => setActiveGardenTab("plants")}
            >
              <Sprout size={16} /> {t("tab_my_plants", "My Plants")} ({plants.length})
            </button>
            <button
              type="button"
              className={`garden-feature-nav-btn ${activeGardenTab === "calendar" ? "active" : ""}`}
              onClick={() => setActiveGardenTab("calendar")}
            >
              <Calendar size={16} /> {t("tab_care_calendar", "Care Calendar & Schedule")}
            </button>
            <button
              type="button"
              className={`garden-feature-nav-btn ${activeGardenTab === "calculator" ? "active" : ""}`}
              onClick={() => setActiveGardenTab("calculator")}
            >
              <Calculator size={16} /> {t("tab_soil_calc", "Soil & Potting Calculator")}
            </button>
            <button
              type="button"
              className={`garden-feature-nav-btn ${activeGardenTab === "synergy" ? "active" : ""}`}
              onClick={() => setActiveGardenTab("synergy")}
            >
              <Sparkles size={16} /> {t("tab_synergy", "Companion Synergy")}
            </button>
          </div>

          {activeGardenTab === "calendar" && (
            <div style={{ marginBottom: "36px" }}>
              <GardenCalendar plants={plants} onPlantUpdate={loadData} />
            </div>
          )}

          {activeGardenTab === "calculator" && (
            <div style={{ marginBottom: "36px" }}>
              <SoilPottingCalculator />
            </div>
          )}

          {activeGardenTab === "synergy" && (
            <div style={{ marginBottom: "36px" }}>
              <GardenSynergyWidget weather={weather} plantCount={plants.length} />
            </div>
          )}

          {activeGardenTab === "plants" && (
            <>
              <div className="garden-tabs-bar">
            <div className="garden-filter-tabs">
              <button
                className={`garden-tab-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                {t("filter_all_plants", "All Plants")} ({plants.length})
              </button>
              <button
                className={`garden-tab-btn ${filter === "needs_water" ? "active" : ""}`}
                onClick={() => setFilter("needs_water")}
              >
                {t("filter_needs_water", "Needs Water")} ({stats.needsWater})
              </button>
              <button
                className={`garden-tab-btn ${filter === "diseased" ? "active" : ""}`}
                onClick={() => setFilter("diseased")}
              >
                {t("filter_diseased", "Under Care / Diseased")} ({stats.diseased})
              </button>
              <button
                className={`garden-tab-btn ${filter === "healthy" ? "active" : ""}`}
                onClick={() => setFilter("healthy")}
              >
                {t("filter_healthy", "Healthy")} ({stats.healthy})
              </button>
            </div>

            <span className="muted" style={{ fontSize: "12px" }}>
              {plants.length} {t("plants_registered", "plants registered")}
            </span>
          </div>

          {/* Plants Grid */}
          {filteredPlants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "36px" }}>
              <Sprout size={36} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <h3>{t("no_plants_found", "No plants found in your garden")}</h3>
              <p className="muted" style={{ fontSize: "13px" }}>
                {t("no_plants_desc", "Add your plant by uploading a photo with the AI scanner above.")}
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
                          <h3>{formatNameByLanguage(plant.name, language)}</h3>
                          <div className="plant-card-species">
                            <span className="plant-card-original-badge">
                              🌱 {t("original_label", "Original:")} {formatNameByLanguage(origName, language)}
                            </span>
                            <span style={{ display: "block", marginTop: "4px", fontSize: "11px", color: "var(--muted)" }}>
                              {t("location_label", "Location:")} {plant.location || "balcony"}
                            </span>
                          </div>
                        </div>
                        <span className={`health-pill ${statusClass}`}>
                          {statusClass === "healthy" && t("health_healthy", "🟢 Healthy")}
                          {statusClass === "underwatered" && t("health_dehydrated", "⚠️ Dehydrated")}
                          {statusClass === "overwatered" && t("health_overwatered", "💧 Overwatered")}
                          {statusClass === "diseased" && t("health_diseased", "🔴 Diseased")}
                          {statusClass === "needs_attention" && t("health_needs_care", "🟡 Needs Care")}
                          {statusClass === "recovering" && t("health_recovering", "🔵 Recovering")}
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
                          <span>{t("how_much_water", "💧 How Much Water:")}</span>
                          <strong>{plant.waterQuantityMl || "300ml - 400ml"}</strong>
                        </div>
                        <div className="watering-box-row" style={{ marginTop: "4px" }}>
                          <span>{t("when_to_water", "⏰ When to Water:")}</span>
                          <strong>
                            {isDue ? (
                              <span style={{ color: "var(--rust)" }}>{t("due_today", "💧 Due Today")}</span>
                            ) : (
                              <span style={{ color: "var(--green)" }}>{plant.wateringEvaluation?.statusText || t("on_track", "✓ On Track")}</span>
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
                            <span>{t("nutrients_label", "Nutrients & Plant Food:")}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#5a4d2e", marginTop: "3px", lineHeight: "1.4" }}>
                            {plant.nutrientAdvice}
                          </div>
                        </div>
                      )}

                      {/* In-app Notification status */}
                      <div className="notification-status-tag">
                        <Bell size={12} color="var(--green)" />
                        <span>{t("reminders_active", "In-App Reminders Active ✓")}</span>
                      </div>

                      {/* IoT Moisture Reading */}
                      {moisture != null && (
                        <div className="plant-iot-bar">
                          <div className="plant-iot-label">
                            <span>{t("iot_soil_moisture", "IoT Soil Moisture:")}</span>
                            <strong>
                              {moisture}%{" "}
                              {moisture < 20 ? "(Dry)" : moisture > 70 ? "(Damp)" : "(Good)"}
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
                        <Sparkles size={14} /> {t("view_step_care", "View Step-by-Step Care Guide")}
                      </button>

                      <div className="plant-card-actions" style={{ paddingTop: "8px" }}>
                        <button
                          className="btn-water"
                          onClick={() => handleWaterPlant(plant)}
                          title="Log that you watered this plant today"
                        >
                          <Droplets size={14} /> {t("btn_watered", "Watered")}
                        </button>
                        <button
                          className="btn-scan"
                          onClick={() => openDoctorModal(plant)}
                          title="Ask AI Plant Doctor advice for this plant"
                        >
                          <MessageSquare size={14} /> {t("btn_doctor", "Doctor")}
                        </button>
                        <button
                          className="btn-mini-icon"
                          onClick={() => openDiagnosisModal(plant)}
                          title="Scan leaf for diseases"
                        >
                          <Sparkles size={14} />
                        </button>
                        <button
                          className="btn-mini-icon"
                          onClick={() => openHistoryModal(plant)}
                          title="View diagnosis & care history"
                        >
                          <History size={14} />
                        </button>
                        <button
                          className="btn-mini-icon danger"
                          onClick={() => handleDeletePlant(plant._id)}
                          title="Remove plant"
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
        </>
      )}
        </>
      )}

      {/* ========================================================
          SECTION: RECOMMENDED NURSERY PRODUCTS (CATEGORY-WISE)
         ======================================================== */}

      {/* ========================================================
          SECTION: RECOMMENDED NURSERY PRODUCTS (CATEGORY-WISE)
         ======================================================== */}
      <section className="nursery-category-section">
        <div className="nursery-section-head">
          <div>
            <p className="eyebrow">
              <ShoppingBag size={14} /> {t("nursery_catalog", "Green Leaf Nursery Catalog")}
            </p>
            <h2>{t("rec_care_products", "Recommended Care Products & Plants (Category-Wise)")}</h2>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "13px" }}>
              {t("rec_care_sub", "Organic medicines, nutrient foods, breathable planters, and healthy plants directly from our nursery.")}
            </p>
          </div>
          <Link to="/products" className="button button-outline button-small">
            {t("browse_full_shop", "Browse Full Shop")} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="nursery-cat-tabs">
          <button
            type="button"
            className={`nursery-cat-btn ${selectedCategoryTab === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategoryTab("all")}
          >
            {t("all_products", "All Products")} ({nurseryProducts.length})
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              className={`nursery-cat-btn ${selectedCategoryTab.toLowerCase() === c.name.toLowerCase() ? "active" : ""}`}
              onClick={() => setSelectedCategoryTab(c.name)}
            >
              {formatNameByLanguage(c.name, language)}
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
                  alt={formatNameByLanguage(product.name, language)}
                  className="nursery-prod-img"
                  loading="lazy"
                />
              </Link>
              <div className="nursery-prod-body">
                <span className="nursery-prod-category">
                  {formatNameByLanguage(product.category?.name || "Nursery Plant", language)}
                </span>
                <Link to={`/products/${product._id}`} className="nursery-prod-title">
                  {formatNameByLanguage(product.name, language)}
                </Link>
                <p className="nursery-prod-desc">{formatDescriptionByLanguage(product.description, language, product.name)}</p>

                <div className="nursery-prod-footer">
                  <span className="nursery-prod-price">
                    {money(product.price, settings?.currency || "₹")}
                  </span>
                  <button
                    type="button"
                    className="nursery-prod-buy-btn"
                    onClick={() => handleAddProductToCart(product)}
                  >
                    <Plus size={14} /> {t("add_to_cart", "Add to Cart")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================================
          MODAL: ADD NEW PLANT (AI PHOTO SCANNER OR MANUAL)
         ======================================================== */}
      {modalType === "add" && (
        <div className="modal-overlay" onClick={() => { stopCamera(); setModalType(null); }}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { stopCamera(); setModalType(null); }}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <Plus size={14} /> My Garden
            </p>
            <h2 style={{ margin: "4px 0 14px" }}>Add Plant to Garden</h2>

            {/* Mode Switch Tabs */}
            <div className="ai-mode-tabs">
              <button
                type="button"
                className={`ai-mode-tab ${addMode === "ai" ? "active" : ""}`}
                onClick={() => setAddMode("ai")}
              >
                ✨ AI Auto-Identify from Photo
              </button>
              <button
                type="button"
                className={`ai-mode-tab ${addMode === "manual" ? "active" : ""}`}
                onClick={() => { stopCamera(); setAddMode("manual"); }}
              >
                📝 Manual Entry
              </button>
            </div>

            {addMode === "ai" ? (
              <div>
                <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
                  Simply upload or take a photo of your plant. AI will automatically verify and identify the botanical species, fetch its real name, create a step-by-step care plan (watering, sunlight, plant food), and set up notifications so you never forget!
                </p>

                {/* Live Camera Viewfinder Box */}
                {cameraActive && cameraTarget === "ai" && (
                  <div className="camera-capture-box">
                    <video ref={videoRef} autoPlay playsInline className="camera-video" />
                    <div className="camera-actions-bar">
                      <button type="button" className="button button-small" onClick={capturePhoto}>
                        <Camera size={15} /> Snap Photo Now
                      </button>
                      <button type="button" className="button button-outline button-small" onClick={stopCamera}>
                        Cancel Camera
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
                            const err = v.error || "Invalid image file";
                            setAiPhotoError(err);
                            alert(`⚠️ File Error:\n\n${err}`);
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
                              const err = v.error || "Invalid image file";
                              setAiPhotoError(err);
                              alert(`⚠️ File Error:\n\n${err}`);
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
                          <img src={aiPreview} alt="Selected plant" />
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                            <span className="dropzone-file-pill">
                              <Leaf size={13} color="var(--green)" />
                              {aiPhoto?.name ? aiPhoto.name.slice(0, 24) : "Photo ready"}
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
                              title="Remove photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--green)", marginTop: "4px", display: "block" }}>
                            Click or drop another image to change
                          </span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={36} color={aiPhotoError ? "var(--rust)" : "var(--green)"} />
                          <strong style={{ fontSize: "13px", color: aiPhotoError ? "var(--rust)" : "var(--green-deep)" }}>
                            Upload Plant Photo *
                          </strong>
                          <span className="muted" style={{ fontSize: "11px" }}>
                            JPG, PNG, WebP · Drag & drop or click to browse
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
                          <Camera size={15} /> Open Live Camera Scanner
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label>
                      Growing Location & Exposure
                      <select
                        value={aiLocation}
                        onChange={(e) => setAiLocation(e.target.value)}
                        style={{ marginTop: "4px" }}
                      >
                        <option value="balcony">Balcony Container</option>
                        <option value="indoor">Indoor Windowsill</option>
                        <option value="terrace">Terrace Garden</option>
                        <option value="garden_bed">Outdoor Soil Bed</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <label>
                      Plant Species / Name (Optional — Auto-detected from photo if empty)
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <input
                          type="text"
                          placeholder="e.g. Tomato, Money Plant, Snake Plant, Rose, Basil... (or leave empty)"
                          value={userSpeciesChoice}
                          onChange={(e) => setUserSpeciesChoice(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) setUserSpeciesChoice(e.target.value);
                          }}
                          style={{ width: "160px" }}
                        >
                          <option value="">Quick Pick...</option>
                          <option value="Tomato">Tomato (ટામેટા)</option>
                          <option value="Money Plant">Money Plant</option>
                          <option value="Snake Plant">Snake Plant</option>
                          <option value="Sweet Basil">Basil / Tulsi (તુલસી)</option>
                          <option value="Aloe Vera">Aloe Vera (કુંવારપાઠું)</option>
                          <option value="Rose">Rose (ગુલાબ)</option>
                          <option value="Hibiscus">Hibiscus (જાસૂદ)</option>
                          <option value="Mint">Mint / Pudina (ફુદીનો)</option>
                          <option value="Chili / Pepper">Chili / Pepper (મરચાં)</option>
                          <option value="ZZ Plant">ZZ Plant</option>
                          <option value="Peace Lily">Peace Lily</option>
                          <option value="Areca Palm">Areca Palm</option>
                          <option value="Ficus Tree">Ficus Tree</option>
                        </select>
                      </div>
                    </label>
                  </div>

                  {aiScanPreview && aiPreview && (
                    <div
                      style={{
                        background:
                          aiScanPreview.healthStatus === "underwatered"
                            ? "#fffbeb"
                            : aiScanPreview.healthStatus === "diseased"
                            ? "#fef2f2"
                            : "#f0fdf4",
                        border: `1px solid ${
                          aiScanPreview.healthStatus === "underwatered"
                            ? "#fde68a"
                            : aiScanPreview.healthStatus === "diseased"
                            ? "#fecaca"
                            : "#bbf7d0"
                        }`,
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                          🔍 Live Vision Scan:
                        </strong>
                        <span className={`health-pill ${aiScanPreview.healthStatus}`}>
                          {aiScanPreview.healthStatus === "underwatered"
                            ? (aiScanPreview.isDesiccated ? "⚠️ Dried / Desiccated" : "⚠️ Dehydrated / Drooping")
                            : aiScanPreview.healthStatus === "diseased"
                            ? "🔴 Diseased"
                            : aiScanPreview.healthStatus === "needs_attention"
                            ? "🟡 Needs Care"
                            : "🟢 Healthy Vitality"}
                        </span>
                      </div>
                      <div style={{ color: "#475569", lineHeight: "1.4" }}>
                        <em>{aiScanPreview.healthDiagnosis}</em> · <span>Species will be verified by Gemini AI below</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="button full-button"
                    disabled={aiAddBusy}
                  >
                    {aiAddBusy ? "AI Identifying Botanical Name & Building Guide…" : "✨ Identify Plant & Fetch Care Guide"}
                    <Sparkles size={16} />
                  </button>
                </form>
              </div>
            ) : (
              /* Manual Entry Form */
              <form onSubmit={handleCreatePlant} className="diagnosis-form">
                <label>
                  Plant Name *
                  <input
                    required
                    placeholder="e.g. Balcony Cherry Tomato"
                    value={plantForm.name}
                    onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
                  />
                </label>

                <label>
                  Plant Species / Type
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
                    Location
                    <select
                      value={plantForm.location}
                      onChange={(e) => setPlantForm({ ...plantForm, location: e.target.value })}
                    >
                      <option value="balcony">Balcony Container</option>
                      <option value="indoor">Indoor Windowsill</option>
                      <option value="terrace">Terrace Garden</option>
                      <option value="garden_bed">Outdoor Soil Bed</option>
                    </select>
                  </label>

                  <label>
                    Pot / Container Size
                    <select
                      value={plantForm.potSize}
                      onChange={(e) => setPlantForm({ ...plantForm, potSize: e.target.value })}
                    >
                      <option value="Small (4-6 inch)">Small (4–6 inch)</option>
                      <option value="Medium (8-10 inch)">Medium (8–10 inch)</option>
                      <option value="Large (12+ inch)">Large (12+ inch)</option>
                      <option value="Raised Bed">Raised Bed / Ground</option>
                    </select>
                  </label>
                </div>

                <label>
                  Base Watering Interval (Days)
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
                  Gardener Notes (Optional)
                  <textarea
                    rows="2"
                    placeholder="e.g. Sown from seed in March, loves afternoon sun."
                    value={plantForm.notes}
                    onChange={(e) => setPlantForm({ ...plantForm, notes: e.target.value })}
                  />
                </label>

                <button type="submit" className="button full-button">
                  Save Plant to Garden
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
              <Sparkles size={14} /> AI Botanical Assistant
            </p>
            <h2 style={{ margin: "4px 0 16px" }}>Step-by-Step Care Guide</h2>

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
                  Identified Plant:
                </span>
                <h3>{stepCarePlant.name}</h3>

                <div className="stepwise-hero-tags">
                  <span className="plant-card-original-badge">
                    🌱 Species: {stepCarePlant.originalName || stepCarePlant.species}
                  </span>
                  <span className="health-pill match">
                    ✓ {stepCareReport?.confidence || 96}% Match
                  </span>
                  <span className={`health-pill ${stepCarePlant.healthStatus || "healthy"}`}>
                    {stepCarePlant.healthStatus === "underwatered"
                      ? (stepCareReport?.healthDiagnosis?.toLowerCase().includes("desiccat") ||
                         stepCareReport?.healthDiagnosis?.toLowerCase().includes("dried") ||
                         stepCarePlant.currentDisease?.toLowerCase().includes("desiccat")
                          ? "⚠️ Completely Dried / Desiccated"
                          : "⚠️ Dehydrated / Drooping Limp")
                      : stepCarePlant.healthStatus === "overwatered"
                      ? "💧 Overwatered"
                      : stepCarePlant.healthStatus === "diseased"
                      ? "🔴 Diseased / Attention Needed"
                      : stepCarePlant.healthStatus === "needs_attention"
                      ? "🟡 Stress / Nutrient Deficiency"
                      : "🟢 Healthy Vitality"}
                  </span>
                </div>
              </div>
            </div>

            {/* Health / Distress Alert Banner if Plant is Not Healthy */}
            {stepCarePlant.healthStatus && stepCarePlant.healthStatus !== "healthy" && stepCarePlant.healthStatus !== "recovering" && (
              <div
                style={{
                  background: stepCarePlant.healthStatus === "underwatered" ? "#fffbeb" : "#fef2f2",
                  border: `1px solid ${stepCarePlant.healthStatus === "underwatered" ? "#fcd34d" : "#fca5a5"}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  margin: "12px 0 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <AlertTriangle size={20} color={stepCarePlant.healthStatus === "underwatered" ? "#b45309" : "#dc2626"} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: stepCarePlant.healthStatus === "underwatered" ? "#92400e" : "#991b1b", fontSize: "13px" }}>
                    {stepCarePlant.healthStatus === "underwatered"
                      ? (stepCareReport?.healthDiagnosis?.toLowerCase().includes("desiccat") ||
                         stepCareReport?.healthDiagnosis?.toLowerCase().includes("dried") ||
                         stepCarePlant.currentDisease?.toLowerCase().includes("desiccat")
                          ? "⚠️ Plant Health Emergency: Severe Desiccation & Dried Foliage Detected"
                          : "⚠️ Plant Health Alert: Severe Foliage Drooping & Dehydration Detected")
                      : "⚠️ Plant Health Alert: Foliage Stress / Disease Symptoms Detected"}
                  </strong>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
                    {stepCareReport?.healthDiagnosis || stepCarePlant.currentDisease || stepCarePlant.healthDiagnosis || (
                      stepCarePlant.healthStatus === "underwatered"
                        ? "Loss of hydrostatic turgor pressure caused foliage to collapse limp. Follow Step 1 immediately to rehydrate and perk the leaves back upright!"
                        : "Follow the tailored care steps below to restore your plant to optimal health."
                    )}
                  </p>
                </div>
              </div>
            )}

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
            <div className="solution-products-strip">
              <div className="solution-products-head">
                <ShoppingBag size={15} color="var(--green-deep)" />
                <span>Recommended Care & Organic Nutrient Products for this Plan:</span>
              </div>
              <div className="solution-products-grid">
                {stepCareProducts.map((prod) => (
                  <div key={prod._id} className="solution-product-mini-card">
                    <img src={imageSource(prod.image)} alt={prod.name} />
                    <div className="solution-product-mini-info">
                      <h5>{prod.name}</h5>
                      <div className="solution-product-mini-price">
                        <span>{money(prod.price)}</span>
                        <button
                          type="button"
                          className="button button-small"
                          onClick={() => handleAddProductToCart(prod)}
                        >
                          <Plus size={12} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", marginTop: "16px" }}>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => openDoctorModal(stepCarePlant)}
              >
                <MessageSquare size={15} /> Ask AI Plant Doctor a Question
              </button>
              <button
                type="button"
                className="button button-small"
                onClick={() => setModalType(null)}
              >
                <Check size={15} /> Done & View in Garden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ASK AI PLANT DOCTOR & AUTO-DETECTED WEATHER CLINIC
         ======================================================== */}
      {modalType === "doctor" && (
        <div className="modal-overlay" onClick={() => { stopCamera(); setModalType(null); }}>
          <div className="modal-card doctor-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { stopCamera(); setModalType(null); }}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <HeartPulse size={14} /> AI Plant Doctor Clinic
            </p>
            <h2 style={{ margin: "4px 0 6px" }}>
              AI Plant Doctor & Climate Clinic
            </h2>

            {/* Plant Selector & Custom Name Input */}
            <div className="doctor-plant-selector-wrap">
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "3px" }}>
                  Select from Garden / Species:
                </label>
                <select
                  value={doctorPlant ? doctorPlant._id : (doctorCustomPlant ? "custom" : "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom" || val === "") {
                      setDoctorPlant(null);
                      if (val === "") setDoctorCustomPlant("");
                    } else {
                      const found = plants.find((p) => p._id === val);
                      if (found) {
                        setDoctorPlant(found);
                        setDoctorCustomPlant(found.name || found.originalName || found.species);
                      }
                    }
                  }}
                  style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--line)" }}
                >
                  <option value="">-- General Garden Consultation --</option>
                  {plants.length > 0 && (
                    <optgroup label="🌱 My Garden Plants">
                      {plants.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.originalName || p.species})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="🌿 Common Crops">
                    {SPECIES_OPTIONS.map((o) => (
                      <option key={o.id} value={`preset_${o.id}`}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">✏️ Type Custom Plant Name...</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "3px" }}>
                  Or Type Plant Name:
                </label>
                <input
                  placeholder="e.g. Cherry Tomato, Money Plant, Hibiscus"
                  value={doctorCustomPlant}
                  onChange={(e) => {
                    setDoctorCustomPlant(e.target.value);
                    setDoctorPlant(null);
                  }}
                  style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>
            </div>

            {/* Live Auto-Detected Weather & Microclimate Card */}
            {weather && (
              <div className="doctor-weather-box">
                <div className="doctor-weather-head">
                  <span className="doctor-weather-location">
                    <MapPin size={14} color="var(--green)" />
                    {weather.city || (locationDetected ? "Auto-Detected via GPS" : "Auto-Detected Local Climate")}
                  </span>
                  <button
                    type="button"
                    className="button button-outline button-small"
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={detectLocationAndWeather}
                    disabled={locationDetecting}
                    title="Refresh GPS location & live weather"
                  >
                    <RefreshCw size={11} className={locationDetecting ? "spin" : ""} />
                    {locationDetecting ? "Detecting…" : "Refresh GPS"}
                  </button>
                </div>

                <div className="doctor-weather-grid">
                  <div className="doctor-weather-metric">
                    <span>{t("weather_temp", "Temp")}</span>
                    <strong>{weather.temperature}°C</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>{t("weather_humidity_label", "Humidity")}</span>
                    <strong>{weather.humidity}%</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>{t("weather_cond_label", "Condition")}</span>
                    <strong style={{ fontSize: "12px" }}>{formatWeatherCondition(weather.condition, language)}</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>{t("weather_rain_label", "Rainfall")}</span>
                    <strong>{weather.precipitation || 0}mm</strong>
                  </div>
                </div>

                <div className="doctor-weather-advisory">
                  <strong>{t("doc_assessment", "🩺 Microclimate Doctor Assessment:")} </strong>
                  {formatWeatherTip(weather.tip, language)}
                </div>
              </div>
            )}

            {/* Live Camera Box in Doctor Clinic if active */}
            {cameraActive && cameraTarget === "doctor" && (
              <div className="camera-capture-box">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <div className="camera-actions-bar">
                  <button type="button" className="button button-small" onClick={capturePhoto}>
                    <Camera size={15} /> {t("snap_plant_photo", "Snap Plant Photo")}
                  </button>
                  <button type="button" className="button button-outline button-small" onClick={stopCamera}>
                    {t("cancel_camera", "Cancel Camera")}
                  </button>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="doctor-chat-box">
              {doctorMessages.map((msg, idx) => (
                <div key={idx} className={`doctor-msg ${msg.role}`}>
                  {msg.photo && (
                    <div style={{ marginBottom: "8px" }}>
                      <img
                        src={msg.photo}
                        alt="Attached plant"
                        style={{ maxWidth: "160px", maxHeight: "120px", borderRadius: "6px", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                  <div>{msg.text}</div>

                  {/* Recommended Products directly below solution */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="solution-products-strip">
                      <div className="solution-products-head">
                        <ShoppingBag size={13} color="var(--green-deep)" />
                        <span>Recommended Products for this Diagnosis & Care:</span>
                      </div>
                      <div className="solution-products-grid">
                        {msg.recommendedProducts.map((prod) => (
                          <div key={prod._id} className="solution-product-mini-card">
                            <img src={imageSource(prod.image)} alt={prod.name} />
                            <div className="solution-product-mini-info">
                              <h5>{prod.name}</h5>
                              <div className="solution-product-mini-price">
                                <span>{money(prod.price)}</span>
                                <button
                                  type="button"
                                  className="button button-small"
                                  onClick={() => handleAddProductToCart(prod)}
                                >
                                  <Plus size={12} /> Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {doctorBusy && (
                <div className="doctor-msg assistant">
                  <em>AI Doctor is analyzing plant symptoms, photo & local microclimate…</em>
                </div>
              )}
            </div>

            {/* Attached Photo Preview */}
            {doctorPhotoPreview && (
              <div className="doctor-photo-preview-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={doctorPhotoPreview} alt="Attached" />
                  <span>Plant photo attached ({doctorPhoto?.name?.slice(0, 20) || "photo"})</span>
                </div>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={() => {
                    setDoctorPhoto(null);
                    setDoctorPhotoPreview("");
                  }}
                  style={{ padding: "2px 6px" }}
                >
                  <X size={12} /> Remove
                </button>
              </div>
            )}

            {/* Chat Input Row with Photo & Live Camera Trigger */}
            <form onSubmit={handleDoctorSubmit} className="doctor-input-row" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label
                className="button button-outline button-small"
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 10px" }}
                title="Attach plant photo"
              >
                <UploadCloud size={15} />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const v = validatePlantImageFile(file);
                      if (v.valid) {
                        setDoctorPhoto(file);
                      } else {
                        alert(v.error);
                      }
                    }
                  }}
                />
              </label>

              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => startCamera("doctor")}
                title="Take live photo from camera"
                style={{ padding: "8px 10px" }}
              >
                <Camera size={15} />
              </button>

              <input
                placeholder={doctorPhoto ? "Ask about this plant photo (optional)..." : "Ask Doctor anything (e.g. why are leaves yellow? how much compost?)..."}
                value={doctorQuestion}
                onChange={(e) => setDoctorQuestion(e.target.value)}
              />

              <button
                type="submit"
                className="button button-small"
                disabled={doctorBusy || (!doctorQuestion.trim() && !doctorPhoto)}
              >
                Ask Doctor
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
              <Sparkles size={14} /> AI Plant Pathologist
            </p>
            <h2 style={{ margin: "4px 0 6px" }}>
              {selectedPlant ? `Diagnose: ${selectedPlant.name} (${selectedPlant.originalName || selectedPlant.species})` : "Diagnose Plant Leaf"}
            </h2>
            <p className="muted" style={{ fontSize: "12px", margin: "0 0 16px" }}>
              Upload or snap a photo of any plant leaf. AI automatically identifies the plant species and diagnoses diseases and treatment recommendations — no nickname needed.
            </p>

            {/* Live Camera Viewfinder */}
            {cameraActive && cameraTarget === "diag" && (
              <div className="camera-capture-box">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <div className="camera-actions-bar">
                  <button type="button" className="button button-small" onClick={capturePhoto}>
                    <Camera size={15} /> Snap Leaf Photo
                  </button>
                  <button type="button" className="button button-outline button-small" onClick={stopCamera}>
                    Cancel Camera
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
                        const err = v.error || "Invalid image file";
                        setDiagFile(null);
                        setDiagPreview("");
                        setDiagResult(null);
                        setDiagProducts([]);
                        setDiagFileError(err);
                        alert(`⚠️ File Error:\n\n${err}`);
                        notify(`⚠️ ${err}`, "error");
                        return;
                      }
                      checkIsLikelyPlantImage(file).then((check) => {
                        if (!check.isPlant) {
                          const err = check.reason || "The uploaded file is not a plant or leaf. Please upload a clear photo of a live plant leaf.";
                          setDiagFile(null);
                          setDiagPreview("");
                          setDiagResult(null);
                          setDiagProducts([]);
                          setDiagFileError(err);
                          alert(`⚠️ Image Verification Failed:\n\n${err}`);
                          notify(`⚠️ ${err}`, "error");
                        } else {
                          setDiagFileError("");
                          setDiagFile(file);
                        }
                      });
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
                          const err = v.error || "Invalid image file";
                          setDiagFile(null);
                          setDiagPreview("");
                          setDiagResult(null);
                          setDiagProducts([]);
                          setDiagFileError(err);
                          alert(`⚠️ File Error:\n\n${err}`);
                          notify(`⚠️ ${err}`, "error");
                          return;
                        }
                        checkIsLikelyPlantImage(file).then((check) => {
                          if (!check.isPlant) {
                            const err = check.reason || "The uploaded file is not a plant or leaf. Please upload a clear photo of a live plant leaf.";
                            setDiagFile(null);
                            setDiagPreview("");
                            setDiagResult(null);
                            setDiagProducts([]);
                            setDiagFileError(err);
                            alert(`⚠️ Image Verification Failed:\n\n${err}`);
                            notify(`⚠️ ${err}`, "error");
                          } else {
                            setDiagFileError("");
                            setDiagFile(file);
                          }
                        });
                      }
                    }}
                  />
                  {diagPreview ? (
                    <div>
                      <img src={diagPreview} alt="Leaf preview" />
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span className="dropzone-file-pill">
                          <Leaf size={13} color="var(--green)" />
                          {diagFile?.name ? diagFile.name.slice(0, 24) : "Leaf photo ready"}
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
                          title="Remove photo"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--green)", marginTop: "4px", display: "block" }}>
                        Click or drop another image to change
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={38} color={diagFileError ? "var(--rust)" : "var(--green)"} />
                      <strong style={{ fontSize: "13px", color: diagFileError ? "var(--rust)" : "var(--green-deep)" }}>
                        Upload plant or leaf photo (JPG, PNG, WebP) *
                      </strong>
                      <span className="muted" style={{ fontSize: "11px" }}>
                        Drag and drop or click to browse
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
                      <Camera size={15} /> Use Live Camera to Snap Leaf
                    </button>
                  </div>
                )}
              </div>

              {/* Plant Placement / Growing Location Selector */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                  🌱 Plant Placement / Growing Location *
                  <select
                    value={diagLocation}
                    onChange={(e) => setDiagLocation(e.target.value)}
                    style={{ marginTop: "4px", width: "100%", padding: "9px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)", background: "white" }}
                  >
                    <option value="balcony">Balcony Container (Partial / Morning Sun)</option>
                    <option value="indoor">Indoor Windowsill / Living Room</option>
                    <option value="outdoor">Outdoor Terrace / Rooftop Garden</option>
                    <option value="garden_bed">Outdoor Soil Bed / Ground</option>
                  </select>
                </label>
              </div>

              {/* Plant Species / Crop (Matched against Botanical Dataset) */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                  🌿 Plant Type / Crop (Matched against Verified Dataset)
                  <select
                    value={diagSpecies}
                    onChange={(e) => setDiagSpecies(e.target.value)}
                    style={{ marginTop: "4px", width: "100%", padding: "9px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)", background: "white" }}
                  >
                    <option value="">Auto-Detect from Image (AI Vision)</option>
                    <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                    <option value="Rose">Rose (Rosa spp.)</option>
                    <option value="Money Plant">Money Plant / Pothos</option>
                    <option value="Snake Plant">Snake Plant (Sansevieria)</option>
                    <option value="Peace Lily">Peace Lily (Spathiphyllum)</option>
                    <option value="Hibiscus">Hibiscus (Gudhal)</option>
                    <option value="Tulsi">Tulsi (Holy Basil)</option>
                    <option value="Pepper">Chili / Bell Pepper</option>
                    <option value="Urban Houseplant">Other Balcony / Houseplant</option>
                  </select>
                </label>
              </div>

              <div style={{ textAlign: "right", margin: "2px 0 10px" }}>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={async () => {
                    setShowDatasetModal(true);
                    if (!datasetList.length) {
                      try {
                        const res = await api("/garden/dataset");
                        setDatasetList(res.dataset || []);
                      } catch (err) {
                        console.warn("Dataset fetch notice:", err.message);
                      }
                    }
                  }}
                  style={{ fontSize: "11px", padding: "5px 10px" }}
                >
                  <Sparkles size={12} /> View Pathology Dataset Classes ({datasetList.length || 19}+)
                </button>
              </div>

              <button
                type="submit"
                className="button full-button"
                disabled={diagBusy}
              >
                {diagBusy ? "Analyzing Leaf Image with AI Pathologist…" : "Run AI Diagnosis"}
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Structured Diagnosis Results */}
            {diagResult && (
              <div className="diagnosis-box">
                {/* AI-Identified Plant Name Banner */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    background: "#edf5ee",
                    border: "1px solid #b8dabf",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--green)",
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Sprout size={18} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          color: "var(--green)",
                          display: "block",
                        }}
                      >
                        AI Identified Plant
                      </span>
                      <strong style={{ fontSize: "16px", color: "var(--green-deep)" }}>
                        {diagResult.identifiedPlant || selectedPlant?.name || selectedPlant?.species || "Urban Plant"}
                      </strong>
                    </div>
                  </div>
                  <span className="health-pill healthy" style={{ fontSize: "11px", padding: "4px 10px" }}>
                    ✓ Auto-Identified by AI
                  </span>
                </div>

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
                      {diagResult.isHealthy
                        ? "✓ Healthy Botanical Status"
                        : (diagResult.diseaseName?.includes("Desiccation") || diagResult.diseaseName?.includes("Wilting") || diagResult.diseaseName?.includes("Dehydration"))
                        ? "⚠️ Critical Dehydration Detected"
                        : "⚠️ Plant Health Issue Identified"}
                    </span>
                    <h3>{diagResult.diseaseName}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#545e51" }}>
                      <span>
                        Plant: <strong style={{ color: "var(--green-deep)" }}>{diagResult.identifiedPlant || selectedPlant?.name || selectedPlant?.species || "Urban Plant"}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Severity: <strong>{diagResult.severity || "Moderate"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="confidence-gauge">
                    <span style={{ fontSize: "10px", display: "block", color: "#646d60" }}>
                      AI CONFIDENCE
                    </span>
                    <strong>{diagResult.confidence || 93}%</strong>
                  </div>
                </div>

                <div className="diagnosis-sections">
                  {/* Symptoms & Causes */}
                  <div className="diagnosis-sect-card">
                    <h4>🔍 Visible Symptoms & Pathogen Triggers</h4>
                    <ul>
                      {(diagResult.symptoms || []).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                    {diagResult.causes?.length > 0 && (
                      <p style={{ marginTop: "8px" }}>
                        <strong>Causes: </strong>
                        {diagResult.causes.join(" • ")}
                      </p>
                    )}
                  </div>

                  {/* Organic & Home Treatments */}
                  <div className="diagnosis-sect-card" style={{ background: "#f5f8f3" }}>
                    <h4 style={{ color: "var(--green-deep)" }}>
                      🌿 Urban Gardener Organic & Home Remedies
                    </h4>
                    <ul>
                      {(diagResult.organicTreatment || []).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Treatment & Prevention */}
                  <div className="diagnosis-sect-card">
                    <h4>🧪 Nursery Treatment & Preventive Care</h4>
                    {diagResult.chemicalTreatment?.length > 0 && (
                      <p style={{ marginBottom: "6px" }}>
                        <strong>Protective Fungicides: </strong>
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
                      <h4 style={{ color: "#235496" }}>💧 Recommended Watering Routine</h4>
                      <p>{diagResult.wateringAdvice}</p>
                    </div>
                  )}

                  {/* Recommended Products in Nursery directly below solution */}
                  {diagProducts && diagProducts.length > 0 && (
                    <div className="solution-products-strip" style={{ margin: "14px 0 0" }}>
                      <div className="solution-products-head">
                        <ShoppingBag size={15} color="var(--green-deep)" />
                        <span>Recommended Treatment Products from Nursery:</span>
                      </div>
                      <div className="solution-products-grid">
                        {diagProducts.map((prod) => (
                          <div key={prod._id} className="solution-product-mini-card">
                            <img src={imageSource(prod.image)} alt={prod.name} />
                            <div className="solution-product-mini-info">
                              <h5>{prod.name}</h5>
                              <div className="solution-product-mini-price">
                                <span>{money(prod.price)}</span>
                                <button
                                  type="button"
                                  className="button button-small"
                                  onClick={() => handleAddProductToCart(prod)}
                                >
                                  <Plus size={12} /> Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", marginTop: "18px" }}>
                    <button
                      type="button"
                      className="button button-outline button-small"
                      onClick={() => {
                        const identifiedName = diagResult.identifiedPlant || selectedPlant?.name || "Plant";
                        openDoctorModal(selectedPlant || { name: identifiedName, species: identifiedName, originalName: identifiedName, healthStatus: diagResult.isHealthy ? "healthy" : "diseased", currentDisease: diagResult.diseaseName });
                      }}
                    >
                      <MessageSquare size={14} /> Ask Doctor About {diagResult.identifiedPlant || "This Plant"}
                    </button>
                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => setModalType(null)}
                    >
                      <Check size={14} /> Close Diagnosis
                    </button>
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
              <History size={14} /> Medical Log
            </p>
            <h2 style={{ margin: "4px 0 16px" }}>Care History: {selectedPlant.name}</h2>
            <p className="muted" style={{ fontSize: "12px", margin: "-10px 0 14px" }}>
              Original Species: <strong>{selectedPlant.originalName || selectedPlant.species}</strong>
            </p>

            {plantHistory.length === 0 ? (
              <p className="muted">No past diagnoses recorded for this plant yet.</p>
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
                      Confidence: {item.confidence}% • Severity: {item.severity}
                    </span>
                    {item.symptoms?.length > 0 && (
                      <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#545d51" }}>
                        Symptoms: {item.symptoms.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: AUTHENTICATION REQUIRED PROMPT
         ======================================================== */}
      {modalType === "authPrompt" && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card" style={{ maxWidth: "440px", textAlign: "center", padding: "32px 24px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#e8f3ea", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Sprout size={28} color="var(--green)" />
            </div>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Sign In to Use This Feature</h2>
            <p className="muted" style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "22px" }}>
              You can explore live weather and browse our nursery collection freely. To use AI Plant Doctor, diagnose leaf diseases, manage your urban garden, or buy items, please sign in to your account.
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              <Link to="/login?redirect=/garden" className="button full-button" onClick={() => setModalType(null)}>
                Sign In Now <ArrowRight size={16} />
              </Link>
              <Link to="/register?redirect=/garden" className="button button-outline full-button" onClick={() => setModalType(null)}>
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: BOTANICAL PATHOLOGY DATASET EXPLORER
         ======================================================== */}
      {showDatasetModal && (
        <div className="modal-overlay" onClick={() => setShowDatasetModal(false)}>
          <div className="modal-card modal-card-large" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDatasetModal(false)}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <Sparkles size={14} /> Certified Reference Dataset
            </p>
            <h2 style={{ margin: "4px 0 6px" }}>Botanical Pathology Dataset Explorer</h2>
            <p className="muted" style={{ fontSize: "12px", margin: "0 0 16px" }}>
              Standardized plant pathology benchmark with verified symptoms, organic remedies, and pathogen biology.
            </p>

            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search disease, pathogen, or symptoms..."
                value={datasetSearch}
                onChange={(e) => setDatasetSearch(e.target.value)}
                style={{ flex: 1, minWidth: "200px", padding: "8px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)" }}
              />
              <select
                value={datasetCropFilter}
                onChange={(e) => setDatasetCropFilter(e.target.value)}
                style={{ padding: "8px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)", background: "white" }}
              >
                <option value="all">All Crops</option>
                <option value="Tomato">Tomato</option>
                <option value="Rose">Rose</option>
                <option value="Money Plant">Money Plant</option>
                <option value="Snake Plant">Snake Plant</option>
                <option value="Peace Lily">Peace Lily</option>
                <option value="Hibiscus">Hibiscus</option>
                <option value="Tulsi">Tulsi</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: "12px", maxHeight: "450px", overflowY: "auto", paddingRight: "4px" }}>
              {datasetList
                .filter((item) => {
                  if (datasetCropFilter !== "all" && !item.crop.toLowerCase().includes(datasetCropFilter.toLowerCase())) return false;
                  if (!datasetSearch) return true;
                  const q = datasetSearch.toLowerCase();
                  return (
                    item.crop.toLowerCase().includes(q) ||
                    item.condition.toLowerCase().includes(q) ||
                    (item.scientificName && item.scientificName.toLowerCase().includes(q)) ||
                    item.symptoms.some((s) => s.toLowerCase().includes(q))
                  );
                })
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "14px",
                      background: item.isHealthy ? "#f6faf6" : "#fffcf9",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                      <div>
                        <strong style={{ fontSize: "15px", color: "var(--green-deep)" }}>
                          {item.crop}: {item.condition}
                        </strong>
                        <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", fontStyle: "italic" }}>
                          {item.scientificName}
                        </span>
                      </div>
                      <span
                        className={`health-pill ${item.isHealthy ? "healthy" : "diseased"}`}
                        style={{ fontSize: "11px" }}
                      >
                        {item.isHealthy ? "✓ Healthy Class" : `⚠️ ${item.severity} Severity`}
                      </span>
                    </div>

                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#334155" }}>
                      <strong>Symptoms:</strong>
                      <ul style={{ margin: "4px 0 8px 18px", padding: 0 }}>
                        {item.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {item.organicTreatment?.length > 0 && (
                      <div style={{ fontSize: "12px", color: "#2b6d27", background: "#f0f7f1", padding: "8px 10px", borderRadius: "6px", marginTop: "6px" }}>
                        <strong>🌱 Organic Treatment:</strong> {item.organicTreatment[0]}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
