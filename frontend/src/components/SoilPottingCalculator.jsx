import { useState } from "react";
import { Calculator, Sprout, Sparkles, Check, ArrowRight, Layers, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PLANT_TYPES = {
  houseplant: {
    label: "Indoor Foliage (Monstera, Pothos, Peace Lily)",
    description: "Well-draining, airy mix with good aeration and organic matter.",
    recipe: [
      { name: "Cocopeat / Peat Moss", pct: 40, color: "#8d6e63" },
      { name: "Perlite / Pumice / Bark", pct: 30, color: "#e0e0e0" },
      { name: "Organic Vermicompost", pct: 20, color: "#5d4037" },
      { name: "Garden Loam / Topsoil", pct: 10, color: "#795548" },
    ],
    fertilizer: "1 tbsp organic vermicompost or 5ml seaweed liquid every 14 days",
    drainageTip: "Ensure pot has at least 1 drainage hole; add 1-inch gravel/perlite layer at the base.",
  },
  succulent: {
    label: "Succulents & Cacti (Aloe, Snake Plant, Jade)",
    description: "Fast-draining gritty mix to prevent root rot and moisture retention.",
    recipe: [
      { name: "Coarse Perlite / Sand / Grit", pct: 50, color: "#e0e0e0" },
      { name: "Potting Soil", pct: 30, color: "#795548" },
      { name: "Cocopeat", pct: 10, color: "#8d6e63" },
      { name: "Organic Compost", pct: 10, color: "#5d4037" },
    ],
    fertilizer: "Mild organic feed once every 30-45 days during spring/summer only",
    drainageTip: "Terracotta clay pots work best because their porous walls allow soil to dry quickly.",
  },
  veggie: {
    label: "Veggies & Herbs (Tomato, Basil, Chili, Mint)",
    description: "Nutrient-rich, moisture-retaining organic mix for fast-growing crops.",
    recipe: [
      { name: "Rich Garden Soil", pct: 40, color: "#795548" },
      { name: "Organic Vermicompost / Manure", pct: 30, color: "#5d4037" },
      { name: "Cocopeat for moisture", pct: 20, color: "#8d6e63" },
      { name: "Perlite / Rice Husk for aeration", pct: 10, color: "#e0e0e0" },
    ],
    fertilizer: "2 tbsp organic vermicompost or compost tea every 10–14 days during flowering & fruiting",
    drainageTip: "Water deeply in the morning; tomatoes require deep containers (10–14 inches deep).",
  },
  flowering: {
    label: "Flowering & Roses (Hibiscus, Bougainvillea, Rose)",
    description: "Balanced soil blend high in phosphorus and micronutrients for continuous blooms.",
    recipe: [
      { name: "Garden Loam Soil", pct: 35, color: "#795548" },
      { name: "Organic Vermicompost", pct: 35, color: "#5d4037" },
      { name: "Cocopeat", pct: 20, color: "#8d6e63" },
      { name: "Neem Cake & Bio-Nutrients", pct: 10, color: "#2e7d32" },
    ],
    fertilizer: "Feed with seaweed extract or bone-meal bio-fertilizer every 14 days",
    drainageTip: "Prune dead flowers (deadheading) to encourage vigorous new flower buds.",
  },
};

export default function SoilPottingCalculator() {
  const [potShape, setPotShape] = useState("round");
  const [unit, setUnit] = useState("inches");
  const [diameter, setDiameter] = useState(10);
  const [length, setLength] = useState(16);
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(10);
  const [plantTypeKey, setPlantTypeKey] = useState("houseplant");

  // Calculate volume in Liters
  let volumeLiters = 0;
  const factor = unit === "cm" ? 1 / 2.54 : 1; // convert to inches first
  const hIn = height * factor;

  if (potShape === "round") {
    const dIn = diameter * factor;
    const rIn = dIn / 2;
    // Volume of cylinder = π * r^2 * h (in cubic inches)
    // 1 cubic inch ≈ 0.0163871 Liters
    const cubicInches = Math.PI * Math.pow(rIn, 2) * hIn * 0.85; // 0.85 factor for slight taper
    volumeLiters = cubicInches * 0.0163871;
  } else {
    const lIn = length * factor;
    const wIn = width * factor;
    const cubicInches = lIn * wIn * hIn * 0.9;
    volumeLiters = cubicInches * 0.0163871;
  }

  volumeLiters = Math.max(0.5, Math.round(volumeLiters * 10) / 10);
  const volumeGallons = Math.round((volumeLiters * 0.264172) * 10) / 10;
  const selectedType = PLANT_TYPES[plantTypeKey];

  return (
    <div className="soil-calculator-card">
      <div className="calc-header">
        <div className="calc-badge">
          <Calculator size={16} /> Smart Potting Tool
        </div>
        <h3>Potting Mix & Soil Calculator</h3>
        <p className="muted text-sm">
          Calculate the exact potting mix volume, soil recipe ratios, and fertilizer schedule for your containers.
        </p>
      </div>

      <div className="calc-body-grid">
        {/* Input Controls */}
        <div className="calc-controls">
          <div className="control-group">
            <label className="control-label">1. Container Shape</label>
            <div className="segmented-toggle">
              <button
                type="button"
                className={`segment-btn ${potShape === "round" ? "active" : ""}`}
                onClick={() => setPotShape("round")}
              >
                Round / Cylinder Pot
              </button>
              <button
                type="button"
                className={`segment-btn ${potShape === "rect" ? "active" : ""}`}
                onClick={() => setPotShape("rect")}
              >
                Planter Box / Rectangular
              </button>
            </div>
          </div>

          <div className="control-group">
            <div className="flex-between">
              <label className="control-label">2. Dimensions</label>
              <div className="unit-switch">
                <button
                  type="button"
                  className={unit === "inches" ? "active" : ""}
                  onClick={() => setUnit("inches")}
                >
                  Inches
                </button>
                <button
                  type="button"
                  className={unit === "cm" ? "active" : ""}
                  onClick={() => setUnit("cm")}
                >
                  CM
                </button>
              </div>
            </div>

            {potShape === "round" ? (
              <div className="input-row-2">
                <label>
                  <span>Top Diameter ({unit})</span>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={diameter}
                    onChange={(e) => setDiameter(Math.max(1, Number(e.target.value)))}
                  />
                </label>
                <label>
                  <span>Pot Height ({unit})</span>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                  />
                </label>
              </div>
            ) : (
              <div className="input-row-3">
                <label>
                  <span>Length ({unit})</span>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={length}
                    onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                  />
                </label>
                <label>
                  <span>Width ({unit})</span>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                  />
                </label>
                <label>
                  <span>Height ({unit})</span>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="control-group">
            <label className="control-label">3. What are you planting?</label>
            <select
              className="calc-select"
              value={plantTypeKey}
              onChange={(e) => setPlantTypeKey(e.target.value)}
            >
              {Object.entries(PLANT_TYPES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Output Calculation Results */}
        <div className="calc-results">
          <div className="volume-highlight">
            <div className="volume-main">
              <span className="vol-number">{volumeLiters}</span>
              <span className="vol-unit">Liters needed</span>
            </div>
            <span className="vol-sub">≈ {volumeGallons} US Gallons / {(volumeLiters * 1.05).toFixed(1)} Dry Quarts</span>
          </div>

          <div className="recipe-section">
            <span className="recipe-title">
              <Layers size={15} /> Custom Potting Recipe Breakdown:
            </span>
            <div className="recipe-bars">
              {selectedType.recipe.map((item, i) => {
                const itemLiters = Math.round((volumeLiters * (item.pct / 100)) * 10) / 10;
                return (
                  <div key={i} className="recipe-item">
                    <div className="recipe-item-header">
                      <span>{item.name}</span>
                      <strong>
                        {itemLiters} L ({item.pct}%)
                      </strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fertilizer-tip-box">
            <p className="fert-heading">🌿 Fertilizer & Care Routine:</p>
            <p className="fert-text">{selectedType.fertilizer}</p>
            <p className="fert-sub text-xs muted">{selectedType.drainageTip}</p>
          </div>

          <div className="calc-shop-cta">
            <Link to="/shop?category=698379bfca12f8450f3b0004" className="button button-sm full-width">
              <span>Shop Organic Vermicompost & Potting Mix</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
