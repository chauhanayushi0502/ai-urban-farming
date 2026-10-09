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

export function getSpeciesOptions(t) {
  return [
    { id: "Tomato", label: t("species_tomato", "Tomato"), defaultInterval: 2 },
    { id: "Sweet Basil", label: t("species_basil", "Sweet Basil"), defaultInterval: 2 },
    { id: "Mint", label: t("species_mint", "Mint"), defaultInterval: 1 },
    { id: "Rose", label: t("species_rose", "Rose"), defaultInterval: 3 },
    { id: "Chili / Pepper", label: t("species_chili", "Chili / Pepper"), defaultInterval: 3 },
    { id: "Aloe Vera", label: t("species_aloe", "Aloe Vera"), defaultInterval: 12 },
    { id: "Snake Plant", label: t("species_snake", "Snake Plant"), defaultInterval: 14 },
    { id: "Money Plant", label: t("species_money", "Money Plant"), defaultInterval: 6 },
    { id: "Peace Lily", label: t("species_peace_lily", "Peace Lily"), defaultInterval: 3 },
    { id: "Hibiscus", label: t("species_hibiscus", "Hibiscus"), defaultInterval: 2 },
    { id: "Houseplant", label: t("species_houseplant", "Houseplant"), defaultInterval: 3 },
  ];
}

