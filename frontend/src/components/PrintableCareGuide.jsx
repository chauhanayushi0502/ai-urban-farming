import { Printer, Sprout, Droplets, Sun, Sparkles, X, Check, ShieldCheck } from "lucide-react";

export default function PrintableCareGuide({ plant, onClose, settings }) {
  if (!plant) return null;

  function handlePrint() {
    window.print();
  }

  const speciesName = plant.originalName || plant.species || plant.name || "Nursery Plant";

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card printable-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px", background: "white", padding: "28px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: "var(--green)" }}>
              {settings?.site_name || "Green Leaf Nursery"} Official Care Sheet
            </span>
            <h2 style={{ fontSize: "20px", margin: "4px 0 0" }}>{plant.name}</h2>
            <p className="muted" style={{ fontSize: "12px", margin: "2px 0 0" }}>Botanical Classification: {speciesName}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", background: "#fbfcf9", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #eee" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#2563eb" }}>
                <Droplets size={14} /> Watering Routine
              </strong>
              <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#444" }}>
                {plant.waterQuantityMl || "300ml - 400ml"} · {plant.waterScheduleAdvice || `Every ${plant.wateringIntervalDays || 2} days in the morning`}
              </p>
            </div>

            <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #eee" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#d97706" }}>
                <Sun size={14} /> Lighting
              </strong>
              <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#444" }}>
                {plant.sunlightAdvice || "4–6 hours bright indirect or gentle morning sunlight"}
              </p>
            </div>
          </div>

          <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #eee", marginBottom: "12px" }}>
            <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#16a34a" }}>
              <Sparkles size={14} /> Plant Food & Nutrients
            </strong>
            <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#444" }}>
              {plant.nutrientAdvice || "Apply 1-2 tbsp organic vermicompost or seaweed tonic every 14 days."}
            </p>
          </div>

          <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #eee" }}>
            <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#9333ea" }}>
              <ShieldCheck size={14} /> Organic Protection Tips
            </strong>
            <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#444" }}>
              {plant.protectionAdvice || "Inspect undersides of leaves weekly. Spray organic cold-pressed neem oil if pests appear."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" className="button button-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="button" onClick={handlePrint}>
            <Printer size={16} /> Print Care Guide
          </button>
        </div>
      </div>
    </div>
  );
}
