import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Droplets,
  CloudRain,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sprout,
  ArrowRight,
  Maximize2,
  Leaf,
  Layers,
  Plus,
  Trash2,
  Sliders,
  Check,
  Zap,
  HelpCircle,
  X,
  ShoppingBag,
} from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

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

export function getBotanicalImageForPlant(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("strawberr")) return "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80";
  if (n.includes("borag")) return "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80";
  if (n.includes("tomat")) return "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80";
  if (n.includes("basil")) return "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&q=80";
  if (n.includes("mint") || n.includes("spearmint") || n.includes("pudina")) return "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80";
  if (n.includes("rose") && !n.includes("rosemary")) return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80";
  if (n.includes("marigold") || n.includes("genda")) return "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=400&q=80";
  if (n.includes("lavender") || n.includes("lavendar")) return "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=400&q=80";
  if (n.includes("chili") || n.includes("chilli") || n.includes("chilly") || n.includes("pepper") || n.includes("mirch")) return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80";
  if (n.includes("bonsai") || n.includes("bonzai")) return "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=400&q=80";
  if (n.includes("rubber") || n.includes("ficus elastica")) return "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80";
  if (n.includes("snake") || n.includes("sansevieria")) return "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?w=400&q=80";
  if (n.includes("money") || n.includes("pothos")) return "https://images.unsplash.com/photo-1597055181300-e3633a917c9c?w=400&q=80";
  if (n.includes("peace lily") || n.includes("peacelily")) return "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=400&q=80";
  if (n.includes("aloe")) return "https://images.unsplash.com/photo-1567689574106-324cc98b6072?w=400&q=80";
  if (n.includes("cucumb")) return "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80";
  if (n.includes("spinach") || n.includes("spinich") || n.includes("palak")) return "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80";
  if (n.includes("garlic") || n.includes("lahsun")) return "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&q=80";
  if (n.includes("dill")) return "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80";
  if (n.includes("radish") || n.includes("mooli")) return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80";
  if (n.includes("monstera") || n.includes("monstara")) return "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80";
  if (n.includes("ficus")) return "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80";
  if (n.includes("hibiscus") || n.includes("hibicus")) return "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=400&q=80";
  return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80";
}