export default function GardenPage() {
  const { user, syncCart, settings } = useApp();
  const { t } = useLanguage();
  const notify = useToast();

  const SPECIES_OPTIONS = getSpeciesOptions(t);

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

  // AI Add Plant (Photo + Nickname) State
  const [aiPhoto, setAiPhoto] = useState(null);
  const [aiPreview, setAiPreview] = useState("");
  const [aiNickname, setAiNickname] = useState("");
  const [aiLocation, setAiLocation] = useState("balcony");
  const [aiAddBusy, setAiAddBusy] = useState(false);
  const [aiPhotoError, setAiPhotoError] = useState("");
  const [aiNicknameError, setAiNicknameError] = useState("");
  const [isDraggingAi, setIsDraggingAi] = useState(false);

  // Leaf Diagnosis Modal State
  const [diagPlantId, setDiagPlantId] = useState("");
  const [diagSpecies, setDiagSpecies] = useState("");
  const [diagFile, setDiagFile] = useState(null);
  const [diagPreview, setDiagPreview] = useState("");
  const [diagBusy, setDiagBusy] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [diagFileError, setDiagFileError] = useState("");
  const [isDraggingDiag, setIsDraggingDiag] = useState(false);

  // Live Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState("ai");
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    loadData();
    detectLocationAndWeather(false);
  }, [user]);

  useEffect(() => {
    if (aiPhoto) {
      const url = URL.createObjectURL(aiPhoto);
      setAiPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAiPreview("");
    }
  }, [aiPhoto]);

  useEffect(() => {
    if (diagFile) {
      const url = URL.createObjectURL(diagFile);
      setDiagPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setDiagPreview("");
    }
  }, [diagFile]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api("/categories").catch(() => []),
        api("/products?limit=24").catch(() => []),
      ]);
      setCategories(catsRes || []);
      setNurseryProducts(prodsRes || []);

      if (user) {
        const [pData, sData] = await Promise.all([
          api("/garden/plants"),
          api("/garden/stats"),
        ]);
        setPlants(pData || []);
        setStats(sData || { total: 0, needsWater: 0, diseased: 0, healthy: 0 });
      } else {
        const local = localStorage.getItem("guest_plants");
        const parsed = local ? JSON.parse(local) : [];
        setPlants(parsed);
        calculateGuestStats(parsed);
      }
    } catch (err) {
      console.error("Garden load error:", err);
    } finally {
      setLoading(false);
    }
  }

  function calculateGuestStats(list) {
    const total = list.length;
    let needsWater = 0;
    let diseased = 0;
    let healthy = 0;

    list.forEach((p) => {
      if (p.wateringEvaluation?.isDue) needsWater++;
      if (p.healthStatus === "diseased" || p.healthStatus === "needs_attention") diseased++;
      else healthy++;
    });

    setStats({ total, needsWater, diseased, healthy });
  }

  // Detect Weather & Microclimate
  async function detectLocationAndWeather(forceGPS = false) {
    setLocationDetecting(true);
    try {
      if (forceGPS && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const res = await api(`/garden/weather?lat=${latitude}&lon=${longitude}`);
              setWeather(res.weather);
              setLocationDetected(true);
            } catch (err) {
              fetchDefaultWeather();
            } finally {
              setLocationDetecting(false);
            }
          },
          () => {
            fetchDefaultWeather();
            setLocationDetecting(false);
          },
          { timeout: 8000 }
        );
      } else {
        await fetchDefaultWeather();
        setLocationDetecting(false);
      }
    } catch (err) {
      fetchDefaultWeather();
      setLocationDetecting(false);
    }
  }

  async function fetchDefaultWeather() {
    try {
      const res = await api("/garden/weather");
      setWeather(res.weather);
    } catch (err) {
      setWeather({
        temperature: 28,
        humidity: 55,
        condition: "Pleasant",
        city: "Urban Nursery",
        tip: "Ideal growing conditions for indoor & balcony plants today.",
      });
    }
  }

  // Handle City Search in Weather Header
  async function handleLocationSearch(query) {
    setLocationSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const cities = [
        { id: "ahmedabad", label: "Ahmedabad, Gujarat", lat: 23.0225, lon: 72.5714 },
        { id: "mumbai", label: "Mumbai, Maharashtra", lat: 19.076, lon: 72.8777 },
        { id: "delhi", label: "Delhi / NCR", lat: 28.7041, lon: 77.1025 },
        { id: "surat", label: "Surat, Gujarat", lat: 21.1702, lon: 72.8311 },
        { id: "rajkot", label: "Rajkot, Gujarat", lat: 22.3039, lon: 70.8022 },
        { id: "vadodara", label: "Vadodara, Gujarat", lat: 22.3072, lon: 73.1812 },
        { id: "bangalore", label: "Bengaluru, Karnataka", lat: 12.9716, lon: 77.5946 },
        { id: "pune", label: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567 },
      ];
      const matched = cities.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
      setLocationSuggestions(matched.length > 0 ? matched : [{ id: "custom", label: `${query} (Search Weather)`, lat: 23.0225, lon: 72.5714 }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function selectLocation(loc) {
    setShowLocationSearch(false);
    setLocationSuggestions([]);
    setLocationSearchQuery("");
    setLocationDetecting(true);
    try {
      const res = await api(`/garden/weather?lat=${loc.lat}&lon=${loc.lon}`);
      setWeather({ ...res.weather, city: loc.label.split(",")[0] });
      setLocationDetected(true);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLocationDetecting(false);
    }
  }

  // Live Camera Controls
  async function startCamera(target = "ai") {
    setCameraTarget(target);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      notify("Camera access denied or unavailable.", "error");
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `snap-${Date.now()}.jpg`, { type: "image/jpeg" });
        if (cameraTarget === "ai") {
          setAiPhoto(file);
          setAiPhotoError("");
        } else {
          setDiagFile(file);
          setDiagFileError("");
        }
        notify("Photo snapped!", "success");
      }
      stopCamera();
    }, "image/jpeg", 0.9);
  }

  // Handle Add Product to Cart
  async function handleAddProductToCart(product) {
    if (!user) return notify(t("signed_in_cart_err", "Sign in to add items to your cart."), "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: product._id, quantity: 1 } });
      await syncCart();
      notify(`${product.name} ${t("added_to_cart_msg", "added to your cart.")}`, "success");
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Submit AI Add Plant (Photo + Nickname) Form
  async function handleAiAddPlant(e) {
    e.preventDefault();
    setAiPhotoError("");
    setAiNicknameError("");

    let hasErr = false;
    const photoValidation = validatePlantImageFile(aiPhoto);
    if (!photoValidation.valid) {
      const errMsg = photoValidation.error || "Plant photo is required.";
      setAiPhotoError(errMsg);
      hasErr = true;
    }

    if (!aiNickname.trim()) {
      setAiNicknameError("Plant nickname is required.");
      hasErr = true;
    }

    if (hasErr) {
      notify("Please provide both a plant photo and a nickname.", "error");
      return;
    }

    setAiAddBusy(true);

    try {
      const optimizedFile = await compressAndOptimizeImage(aiPhoto, 1200, 0.85);

      const form = new FormData();
      form.append("plant_image", optimizedFile);
      form.append("nickname", aiNickname.trim());
      form.append("location", aiLocation);

      const res = await api("/garden/plants/ai-add", {
        method: "POST",
        body: form,
      });

      notify(`Added ${res.plant.name} (${res.plant.species}) to your garden!`, "success");
      setModalType(null);
      setAiPhoto(null);
      setAiPreview("");
      setAiNickname("");
      await loadData();

      // Open Step-by-Step Care pop-up automatically
      openStepCareModal(res.plant, res.careReport);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setAiAddBusy(false);
    }
  }

  // Open Step-by-Step Care Pop-up Modal
  function openStepCareModal(plant, report = null) {
    setSelectedPlant(plant);
    setStepCarePlant(plant);

    const species = plant.originalName || plant.species || "Houseplant";
    setStepCareReport(report || {
      confidence: 96,
      stepWiseCare: [
        {
          stepNumber: 1,
          title: t("step1_title", "Watering Schedule"),
          headline: `Every ${plant.wateringIntervalDays || 2} days in morning`,
          schedule: "Morning routine",
          detail: plant.waterScheduleAdvice || `Water thoroughly with ${plant.waterQuantityMl || '300ml'} when top 1 inch soil dries out.`,
        },
        {
          stepNumber: 2,
          title: t("step2_title", "Sunlight & Location"),
          headline: "4-6 Hours Sunlight",
          schedule: plant.location === "balcony" ? "Balcony container" : plant.location === "indoor" ? "Indoor Window" : "Bright spot",
          detail: plant.sunlightAdvice || "Position in bright indirect light or morning sun. Avoid harsh scorching afternoon rays.",
        },
        {
          stepNumber: 3,
          title: t("step3_title", "Soil & Organic Fertilizing"),
          headline: "Bi-Weekly Nutrient Boost",
          schedule: "Every 14 days",
          detail: plant.nutrientAdvice || "Apply 1-2 tbsp organic compost, vermicompost or seaweed extract to maintain rich foliage.",
        },
        {
          stepNumber: 4,
          title: t("step4_title", "Pest & Leaf Care"),
          headline: "Weekly Inspection",
          schedule: "Weekly",
          detail: plant.protectionAdvice || "Inspect undersides of leaves weekly. Apply organic neem oil spray (5ml/L) if pests appear.",
        },
        {
          stepNumber: 5,
          title: t("step5_title", "Automated Reminders"),
          headline: "Active Reminders",
          schedule: "Scheduled",
          detail: `In-app watering notifications are active for ${plant.name} (${species}).`,
        },
      ],
    });
    setModalType("stepWiseCare");
  }

  // Open Ask AI Plant Doctor Modal
  function openDoctorModal(plant = null) {
    setSelectedPlant(plant);
    setDoctorPlant(plant);
    setDoctorQuestion("");

    const greeting = plant
      ? `Hello! I'm your AI Plant Doctor. Ask me anything about your ${plant.name} (${plant.originalName || plant.species})!`
      : `Hello! I'm your AI Plant Doctor. Ask me any question about your urban garden plants, pest treatments, soil mix, or care schedules!`;

    setDoctorMessages([{ role: "assistant", text: greeting }]);
    setModalType("doctor");
  }

  // Submit Question to Plant Doctor
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

    const fileValidation = validatePlantImageFile(diagFile);
    if (!fileValidation.valid) {
      const errMsg = fileValidation.error || "Leaf photo is required.";
      setDiagFileError(errMsg);
      alert(`⚠️ Validation Error:\n\n${errMsg}`);
      notify(`⚠️ ${errMsg}`, "error");
      return;
    }

    setDiagBusy(true);
    setDiagResult(null);

    try {
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

  const filteredPlants = plants.filter((p) => {
    if (filter === "needs_water") return p.wateringEvaluation?.isDue;
    if (filter === "diseased") return p.healthStatus === "diseased" || p.healthStatus === "needs_attention";
    if (filter === "healthy") return p.healthStatus === "healthy" || p.healthStatus === "recovering";
    return true;
  });

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

      {/* LIVE GPS LOCATION & MICROCLIMATE WEATHER BANNER */}
      {weather && (
        <section className="garden-weather-banner">
          <div className="garden-weather-top">
            <div className="garden-weather-loc-badge">
              <span className="live-gps-dot" title={t("live_gps_signal", "Live GPS Signal")} />
              <div className="garden-weather-city-title">
                <MapPin size={17} color="var(--green)" />
                <span>{weather.city || (locationDetected ? t("live_gps_loc", "Live GPS Location") : t("auto_weather", "Auto-Detected Weather"))}</span>
              </div>
            </div>

            <div className="garden-weather-controls">
              <div className="weather-search-dropdown-wrap">
                {showLocationSearch ? (
                  <div className="weather-search-input-box">
                    <Search size={14} color="var(--muted)" />
                    <input
                      type="text"
                      placeholder={t("search_city_ph", "Search city/area...")}
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
                  >
                    <Search size={13} /> {t("change_city", "Change city")}
                  </button>
                )}

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
              </div>

              <button
                type="button"
                className="button button-small"
                style={{ fontSize: "12px", padding: "5px 11px" }}
                onClick={() => detectLocationAndWeather(true)}
                disabled={locationDetecting}
              >
                <Navigation size={13} className={locationDetecting ? "spin" : ""} />
                {locationDetecting ? t("locating", "Locating…") : t("use_live_loc", "Use my live location")}
              </button>

              <button
                type="button"
                className="button button-outline button-small"
                style={{ padding: "5px 8px" }}
                onClick={() => detectLocationAndWeather(true)}
                disabled={locationDetecting}
              >
                <RefreshCw size={13} className={locationDetecting ? "spin" : ""} />
              </button>
            </div>
          </div>

          <div className="garden-weather-stats-row">
            <div className="garden-weather-stat-card">
              <span className="w-label"><Thermometer size={12} color="#d9534f" /> {t("temperature", "Temperature")}</span>
              <span className="w-val">{weather.temperature}°C</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Droplets size={12} color="#2b75a0" /> {t("humidity", "Humidity")}</span>
              <span className="w-val">{weather.humidity}%</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Sun size={12} color="#f0ad4e" /> {t("condition", "Condition")}</span>
              <span className="w-val" style={{ fontSize: "13px" }}>{weather.condition}</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><CloudRain size={12} color="#5bc0de" /> {t("rainfall", "Rainfall")}</span>
              <span className="w-val">{weather.precipitation || 0} mm</span>
            </div>

            <div className="garden-weather-stat-card">
              <span className="w-label"><Wind size={12} color="#6c757d" /> {t("wind_speed", "Wind Speed")}</span>
              <span className="w-val">{weather.windSpeed || 8} km/h</span>
            </div>
          </div>

          <div className="garden-weather-advice-box">
            <HeartPulse size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              <strong>{t("climate_advisory", "🩺 Live Climate AI Advisory:")} </strong>
              {weather.tip}
            </div>
          </div>
        </section>
      )}

      {/* Overview Stats */}
      <div className="garden-overview-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_total_plants", "Total Plants")}</span>
            <Sprout size={20} />
          </div>
          <div className="stat-card-num">{stats.total}</div>
          <div className="stat-card-desc">{t("stat_in_garden", "Active in your garden")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_water_due", "Watering Due Today")}</span>
            <Droplets size={20} color="#2b75a0" />
          </div>
          <div className="stat-card-num">{stats.needsWater}</div>
          <div className="stat-card-desc">
            {stats.needsWater > 0 ? t("stat_needs_hydration", "Needs watering today") : t("stat_hydrated", "All plants hydrated")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>{t("stat_needs_attention", "Needs Attention")}</span>
            <AlertTriangle size={20} color="var(--rust)" />
          </div>
          <div className="stat-card-num">{stats.diseased}</div>
          <div className="stat-card-desc">
            {stats.diseased > 0 ? t("stat_under_observation", "Under clinical care") : t("stat_no_diseases", "No diseases found")}
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
          <div className="stat-card-desc">{t("stat_vitality_score", "Vitality Score")}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="garden-tabs-bar">
        <div className="garden-filter-tabs">
          <button
            className={`garden-tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            {t("tab_all_plants", "All Plants")} ({plants.length})
          </button>
          <button
            className={`garden-tab-btn ${filter === "needs_water" ? "active" : ""}`}
            onClick={() => setFilter("needs_water")}
          >
            {t("tab_needs_water", "Needs Water")} ({stats.needsWater})
          </button>
          <button
            className={`garden-tab-btn ${filter === "diseased" ? "active" : ""}`}
            onClick={() => setFilter("diseased")}
          >
            {t("tab_diseased", "Under Care / Diseased")} ({stats.diseased})
          </button>
          <button
            className={`garden-tab-btn ${filter === "healthy" ? "active" : ""}`}
            onClick={() => setFilter("healthy")}
          >
            {t("tab_healthy", "Healthy")} ({stats.healthy})
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredPlants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: "8px", border: "1px solid var(--line)" }}>
          <Sprout size={36} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
          <h3>{t("no_plants_view", "No plants found in this view")}</h3>
          <p className="muted" style={{ fontSize: "13px" }}>
            {t("add_plant_instruction", "Upload a photo and nickname to add your plant.")}
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
                  {plant.image && (
                    <img src={plant.image} alt={plant.name} className="plant-card-media" />
                  )}

                  <div className="plant-card-head">
                    <div className="plant-card-title">
                      <h3>{plant.name}</h3>
                      <div className="plant-card-species">
                        <span className="plant-card-original-badge">
                          🌱 {t("original_plant_label", "Original plant:")} {origName}
                        </span>
                      </div>
                    </div>
                    <span className={`health-pill ${statusClass}`}>
                      {statusClass === "healthy" && `🟢 ${t("tab_healthy", "Healthy")}`}
                      {statusClass === "diseased" && `🔴 ${t("status_diseased", "Diseased")}`}
                      {statusClass === "needs_attention" && `🟡 ${t("status_attention", "Needs Attention")}`}
                    </span>
                  </div>

                  {plant.currentDisease && (
                    <div className="disease-alert-tag">
                      <ShieldAlert size={14} />
                      <span>{plant.currentDisease}</span>
                    </div>
                  )}

                  <div className="watering-box">
                    <div className="watering-box-row">
                      <span>{t("how_much_water", "💧 How much water:")}</span>
                      <strong>{plant.waterQuantityMl || "300ml - 400ml"}</strong>
                    </div>
                    <div className="watering-box-row" style={{ marginTop: "4px" }}>
                      <span>{t("when_to_water", "⏰ When to water:")}</span>
                      <strong>
                        {isDue ? (
                          <span style={{ color: "var(--rust)" }}>{t("due_today", "💧 Due Today")}</span>
                        ) : (
                          <span style={{ color: "var(--green)" }}>{t("on_track", "✓ On schedule")}</span>
                        )}
                      </strong>
                    </div>
                  </div>

                  {plant.nutrientAdvice && (
                    <div className="nutrient-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "#6a521a" }}>
                        <Sparkles size={13} color="#a07c2a" />
                        <span>{t("nutrients_plant_food", "Nutrients & Plant Food:")}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a4d2e", marginTop: "3px", lineHeight: "1.4" }}>
                        {plant.nutrientAdvice}
                      </div>
                    </div>
                  )}

                  <div className="notification-status-tag">
                    <Bell size={12} color="var(--green)" />
                    <span>{t("in_app_reminders_active", "In-app reminders active ✓")}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
                  <button
                    className="button button-small"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => openStepCareModal(plant)}
                  >
                    <Sparkles size={14} /> {t("btn_view_care_guide", "View Step-by-Step Care Guide")}
                  </button>

                  <div className="plant-card-actions" style={{ paddingTop: "8px" }}>
                    <button
                      className="btn-water"
                      onClick={() => handleWaterPlant(plant)}
                    >
                      <Droplets size={14} /> {t("btn_watered", "Watered")}
                    </button>
                    <button
                      className="btn-scan"
                      onClick={() => openDoctorModal(plant)}
                    >
                      <MessageSquare size={14} /> {t("btn_doctor", "Doctor")}
                    </button>
                    <button
                      className="btn-mini-icon"
                      onClick={() => openDiagnosisModal(plant)}
                    >
                      <Sparkles size={14} />
                    </button>
                    <button
                      className="btn-mini-icon danger"
                      onClick={() => handleDeletePlant(plant._id)}
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

      {/* Nursery Section */}
      <section className="nursery-category-section">
        <div className="nursery-section-head">
          <div>
            <p className="eyebrow">
              <ShoppingBag size={14} /> {t("site_name", "Green Leaf Nursery")}
            </p>
            <h2>{t("nursery_catalog_title", "Recommended Care Products & Plants")}</h2>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "13px" }}>
              {t("nursery_catalog_sub", "Organic treatments, nutrient plant food, pots, and healthy plants directly from our nursery.")}
            </p>
          </div>
          <Link to="/products" className="button button-outline button-small">
            {t("browse_full_shop", "Browse Full Shop")} <ArrowRight size={14} />
          </Link>
        </div>

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
                  {product.category?.name || t("nursery_favorite", "Nursery favorite")}
                </span>
                <Link to={`/products/${product._id}`} className="nursery-prod-title">
                  {product.name}
                </Link>

                <div className="nursery-prod-footer">
                  <span className="nursery-prod-price">
                    {money(product.price, settings?.currency || "₹")}
                  </span>
                  <button
                    type="button"
                    className="nursery-prod-buy-btn"
                    onClick={() => handleAddProductToCart(product)}
                  >
                    <Plus size={14} /> {t("add_to_cart", "Add to cart")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MODAL: ADD PLANT */}
      {modalType === "add" && (
        <div className="modal-overlay" onClick={() => { stopCamera(); setModalType(null); }}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { stopCamera(); setModalType(null); }}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <Plus size={14} /> {t("my_garden", "My Garden")}
            </p>
            <h2 style={{ margin: "4px 0 14px" }}>{t("add_plant_h2", "Add Plant to Garden")}</h2>

            <div className="ai-mode-tabs">
              <button
                type="button"
                className={`ai-mode-tab ${addMode === "ai" ? "active" : ""}`}
                onClick={() => setAddMode("ai")}
              >
                {t("ai_auto_setup_tab", "✨ AI Auto-Setup (Photo + Nickname)")}
              </button>
              <button
                type="button"
                className={`ai-mode-tab ${addMode === "manual" ? "active" : ""}`}
                onClick={() => { stopCamera(); setAddMode("manual"); }}
              >
                {t("manual_entry_tab", "📝 Manual Entry")}
              </button>
            </div>

            {addMode === "ai" ? (
              <div>
                <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
                  {t("ai_add_desc", "Upload a photo and enter a nickname. AI will detect species, build care routines, and configure reminders!")}
                </p>

                {cameraActive && cameraTarget === "ai" && (
                  <div className="camera-capture-box">
                    <video ref={videoRef} autoPlay playsInline className="camera-video" />
                    <div className="camera-actions-bar">
                      <button type="button" className="button button-small" onClick={capturePhoto}>
                        <Camera size={15} /> {t("snap_photo_now", "Snap Photo Now")}
                      </button>
                      <button type="button" className="button button-outline button-small" onClick={stopCamera}>
                        {t("cancel_camera", "Close Camera")}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAiAddPlant} className="diagnosis-form">
                  <div>
                    <label className="drag-drop-zone">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) setAiPhoto(file);
                        }}
                      />
                      {aiPreview ? (
                        <div>
                          <img src={aiPreview} alt="Selected Plant" />
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={36} color="var(--green)" />
                          <strong style={{ fontSize: "13px", color: "var(--green-deep)" }}>
                            {t("upload_photo_label", "Upload Plant Photo *")}
                          </strong>
                          <span className="muted" style={{ fontSize: "11px" }}>
                            {t("drag_drop_browse", "JPG, PNG, WebP · Drag & drop or click to browse")}
                          </span>
                        </>
                      )}
                    </label>

                    {!cameraActive && (
                      <div style={{ textAlign: "center", marginTop: "8px" }}>
                        <button
                          type="button"
                          className="button button-outline button-small"
                          onClick={() => startCamera("ai")}
                        >
                          <Camera size={15} /> {t("open_camera_scanner", "Open Live Camera Scanner")}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label>
                      {t("plant_nickname_label", "Plant Nickname *")}
                      <input
                        value={aiNickname}
                        onChange={(e) => setAiNickname(e.target.value)}
                      />
                    </label>

                    <label>
                      {t("growing_location_label", "Growing Location")}
                      <select
                        value={aiLocation}
                        onChange={(e) => setAiLocation(e.target.value)}
                      >
                        <option value="balcony">{t("loc_balcony", "Balcony Container")}</option>
                        <option value="indoor">{t("loc_indoor", "Indoor Window")}</option>
                        <option value="terrace">{t("loc_terrace", "Terrace Garden")}</option>
                        <option value="garden_bed">{t("loc_garden_bed", "Outdoor Soil")}</option>
                      </select>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="button full-button"
                    disabled={aiAddBusy}
                  >
                    {aiAddBusy ? t("identifying_busy", "AI identifying species & building guide…") : t("identify_btn", "✨ Identify Plant & Get Care Guide")}
                    <Sparkles size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleCreatePlant} className="diagnosis-form">
                <label>
                  {t("plant_nickname_or_name", "Plant Name or Nickname *")}
                  <input
                    required
                    value={plantForm.name}
                    onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
                  />
                </label>

                <label>
                  {t("plant_species_type", "Plant Species / Type")}
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

                <button type="submit" className="button full-button">
                  {t("save_plant_btn", "Save Plant to Garden")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: STEP CARE */}
      {modalType === "stepWiseCare" && stepCarePlant && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card stepwise-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>

            <p className="eyebrow">
              <Sparkles size={14} /> {t("ai_banner_eyebrow", "AI Plant Assistant")}
            </p>
            <h2 style={{ margin: "4px 0 16px" }}>{t("step_care_h2", "Step-by-Step Care Guide")}</h2>

            <div className="stepwise-hero">
              <div className="stepwise-hero-info">
                <h3>{stepCarePlant.name}</h3>
                <div className="stepwise-hero-tags">
                  <span className="plant-card-original-badge">
                    🌱 {t("original_plant_label", "Original plant:")} {stepCarePlant.originalName || stepCarePlant.species}
                  </span>
                </div>
              </div>
            </div>

            <div className="stepwise-steps-container">
              {(stepCareReport?.stepWiseCare || []).map((step) => (
                <div key={step.stepNumber} className="stepwise-step-card">
                  <div className="stepwise-step-num">{step.stepNumber}</div>
                  <div className="stepwise-step-content">
                    <div className="stepwise-step-head">
                      <h4>{step.title}</h4>
                      <span className="stepwise-step-badge">{step.headline || step.schedule}</span>
                    </div>
                    <p className="stepwise-step-detail">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", marginTop: "16px" }}>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => openDoctorModal(stepCarePlant)}
              >
                <MessageSquare size={15} /> {t("ask_doctor_question_btn", "Ask AI Plant Doctor")}
              </button>
              <button
                type="button"
                className="button button-small"
                onClick={() => setModalType(null)}
              >
                <Check size={15} /> {t("done_view_garden_btn", "Done & View Garden")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOCTOR */}
      {modalType === "doctor" && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card doctor-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <HeartPulse size={14} /> {t("doctor_clinic_h2", "AI Plant Doctor Clinic")}
            </p>
            <h2 style={{ margin: "4px 0 6px" }}>
              {doctorPlant ? `${t("btn_doctor", "Doctor")}: ${doctorPlant.name}` : t("doctor_clinic_h2", "AI Plant Doctor & Clinic")}
            </h2>

            <div className="doctor-chat-box">
              {doctorMessages.map((msg, idx) => (
                <div key={idx} className={`doctor-msg ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {doctorBusy && (
                <div className="doctor-msg assistant">
                  <em>{t("identifying_busy", "AI Doctor is analyzing plant symptoms…")}</em>
                </div>
              )}
            </div>

            <form onSubmit={handleDoctorSubmit} className="doctor-input-row">
              <input
                required
                placeholder={t("ask_doctor_placeholder", "Ask a question about your plant care…")}
                value={doctorQuestion}
                onChange={(e) => setDoctorQuestion(e.target.value)}
              />
              <button type="submit" className="button button-small" disabled={doctorBusy || !doctorQuestion.trim()}>
                {t("ask_doctor_submit", "Ask Question")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIAGNOSE LEAF */}
      {modalType === "diagnose" && (
        <div className="modal-overlay" onClick={() => { stopCamera(); setModalType(null); }}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { stopCamera(); setModalType(null); }}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <Sparkles size={14} /> {t("ai_pathologist_eyebrow", "AI Plant Pathologist")}
            </p>
            <h2 style={{ margin: "4px 0 14px" }}>
              {selectedPlant ? `${t("diagnose_h2", "Diagnose Leaf")}: ${selectedPlant.name}` : t("diagnose_h2", "Diagnose Leaf")}
            </h2>

            <form onSubmit={handleDiagnoseSubmit} className="diagnosis-form">
              <div>
                <label className="drag-drop-zone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) setDiagFile(file);
                    }}
                  />
                  {diagPreview ? (
                    <div>
                      <img src={diagPreview} alt="Leaf Preview" />
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={38} color="var(--green)" />
                      <strong style={{ fontSize: "13px", color: "var(--green-deep)" }}>
                        {t("upload_leaf_label", "Upload plant or leaf photo (JPG, PNG, WebP) *")}
                      </strong>
                    </>
                  )}
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  {t("plant_species_type", "Plant Species / Type")}
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
              </div>

              <button
                type="submit"
                className="button full-button"
                disabled={diagBusy}
              >
                {diagBusy ? t("analyzing_leaf_busy", "AI Pathologist is analyzing…") : t("run_ai_diagnosis", "Run AI Diagnosis")}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
