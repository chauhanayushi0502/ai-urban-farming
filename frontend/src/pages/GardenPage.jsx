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
} from "lucide-react";
import { useToast, useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

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

export default function GardenPage() {
  const { user, syncCart, settings } = useApp();
  const notify = useToast();

  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({ total: 0, needsWater: 0, diseased: 0, healthy: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Auto-Detected Weather & Microclimate State
  const [weather, setWeather] = useState(null);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

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

  // Diagnosis Modal State
  const [diagFile, setDiagFile] = useState(null);
  const [diagPreview, setDiagPreview] = useState("");
  const [diagPlantId, setDiagPlantId] = useState("");
  const [diagSpecies, setDiagSpecies] = useState("");
  const [diagBusy, setDiagBusy] = useState(false);
  const [diagResult, setDiagResult] = useState(null);

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
  async function detectLocationAndWeather() {
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
          } catch (err) {
            console.warn("Weather fetch error with GPS:", err);
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
          } catch (e) {
            console.warn(e);
          } finally {
            setLocationDetecting(false);
          }
        },
        { timeout: 8000 }
      );
    } else {
      try {
        const data = await api("/garden/weather");
        setWeather(data);
      } catch (e) {
        console.warn(e);
      } finally {
        setLocationDetecting(false);
      }
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
        } else if (cameraTarget === "diag") {
          setDiagFile(file);
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
    if (!aiPhoto) return notify("Please upload or take a plant photo first.", "error");
    if (!aiNickname.trim()) return notify("Please give your plant a nickname (e.g. Tommy).", "error");

    setAiAddBusy(true);

    try {
      const form = new FormData();
      form.append("plant_image", aiPhoto);
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
    if (!diagFile) return notify("Please select or capture a leaf photo.", "error");

    setDiagBusy(true);
    setDiagResult(null);

    try {
      const form = new FormData();
      form.append("plant_image", diagFile);
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
            <Sprout size={15} /> Urban Agriculture & AI Care
          </p>
          <h1>AI Plant Doctor & Garden Assistant</h1>
          <p>
            Upload your plant photo and nickname to instantly get the original botanical name, step-by-step care routines, and automated reminders.
          </p>
        </div>
        <div className="garden-header-actions">
          <button
            className="button button-outline button-small"
            onClick={() => openDoctorModal(null)}
          >
            <HeartPulse size={15} /> 🩺 AI Doctor & Climate Clinic
          </button>
          <button
            className="button button-outline button-small"
            onClick={() => openDiagnosisModal()}
          >
            <Sparkles size={15} /> Quick Leaf Scan
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
            <Plus size={16} /> Add Plant (Photo & Nickname)
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="garden-overview-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Total Plants</span>
            <Sprout size={20} />
          </div>
          <div className="stat-card-num">{stats.total}</div>
          <div className="stat-card-desc">Active in your garden</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Water Due Today</span>
            <Droplets size={20} color="#2b75a0" />
          </div>
          <div className="stat-card-num">{stats.needsWater}</div>
          <div className="stat-card-desc">
            {stats.needsWater > 0 ? "Needs hydration today" : "All plants sufficiently hydrated"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Needs Attention</span>
            <AlertTriangle size={20} color="var(--rust)" />
          </div>
          <div className="stat-card-num">{stats.diseased}</div>
          <div className="stat-card-desc">
            {stats.diseased > 0 ? "Under medical observation" : "No diseases detected"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Garden Health</span>
            <HeartPulse size={20} color="#358044" />
          </div>
          <div className="stat-card-num">
            {stats.total > 0 ? `${Math.round(((stats.healthy || 0) / stats.total) * 100)}%` : "100%"}
          </div>
          <div className="stat-card-desc">Overall vitality score</div>
        </div>
      </div>

      {/* Garden Plant Cards & Tabs */}
      <div className="garden-tabs-bar">
        <div className="garden-filter-tabs">
          <button
            className={`garden-tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Plants ({plants.length})
          </button>
          <button
            className={`garden-tab-btn ${filter === "needs_water" ? "active" : ""}`}
            onClick={() => setFilter("needs_water")}
          >
            Needs Water ({stats.needsWater})
          </button>
          <button
            className={`garden-tab-btn ${filter === "diseased" ? "active" : ""}`}
            onClick={() => setFilter("diseased")}
          >
            Under Care / Diseased ({stats.diseased})
          </button>
          <button
            className={`garden-tab-btn ${filter === "healthy" ? "active" : ""}`}
            onClick={() => setFilter("healthy")}
          >
            Healthy ({stats.healthy})
          </button>
        </div>

        <span className="muted" style={{ fontSize: "12px" }}>
          {plants.length} plant{plants.length !== 1 ? "s" : ""} registered
        </span>
      </div>

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: "8px", border: "1px solid var(--line)" }}>
          <Sprout size={36} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
          <h3>No plants found in this view</h3>
          <p className="muted" style={{ fontSize: "13px" }}>
            Add your plant by uploading a photo and giving it a nickname.
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
                          🌱 Original: {origName}
                        </span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "11px", color: "var(--muted)" }}>
                          Location: {plant.location || "balcony"}
                        </span>
                      </div>
                    </div>
                    <span className={`health-pill ${statusClass}`}>
                      {statusClass === "healthy" && "🟢 Healthy"}
                      {statusClass === "diseased" && "🔴 Diseased"}
                      {statusClass === "needs_attention" && "🟡 Needs Care"}
                      {statusClass === "recovering" && "🔵 Recovering"}
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
                      <span>💧 How Much Water:</span>
                      <strong>{plant.waterQuantityMl || "300ml - 400ml"}</strong>
                    </div>
                    <div className="watering-box-row" style={{ marginTop: "4px" }}>
                      <span>⏰ When to Water:</span>
                      <strong>
                        {isDue ? (
                          <span style={{ color: "var(--rust)" }}>💧 Due Today</span>
                        ) : (
                          <span style={{ color: "var(--green)" }}>{plant.wateringEvaluation?.statusText || "✓ On Track"}</span>
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
                        <span>Nutrients & Plant Food:</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a4d2e", marginTop: "3px", lineHeight: "1.4" }}>
                        {plant.nutrientAdvice}
                      </div>
                    </div>
                  )}

                  {/* In-app Notification status */}
                  <div className="notification-status-tag">
                    <Bell size={12} color="var(--green)" />
                    <span>In-App Reminders Active ✓</span>
                  </div>

                  {/* IoT Moisture Reading */}
                  {moisture != null && (
                    <div className="plant-iot-bar">
                      <div className="plant-iot-label">
                        <span>IoT Soil Moisture:</span>
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
                    <Sparkles size={14} /> View Step-by-Step Care Guide
                  </button>

                  <div className="plant-card-actions" style={{ paddingTop: "8px" }}>
                    <button
                      className="btn-water"
                      onClick={() => handleWaterPlant(plant)}
                      title="Log that you watered this plant today"
                    >
                      <Droplets size={14} /> Watered
                    </button>
                    <button
                      className="btn-scan"
                      onClick={() => openDoctorModal(plant)}
                      title="Ask AI Plant Doctor advice for this plant"
                    >
                      <MessageSquare size={14} /> Doctor
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

      {/* ========================================================
          SECTION: RECOMMENDED NURSERY PRODUCTS (CATEGORY-WISE)
         ======================================================== */}
      <section className="nursery-category-section">
        <div className="nursery-section-head">
          <div>
            <p className="eyebrow">
              <ShoppingBag size={14} /> Green Leaf Nursery Catalog
            </p>
            <h2>Recommended Care Products & Plants (Category-Wise)</h2>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "13px" }}>
              Organic medicines, nutrient foods, breathable planters, and healthy plants directly from our nursery.
            </p>
          </div>
          <Link to="/products" className="button button-outline button-small">
            Browse Full Shop <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="nursery-cat-tabs">
          <button
            type="button"
            className={`nursery-cat-btn ${selectedCategoryTab === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategoryTab("all")}
          >
            All Products ({nurseryProducts.length})
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
                  {product.category?.name || "Nursery Plant"}
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
                    <Plus size={14} /> Add to Cart
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
                ✨ AI Auto-Setup (Photo + Nickname only)
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
                  Upload a photo of your plant and enter a nickname. AI will identify the original plant name, create a step-by-step care plan (watering, sunlight, plant food), and set up notifications so you never forget!
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
                    <label className="drag-drop-zone">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={(e) => setAiPhoto(e.target.files?.[0] || null)}
                      />
                      {aiPreview ? (
                        <>
                          <img src={aiPreview} alt="Selected plant" />
                          <span style={{ fontSize: "11px", color: "var(--green)" }}>
                            Click to change photo
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={36} color="var(--green)" />
                          <strong style={{ fontSize: "13px" }}>Upload Plant Photo *</strong>
                          <span className="muted" style={{ fontSize: "11px" }}>
                            JPG, PNG, WebP · Drag & drop or browse
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
                          <Camera size={15} /> Open Live Camera Scanner
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label>
                      Plant Nickname *
                      <input
                        required
                        placeholder="e.g. Tommy, Greenie, Sunny Mint"
                        value={aiNickname}
                        onChange={(e) => setAiNickname(e.target.value)}
                      />
                    </label>

                    <label>
                      Growing Location
                      <select
                        value={aiLocation}
                        onChange={(e) => setAiLocation(e.target.value)}
                      >
                        <option value="balcony">Balcony Container</option>
                        <option value="indoor">Indoor Windowsill</option>
                        <option value="terrace">Terrace Garden</option>
                        <option value="garden_bed">Outdoor Soil Bed</option>
                      </select>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="button full-button"
                    disabled={aiAddBusy || !aiPhoto || !aiNickname.trim()}
                  >
                    {aiAddBusy ? "AI Identifying Plant & Building Step-by-Step Guide…" : "✨ Identify Plant & Get Step-by-Step Care Guide"}
                    <Sparkles size={16} />
                  </button>
                </form>
              </div>
            ) : (
              /* Manual Entry Form */
              <form onSubmit={handleCreatePlant} className="diagnosis-form">
                <label>
                  Plant Nickname or Name *
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
                  Nickname:
                </span>
                <h3>{stepCarePlant.name}</h3>

                <div className="stepwise-hero-tags">
                  <span className="plant-card-original-badge">
                    🌱 Original Plant: {stepCarePlant.originalName || stepCarePlant.species}
                  </span>
                  <span className="health-pill healthy">
                    ✓ {stepCareReport?.confidence || 96}% Match
                  </span>
                  <span className="health-pill healthy">
                    🟢 {stepCarePlant.healthStatus || "Healthy"}
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
                <span>Recommended Care Products from Nursery:</span>
              </div>
              <div className="stepwise-products-pills">
                <Link to="/products?q=neem" className="stepwise-prod-pill">
                  🌿 Organic Cold-Pressed Neem Spray
                </Link>
                <Link to="/products?q=fertilizer" className="stepwise-prod-pill">
                  🧪 Seaweed & Vermicompost Plant Food
                </Link>
                <Link to="/products?q=potting" className="stepwise-prod-pill">
                  🪴 Aerated Organic Potting Mix
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
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card doctor-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalType(null)}>
              <X size={18} />
            </button>
            <p className="eyebrow">
              <HeartPulse size={14} /> AI Plant Doctor Clinic
            </p>
            <h2 style={{ margin: "4px 0 6px" }}>
              {doctorPlant ? `Consult Doctor: ${doctorPlant.name}` : "AI Plant Doctor & Climate Clinic"}
            </h2>
            {doctorPlant && (
              <p className="muted" style={{ fontSize: "12px", margin: "0 0 14px" }}>
                Original Plant: <strong>{doctorPlant.originalName || doctorPlant.species}</strong> • Health: {doctorPlant.healthStatus}
              </p>
            )}

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
                    <span>Temp</span>
                    <strong>{weather.temperature}°C</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>Humidity</span>
                    <strong>{weather.humidity}%</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>Condition</span>
                    <strong style={{ fontSize: "12px" }}>{weather.condition}</strong>
                  </div>
                  <div className="doctor-weather-metric">
                    <span>Rainfall</span>
                    <strong>{weather.precipitation || 0}mm</strong>
                  </div>
                </div>

                <div className="doctor-weather-advisory">
                  <strong>🩺 Microclimate Doctor Assessment: </strong>
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
                  <em>AI Doctor is analyzing plant symptoms & local microclimate…</em>
                </div>
              )}
            </div>

            <form onSubmit={handleDoctorSubmit} className="doctor-input-row">
              <input
                required
                placeholder="e.g. Why are lower leaves turning yellow in this heat?"
                value={doctorQuestion}
                onChange={(e) => setDoctorQuestion(e.target.value)}
              />
              <button type="submit" className="button button-small" disabled={doctorBusy || !doctorQuestion.trim()}>
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
            <h2 style={{ margin: "4px 0 14px" }}>
              {selectedPlant ? `Diagnose: ${selectedPlant.name} (${selectedPlant.originalName || selectedPlant.species})` : "Diagnose Plant Leaf"}
            </h2>

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
                <label className="drag-drop-zone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={(e) => setDiagFile(e.target.files?.[0] || null)}
                  />
                  {diagPreview ? (
                    <>
                      <img src={diagPreview} alt="Leaf preview" />
                      <span style={{ fontSize: "11px", color: "var(--green)" }}>
                        Click to change photo
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={38} color="var(--green)" />
                      <strong style={{ fontSize: "13px" }}>
                        Upload plant or leaf photo (JPG, PNG, WebP)
                      </strong>
                      <span className="muted" style={{ fontSize: "11px" }}>
                        Drag and drop or browse to upload
                      </span>
                    </>
                  )}
                </label>

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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  Plant Species / Type
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
                  Link to Garden Plant
                  <select
                    value={diagPlantId}
                    onChange={(e) => {
                      setDiagPlantId(e.target.value);
                      const found = plants.find((p) => p._id === e.target.value);
                      if (found) setSelectedPlant(found);
                    }}
                  >
                    <option value="">-- Quick Scan (Not linked) --</option>
                    {plants.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Original: {p.originalName || p.species})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="button full-button"
                disabled={diagBusy || !diagFile}
              >
                {diagBusy ? "Analyzing Leaf Image with AI Pathologist…" : "Run AI Diagnosis"}
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
                      {diagResult.isHealthy ? "✓ Healthy Botanical Status" : "⚠️ Pathogen Identified"}
                    </span>
                    <h3>{diagResult.diseaseName}</h3>
                    <span style={{ fontSize: "12px", color: "#545e51" }}>
                      Severity: <strong>{diagResult.severity || "Moderate"}</strong>
                    </span>
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

                  {/* Recommended Products in Nursery */}
                  <div className="stepwise-nursery-strip" style={{ margin: "10px 0 0" }}>
                    <div className="stepwise-nursery-head">
                      <ShoppingBag size={16} color="#8a6616" />
                      <span>Recommended Treatment Products from Nursery:</span>
                    </div>
                    <div className="stepwise-products-pills">
                      <Link to="/products?q=neem" className="stepwise-prod-pill">
                        🌿 Organic Cold-Pressed Neem Spray
                      </Link>
                      <Link to="/products?q=fungicide" className="stepwise-prod-pill">
                        🛡️ Bio-Fungicide Powder
                      </Link>
                      <Link to="/products?q=fertilizer" className="stepwise-prod-pill">
                        🧪 Organic Plant Food & Vermicompost
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

    </main>
  );
}