export const DEFAULT_COMPANION_MATRIX = [
  {
    id: "tomato",
    name: "Tomato",
    species: "Solanum lycopersicum",
    goodNeighbors: ["Sweet Basil", "Marigold", "Chili / Pepper", "Parsley"],
    badNeighbors: ["Fennel", "Potato", "Cabbage / Brassicas"],
    synergyScore: 98,
    synergyBadge: "🍅 Organic Pest Deterrence",
    whyItWorks: "Sweet Basil deters tomato hornworms and whiteflies with natural aromatic essential oils, while Marigold root exudates suppress nematodes.",
    potRecommendation: "12-14 inch deep aeration pot (15-20 Liters)",
    waterNeedPerWeekLiters: 4.5,
    repottingIntervalMonths: 6,
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80",
    isCustom: false,
  },
  {
    id: "basil",
    name: "Sweet Basil",
    species: "Ocimum basilicum",
    goodNeighbors: ["Tomato", "Chili / Pepper", "Oregano", "Marigold"],
    badNeighbors: ["Rue", "Fennel", "Common Sage"],
    synergyScore: 95,
    synergyBadge: "🌿 Aromatic Terpenoid Shield",
    whyItWorks: "Basil releases fragrant essential oils that repel thrips, aphids, and flies, protecting neighboring nightshades.",
    potRecommendation: "6-8 inch pot with bottom drainage",
    waterNeedPerWeekLiters: 1.8,
    repottingIntervalMonths: 4,
    image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&q=80",
    isCustom: false,
  },
  {
    id: "chili",
    name: "Chili / Pepper",
    species: "Capsicum annuum",
    goodNeighbors: ["Sweet Basil", "Rose", "Marigold", "Onion / Garlic"],
    badNeighbors: ["Fennel", "Kohlrabi", "Pole Beans"],
    synergyScore: 93,
    synergyBadge: "🌶️ Soil Grub Defense",
    whyItWorks: "Capsaicin roots deter harmful soil grubs and pests. Shares identical light and drainage preferences with herbs.",
    potRecommendation: "10-12 inch terracotta container",
    waterNeedPerWeekLiters: 3.2,
    repottingIntervalMonths: 8,
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80",
    isCustom: false,
  },
  {
    id: "snake_plant",
    name: "Snake Plant",
    species: "Sansevieria trifasciata",
    goodNeighbors: ["ZZ Plant", "Aloe Vera", "Money Plant / Pothos"],
    badNeighbors: ["High-moisture Ferns", "Calathea"],
    synergyScore: 96,
    synergyBadge: "🪴 Drought Harmony",
    whyItWorks: "Both Snake Plant and ZZ Plant thrive on low watering cycles (every 10-14 days) and shared indirect light.",
    potRecommendation: "8-10 inch heavy ceramic planter to avoid tipping",
    waterNeedPerWeekLiters: 0.5,
    repottingIntervalMonths: 18,
    image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?w=400&q=80",
    isCustom: false,
  },
  {
    id: "money_plant",
    name: "Money Plant (Devil's Ivy)",
    species: "Epipremnum aureum",
    goodNeighbors: ["Peace Lily", "Areca Palm", "Snake Plant"],
    badNeighbors: ["Desert Cacti (Opposite watering needs)"],
    synergyScore: 94,
    synergyBadge: "🍃 Canopy Shade Harmony",
    whyItWorks: "Climbing trailing foliage creates a dappled canopy that shades delicate lower-light Peace Lilies from sunburn.",
    potRecommendation: "8-10 inch hanging pot or moss pole container",
    waterNeedPerWeekLiters: 1.2,
    repottingIntervalMonths: 12,
    image: "https://images.unsplash.com/photo-1597055181300-e3633a917c9c?w=400&q=80",
    isCustom: false,
  },
  {
    id: "rose",
    name: "Rose (Garden Specimen)",
    species: "Rosa chinensis",
    goodNeighbors: ["Marigold", "Chili / Pepper", "Lavender", "Garlic"],
    badNeighbors: ["Dense invasive groundcovers"],
    synergyScore: 91,
    synergyBadge: "🌹 Aphid & Fungal Barrier",
    whyItWorks: "Aromatic companion roots and flowers shield rose stems against aphids, mites, and black spot spores.",
    potRecommendation: "14-16 inch glazed planter with compost mix",
    waterNeedPerWeekLiters: 5.0,
    repottingIntervalMonths: 12,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    isCustom: false,
  },
  {
    id: "mint",
    name: "Spearmint / Peppermint",
    species: "Mentha spicata",
    goodNeighbors: ["Cabbage", "Kale", "Tomato", "Carrots"],
    badNeighbors: ["Parsley", "Chamomile"],
    synergyScore: 92,
    synergyBadge: "🌱 Moth & Beetle Repellent",
    whyItWorks: "Strong mint scent masks crops from cabbage moths, aphids, and flea beetles. Best kept in dedicated pots due to vigorous root spread.",
    potRecommendation: "8-10 inch shallow, wide planter with drainage",
    waterNeedPerWeekLiters: 2.8,
    repottingIntervalMonths: 6,
    image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80",
    isCustom: false,
  },
  {
    id: "bonsai_tree",
    name: "Bonsai Tree",
    species: "Bonsai Specimen (Ficus / Juniper)",
    goodNeighbors: ["Cushion Moss", "Miniature Sedum", "Thyme (adjacent pot)", "Sweet Alyssum"],
    badNeighbors: ["Chili Pepper (same pot)", "Tomato (same pot)", "Aggressive Climbing Vines", "Deep Taproots"],
    synergyScore: 92,
    synergyBadge: "🪴 Miniature Architectural Harmony",
    whyItWorks: "Bonsai trees flourish with shallow aeration and bright filtered light. Compact companion mosses regulate surface humidity without competing for root depth.",
    potRecommendation: "Shallow glazed ceramic bonsai tray with Akadama mix (dedicated container)",
    waterNeedPerWeekLiters: 1.2,
    repottingIntervalMonths: 24,
    image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=400&q=80",
    isCustom: false,
  },
];

