import { useState } from "react";
import { Calculator, Sprout, Sparkles, Check, ArrowRight, Layers, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const PLANT_TYPES = {
  houseplant: {
    label: {
      en: "Indoor Foliage (Monstera, Pothos, Peace Lily)",
      gu: "ઇન્ડોર પાંદડાવાળા છોડ (મોન્સ્ટેરા, મની પ્લાન્ટ, પીસ લિલી)",
      hi: "इंडोर पत्तेदार पौधे (मॉन्स्टेरा, मनी प्लांट, पीस लिली)",
    },
    description: {
      en: "Well-draining, airy mix with good aeration and organic matter.",
      gu: "હવાની અવરજવર અને ઓર્ગેનિક પોષકતત્વો ધરાવતી ઉત્તમ ડ્રેનેજવાળી માટી.",
      hi: "हवादार और जैविक पोषक तत्वों से भरपूर अच्छी जल निकासी वाली मिट्टी।",
    },
    recipe: [
      {
        name: {
          en: "Cocopeat / Peat Moss",
          gu: "કોકોપીટ / પીટ મોસ",
          hi: "कोकोपीट / पीट मॉस",
        },
        pct: 40,
        color: "#8d6e63",
      },
      {
        name: {
          en: "Perlite / Pumice / Bark",
          gu: "પરલાઇટ / પ્યુમિસ / છાલ",
          hi: "परलाइट / प्यूमिस / छाल",
        },
        pct: 30,
        color: "#e0e0e0",
      },
      {
        name: {
          en: "Organic Vermicompost",
          gu: "ઓર્ગેનિક વર્મીકમ્પોસ્ટ",
          hi: "जैविक वर्मीकम्पोस्ट",
        },
        pct: 20,
        color: "#5d4037",
      },
      {
        name: {
          en: "Garden Loam / Topsoil",
          gu: "બગીચાની કાળી માટી / ટોપસોઇલ",
          hi: "बगीचे की दोमट मिट्टी",
        },
        pct: 10,
        color: "#795548",
      },
    ],
    fertilizer: {
      en: "1 tbsp organic vermicompost or 5ml seaweed liquid every 14 days",
      gu: "દર ૧૪ દિવસે ૧ ચમચી વર્મીકમ્પોસ્ટ અથવા ૫ મિલી સીવીડ લિક્વિડ",
      hi: "हर 14 दिन में 1 चम्मच वर्मीकम्पोस्ट या 5 मिलीलीटर सीवीड लिक्विड",
    },
    drainageTip: {
      en: "Ensure pot has at least 1 drainage hole; add 1-inch gravel/perlite layer at the base.",
      gu: "કુંડામાં ઓછામાં ઓછું ૧ કાણું હોવું જરૂરી; તળિયે ૧ ઇંચ કાંકરી અથવા પરલાઇટનું સ્તર બનાવો.",
      hi: "गमले में कम से कम 1 जल निकासी छेद सुनिश्चित करें; नीचे 1 इंच कंकड़ या परलाइट की परत डालें।",
    },
  },
  succulent: {
    label: {
      en: "Succulents & Cacti (Aloe, Snake Plant, Jade)",
      gu: "સુક્યુલન્ટ્સ અને થોર (કુંવારપાઠું, સ્નેક પ્લાન્ટ, જેડ)",
      hi: "सक्यूलेंट्स और कैक्टस (एलोवेरा, स्नेक प्लांट, जेड)",
    },
    description: {
      en: "Fast-draining gritty mix to prevent root rot and moisture retention.",
      gu: "મૂળ સડી ન જાય તે માટે ઝડપી નિતારવાળી કાંકરીયુક્ત માટીનું મિશ્રણ.",
      hi: "जड़ों को सड़ने से बचाने के लिए तेजी से पानी निकालने वाली कंकड़युक्त मिट्टी।",
    },
    recipe: [
      {
        name: {
          en: "Coarse Perlite / Sand / Grit",
          gu: "મોટી રેતી / પરલાઇટ / કાંકરી",
          hi: "मोटी रेत / परलाइट / कंकड़",
        },
        pct: 50,
        color: "#e0e0e0",
      },
      {
        name: {
          en: "Potting Soil",
          gu: "પોટિંગ માટી",
          hi: "पोटिंग मिट्टी",
        },
        pct: 30,
        color: "#795548",
      },
      {
        name: {
          en: "Cocopeat",
          gu: "કોકોપીટ",
          hi: "कोकोपीट",
        },
        pct: 10,
        color: "#8d6e63",
      },
      {
        name: {
          en: "Organic Compost",
          gu: "ઓર્ગેનિક કમ્પોસ્ટ ખાતર",
          hi: "जैविक कम्पोस्ट खाद",
        },
        pct: 10,
        color: "#5d4037",
      },
    ],
    fertilizer: {
      en: "Mild organic feed once every 30-45 days during spring/summer only",
      gu: "ફક્ત વસંત/ઉનાળામાં દર ૩૦-૪૫ દિવસે એક વાર હળવું ઓર્ગેનિક ખાતર આપો",
      hi: "केवल वसंत/गर्मी में हर 30-45 दिनों में एक बार हल्का जैविक खाद दें",
    },
    drainageTip: {
      en: "Terracotta clay pots work best because their porous walls allow soil to dry quickly.",
      gu: "માટીના કુંડા સૌથી શ્રેષ્ઠ રહે છે કારણ કે તેનાથી માટી ઝડપથી સુકાય છે.",
      hi: "मिट्टी के गमले सबसे अच्छे रहते हैं क्योंकि उनसे मिट्टी जल्दी सूख जाती है।",
    },
  },
  veggie: {
    label: {
      en: "Veggies & Herbs (Tomato, Basil, Chili, Mint)",
      gu: "શાકભાજી અને ઔષધિઓ (ટામેટા, તુલસી, મરચાં, ફુદીનો)",
      hi: "सब्जियां और जड़ी-बूटियां (टमाटर, तुलसी, मिर्च, पुदीना)",
    },
    description: {
      en: "Nutrient-rich, moisture-retaining organic mix for fast-growing crops.",
      gu: "ઝડપી વિકાસ માટે પોષકતત્વોથી ભરપૂર અને ભેજ જાળવી રાખતી ઓર્ગેનિક માટી.",
      hi: "तेजी से बढ़ने वाली फसलों के लिए पोषक तत्वों से भरपूर और नमी बनाए रखने वाली मिट्टी।",
    },
    recipe: [
      {
        name: {
          en: "Rich Garden Soil",
          gu: "ફળદ્રુપ બગીચાની માટી",
          hi: "उपजाऊ बगीचे की मिट्टी",
        },
        pct: 40,
        color: "#795548",
      },
      {
        name: {
          en: "Organic Vermicompost / Manure",
          gu: "ઓર્ગેનિક વર્મીકમ્પોસ્ટ / દેશી ખાતર",
          hi: "जैविक वर्मीकम्पोस्ट / गोबर खाद",
        },
        pct: 30,
        color: "#5d4037",
      },
      {
        name: {
          en: "Cocopeat for moisture",
          gu: "ભેજ માટે કોકોપીટ",
          hi: "नमी के लिए कोकोपीट",
        },
        pct: 20,
        color: "#8d6e63",
      },
      {
        name: {
          en: "Perlite / Rice Husk for aeration",
          gu: "હવા માટે પરલાઇટ / ડાંગરનું ભૂસું",
          hi: "हवा के लिए परलाइट / धान की भूसी",
        },
        pct: 10,
        color: "#e0e0e0",
      },
    ],
    fertilizer: {
      en: "2 tbsp organic vermicompost or compost tea every 10–14 days during flowering & fruiting",
      gu: "ફૂલ અને ફળ આવે ત્યારે દર ૧૦-૧૪ દિવસે ૨ ચમચી વર્મીકમ્પોસ્ટ અથવા કમ્પોસ્ટ ટી",
      hi: "फूल और फल आने के दौरान हर 10-14 दिनों में 2 चम्मच वर्मीकम्पोस्ट या कम्पोस्ट टी",
    },
    drainageTip: {
      en: "Water deeply in the morning; tomatoes require deep containers (10–14 inches deep).",
      gu: "સવારે ઊંડું પાણી આપો; ટામેટાં માટે ઊંડા કુંડા (૧૦–૧૪ ઇંચ) વાપરો.",
      hi: "सुबह अच्छी तरह पानी दें; टमाटर के लिए गहरे गमले (10-14 इंच) आवश्यक हैं।",
    },
  },
  flowering: {
    label: {
      en: "Flowering & Roses (Hibiscus, Bougainvillea, Rose)",
      gu: "ફૂલછોડ અને ગુલાબ (જાસૂદ, બોગનવેલ, ગુલાબ)",
      hi: "फूल और गुलाब (गुड़हल, बोगनवेलिया, गुलाब)",
    },
    description: {
      en: "Balanced soil blend high in phosphorus and micronutrients for continuous blooms.",
      gu: "સતત ફૂલો માટે ફોસ્ફરસ અને સૂક્ષ્મ પોષકતત્વોથી સમૃદ્ધ સંતુલિત માટી.",
      hi: "लगातार फूलों के लिए फास्फोरस और सूक्ष्म पोषक तत्वों से भरपूर संतुलित मिट्टी।",
    },
    recipe: [
      {
        name: {
          en: "Garden Loam Soil",
          gu: "બગીચાની પોચી માટી",
          hi: "बगीचे की दोमट मिट्टी",
        },
        pct: 35,
        color: "#795548",
      },
      {
        name: {
          en: "Organic Vermicompost",
          gu: "ઓર્ગેનિક વર્મીકમ્પોસ્ટ",
          hi: "जैविक वर्मीकम्पोस्ट",
        },
        pct: 35,
        color: "#5d4037",
      },
      {
        name: {
          en: "Cocopeat",
          gu: "કોકોપીટ",
          hi: "कोकोपीट",
        },
        pct: 20,
        color: "#8d6e63",
      },
      {
        name: {
          en: "Neem Cake & Bio-Nutrients",
          gu: "લીંબોળી ખોળ અને બાયો-પોષકતત્વો",
          hi: "नीम की खली और जैव पोषक तत्व",
        },
        pct: 10,
        color: "#2e7d32",
      },
    ],
    fertilizer: {
      en: "Feed with seaweed extract or bone-meal bio-fertilizer every 14 days",
      gu: "દર ૧૪ દિવસે સીવીડ એક્સટ્રેક્ટ અથવા ઓર્ગેનિક બાયો-ખાતર આપો",
      hi: "हर 14 दिन में सीवीड अर्क या जैविक खाद दें",
    },
    drainageTip: {
      en: "Prune dead flowers (deadheading) to encourage vigorous new flower buds.",
      gu: "નવી કળીઓ માટે કરમાયેલા ફૂલોની છાંટણી (પ્રૂનિંગ) કરો.",
      hi: "नई कलियों को बढ़ावा देने के लिए सूखे हुए फूलों को काटें (प्रूनिंग करें)।",
    },
  },
};

export default function SoilPottingCalculator() {
  const { language, t } = useLanguage();
  const langKey = ["gu", "hi"].includes(language) ? language : "en";

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

  const currentUnitLabel = unit === "cm" ? t("cm_unit") : t("inches_unit");
  const selectedFertilizer = selectedType.fertilizer[langKey] || selectedType.fertilizer.en;
  const selectedDrainageTip = selectedType.drainageTip[langKey] || selectedType.drainageTip.en;

  return (
    <div className="soil-calculator-card">
      <div className="calc-header">
        <div className="calc-badge">
          <Calculator size={16} /> {t("smart_potting_tool")}
        </div>
        <h3>{t("potting_calc_h3")}</h3>
        <p className="muted text-sm">
          {t("potting_calc_desc")}
        </p>
      </div>

      <div className="calc-body-grid">
        {/* Input Controls */}
        <div className="calc-controls">
          <div className="control-group">
            <label className="control-label">{t("container_shape_label")}</label>
            <div className="segmented-toggle">
              <button
                type="button"
                className={`segment-btn ${potShape === "round" ? "active" : ""}`}
                onClick={() => setPotShape("round")}
              >
                {t("round_pot_btn")}
              </button>
              <button
                type="button"
                className={`segment-btn ${potShape === "rect" ? "active" : ""}`}
                onClick={() => setPotShape("rect")}
              >
                {t("rect_pot_btn")}
              </button>
            </div>
          </div>

          <div className="control-group">
            <div className="flex-between">
              <label className="control-label">{t("dimensions_label")}</label>
              <div className="unit-switch">
                <button
                  type="button"
                  className={unit === "inches" ? "active" : ""}
                  onClick={() => setUnit("inches")}
                >
                  {t("inches_unit")}
                </button>
                <button
                  type="button"
                  className={unit === "cm" ? "active" : ""}
                  onClick={() => setUnit("cm")}
                >
                  {t("cm_unit")}
                </button>
              </div>
            </div>

            {potShape === "round" ? (
              <div className="input-row-2">
                <label>
                  <span>{t("top_diameter")} ({currentUnitLabel})</span>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={diameter}
                    onChange={(e) => setDiameter(Math.max(1, Number(e.target.value)))}
                  />
                </label>
                <label>
                  <span>{t("pot_height")} ({currentUnitLabel})</span>
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
                  <span>{t("pot_length")} ({currentUnitLabel})</span>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={length}
                    onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                  />
                </label>
                <label>
                  <span>{t("pot_width")} ({currentUnitLabel})</span>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                  />
                </label>
                <label>
                  <span>{t("pot_rect_height")} ({currentUnitLabel})</span>
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
            <label className="control-label">{t("what_planting_label")}</label>
            <select
              className="calc-select"
              value={plantTypeKey}
              onChange={(e) => setPlantTypeKey(e.target.value)}
            >
              {Object.entries(PLANT_TYPES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label[langKey] || item.label.en}
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
              <span className="vol-unit">{t("liters_needed")}</span>
            </div>
            <span className="vol-sub">
              {langKey === "gu"
                ? `≈ ${volumeGallons} યુ.એસ. ગેલન / ${(volumeLiters * 1.05).toFixed(1)} ડ્રાય ક્વાર્ટ્સ`
                : langKey === "hi"
                ? `≈ ${volumeGallons} यूएस गैलन / ${(volumeLiters * 1.05).toFixed(1)} ड्राई क्वार्ट्स`
                : `≈ ${volumeGallons} US Gallons / ${(volumeLiters * 1.05).toFixed(1)} Dry Quarts`}
            </span>
          </div>

          <div className="recipe-section">
            <span className="recipe-title">
              <Layers size={15} /> {t("recipe_breakdown")}
            </span>
            <div className="recipe-bars">
              {selectedType.recipe.map((item, i) => {
                const itemLiters = Math.round((volumeLiters * (item.pct / 100)) * 10) / 10;
                const ingredientName = item.name[langKey] || item.name.en;
                return (
                  <div key={i} className="recipe-item">
                    <div className="recipe-item-header">
                      <span>{ingredientName}</span>
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
            <p className="fert-heading">{t("fert_care_routine")}</p>
            <p className="fert-text">{selectedFertilizer}</p>
            <p className="fert-sub text-xs muted">{selectedDrainageTip}</p>
          </div>

          <div className="calc-shop-cta">
            <Link to="/shop?category=698379bfca12f8450f3b0004" className="button button-sm full-width">
              <span>{t("shop_vermicompost_btn")}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
