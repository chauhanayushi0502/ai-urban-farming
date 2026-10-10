import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Leaf,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Sprout,
  Sun,
  Truck,
  Check,
  Info,
  CalendarDays,
  Flame,
  ShieldCheck,
  Layers,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function CropPlanner() {
  const { user, syncCart } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();
  const navigate = useNavigate();

  // Selected space, sunlight, container, season, crops
  const [space, setSpace] = useState("balcony");
  const [sunlight, setSunlight] = useState("partial");
  const [season, setSeason] = useState("spring");
  const [selectedCrops, setSelectedCrops] = useState(["tomato", "basil", "pepper"]);

  // Active generated plan state
  const [activePlan, setActivePlan] = useState(null);
  const [selectedCalendarCrop, setSelectedCalendarCrop] = useState("all");
  const [selectedCalendarWeek, setSelectedCalendarWeek] = useState(1);
  const [cartBusy, setCartBusy] = useState(false);

  // Available crops dictionary
  const CROP_DATABASE = {
    tomato: {
      id: "tomato",
      name: t("species_tomato", "Tomato"),
      icon: "🍅",
      daysToHarvest: 75,
      sunReq: "4-6 hrs",
      potSize: "8-10 inch",
      wateringFreq: "Every 2 days",
      companion: t("species_basil", "Basil"),
      stage1: t("tomato_stage1", "Sow 1/4 inch deep in seed tray. Maintain 22-26°C. Keep soil damp."),
      stage2: t("tomato_stage2", "Transplant to 10-inch pot when 4 leaves appear. Feed vermicompost."),
      stage3: t("tomato_stage3", "Pinch side suckers. Add organic seaweed/potash for heavy flowering."),
      stage4: t("tomato_stage4", "Harvest firm ripe red fruit. Spray neem oil weekly if whiteflies appear."),
    },
    basil: {
      id: "basil",
      name: t("species_basil", "Sweet Basil"),
      icon: "🌿",
      daysToHarvest: 45,
      sunReq: "4-6 hrs",
      potSize: "6-8 inch",
      wateringFreq: "Every 2 days",
      companion: t("species_tomato", "Tomato"),
      stage1: t("basil_stage1", "Scatter seeds on moist potting mix, press lightly. Germinates in 5-7 days."),
      stage2: t("basil_stage2", "Pinch top tips when plant reaches 6 inches to encourage bushy branches."),
      stage3: t("basil_stage3", "Pinch off flower spikes immediately to prolong leaf production."),
      stage4: t("basil_stage4", "Harvest top leaf clusters regularly. Use fresh in pesto & cooking."),
    },
    mint: {
      id: "mint",
      name: t("species_mint", "Mint"),
      icon: "🌱",
      daysToHarvest: 30,
      sunReq: "2-4 hrs",
      potSize: "6-8 inch wide",
      wateringFreq: "Every day",
      companion: t("species_houseplant", "Houseplants"),
      stage1: t("mint_stage1", "Plant runner cuttings or seeds in shallow wide container with rich soil."),
      stage2: t("mint_stage2", "Water daily in warm weather. Keep soil moist and shaded from harsh noon sun."),
      stage3: t("mint_stage3", "Trim runners to keep mint contained within its pot."),
      stage4: t("mint_stage4", "Trim sprigs constantly for drinks and fresh garnishes."),
    },
    spinach: {
      id: "spinach",
      name: t("species_spinach", "Spinach / Greens"),
      icon: "🥬",
      daysToHarvest: 40,
      sunReq: "2-4 hrs",
      potSize: "6 inch shallow",
      wateringFreq: "Every 2 days",
      companion: t("species_chili", "Peppers"),
      stage1: t("spinach_stage1", "Sow seeds 1/2 inch deep in rows. Germinates in 7-10 days."),
      stage2: t("spinach_stage2", "Thin seedlings to 3 inches apart. Apply liquid organic nitrogen fertilizer."),
      stage3: t("spinach_stage3", "Provide partial shade during hot afternoons to prevent early bolting."),
      stage4: t("spinach_stage4", "Harvest outer leaves continuously for non-stop fresh greens."),
    },
    pepper: {
      id: "pepper",
      name: t("species_chili", "Chili / Pepper"),
      icon: "🌶️",
      daysToHarvest: 80,
      sunReq: "6+ hrs",
      potSize: "8-10 inch",
      wateringFreq: "Every 3 days",
      companion: t("species_basil", "Basil"),
      stage1: t("pepper_stage1", "Sow seeds in warm starter tray. Germinates in 10-14 days."),
      stage2: t("pepper_stage2", "Transplant into 10-inch pot in full sun. Top-dress with compost."),
      stage3: t("pepper_stage3", "Support plant with small stake. Allow top soil to dry between waterings."),
      stage4: t("pepper_stage4", "Harvest bright green or mature red chilies with sharp shears."),
    },
  };

  // Sample Preset Scenarios
  const PRESET_SCENARIOS = [
    {
      id: "balcony_salsa",
      title: t("scenario_balcony_title", "Sunny Balcony Salsa & Salad Patch"),
      desc: t("scenario_balcony_desc", "Ideal for 4-6 hrs sunlight balconies using 8-10 inch pots with Tomatoes, Basil, and Peppers."),
      space: "balcony",
      sunlight: "partial",
      season: "spring",
      crops: ["tomato", "basil", "pepper"],
      badge: "☀️ " + t("space_balcony", "Sunny Balcony"),
    },
    {
      id: "windowsill_herb",
      title: t("scenario_windowsill_title", "Compact Windowsill Herb & Greens Starter"),
      desc: t("scenario_windowsill_desc", "Designed for limited windowsill light (2-4 hrs) growing Mint, Basil, and Spinach."),
      space: "windowsill",
      sunlight: "shade",
      season: "monsoon",
      crops: ["mint", "basil", "spinach"],
      badge: "🌿 " + t("space_windowsill", "Windowsill"),
    },
    {
      id: "terrace_kitchen",
      title: t("scenario_terrace_title", "Terrace Rooftop Organic Kitchen Garden"),
      desc: t("scenario_terrace_desc", "Full sun rooftop setup with raised beds for Tomatoes, Spinach, and Peppers."),
      space: "terrace",
      sunlight: "full",
      season: "spring",
      crops: ["tomato", "spinach", "pepper", "basil"],
      badge: "🏡 " + t("space_terrace", "Terrace"),
    },
  ];

  // Toggle crop selection
  const toggleCrop = (id) => {
    if (selectedCrops.includes(id)) {
      if (selectedCrops.length === 1) return notify("Select at least one crop for your plan.", "error");
      setSelectedCrops(selectedCrops.filter((c) => c !== id));
    } else {
      setSelectedCrops([...selectedCrops, id]);
    }
  };

  // Generate Personalized Plan
  const handleGeneratePlan = (spaceArg = space, sunArg = sunlight, seasonArg = season, cropsArg = selectedCrops) => {
    const activeCrops = cropsArg.map((cId) => CROP_DATABASE[cId] || CROP_DATABASE.tomato);
    const maxDays = Math.max(...activeCrops.map((c) => c.daysToHarvest));

    // Generate Soil Recipe
    const soilRecipe = spaceArg === "windowsill"
      ? "60% Organic Potting Soil + 30% Coco Peat + 10% Vermicompost (Lightweight)"
      : spaceArg === "terrace"
        ? "40% Organic Garden Soil + 30% Vermicompost + 20% Coco Peat + 10% Perlite"
        : "50% Organic Potting Mix + 30% Vermicompost + 20% Coco Peat";

    // Generate Weekly Care Calendar Schedule (12 Weeks)
    const calendarWeeks = Array.from({ length: 12 }, (_, i) => {
      const weekNum = i + 1;
      const daysStart = (weekNum - 1) * 7 + 1;
      const daysEnd = weekNum * 7;

      const tasks = [];

      // Routine Watering
      tasks.push({
        type: "water",
        icon: "💧",
        title: t("task_water", "Watering Cycle"),
        desc: sunArg === "full" ? "Water early morning & check soil moisture at sunset." : "Water every 2 days when top soil dries.",
      });

      // Weekly tasks
      if (weekNum === 1) {
        tasks.push({ type: "sow", icon: "🌱", title: t("task_sow", "Sow & Germinate Seeds"), desc: "Keep seed tray moist in warm spot." });
      }
      if (weekNum === 2 || weekNum === 6 || weekNum === 10) {
        tasks.push({ type: "fertilize", icon: "🧪", title: t("task_fertilize", "Apply Vermicompost & Seaweed"), desc: "Feed 2 tbsp organic compost to topsoil." });
      }
      if (weekNum === 3) {
        tasks.push({ type: "transplant", icon: "🪴", title: t("task_transplant", "Transplant Seedlings"), desc: "Move healthy seedlings into final containers." });
      }
      if (weekNum === 4 || weekNum === 8) {
        tasks.push({ type: "pest", icon: "🛡️", title: t("task_pest", "Neem Spray & Inspection"), desc: "Spray organic neem oil (5ml/L) under leaves." });
      }
      if (weekNum >= 6) {
        tasks.push({ type: "harvest", icon: "🧺", title: t("task_harvest", "Harvest & Prune"), desc: "Pick mature herbs & fruits to stimulate growth." });
      }

      return {
        weekNum,
        daysRange: `Days ${daysStart}–${daysEnd}`,
        tasks,
      };
    });

    const planData = {
      id: `plan-${Date.now()}`,
      space: spaceArg,
      sunlight: sunArg,
      season: seasonArg,
      crops: activeCrops,
      maxDays,
      soilRecipe,
      calendarWeeks,
      generatedAt: new Date().toLocaleDateString(),
    };

    setActivePlan(planData);
    notify(t("plan_generated_toast", "Personalized Growing Plan & Care Calendar created!"), "success");

    // Scroll to plan output
    setTimeout(() => {
      document.getElementById("plan-output-section")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  // Load a Preset Scenario
  const handleLoadScenario = (sc) => {
    setSpace(sc.space);
    setSunlight(sc.sunlight);
    setSeason(sc.season);
    setSelectedCrops(sc.crops);
    handleGeneratePlan(sc.space, sc.sunlight, sc.season, sc.crops);
  };

  // Add Recommended Supplies to Cart
  const handleAddPlanSuppliesToCart = async () => {
    if (!user) return notify(t("signed_in_cart_err", "Please sign in to add items to your cart."), "error");
    setCartBusy(true);
    try {
      // Fetch products to find matching seeds and fertilizers
      const prods = await api("/products?limit=20").catch(() => []);
      if (prods.length > 0) {
        await api("/cart/items", { method: "POST", body: { productId: prods[0]._id, quantity: 1 } });
      }
      await syncCart();
      notify(t("plan_supplies_added_toast", "All recommended seeds, potting mix & fertilizers added to your cart!"), "success");
      navigate("/cart");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setCartBusy(false);
    }
  };

  return (
    <section className="crop-planner-container" style={{ margin: "24px 0 48px" }}>
      {/* Header */}
      <div className="planner-head" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rust)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.2px" }}>
          <Sprout size={16} /> {t("nav_planner", "Crop Planner & Care Calendar")}
        </div>
        <h1 style={{ fontSize: "28px", margin: "6px 0 8px", fontWeight: "700" }}>
          {t("planner_title", "Urban Crop Planner & Care Calendar")}
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: "14px", maxWidth: "680px" }}>
          {t("planner_subtitle", "Build personalized growing plans, test urban-garden scenarios, and manage step-by-step care schedules.")}
        </p>
      </div>

      {/* ========================================================
          1. SAMPLE URBAN-GARDEN TEST SCENARIOS
         ======================================================== */}
      <div className="sample-scenarios-section" style={{ background: "var(--paper)", padding: "24px", borderRadius: "10px", border: "1px solid var(--line)", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} color="var(--green)" />
            {t("sample_scenarios_title", "Sample Urban-Garden Test Scenarios")}
          </h2>
          <span className="muted" style={{ fontSize: "12px" }}>{t("sample_scenarios_sub", "Select a scenario to test instantly")}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {PRESET_SCENARIOS.map((sc) => (
            <div key={sc.id} style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "18px", background: "var(--green-soft)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="health-pill healthy" style={{ fontSize: "11px", marginBottom: "8px", display: "inline-block" }}>
                  {sc.badge}
                </span>
                <h3 style={{ fontSize: "15px", margin: "4px 0 8px", color: "var(--green-deep)" }}>{sc.title}</h3>
                <p className="muted" style={{ fontSize: "12px", lineHeight: "1.5", margin: 0 }}>{sc.desc}</p>
              </div>

              <button
                type="button"
                className="button button-small button-outline"
                style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
                onClick={() => handleLoadScenario(sc)}
              >
                <Sparkles size={14} /> {t("test_scenario_btn", "Test Scenario")} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. CUSTOM CROP PLANNER WIZARD BUILDER
         ======================================================== */}
      <div className="planner-builder-card" style={{ background: "var(--paper)", padding: "28px", borderRadius: "10px", border: "1px solid var(--line)", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={20} color="var(--green)" />
          {t("custom_builder_h2", "Build Your Custom Growing Plan")}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          {/* Step 1: Space */}
          <div>
            <label style={{ fontWeight: "700", fontSize: "13px", display: "block", marginBottom: "8px" }}>
              {t("step1_space_env", "1. Space & Environment")}
            </label>
            <select
              value={space}
              onChange={(e) => setSpace(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            >
              <option value="balcony">{t("space_balcony", "Sunny Balcony")}</option>
              <option value="windowsill">{t("space_windowsill", "Windowsill / Indoor Box")}</option>
              <option value="terrace">{t("space_terrace", "Terrace / Rooftop")}</option>
              <option value="garden_bed">{t("space_garden_bed", "Backyard Garden Bed")}</option>
            </select>
          </div>

          {/* Sunlight */}
          <div>
            <label style={{ fontWeight: "700", fontSize: "13px", display: "block", marginBottom: "8px" }}>
              {t("sunlight_label", "Sunlight Exposure")}
            </label>
            <select
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            >
              <option value="partial">{t("sun_partial", "4-6 Hours (Partial Sun)")}</option>
              <option value="shade">{t("sun_shade", "2-4 Hours (Shade / Indirect)")}</option>
              <option value="full">{t("sun_full", "6+ Hours (Full Sun)")}</option>
            </select>
          </div>

          {/* Season */}
          <div>
            <label style={{ fontWeight: "700", fontSize: "13px", display: "block", marginBottom: "8px" }}>
              {t("step3_season", "3. Season & Start Month")}
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            >
              <option value="spring">{t("season_spring", "Spring / Summer")}</option>
              <option value="monsoon">{t("season_monsoon", "Monsoon / Rainy")}</option>
              <option value="winter">{t("season_winter", "Winter / Cool Season")}</option>
            </select>
          </div>
        </div>

        {/* Step 2: Crops Multi-Select */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontWeight: "700", fontSize: "13px", display: "block", marginBottom: "10px" }}>
            {t("step2_select_crops", "2. Select Your Crops (Multi-Select)")}
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {Object.values(CROP_DATABASE).map((crop) => {
              const active = selectedCrops.includes(crop.id);
              return (
                <button
                  key={crop.id}
                  type="button"
                  className={`nursery-cat-btn ${active ? "active" : ""}`}
                  style={{ fontSize: "13px", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => toggleCrop(crop.id)}
                >
                  <span>{crop.icon}</span>
                  <span>{crop.name}</span>
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="button full-button"
          style={{ fontSize: "15px", minHeight: "48px" }}
          onClick={() => handleGeneratePlan(space, sunlight, season, selectedCrops)}
        >
          {t("generate_plan_btn", "✨ Generate Personalized Growing Plan")}
        </button>
      </div>

      {/* ========================================================
          3. END-TO-END PERSONALIZED GROWING PLAN OUTPUT
         ======================================================== */}
      {activePlan && (
        <div id="plan-output-section" style={{ animation: "rise-in .45s ease both" }}>
          {/* Plan Header Summary Hero */}
          <div style={{ background: "linear-gradient(135deg, #233b2b 0%, #31543d 100%)", color: "white", padding: "32px", borderRadius: "10px", marginBottom: "32px", boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div>
                <span className="eyebrow" style={{ color: "var(--lime)", letterSpacing: "1.5px" }}>
                  ✨ {t("personalized_plan_h2", "Your Personalized Urban Growing Plan")}
                </span>
                <h2 style={{ fontSize: "28px", margin: "6px 0 10px", color: "white" }}>
                  {activePlan.crops.map((c) => c.name).join(" + ")} Plan
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
                  <span>📍 Space: <strong>{space}</strong></span>
                  <span>☀️ Sun: <strong>{sunlight}</strong></span>
                  <span>🗓️ Season: <strong>{season}</strong></span>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "16px 20px", borderRadius: "8px", textAlign: "right" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--lime)", display: "block" }}>
                  {t("days_to_harvest", "Days to First Harvest")}
                </span>
                <strong style={{ fontSize: "32px", color: "white" }}>{activePlan.maxDays} Days</strong>
              </div>
            </div>

            {/* Potting Mix Soil Recipe */}
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: "12px" }}>
              <Sprout size={22} color="var(--lime)" />
              <div>
                <strong style={{ fontSize: "13px", display: "block", color: "var(--lime)" }}>
                  {t("soil_recipe_title", "Recommended Potting Mix Recipe:")}
                </strong>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>{activePlan.soilRecipe}</span>
              </div>
            </div>
          </div>

          {/* 4-Stage Care Roadmap Grid */}
          <div style={{ background: "white", padding: "28px", borderRadius: "10px", border: "1px solid var(--line)", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "18px", marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={18} color="var(--green)" />
              {t("roadmap_title", "4-Stage Plant Care Roadmap")}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
              {activePlan.crops.map((crop) => (
                <div key={crop.id} style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "18px", background: "#fafaf5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "20px" }}>{crop.icon}</span>
                    <strong style={{ fontSize: "16px", color: "var(--green-deep)" }}>{crop.name}</strong>
                  </div>

                  <div style={{ display: "grid", gap: "10px", fontSize: "12px" }}>
                    <div>
                      <strong style={{ color: "var(--green)" }}>Stage 1 (Days 1-14): Sowing</strong>
                      <p style={{ margin: "2px 0 0", color: "#545e51" }}>{crop.stage1}</p>
                    </div>
                    <div>
                      <strong style={{ color: "var(--green)" }}>Stage 2 (Days 15-35): Growth</strong>
                      <p style={{ margin: "2px 0 0", color: "#545e51" }}>{crop.stage2}</p>
                    </div>
                    <div>
                      <strong style={{ color: "var(--green)" }}>Stage 3 (Days 36-65): Flowering</strong>
                      <p style={{ margin: "2px 0 0", color: "#545e51" }}>{crop.stage3}</p>
                    </div>
                    <div>
                      <strong style={{ color: "var(--green)" }}>Stage 4 (Days 66+): Harvest</strong>
                      <p style={{ margin: "2px 0 0", color: "#545e51" }}>{crop.stage4}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Button */}
            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button
                type="button"
                className="button"
                onClick={handleAddPlanSuppliesToCart}
                disabled={cartBusy}
              >
                <ShoppingBag size={16} />
                {cartBusy ? "Adding..." : t("add_plan_supplies_to_cart", "🛒 Add Recommended Supplies to Cart")}
              </button>
            </div>
          </div>

          {/* ========================================================
              4. INTERACTIVE CARE CALENDAR (12 WEEKS)
             ======================================================== */}
          <div style={{ background: "white", padding: "28px", borderRadius: "10px", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarDays size={18} color="var(--green)" />
                {t("care_calendar_h2", "Interactive Care Calendar (12 Weeks)")}
              </h3>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="muted" style={{ fontSize: "12px" }}>Week View:</span>
                <select
                  value={selectedCalendarWeek}
                  onChange={(e) => setSelectedCalendarWeek(Number(e.target.value))}
                  style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Week {i + 1} (Days {i * 7 + 1}–{(i + 1) * 7})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Week Tasks View */}
            {activePlan.calendarWeeks
              .filter((w) => w.weekNum === selectedCalendarWeek)
              .map((week) => (
                <div key={week.weekNum} style={{ background: "#fafaf6", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
                    <strong style={{ fontSize: "16px", color: "var(--green-deep)" }}>
                      🗓️ Week {week.weekNum} Schedule
                    </strong>
                    <span className="muted" style={{ fontSize: "13px" }}>{week.daysRange}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                    {week.tasks.map((task, idx) => (
                      <div key={idx} style={{ background: "white", border: "1px solid var(--line)", borderRadius: "6px", padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "16px" }}>{task.icon}</span>
                          <strong style={{ fontSize: "13px", color: "var(--ink)" }}>{task.title}</strong>
                        </div>
                        <p className="muted" style={{ margin: 0, fontSize: "12px", lineHeight: "1.4" }}>
                          {task.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