export default function GardenSynergyWidget({ weather, plantCount = 0 }) {
  const { user } = useApp();
  const notify = useToast();

  // Custom plants loaded from localStorage
  const [customPlants, setCustomPlants] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_companion_matrix");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allPlants = [...DEFAULT_COMPANION_MATRIX, ...customPlants];

  const [selectedPlantId, setSelectedPlantId] = useState("tomato");
  const [balconyAreaSqFt, setBalconyAreaSqFt] = useState(40);
  const [useManualCount, setUseManualCount] = useState(false);
  const [manualPlantCount, setManualPlantCount] = useState(plantCount || 4);
  const [customRainfallMm, setCustomRainfallMm] = useState("");

  // 2-Plant Synergy Checker State
  const [testerMode, setTesterMode] = useState("dropdown"); // 'dropdown' | 'manual'
  const [testerPlantA, setTesterPlantA] = useState("tomato");
  const [testerPlantB, setTesterPlantB] = useState("basil");
  const [testerManualA, setTesterManualA] = useState("Tomato");
  const [testerManualB, setTesterManualB] = useState("Sweet Basil");
  const [aiPairingResult, setAiPairingResult] = useState(null);
  const [testingAi, setTestingAi] = useState(false);

  // Add Custom Plant Form State (TAKES ONLY 1 PLANT NAME)
  const [showAddModal, setShowAddModal] = useState(false);
  const [singlePlantName, setSinglePlantName] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Save custom plants whenever changed
  useEffect(() => {
    try {
      localStorage.setItem("custom_companion_matrix", JSON.stringify(customPlants));
    } catch (e) {
      console.warn("Error saving custom companion plants:", e);
    }
  }, [customPlants]);

  const currentPlant = allPlants.find((p) => p.id === selectedPlantId) || allPlants[0] || DEFAULT_COMPANION_MATRIX[0];

  // Active plant count for water calculation
  const effectivePlantCount = useManualCount ? Math.max(1, Number(manualPlantCount) || 1) : Math.max(1, plantCount || 3);

  // Eco Water Calculation
  const rainfallMm = customRainfallMm !== "" ? Math.max(0, Number(customRainfallMm) || 0) : (weather?.precipitation || 0);
  const effectiveRainLiters = Math.round(rainfallMm * (balconyAreaSqFt * 0.0929) * 0.8 * 10) / 10;
  const estimatedGardenWeeklyWaterLiters = Math.max(1, Math.round(effectivePlantCount * (currentPlant.waterNeedPerWeekLiters || 2.5) * 10) / 10);
  const netSavedLiters = Math.min(estimatedGardenWeeklyWaterLiters, Math.max(0, Math.round(effectiveRainLiters * 1.5 * 10) / 10));
  const waterSavingPercent = Math.min(100, Math.round((netSavedLiters / estimatedGardenWeeklyWaterLiters) * 100));

  // Handle Generating Custom Companion Profile for a SINGLE plant
  async function handleGenerateSinglePlant(e) {
    if (e) e.preventDefault();
    const rawName = singlePlantName.trim();
    if (!rawName) {
      alert("⚠️ Please enter a plant name (e.g. Bonsai, Chili, Monstera).");
      return;
    }

    const norm = autoCorrectPlantName(rawName);
    const correctedName = norm.corrected;

    setGeneratingAi(true);

    try {
      let result = null;
      try {
        result = await api("/garden/generate-plant-profile", {
          method: "POST",
          body: { plantName: correctedName },
        });
      } catch (apiErr) {
        console.warn("API single plant generator failed, using local botanical engine:", apiErr.message);
      }

      if (!result) {
        const pLower = correctedName.toLowerCase();
        const isBonsai = pLower.includes("bonsai");
        const isChili = pLower.includes("chili") || pLower.includes("pepper");
        const isSucculent = norm.type === "succulent";

        result = {
          id: `custom_${Date.now()}`,
          name: correctedName,
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
            : `${correctedName} fosters a balanced container microclimate, naturally repelling garden pests and optimizing soil aeration.`,
          potRecommendation: isBonsai ? "Shallow glazed bonsai ceramic tray with Akadama mix" : "10-12 inch container with drainage and rich compost",
          waterNeedPerWeekLiters: isBonsai ? 1.2 : isSucculent ? 0.6 : 3.0,
          repottingIntervalMonths: isBonsai ? 24 : 8,
          wateringAdvice: "Water deeply at root base in the early morning.",
          smartGardenTip: `Keep ${correctedName} in well-draining soil with bright filtered sunlight.`,
          image: getBotanicalImageForPlant(correctedName),
          isCustom: true,
        };
      }

      if (!result.image) {
        result.image = getBotanicalImageForPlant(result.name || correctedName);
      }
      result.id = `custom_${Date.now()}`;
      result.isCustom = true;
      result.autoCorrectInfo = norm.wasAutoCorrected ? {
        originalA: rawName,
        correctedA: correctedName,
        wasCorrectedA: true,
      } : null;

      const updated = [...customPlants, result];
      setCustomPlants(updated);
      setSelectedPlantId(result.id);
      setShowAddModal(false);
      setSinglePlantName("");

      if (norm.wasAutoCorrected) {
        notify(`✨ Auto-corrected: "${rawName}" → "${correctedName}" & generated profile!`, "success");
      } else {
        notify(`✨ AI Generated Companion Profile for ${result.name}!`, "success");
      }
    } catch (err) {
      alert(`⚠️ Error generating profile:\n\n${err.message || "Failed to generate botanical profile."}`);
      notify(err.message || "Error generating profile", "error");
    } finally {
      setGeneratingAi(false);
    }
  }

  // Handle Deleting a Custom Plant
  function handleDeleteCustomPlant(plantId, plantName) {
    if (!window.confirm(`Remove custom plant "${plantName}" from Companion Matrix?`)) return;
    const updated = customPlants.filter((p) => p.id !== plantId);
    setCustomPlants(updated);
    if (selectedPlantId === plantId) {
      setSelectedPlantId(DEFAULT_COMPANION_MATRIX[0].id);
    }
    notify(`Removed "${plantName}" from Companion Matrix.`, "info");
  }

  // Evaluate 2-Plant Pairing Compatibility (Supports both dropdown and manually typed names with auto-correction)
  const rawActivePlantAName = testerMode === "manual"
    ? (testerManualA || "Plant 1")
    : (allPlants.find((p) => p.id === testerPlantA)?.name || "Plant 1");

  const rawActivePlantBName = testerMode === "manual"
    ? (testerManualB || "Plant 2")
    : (allPlants.find((p) => p.id === testerPlantB)?.name || "Plant 2");

  const normTesterA = autoCorrectPlantName(rawActivePlantAName);
  const normTesterB = autoCorrectPlantName(rawActivePlantBName);
  const activePlantAName = normTesterA.corrected;
  const activePlantBName = normTesterB.corrected;

  // Real-time AI Compatibility Evaluation (Debounced API call to Gemini AI)
  useEffect(() => {
    if (!activePlantAName?.trim() || !activePlantBName?.trim()) {
      setAiPairingResult(null);
      return;
    }

    let isMounted = true;
    setTestingAi(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api("/garden/test-synergy", {
          method: "POST",
          body: { plantA: activePlantAName, plantB: activePlantBName },
        });
        if (isMounted && res) {
          setAiPairingResult(res);
        }
      } catch (err) {
        console.warn("AI synergy test error, falling back to local botanical rules:", err);
      } finally {
        if (isMounted) setTestingAi(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activePlantAName, activePlantBName]);

  function evaluatePairing(name1, name2, original1, original2) {
    if (!name1?.trim() || !name2?.trim()) {
      return { type: "neutral", text: "Enter two plant names to test synergy." };
    }

    // If live AI result is available for these plants, use it
    if (aiPairingResult && 
       (aiPairingResult.plantA?.toLowerCase() === name1.toLowerCase() && aiPairingResult.plantB?.toLowerCase() === name2.toLowerCase() ||
        aiPairingResult.plantA?.toLowerCase() === name2.toLowerCase() && aiPairingResult.plantB?.toLowerCase() === name1.toLowerCase())) {
      return aiPairingResult;
    }

    const n1 = name1.trim().toLowerCase();
    const n2 = name2.trim().toLowerCase();

    if (n1 === n2) {
      return {
        type: "neutral",
        score: 80,
        title: "Same Species Cohort",
        reason: `Growing multiple ${name1} together is safe. Ensure 30–45cm spacing between pots for proper leaf aeration.`,
      };
    }

    const isMoneyAndBonsai = (n1.includes("money") || n1.includes("pothos")) && (n2.includes("bonsai") || n2.includes("tree")) ||
                             (n2.includes("money") || n2.includes("pothos")) && (n1.includes("bonsai") || n1.includes("tree"));

    if (isMoneyAndBonsai) {
      return {
        type: "antagonistic",
        score: 36,
        title: "⚠️ Canopy Shading & Climbing Vine Conflict",
        reason: `Money Plant is a fast-growing, vigorous climbing vine that will quickly wrap around branches and shade out the delicate foliage of a Bonsai tree. Grow them in separate areas of your home.`,
      };
    }

    const isChiliAndBonsai = (n1.includes("chili") || n1.includes("pepper")) && (n2.includes("bonsai") || n2.includes("tree")) ||
                             (n2.includes("chili") || n2.includes("pepper")) && (n1.includes("bonsai") || n1.includes("tree"));

    if (isChiliAndBonsai) {
      return {
        type: "antagonistic",
        score: 42,
        title: "⚠️ Separate Pots Only (Root Incompatibility)",
        reason: `Do NOT plant ${name1} and ${name2} in the same container! Chili is an aggressive feeder with rapid root growth that will choke delicate Bonsai roots. Keep them in separate adjacent pots on a sunny balcony so Chili's capsaicin aroma can deter aphids from Bonsai foliage without root conflict.`,
      };
    }

    const obj1 = allPlants.find((p) => p.name.toLowerCase().includes(n1) || n1.includes(p.name.toLowerCase()));
    const obj2 = allPlants.find((p) => p.name.toLowerCase().includes(n2) || n2.includes(p.name.toLowerCase()));

    // Check good neighbors
    const isGood =
      (obj1?.goodNeighbors || []).some((g) => n2.includes(g.toLowerCase()) || g.toLowerCase().includes(n2)) ||
      (obj2?.goodNeighbors || []).some((g) => n1.includes(g.toLowerCase()) || g.toLowerCase().includes(n1)) ||
      (n1.includes("basil") && n2.includes("tomato")) || (n1.includes("tomato") && n2.includes("basil")) ||
      (n1.includes("marigold") || n2.includes("marigold")) ||
      (n1.includes("borage") && n2.includes("strawberr")) || (n1.includes("strawberr") && n2.includes("borage")) ||
      (n1.includes("garlic") && (n2.includes("rose") || n2.includes("pepper") || n2.includes("tomato"))) ||
      (n2.includes("garlic") && (n1.includes("rose") || n1.includes("pepper") || n1.includes("tomato"))) ||
      (n1.includes("mint") && (n2.includes("cabbage") || n2.includes("kale") || n2.includes("tomato"))) ||
      (n1.includes("rubber") || n2.includes("rubber") || n1.includes("ficus") || n2.includes("ficus")) ||
      ((n1.includes("snake") || n1.includes("zz") || n1.includes("aloe") || n1.includes("pothos") || n1.includes("money")) &&
       (n2.includes("snake") || n2.includes("zz") || n2.includes("aloe") || n2.includes("pothos") || n2.includes("money")));

    // Check bad neighbors
    const isBad =
      (obj1?.badNeighbors || []).some((b) => n2.includes(b.toLowerCase()) || b.toLowerCase().includes(n2)) ||
      (obj2?.badNeighbors || []).some((b) => n1.includes(b.toLowerCase()) || b.toLowerCase().includes(n1)) ||
      (n1.includes("fennel") || n2.includes("fennel")) ||
      ((n1.includes("cactus") || n1.includes("succulent")) && (n2.includes("fern") || n2.includes("peace lily") || n2.includes("mint"))) ||
      ((n2.includes("cactus") || n2.includes("succulent")) && (n1.includes("fern") || n1.includes("peace lily") || n1.includes("mint")));

    if (isGood) {
      return {
        type: "synergistic",
        score: Math.max(obj1?.synergyScore || 94, obj2?.synergyScore || 94),
        title: "🌟 Highly Synergistic Companions!",
        reason: `${name1} and ${name2} thrive together in urban containers! They balance microclimate moisture, naturally deter pests, and attract beneficial pollinators.`,
      };
    }

    if (isBad) {
      return {
        type: "antagonistic",
        score: 35,
        title: "⚠️ Antagonistic / Incompatible Neighbors!",
        reason: `Avoid growing ${name1} and ${name2} in the same container or adjoining space. They have conflicting moisture needs or compete aggressively for root nutrients.`,
      };
    }

    return {
      type: "neutral",
      score: 75,
      title: "🤝 Harmonious & Compatible",
      reason: `${name1} and ${name2} have balanced sunlight and soil moisture requirements. Safe to cultivate side by side in containers.`,
    };
  }

  const pairingResult = evaluatePairing(activePlantAName, activePlantBName, rawActivePlantAName, rawActivePlantBName);

  return (
    <section className="garden-synergy-section" style={{
      background: "white",
      borderRadius: "12px",
      border: "1px solid var(--line)",
      padding: "28px",
      margin: "32px 0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
    }}>
      {/* Heading with Add Custom Plant Button */}
      <div className="section-heading" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "14px",
        marginBottom: "20px"
      }}>
        <div>
          <p className="eyebrow"><Sparkles size={15} color="var(--green)" /> Urban Garden Ecology & AI Engine</p>
          <h2 style={{ fontSize: "22px", margin: "4px 0" }}>Plant Companion Synergy & Eco-Water Calculator</h2>
          <p className="muted" style={{ fontSize: "14px", margin: "0" }}>
            Pair plants for natural pest protection, generate custom companion synergies with AI, and calculate container water budgets.
          </p>
        </div>

        <button
          type="button"
          className="button button-small"
          onClick={() => {
            setSinglePlantName("");
            setShowAddModal(true);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={15} /> + Add Plant to Matcher (AI)
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Panel 1: Companion Planting Matcher */}
        <div style={{ background: "#fbfcf9", padding: "20px", borderRadius: "8px", border: "1px solid #e7ede2" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Leaf size={18} color="var(--green-deep)" />
              <h3 style={{ fontSize: "16px", margin: 0 }}>Companion Planting Matcher</h3>
            </div>
            {currentPlant.isCustom && (
              <span style={{ fontSize: "11px", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                ✨ AI Generated Plant
              </span>
            )}
          </div>

          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
            Select Main Plant:
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--line)",
                fontSize: "14px",
                background: "white"
              }}
            >
              <optgroup label="🌱 Standard Urban Crops">
                {DEFAULT_COMPANION_MATRIX.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </optgroup>
              {customPlants.length > 0 && (
                <optgroup label="⭐ AI Custom Companion Plants">
                  {customPlants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {currentPlant.isCustom && (
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => handleDeleteCustomPlant(currentPlant.id, currentPlant.name)}
                title="Delete this custom plant"
                style={{ color: "var(--rust)", borderColor: "var(--rust)" }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {/* Synergy Card with Plant Image */}
          <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
              {currentPlant.image && (
                <img
                  src={currentPlant.image}
                  alt={currentPlant.name}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1px solid #e2e8f0",
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "var(--foreground)", display: "block" }}>
                      {currentPlant.name}
                    </strong>
                    <span className="muted" style={{ fontSize: "12px", fontStyle: "italic" }}>{currentPlant.species}</span>
                  </div>
                  <span style={{
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "700",
                    flexShrink: 0
                  }}>
                    ⭐ {currentPlant.synergyScore}% Synergy
                  </span>
                </div>
                {currentPlant.synergyBadge && (
                  <span style={{ fontSize: "11px", color: "var(--green-deep)", fontWeight: "600", marginTop: "2px", display: "block" }}>
                    {currentPlant.synergyBadge}
                  </span>
                )}
                {currentPlant.autoCorrectInfo && (
                  <span style={{
                    fontSize: "10px",
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    marginTop: "4px",
                    display: "inline-block",
                  }}>
                    ✨ Auto-corrected spelling: "{currentPlant.autoCorrectInfo.originalA}" → "{currentPlant.name}"
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2e7d32", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} /> Thrives Together With (Good Companions):
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {(currentPlant.goodNeighbors || []).map((n) => (
                  <span key={n} style={{ background: "#f0f8f1", border: "1px solid #d4ecd6", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", color: "#166534" }}>
                    🌿 {n}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--rust)", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={13} /> Avoid Planting Near (Incompatible):
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {(currentPlant.badNeighbors || []).map((n) => (
                  <span key={n} style={{ background: "#fff5f5", border: "1px solid #fed7d7", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", color: "#c53030" }}>
                    ⚠️ {n}
                  </span>
                ))}
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", margin: "10px 0 0", padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>💡 Ecological Synergy: </strong>{currentPlant.whyItWorks}
            </p>
          </div>
        </div>

        {/* Panel 2: Interactive Eco-Water & Container Calculator */}
        <div style={{ background: "#fbfcf9", padding: "20px", borderRadius: "8px", border: "1px solid #e7ede2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <CloudRain size={18} color="#0284c7" />
            <h3 style={{ fontSize: "16px", margin: 0 }}>Interactive Eco-Water & Pot Calculator</h3>
          </div>

          {/* Pot Recommendation Card */}
          <div style={{ background: "white", padding: "14px 16px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Maximize2 size={14} color="#0891b2" />
              <strong style={{ fontSize: "13px" }}>Container & Repotting Cycle:</strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--foreground)", margin: "4px 0 8px", fontWeight: "600" }}>
              {currentPlant.potRecommendation}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", paddingTop: "6px", fontSize: "12px" }}>
              <span className="muted">Repotting Frequency:</span>
              <strong>Every {currentPlant.repottingIntervalMonths} Months</strong>
            </div>
          </div>

          {/* Manual Tuning Sliders */}
          <div style={{ background: "white", padding: "14px 16px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                Balcony / Terrace Area:
              </label>
              <strong style={{ fontSize: "13px", color: "#0284c7" }}>{balconyAreaSqFt} sq. ft.</strong>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={balconyAreaSqFt}
              onChange={(e) => setBalconyAreaSqFt(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--green)" }}
            />

            {/* Plant Count Mode Switch */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                Target Plant Count:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={effectivePlantCount}
                  onChange={(e) => {
                    setUseManualCount(true);
                    setManualPlantCount(Number(e.target.value));
                  }}
                  style={{ width: "65px", padding: "4px 6px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--line)", textAlign: "center" }}
                />
                <span className="muted" style={{ fontSize: "11px" }}>plants</span>
              </div>
            </div>

            {/* Rainfall Simulation Input */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                Simulate Rainfall (mm/week):
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="number"
                  min="0"
                  max="150"
                  placeholder={weather?.precipitation ? `${weather.precipitation}mm` : "0mm"}
                  value={customRainfallMm}
                  onChange={(e) => setCustomRainfallMm(e.target.value)}
                  style={{ width: "70px", padding: "4px 6px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--line)", textAlign: "center" }}
                />
                <span className="muted" style={{ fontSize: "11px" }}>mm</span>
              </div>
            </div>
          </div>

          {/* Water Budget Summary Card */}
          <div style={{
            background: "#f0fdf4",
            padding: "14px 16px",
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
          }}>
            <div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700", textTransform: "uppercase" }}>
                Weekly Garden Need
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#15803d" }}>
                {estimatedGardenWeeklyWaterLiters} Liters
              </p>
              <span className="muted" style={{ fontSize: "11px" }}>({currentPlant.waterNeedPerWeekLiters} L / plant)</span>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#1e40af", fontWeight: "700", textTransform: "uppercase" }}>
                Rainwater Offset
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#1d4ed8" }}>
                {netSavedLiters} L ({waterSavingPercent}%)
              </p>
              <span className="muted" style={{ fontSize: "11px" }}>Conserves municipal tap water</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Plant Compatibility Tester */}
      <div style={{
        marginTop: "24px",
        background: "#f8fafc",
        padding: "18px 20px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} color="#d97706" />
            <strong style={{ fontSize: "14px", color: "#0f172a" }}>2-Plant Synergy Tester</strong>
            {testingAi && (
              <span style={{ fontSize: "12px", color: "var(--green-deep)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={13} className="spin" /> Analyzing with Gemini AI...
              </span>
            )}
          </div>

          {/* Mode Switch: Dropdown vs Manual Input */}
          <div style={{ display: "flex", gap: "4px", background: "#e2e8f0", padding: "3px", borderRadius: "6px" }}>
            <button
              type="button"
              onClick={() => setTesterMode("dropdown")}
              style={{
                border: "none",
                background: testerMode === "dropdown" ? "white" : "transparent",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: testerMode === "dropdown" ? "700" : "500",
                borderRadius: "4px",
                cursor: "pointer",
                color: testerMode === "dropdown" ? "var(--green-deep)" : "#64748b",
                boxShadow: testerMode === "dropdown" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              📋 Select from List
            </button>
            <button
              type="button"
              onClick={() => setTesterMode("manual")}
              style={{
                border: "none",
                background: testerMode === "manual" ? "white" : "transparent",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: testerMode === "manual" ? "700" : "500",
                borderRadius: "4px",
                cursor: "pointer",
                color: testerMode === "manual" ? "var(--green-deep)" : "#64748b",
                boxShadow: testerMode === "manual" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              ✍️ Type Plant Names Manually
            </button>
          </div>
        </div>

        {/* Datalist for autocomplete */}
        <datalist id="tester-plants-list">
          {allPlants.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
          <option value="Bonsai Tree" />
          <option value="Chili Pepper" />
          <option value="Variegated Rubber Tree" />
          <option value="Ficus Benjamina" />
          <option value="Monstera Deliciosa" />
          <option value="Lavender" />
          <option value="Rosemary" />
          <option value="Borage" />
          <option value="Marigold" />
          <option value="Garlic" />
          <option value="Strawberry" />
          <option value="Aloe Vera" />
          <option value="ZZ Plant" />
        </datalist>

        {/* Inputs */}
        {testerMode === "dropdown" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
            <select
              value={testerPlantA}
              onChange={(e) => setTesterPlantA(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "white", fontSize: "13px" }}
            >
              {allPlants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <span style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8" }}>+</span>

            <select
              value={testerPlantB}
              onChange={(e) => setTesterPlantB(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "white", fontSize: "13px" }}
            >
              {allPlants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
              <input
                type="text"
                list="tester-plants-list"
                placeholder="Enter Plant 1 (e.g. Chili, Bonsai)"
                value={testerManualA}
                onChange={(e) => setTesterManualA(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  background: "white",
                  fontSize: "13px",
                  width: "100%",
                }}
              />

              <span style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8" }}>+</span>

              <input
                type="text"
                list="tester-plants-list"
                placeholder="Enter Plant 2 (e.g. Bonsai, Sweet Basil)"
                value={testerManualB}
                onChange={(e) => setTesterManualB(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  background: "white",
                  fontSize: "13px",
                  width: "100%",
                }}
              />
            </div>

            {/* Quick Presets for Manual Entry */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginTop: "8px" }}>
              <span className="muted" style={{ fontSize: "11px" }}>Quick Try:</span>
              {[
                { a: "Chili Pepper", b: "Bonsai Tree" },
                { a: "Money Plant (Devil's Ivy)", b: "Bonsai Tree" },
                { a: "Tomato", b: "Sweet Basil" },
                { a: "Strawberry", b: "Borage" },
                { a: "Rose", b: "Garlic" },
                { a: "Snake Plant", b: "ZZ Plant" },
              ].map((pair) => (
                <button
                  key={`${pair.a}-${pair.b}`}
                  type="button"
                  onClick={() => {
                    setTesterManualA(pair.a);
                    setTesterManualB(pair.b);
                  }}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                >
                  {pair.a} + {pair.b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Pairing Output */}
        <div style={{
          padding: "14px 16px",
          borderRadius: "6px",
          background: pairingResult.type === "synergistic" ? "#f0fdf4" : pairingResult.type === "antagonistic" ? "#fef2f2" : "white",
          border: `1px solid ${pairingResult.type === "synergistic" ? "#bbf7d0" : pairingResult.type === "antagonistic" ? "#fecaca" : "#e2e8f0"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: "260px" }}>
            {pairingResult.type === "synergistic" ? (
              <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : pairingResult.type === "antagonistic" ? (
              <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : (
              <Sprout size={22} color="var(--green)" style={{ flexShrink: 0, marginTop: "2px" }} />
            )}

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <strong style={{
                  fontSize: "14px",
                  color: pairingResult.type === "synergistic" ? "#15803d" : pairingResult.type === "antagonistic" ? "#b91c1c" : "#334155"
                }}>
                  {pairingResult.title}
                </strong>
                {pairingResult.score && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: pairingResult.score >= 80 ? "#dcfce7" : pairingResult.score >= 50 ? "#fef3c7" : "#fee2e2",
                    color: pairingResult.score >= 80 ? "#15803d" : pairingResult.score >= 50 ? "#b45309" : "#991b1b"
                  }}>
                    {pairingResult.score}% Compatibility
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>
                {pairingResult.reason}
              </p>
              {(normTesterA.wasAutoCorrected || normTesterB.wasAutoCorrected) && (
                <span style={{ fontSize: "11px", color: "var(--green-deep)", fontWeight: "600", marginTop: "4px", display: "inline-block" }}>
                  ✨ Auto-corrected: {normTesterA.wasAutoCorrected ? `"${rawActivePlantAName}" → "${activePlantAName}"` : ""} {normTesterB.wasAutoCorrected ? `"${rawActivePlantBName}" → "${activePlantBName}"` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD CUSTOM PLANT PROFILE (TAKES ONLY 1 PLANT NAME)
         ======================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>
              <X size={18} />
            </button>

            <p className="eyebrow"><Sparkles size={14} color="var(--green)" /> AI Botanical Companion Generator</p>
            <h2 style={{ fontSize: "20px", margin: "4px 0 8px" }}>Add Custom Plant to Matcher</h2>
            <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
              Enter <strong>1 plant name</strong>. Our Google Gemini AI will generate its full companion profile, beneficial neighbors, plants to avoid, pot sizes, and watering budget!
            </p>

            <form onSubmit={handleGenerateSinglePlant} className="diagnosis-form">
              <label style={{ display: "block", marginBottom: "12px" }}>
                Plant Name *
                <input
                  required
                  placeholder="e.g. Bonsai (or bonzai), Chili (or chilly), Monstera"
                  value={singlePlantName}
                  onChange={(e) => setSinglePlantName(e.target.value)}
                  style={{ width: "100%", marginTop: "6px" }}
                />
                {singlePlantName.trim() && autoCorrectPlantName(singlePlantName).wasAutoCorrected && (
                  <span style={{ fontSize: "11px", color: "var(--green-deep)", fontWeight: "600", marginTop: "4px", display: "block" }}>
                    ✨ Auto-corrects to: <strong>{autoCorrectPlantName(singlePlantName).corrected}</strong>
                  </span>
                )}
              </label>

              {/* 1-Click Plant Suggestions */}
              <div style={{ marginTop: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  💡 Popular Urban Plants (Click to Auto-fill):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {[
                    "Bonsai Tree",
                    "Chili Pepper",
                    "Monstera Deliciosa",
                    "Peace Lily",
                    "Lavender",
                    "Spearmint",
                    "Aloe Vera",
                    "Strawberry"
                  ].map((plant) => (
                    <button
                      key={plant}
                      type="button"
                      onClick={() => setSinglePlantName(plant)}
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "14px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        cursor: "pointer",
                        color: "#334155",
                      }}
                    >
                      🌿 {plant}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={generatingAi}
                >
                  {generatingAi ? "Generating Plant Profile…" : "✨ Generate Profile with AI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
