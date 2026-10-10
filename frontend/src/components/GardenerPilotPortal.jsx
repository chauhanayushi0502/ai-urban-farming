import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Home,
  Sprout,
  Camera,
  CheckCircle2,
  Award,
  TrendingUp,
  BarChart3,
  FlaskConical,
  Leaf,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Sparkles,
  Layers,
  MapPin,
  Sun,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Thermometer,
  Droplets
} from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function GardenerPilotPortal({ openPhotoScanModal }) {
  const { user, syncCart, userLocation, deviceWeather, detectDeviceLocation, locationLoading } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();

  const [activeTab, setActiveTab] = useState("student"); // 'student' | 'home'
  const [selectedRegion, setSelectedRegion] = useState("west_india");
  const [cartBusy, setCartBusy] = useState(false);

  // Auto-select regional climate advisory based on user device GPS location
  useEffect(() => {
    if (userLocation?.lat != null) {
      const lat = userLocation.lat;
      if (lat >= 25.5) {
        setSelectedRegion("north_india");
      } else if (lat < 18) {
        setSelectedRegion("south_india");
      } else {
        setSelectedRegion("west_india");
      }
    }
  }, [userLocation]);

  // Student Science Experiment Tracker State
  const [experimentLogs, setExperimentLogs] = useState(() => {
    const saved = localStorage.getItem("pilot_student_logs");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "exp-1",
            plantName: "Cherry Tomato #1",
            date: new Date().toISOString().split("T")[0],
            heightCm: 14.5,
            leafCount: 8,
            phLevel: 6.5,
            notes: "First true leaves expanded. Applied seaweed extract.",
          },
        ];
  });

  const [newLog, setNewLog] = useState({
    plantName: "Sweet Basil",
    heightCm: "",
    leafCount: "",
    phLevel: "6.5",
    notes: "",
  });

  // Home Harvest & Compost Log State
  const [harvestLogs, setHarvestLogs] = useState(() => {
    const saved = localStorage.getItem("pilot_home_harvests");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "harv-1",
            cropName: "Fresh Mint & Spinach",
            weightGrams: 350,
            date: new Date().toISOString().split("T")[0],
            estimatedSavings: 65,
            compostAddedKg: 1.2,
          },
        ];
  });

  const [newHarvest, setNewHarvest] = useState({
    cropName: "Tomatoes",
    weightGrams: "",
    compostAddedKg: "",
  });

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem("pilot_student_logs", JSON.stringify(experimentLogs));
  }, [experimentLogs]);

  useEffect(() => {
    localStorage.setItem("pilot_home_harvests", JSON.stringify(harvestLogs));
  }, [harvestLogs]);

  // Handle Add Student Science Log
  const handleAddExperimentLog = (e) => {
    e.preventDefault();
    if (!newLog.plantName || !newLog.heightCm) {
      return notify(t("fill_required_exp_err", "Please enter plant name and height in cm."), "error");
    }

    const logEntry = {
      id: `exp-${Date.now()}`,
      plantName: newLog.plantName,
      date: new Date().toISOString().split("T")[0],
      heightCm: Number(newLog.heightCm),
      leafCount: Number(newLog.leafCount) || 0,
      phLevel: Number(newLog.phLevel) || 6.5,
      notes: newLog.notes || t("exp_default_note", "Regular observation recorded."),
    };

    setExperimentLogs([logEntry, ...experimentLogs]);
    setNewLog({ plantName: "Sweet Basil", heightCm: "", leafCount: "", phLevel: "6.5", notes: "" });
    notify(t("log_added_toast", "Science experiment entry logged successfully!"), "success");
  };

  // Handle Add Home Harvest Entry
  const handleAddHarvestLog = (e) => {
    e.preventDefault();
    if (!newHarvest.cropName || !newHarvest.weightGrams) {
      return notify(t("fill_required_harv_err", "Please enter crop name and harvest weight in grams."), "error");
    }

    const grams = Number(newHarvest.weightGrams);
    const savings = Math.round((grams / 1000) * 180); // ₹180 per kg organic produce avg

    const entry = {
      id: `harv-${Date.now()}`,
      cropName: newHarvest.cropName,
      weightGrams: grams,
      date: new Date().toISOString().split("T")[0],
      estimatedSavings: savings,
      compostAddedKg: Number(newHarvest.compostAddedKg) || 0.5,
    };

    setHarvestLogs([entry, ...harvestLogs]);
    setNewHarvest({ cropName: "Tomatoes", weightGrams: "", compostAddedKg: "" });
    notify(t("harvest_added_toast", "Kitchen harvest & compost entry saved!"), "success");
  };

  // Delete Log Items
  const handleDeleteExperimentLog = (id) => {
    setExperimentLogs(experimentLogs.filter((l) => l.id !== id));
  };

  const handleDeleteHarvestLog = (id) => {
    setHarvestLogs(harvestLogs.filter((h) => h.id !== id));
  };

  // Calculate pilot metrics
  const totalHarvestGrams = harvestLogs.reduce((sum, h) => sum + h.weightGrams, 0);
  const totalSavings = harvestLogs.reduce((sum, h) => sum + h.estimatedSavings, 0);
  const totalCompostKg = harvestLogs.reduce((sum, h) => sum + h.compostAddedKg, 0);

  // Regional Climate Databases
  const REGIONAL_ADVISORIES = {
    west_india: {
      name: t("region_west", "West India (Gujarat / Maharashtra Plains)"),
      climate: t("climate_west", "Semi-arid to Tropical. High summer temperatures (35-42°C), monsoon rains July-Oct."),
      recommendedCrops: [
        { name: t("species_tomato", "Tomato"), season: t("season_winter", "Winter / Spring"), notes: t("rec_tomato_west", "Sow Oct-Nov for heavy winter fruit set.") },
        { name: t("species_chili", "Chili / Pepper"), season: t("season_monsoon", "All Year"), notes: t("rec_chili_west", "Thrives in warm balcony sun.") },
        { name: t("species_basil", "Sweet Basil"), season: t("season_spring", "Spring / Summer"), notes: t("rec_basil_west", "Provide afternoon shade above 38°C.") },
        { name: t("species_mint", "Mint"), season: t("season_monsoon", "Monsoon / Winter"), notes: t("rec_mint_west", "Keep soil moist in shaded containers.") },
      ],
    },
    north_india: {
      name: t("region_north", "North India (Indo-Gangetic / NCR Region)"),
      climate: t("climate_north", "Extreme seasons. Hot summers (40-45°C), cold winters (4-12°C)."),
      recommendedCrops: [
        { name: t("species_spinach", "Spinach / Mustard"), season: t("season_winter", "Winter (Oct-Feb)"), notes: t("rec_spinach_north", "Bumper yields during cool winter months.") },
        { name: t("species_tomato", "Tomato"), season: t("season_spring", "Spring (Feb-May)"), notes: t("rec_tomato_north", "Protect from extreme December frost.") },
        { name: t("species_coriander", "Coriander / Dhaniya"), season: t("season_winter", "Winter"), notes: t("rec_coriander_north", "Fast germination in mild sun.") },
      ],
    },
    south_india: {
      name: t("region_south", "South India (Peninsular / Coastal Belt)"),
      climate: t("climate_south", "Tropical humid, moderate temperatures (24-34°C) year-round with dual monsoons."),
      recommendedCrops: [
        { name: t("species_chili", "Chili & Peppers"), season: t("season_monsoon", "Year-round"), notes: t("rec_chili_south", "Excellent humidity tolerance.") },
        { name: t("species_eggplant", "Brinjal / Eggplant"), season: t("season_monsoon", "Year-round"), notes: t("rec_eggplant_south", "High yield in warm balcony pots.") },
        { name: t("species_curry", "Curry Leaf Plant"), season: t("season_monsoon", "Year-round"), notes: t("rec_curry_south", "Thrives in sunny terrace containers.") },
      ],
    },
  };

  const activeRegionData = REGIONAL_ADVISORIES[selectedRegion] || REGIONAL_ADVISORIES.west_india;

  return (
    <section className="pilot-portal-container" style={{ margin: "32px 0 60px" }}>
      {/* Banner / Header */}
      <div
        className="pilot-banner-card"
        style={{
          background: "linear-gradient(135deg, #1b3524 0%, #2e5239 100%)",
          color: "white",
          borderRadius: "12px",
          padding: "32px 28px",
          marginBottom: "32px",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
          <div>
            <span
              style={{
                background: "rgba(216, 231, 164, 0.2)",
                color: "var(--lime)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "12px",
              }}
            >
              <Sparkles size={14} /> {t("pilot_program_badge", "Urban Farming Pilot & Research Program")}
            </span>
            <h1 style={{ fontSize: "28px", margin: "4px 0 8px", color: "#ffffff", fontWeight: "700" }}>
              {t("pilot_h1", "Student & Home Gardener Pilot Dashboard")}
            </h1>
            <p style={{ margin: 0, color: "#d8e7a4", opacity: 0.9, maxWidth: "660px", fontSize: "14px", lineHeight: "1.6" }}>
              {t(
                "pilot_desc",
                "Empowering academic student projects and household kitchen gardeners with regional climate data, photo-based plant health diagnosis, and growth tracking."
              )}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button button-small"
              style={{ background: "#d8e7a4", color: "#1b3524", border: "none", fontWeight: "700" }}
              onClick={openPhotoScanModal}
            >
              <Camera size={16} /> {t("quick_photo_health_btn", "Photo Health Check")}
            </button>
          </div>
        </div>

        {/* Quick Pilot Stats Counter */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "28px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "14px 16px", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>
              {t("stat_active_pilots", "Active Pilot Members")}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>1,240+</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", padding: "14px 16px", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>
              {t("stat_total_harvest", "Total Harvested")}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#d8e7a4", marginTop: "4px" }}>
              {(totalHarvestGrams / 1000 + 142).toFixed(1)} kg
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", padding: "14px 16px", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>
              {t("stat_est_savings", "Household Savings")}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
              ₹{totalSavings + 2450}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", padding: "14px 16px", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>
              {t("stat_compost", "Compost Diverted")}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#d8e7a4", marginTop: "4px" }}>
              {(totalCompostKg + 84).toFixed(1)} kg
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          1. REGIONAL & SEASONAL RECOMMENDATIONS MODULE
         ======================================================== */}
      <div
        className="regional-module-card"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={20} color="var(--green)" />
              {t("regional_adv_h2", "Regional & Seasonal Planting Recommendations")}
            </h2>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
              {t("regional_adv_sub", "Customized microclimate guidance and crop selection tailored to Indian agro-climatic zones.")}
            </p>
          </div>

          {/* Region Switcher Select */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700" }}>{t("select_region_label", "Select Region:")}</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "white", fontWeight: "600", fontSize: "13px" }}
            >
              <option value="west_india">{t("region_west", "West India (Gujarat / Maharashtra Plains)")}</option>
              <option value="north_india">{t("region_north", "North India (Indo-Gangetic / NCR Region)")}</option>
              <option value="south_india">{t("region_south", "South India (Peninsular / Coastal Belt)")}</option>
            </select>
          </div>
        </div>

        {/* LIVE DEVICE GPS LOCATION & REAL-TIME WEATHER MODULE */}
        <div
          className="pilot-live-weather-card"
          style={{
            background: "linear-gradient(135deg, rgba(49, 84, 61, 0.08) 0%, rgba(216, 231, 164, 0.18) 100%)",
            border: "1px solid var(--green)",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "var(--green)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(49, 84, 61, 0.25)",
              }}
            >
              📍
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--green-deep)" }}>
                  {userLocation?.city || "Ahmedabad, Gujarat"}
                </h3>
                <span
                  style={{
                    background: userLocation?.isGPS ? "#2e5239" : "#4a7c59",
                    color: "#ffffff",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {locationLoading ? t("locating", "Detecting…") : (userLocation?.isGPS ? "📍 Live Device GPS" : "📍 Auto Microclimate")}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--ink)", opacity: 0.9 }}>
                {deviceWeather?.tip || "Optimal microclimate detected for urban balcony & kitchen growing."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--green-deep)" }}>
                {deviceWeather?.temperature ?? 28}°C
              </div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--muted)" }}>
                {deviceWeather?.condition || "Sunny / Pleasant"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "12px", borderLeft: "1px solid var(--line)", paddingLeft: "14px" }}>
              <span>💧 {t("humidity", "Humidity")}: <strong>{deviceWeather?.humidity ?? 55}%</strong></span>
              <span>🌧️ {t("rainfall", "Rainfall")}: <strong>{deviceWeather?.precipitation ?? 0} mm</strong></span>
            </div>

            <button
              type="button"
              className="button button-small button-outline"
              onClick={detectDeviceLocation}
              disabled={locationLoading}
              style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={13} className={locationLoading ? "spin" : ""} />
              {locationLoading ? t("locating", "Locating…") : t("use_live_loc", "Refresh Device GPS")}
            </button>
          </div>

          {/* Hourly Weather Strip (Every Hour) */}
          {deviceWeather?.hourlyForecast && deviceWeather.hourlyForecast.length > 0 && (
            <div style={{ width: "100%", marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed rgba(49, 84, 61, 0.2)" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: "8px" }}>
                ⏰ {t("hourly_forecast", "Hourly Weather (Every Hour)")}
              </div>
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                {deviceWeather.hourlyForecast.map((h, i) => (
                  <div key={i} style={{ flex: "0 0 58px", textAlign: "center", background: "white", border: "1px solid var(--line)", borderRadius: "6px", padding: "6px 2px", fontSize: "11px" }}>
                    <div style={{ opacity: 0.7, fontSize: "10px" }}>{h.time}</div>
                    <div style={{ fontSize: "16px", margin: "2px 0" }}>{h.icon}</div>
                    <div style={{ fontWeight: "800", color: "var(--green-deep)" }}>{h.temp}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: "rgba(49, 84, 61, 0.05)", borderLeft: "4px solid var(--green)", padding: "14px 18px", borderRadius: "4px", marginBottom: "20px" }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--green-deep)", marginBottom: "4px" }}>
            📍 {activeRegionData.name}
          </div>
          <div style={{ fontSize: "13px", color: "var(--ink)", lineHeight: "1.5" }}>
            {activeRegionData.climate}
          </div>
        </div>

        {/* Recommended Crops Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {activeRegionData.recommendedCrops.map((c, idx) => (
            <div key={idx} style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "16px", background: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--green-deep)" }}>🌱 {c.name}</span>
                <span className="health-pill healthy" style={{ fontSize: "11px" }}>{c.season}</span>
              </div>
              <p className="muted" style={{ fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                {c.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. PILOT PERSONA TABS (STUDENT vs HOME GARDENER)
         ======================================================== */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          type="button"
          className={`button ${activeTab === "student" ? "" : "button-outline"}`}
          style={{ flex: 1, padding: "14px", justifyContent: "center" }}
          onClick={() => setActiveTab("student")}
        >
          <GraduationCap size={18} /> {t("tab_student_pilot", "Student & Academic Pilot")}
        </button>

        <button
          type="button"
          className={`button ${activeTab === "home" ? "" : "button-outline"}`}
          style={{ flex: 1, padding: "14px", justifyContent: "center" }}
          onClick={() => setActiveTab("home")}
        >
          <Home size={18} /> {t("tab_home_pilot", "Home & Kitchen Gardener Pilot")}
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === "student" ? (
        /* STUDENT PILOT PANEL */
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "10px", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <FlaskConical size={20} color="var(--green)" />
                {t("student_h2", "Student Science Experiment & Growth Tracker")}
              </h2>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                {t("student_sub", "Record height growth (cm), leaf counts, pH levels, and daily observations for school & college urban farm projects.")}
              </p>
            </div>
            <span className="health-pill healthy" style={{ fontSize: "12px" }}>
              🎓 {t("student_badge", "Academic Research Mode")}
            </span>
          </div>

          {/* Form to log experiment data */}
          <form onSubmit={handleAddExperimentLog} style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", marginTop: 0, marginBottom: "14px", fontWeight: "700", color: "var(--green-deep)" }}>
              + {t("add_exp_log_title", "Log New Science Metric Entry")}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("log_plant_name", "Plant Nickname")}</label>
                <input
                  type="text"
                  placeholder="e.g. Cherry Tomato #1"
                  value={newLog.plantName}
                  onChange={(e) => setNewLog({ ...newLog, plantName: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("log_height", "Height (cm)")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 14.5"
                  value={newLog.heightCm}
                  onChange={(e) => setNewLog({ ...newLog, heightCm: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("log_leaf_count", "Leaf Count")}</label>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  value={newLog.leafCount}
                  onChange={(e) => setNewLog({ ...newLog, leafCount: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("log_ph", "Soil / Water pH")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 6.5"
                  value={newLog.phLevel}
                  onChange={(e) => setNewLog({ ...newLog, phLevel: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("log_notes", "Observation Notes")}</label>
              <input
                type="text"
                placeholder="e.g. True leaves appeared, fed organic liquid nitrogen"
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
              />
            </div>

            <button type="submit" className="button button-small">
              <Plus size={15} /> {t("btn_save_log", "Save Science Entry")}
            </button>
          </form>

          {/* Table / List of Experiment Logs */}
          <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>{t("exp_log_history_h3", "Logged Academic Growth History")}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f3f4ec", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px" }}>{t("th_date", "Date")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_plant", "Plant")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_height", "Height (cm)")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_leaves", "Leaves")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_ph", "pH")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_notes", "Notes")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_action", "Action")}</th>
                </tr>
              </thead>
              <tbody>
                {experimentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "18px", textAlign: "center" }} className="muted">
                      {t("no_logs_msg", "No science logs recorded yet. Add your first entry above!")}
                    </td>
                  </tr>
                ) : (
                  experimentLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 14px" }}>{log.date}</td>
                      <td style={{ padding: "10px 14px", fontWeight: "700", color: "var(--green-deep)" }}>{log.plantName}</td>
                      <td style={{ padding: "10px 14px" }}>{log.heightCm} cm</td>
                      <td style={{ padding: "10px 14px" }}>{log.leafCount}</td>
                      <td style={{ padding: "10px 14px" }}>{log.phLevel}</td>
                      <td style={{ padding: "10px 14px" }}>{log.notes}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <button
                          type="button"
                          style={{ border: "none", background: "transparent", color: "var(--rust)", cursor: "pointer" }}
                          onClick={() => handleDeleteExperimentLog(log.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* HOME GARDENER PILOT PANEL */
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "10px", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Home size={20} color="var(--green)" />
                {t("home_h2", "Home Kitchen Harvest & Organic Compost Tracker")}
              </h2>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                {t("home_sub", "Track your organic harvest yield, kitchen compost diversion, and calculated grocery savings.")}
              </p>
            </div>
            <span className="health-pill healthy" style={{ fontSize: "12px" }}>
              🏡 {t("home_badge", "Home Organic Pilot")}
            </span>
          </div>

          {/* Form to log harvest */}
          <form onSubmit={handleAddHarvestLog} style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", marginTop: 0, marginBottom: "14px", fontWeight: "700", color: "var(--green-deep)" }}>
              + {t("add_harvest_title", "Log Fresh Harvest or Compost Entry")}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("harvest_crop_name", "Harvested Crop")}</label>
                <input
                  type="text"
                  placeholder="e.g. Tomatoes / Spinach"
                  value={newHarvest.cropName}
                  onChange={(e) => setNewHarvest({ ...newHarvest, cropName: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("harvest_weight", "Weight (Grams)")}</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={newHarvest.weightGrams}
                  onChange={(e) => setNewHarvest({ ...newHarvest, weightGrams: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>{t("compost_added", "Compost Diverted (kg)")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1.5"
                  value={newHarvest.compostAddedKg}
                  onChange={(e) => setNewHarvest({ ...newHarvest, compostAddedKg: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
              </div>
            </div>

            <button type="submit" className="button button-small">
              <Plus size={15} /> {t("btn_save_harvest", "Save Harvest Log")}
            </button>
          </form>

          {/* Table / List of Home Harvest Entries */}
          <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>{t("home_harvest_history_h3", "Logged Kitchen Produce & Savings")}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f3f4ec", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px" }}>{t("th_date", "Date")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_crop", "Crop")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_weight", "Yield (g)")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_savings", "Est. Savings")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_compost", "Compost (kg)")}</th>
                  <th style={{ padding: "10px 14px" }}>{t("th_action", "Action")}</th>
                </tr>
              </thead>
              <tbody>
                {harvestLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "18px", textAlign: "center" }} className="muted">
                      {t("no_harvest_msg", "No harvest entries recorded yet. Add your first harvest above!")}
                    </td>
                  </tr>
                ) : (
                  harvestLogs.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 14px" }}>{item.date}</td>
                      <td style={{ padding: "10px 14px", fontWeight: "700", color: "var(--green-deep)" }}>{item.cropName}</td>
                      <td style={{ padding: "10px 14px" }}>{item.weightGrams} g</td>
                      <td style={{ padding: "10px 14px", color: "var(--green)", fontWeight: "700" }}>₹{item.estimatedSavings}</td>
                      <td style={{ padding: "10px 14px" }}>{item.compostAddedKg} kg</td>
                      <td style={{ padding: "10px 14px" }}>
                        <button
                          type="button"
                          style={{ border: "none", background: "transparent", color: "var(--rust)", cursor: "pointer" }}
                          onClick={() => handleDeleteHarvestLog(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
