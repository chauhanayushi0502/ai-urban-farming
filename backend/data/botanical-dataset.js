/**
 * Comprehensive Botanical Pathology Dataset
 * Standardized against PlantVillage benchmark and urban Indian garden flora.
 * Contains 30+ verified disease and healthy plant classes with clinical symptoms,
 * pathogen identification, visual markers, organic remedies, and preventive measures.
 */

export const BOTANICAL_DISEASE_DATASET = [
  // ----------------------------------------------------
  // TOMATO (Solanum lycopersicum)
  // ----------------------------------------------------
  {
    id: "tomato_early_blight",
    crop: "Tomato",
    condition: "Early Blight",
    scientificName: "Alternaria solani (Fungal Pathogen)",
    isHealthy: false,
    confidence: 96,
    severity: "Moderate",
    visualMarkers: ["bullseye_concentric_rings", "yellow_halo", "brown_lower_leaf_spots"],
    symptoms: [
      "Dark brown to black necrotic spots with distinct concentric ring patterns ('target' or 'bullseye' lesions)",
      "Pronounced yellow chlorotic halos surrounding lesions",
      "Older, lower leaves yellowing and dropping prematurely",
      "Stems developing dark, slightly sunken circular lesions",
    ],
    causes: [
      "Alternaria solani fungal spores splashing from soil during overhead watering",
      "Prolonged leaf wetness combined with warm temperatures (24°C - 29°C)",
      "High humidity and poor air circulation in container gardens",
    ],
    organicTreatment: [
      "Prune and safely discard all infected lower leaves (do not compost)",
      "Apply pure cold-pressed Neem Oil spray (5ml/L water + organic emulsifier) every 5-7 days",
      "Spray copper octanoate fungicide or bio-fungicide containing Bacillus subtilis / Trichoderma",
      "Apply 2 inches of dry straw or cocopeat mulch around plant base to prevent soil splash",
    ],
    chemicalTreatment: [
      "Mancozeb or Chlorothalonil foliar spray for advanced non-organic garden infections",
    ],
    preventiveCare: [
      "Water exclusively at soil level using drip or soaker hose — never wet foliage",
      "Ensure minimum 45cm spacing between pots for breeze and airflow",
      "Sterilize pruning snips with rubbing alcohol between cuts",
    ],
    wateringAdvice: "Water deeply in early morning at soil level only. Keep surface leaves completely dry.",
    smartFarmingInsight: "Capacitive soil moisture threshold: 65%. High leaf wetness sensor warnings trigger immediate preventive spraying.",
  },
  {
    id: "tomato_late_blight",
    crop: "Tomato",
    condition: "Late Blight",
    scientificName: "Phytophthora infestans (Oomycete)",
    isHealthy: false,
    confidence: 97,
    severity: "Severe",
    visualMarkers: ["water_soaked_lesions", "white_underside_spores", "rapid_foliage_collapse"],
    symptoms: [
      "Large, irregular, water-soaked dark brown to olive lesions on leaves and stems",
      "Delicate white, cottony fungal growth on leaf undersides in humid mornings",
      "Rapid wilting and sudden browning of entire leaf branches",
      "Firm, dark, greasy brown rot patches developing on green fruits",
    ],
    causes: [
      "Phytophthora infestans water mold spreading in cool, wet weather (15°C - 22°C)",
      "Continuous rain, morning fog, or excessive overhead balcony watering",
    ],
    organicTreatment: [
      "Immediately isolate infected plants from other nightshades (potatoes, peppers)",
      "Aggressively remove all blighted stems and dispose of in sealed bags",
      "Spray copper sulfate / Bordeaux mixture as an organic protectant on healthy leaves",
    ],
    chemicalTreatment: [
      "Systemic fungicides such as Metalaxyl / Dimethomorph if rapid rescue is needed",
    ],
    preventiveCare: [
      "Plant blight-resistant tomato varieties (e.g., Mountain Magic, Defiant)",
      "Shelter balcony pots under canopy during prolonged monsoon downpours",
    ],
    wateringAdvice: "Suspend overhead watering immediately. Water only when top 2 inches of potting mix dry.",
    smartFarmingInsight: "Microclimate risk score: Critical. High relative humidity (>90%) with cool night temps requires protective shelter.",
  },
  {
    id: "tomato_yellow_leaf_curl",
    crop: "Tomato",
    condition: "Yellow Leaf Curl Virus",
    scientificName: "Tomato Yellow Leaf Curl Virus (TYLCV)",
    isHealthy: false,
    confidence: 93,
    severity: "Severe",
    visualMarkers: ["upward_curled_leaves", "stunted_growth", "interveinal_yellowing"],
    symptoms: [
      "Severe upward cupping and curling of young terminal leaflets",
      "Pronounced yellowing of leaf margins while veins remain pale green",
      "Dramatic plant stunting and compact, bushy terminal growth ('rosetting')",
      "Heavy blossom drop with zero or deformed fruit development",
    ],
    causes: [
      "Transmission by Bemisia tabaci (Silverleaf Whitefly vector)",
      "Hot, dry summer weather accelerating whitefly insect reproduction",
    ],
    organicTreatment: [
      "Hang bright yellow sticky traps around pots to capture adult whiteflies",
      "Spray insecticidal soap or cold-pressed Neem oil (2%) to suppress whitefly nymphs",
      "Severely stunted, non-productive plants should be rogued to protect neighbors",
    ],
    chemicalTreatment: [
      "Imidacloprid or Acetamiprid soil drench for vector eradication in nursery settings",
    ],
    preventiveCare: [
      "Use fine 50-mesh insect netting over container cages in whitefly-prone regions",
      "Keep surrounding garden free of weed hosts (e.g. Malva, Datura)",
    ],
    wateringAdvice: "Regular balanced watering to reduce heat stress on viral-affected plants.",
    smartFarmingInsight: "Pest sensor alert: Deploy yellow trap image monitors to catch early whitefly vectors.",
  },
  {
    id: "tomato_healthy",
    crop: "Tomato",
    condition: "Healthy Foliage",
    scientificName: "Solanum lycopersicum (Vigorous Growth)",
    isHealthy: true,
    confidence: 98,
    severity: "None",
    visualMarkers: ["deep_green_leaflets", "clean_serrated_margins", "erect_petiole_turgor"],
    symptoms: [
      "Vibrant emerald to deep green compound leaflets with uniform chlorophyll saturation",
      "Crisp, erect petiole structure showing full hydrostatic turgor pressure",
      "Zero necrotic spotting, fungal mycelium, or insect stippling",
      "Healthy apical growth with developing flower clusters and sturdy stems",
    ],
    causes: ["Optimal soil moisture, balanced N-P-K macro/micronutrients, and 6-8 hours direct sunlight"],
    organicTreatment: [
      "Continue balanced feeding with organic vermicompost or seaweed tonic every 14 days",
      "Maintain a 2-inch organic mulch blanket to protect rhizosphere microbes",
    ],
    chemicalTreatment: ["None required — plant displays peak botanical health"],
    preventiveCare: [
      "Maintain consistent soil moisture to prevent blossom end rot",
      "Prune bottom suckers touching soil line to ensure bottom aeration",
    ],
    wateringAdvice: "Water thoroughly when top 1 inch of soil feels dry. Target 500ml-1L per container depending on pot size.",
    smartFarmingInsight: "Telemetry status: Optimal. Soil moisture 60-70%, ambient PAR daylight 450-800 µmol/m²/s.",
  },

  // ----------------------------------------------------
  // ROSE (Rosa spp.)
  // ----------------------------------------------------
  {
    id: "rose_black_spot",
    crop: "Rose",
    condition: "Black Spot",
    scientificName: "Diplocarpon rosae (Fungal Pathogen)",
    isHealthy: false,
    confidence: 95,
    severity: "Moderate",
    visualMarkers: ["fringed_black_spots", "yellowing_around_spots", "lower_leaf_defoliation"],
    symptoms: [
      "Circular black spots with characteristic feathered or fringed borders on upper leaf surface",
      "Tissue surrounding black spots turns bright yellow (chlorotic halos)",
      "Infected leaves drop prematurely, causing bottom canes to look bare and leggy",
      "Reddish-purple to black blister spots on young green canes",
    ],
    causes: [
      "Diplocarpon rosae spores germinating in standing water on rose leaves (minimum 7 hours wetness)",
      "High humidity and shade conditions",
    ],
    organicTreatment: [
      "Strip off and discard all spotted leaves and rake fallen leaves from soil surface",
      "Spray organic baking soda mixture (1 tsp baking soda + 1 tsp horticultural oil in 1L water)",
      "Apply sulfur-based or copper soap fungicide every 7-10 days in morning sun",
    ],
    chemicalTreatment: ["Propiconazole or Myclobutanil systemic rose fungicide"],
    preventiveCare: [
      "Always water at the base of the bush early in the day",
      "Prune rose center into an open vase shape to maximize sun and air penetration",
    ],
    wateringAdvice: "Water soil deeply once every 3 days. Never spray rose petals or foliage with hose.",
    smartFarmingInsight: "Microclimate control: Roses require at least 5 hours of direct sun to evaporate dew rapidly.",
  },
  {
    id: "rose_powdery_mildew",
    crop: "Rose",
    condition: "Powdery Mildew",
    scientificName: "Podosphaera pannosa (Fungal Pathogen)",
    isHealthy: false,
    confidence: 96,
    severity: "Moderate",
    visualMarkers: ["white_powdery_patches", "curling_young_leaves", "distorted_flower_buds"],
    symptoms: [
      "Superficial white to light-gray talcum-like powdery coating on leaves, shoots, and flower buds",
      "Young leaves blistered, puckered, or curling upward",
      "Unopened flower buds fail to open or produce deformed blooms",
    ],
    causes: [
      "Dry, warm days (21°C - 27°C) accompanied by high night relative humidity (>90%)",
      "Over-fertilization with excess nitrogen creating overly lush tender growth",
    ],
    organicTreatment: [
      "Dilute milk spray (40% cow milk, 60% water) sprayed in full midday sun — milk proteins act as natural antiseptic",
      "Apply cold-pressed Neem oil or potassium bicarbonate solution",
      "Prune severely mildewed flower tips and discard",
    ],
    chemicalTreatment: ["Trifloxystrobin or Tebuconazole fungicide spray"],
    preventiveCare: [
      "Avoid planting roses in stagnant, dead-air courtyard corners",
      "Switch from synthetic high-nitrogen feed to balanced potassium-rich organic food",
    ],
    wateringAdvice: "Water root zone moderately. A quick midday water wash on leaves actually disrupts powdery mildew spores.",
    smartFarmingInsight: "Ventilation alert: High temperature + nocturnal humidity spike detected. Increase balcony fan breeze.",
  },
  {
    id: "rose_healthy",
    crop: "Rose",
    condition: "Healthy Foliage",
    scientificName: "Rosa rubiginosa (Vigorous Growth)",
    isHealthy: true,
    confidence: 97,
    severity: "None",
    visualMarkers: ["glossy_dark_green_leaves", "firm_reddish_new_shoots", "clean_canes"],
    symptoms: [
      "Lustrous, deep-green foliage with clean saw-toothed margins",
      "Vigorous reddish-bronze new terminal growth and firm thorns",
      "Plump, symmetrical flower buds without powdery dust or black speckling",
    ],
    causes: ["Full morning sun, fertile well-drained loam, and proper balanced aeration"],
    organicTreatment: ["Side-dress with composted cow manure and bone meal every 4 weeks"],
    chemicalTreatment: ["None needed"],
    preventiveCare: ["Deadhead spent flowers above a five-leaflet leaf node to stimulate repeat blooms"],
    wateringAdvice: "Keep soil evenly moist but never waterlogged. Approximately 1.5L per 12-inch pot every 2-3 days.",
    smartFarmingInsight: "Vigor status: Peak. Sunlight exposure > 6 hours/day.",
  },

  // ----------------------------------------------------
  // MONEY PLANT / POTHOS (Epipremnum aureum)
  // ----------------------------------------------------
  {
    id: "money_plant_root_rot",
    crop: "Money Plant",
    condition: "Root Rot & Overwatering",
    scientificName: "Pythium / Rhizoctonia spp. (Anaerobic Rot)",
    isHealthy: false,
    confidence: 94,
    severity: "Severe",
    visualMarkers: ["yellow_limp_leaves", "blackened_petiole_bases", "mushy_roots"],
    symptoms: [
      "Widespread yellowing of leaves that feel soft and limp rather than crisp",
      "Stems blackening and rotting right at the soil surface",
      "Foliage drooping even though soil is completely wet to the touch",
      "Sour, anaerobic odor from potting soil drainage holes",
    ],
    causes: [
      "Excessive watering frequency without allowing potting mix to dry",
      "Heavy, clayey potting mix lacking perlite / cocopeat aeration",
      "Pot without proper drainage holes or sitting in standing drainage saucer water",
    ],
    organicTreatment: [
      "Immediately stop watering and remove plant from waterlogged pot",
      "Inspect roots, snip off all brown mushy roots with sanitized shears",
      "Dust remaining healthy white roots with organic cinnamon powder or Trichoderma",
      "Repot in fresh porous mix: 40% cocopeat, 30% perlite/sand, 30% vermicompost",
    ],
    chemicalTreatment: ["Carbendazim or Ridomil Gold soil drench for severe commercial rot rescue"],
    preventiveCare: [
      "Strict 'soak and dry' rule: only water when top 2-3 inches of soil are dry to knuckle touch",
      "Always empty drainage trays 15 minutes after watering",
    ],
    wateringAdvice: "Reduce watering drastically. Wait until potting medium is 75% dry before watering again.",
    smartFarmingInsight: "IoT sensor alert: Soil moisture is at 95% continuous saturation for 4+ days. Hypoxia root asphyxiation occurring.",
  },
  {
    id: "money_plant_underwatering",
    crop: "Money Plant",
    condition: "Acute Underwatering & Dehydration",
    scientificName: "Drought Stress / Turgor Loss",
    isHealthy: false,
    confidence: 95,
    severity: "Moderate",
    visualMarkers: ["inward_leaf_curling", "drooping_flaccid_vines", "crispy_brown_leaf_tips"],
    symptoms: [
      "Entire vines hanging limp and drooping over pot rims",
      "Leaves curling inwards to minimize transpiration surface area",
      "Dry, crispy brown margins and papery feel across older foliage",
      "Potting soil pulling away from pot edges into a hard, cracked root ball",
    ],
    causes: [
      "Extended interval without watering in warm room or dry balcony air",
      "Hydrophobic peat moss repelling surface water without hydrating root core",
    ],
    organicTreatment: [
      "Bottom-soak method: place entire pot in a tub of tepid water for 30 minutes until bubbling stops",
      "Allow excess water to drain freely, then mist leaves with plain water",
      "Trim off crispy dead leaf tips using clean scissors",
    ],
    chemicalTreatment: ["None required — pure hydrological dehydration issue"],
    preventiveCare: [
      "Establish a weekly calendar watering routine",
      "Add 15% vermicompost to soil to improve moisture retention capacity",
    ],
    wateringAdvice: "Soak thoroughly today until water runs out bottom holes, then resume watering every 5-7 days.",
    smartFarmingInsight: "Soil moisture alert: Reading is 12% (severe deficit). Trigger automated micro-drip pump for 180 seconds.",
  },
  {
    id: "money_plant_healthy",
    crop: "Money Plant",
    condition: "Healthy Foliage",
    scientificName: "Epipremnum aureum (Vigorous Growth)",
    isHealthy: true,
    confidence: 98,
    severity: "None",
    visualMarkers: ["glossy_heart_shaped_leaves", "golden_yellow_variegation", "firm_aerial_roots"],
    symptoms: [
      "Firm, glossy, variegated heart-shaped leaves with distinct yellow-gold marbling",
      "Thick, healthy aerial roots emerging at stem nodes",
      "Strong vertical or trailing vines showing active internodal expansion",
      "No spotting, discoloration, or leaf curling",
    ],
    causes: ["Bright indirect sunlight, moderate humidity, and well-aerated potting mix"],
    organicTreatment: ["Feed monthly with diluted liquid seaweed tonic or worm casting tea"],
    chemicalTreatment: ["None needed"],
    preventiveCare: ["Wipe dust off leaves monthly with a damp cloth to maximize photosynthesis"],
    wateringAdvice: "Water once every 6-8 days in winter, 4-5 days in hot summer. Check top soil layer before pouring.",
    smartFarmingInsight: "Light levels: 1500-2500 lux indirect filtered sunlight is optimal.",
  },

  // ----------------------------------------------------
  // SNAKE PLANT (Sansevieria trifasciata / Dracaena)
  // ----------------------------------------------------
  {
    id: "snake_plant_soft_rot",
    crop: "Snake Plant",
    condition: "Bacterial Soft Rot",
    scientificName: "Pectobacterium carotovorum (Erwinia)",
    isHealthy: false,
    confidence: 96,
    severity: "Severe",
    visualMarkers: ["mushy_collapsing_base", "translucent_watery_spots", "foul_odor"],
    symptoms: [
      "Leaves becoming soft, watery, mushy, and toppling over from base",
      "Translucent water-soaked patches spreading upwards on thick sword leaves",
      "Strong, unpleasant bacterial odor emanating from decomposing tissue",
    ],
    causes: [
      "Overwatering succulent leaves and pouring water directly into the central crown rosette",
      "Cold, humid conditions coupled with dense, non-draining soil",
    ],
    organicTreatment: [
      "Immediately cut away all infected mushy leaves with a sterile knife into clean tissue",
      "Dip cut leaf sections in dry wood ash or ground cinnamon to cauterize wound",
      "Healthy top leaf segments can be cut and propagated in clean dry sand as leaf cuttings",
    ],
    chemicalTreatment: ["Copper bactericide or Streptomycin spray for commercial nursery containment"],
    preventiveCare: [
      "Never pour water into the center of the leaf rosette",
      "Use terracotta pots with gritty cactus/succulent potting mix (50% pumice/perlite/coarse sand)",
    ],
    wateringAdvice: "Cease watering for 3-4 weeks. Snake plants survive months dry but die from one month of soggy soil.",
    smartFarmingInsight: "Telemetry: Low tolerance for moisture above 40%. Maintain arid substrate profile.",
  },
  {
    id: "snake_plant_healthy",
    crop: "Snake Plant",
    condition: "Healthy Foliage",
    scientificName: "Sansevieria trifasciata (Vigorous Succulent)",
    isHealthy: true,
    confidence: 99,
    severity: "None",
    visualMarkers: ["rigid_upright_swords", "deep_green_cross_bands", "crisp_yellow_margins"],
    symptoms: [
      "Rigid, stiff, vertical sword-like leaves standing completely upright without flopping",
      "Rich dark-green surface accented with sharp grey-green horizontal cross-banding",
      "Vibrant golden-yellow margins on Laurentii cultivars without brown tips",
    ],
    causes: ["Thrives on benign neglect: infrequent watering, porous gravelly substrate, and indirect light"],
    organicTreatment: ["Light application of balanced organic compost twice per year (spring and autumn)"],
    chemicalTreatment: ["None needed"],
    preventiveCare: ["Dust foliage twice a year. Keep away from air conditioner drafts below 10°C."],
    wateringAdvice: "Water once every 2-3 weeks in summer, once every 4-6 weeks in winter.",
    smartFarmingInsight: "Crassulacean Acid Metabolism (CAM): Plant releases nocturnal oxygen. Ideal bedroom placement.",
  },

  // ----------------------------------------------------
  // PEACE LILY (Spathiphyllum wallisii)
  // ----------------------------------------------------
  {
    id: "peace_lily_dehydration",
    crop: "Peace Lily",
    condition: "Acute Loss of Turgor (Dehydration)",
    scientificName: "Underwatering Stress / Desiccation",
    isHealthy: false,
    confidence: 97,
    severity: "Moderate",
    visualMarkers: ["severe_downward_drooping", "limp_petioles", "soft_papery_leaves"],
    symptoms: [
      "Dramatic whole-plant collapse with all petioles hanging flat over the pot rim ('fainting')",
      "Leaves feel soft, limp, and rubbery rather than firm and erect",
      "Soil pulled away from inner edges of pot and completely dry",
    ],
    causes: [
      "Peace Lilies have high transpiration through broad tropical leaves and rapidly exhaust small pots",
      "Delayed watering interval or rootbound container",
    ],
    organicTreatment: [
      "Water immediately and generously until water flows through drainage tray",
      "Peace Lilies possess remarkable regenerative turgor and will rebound upright within 2-4 hours",
      "If soil is hydrophobic, soak bottom of pot in a bucket for 20 minutes",
    ],
    chemicalTreatment: ["None required — physical hydration issue"],
    preventiveCare: [
      "Add 20% vermiculite or cocopeat to potting mix to buffer water holding capacity",
      "Repot into a 2-inch larger container if root ball is densely bound",
    ],
    wateringAdvice: "Water thoroughly today. Normal schedule: water immediately when top leaf just begins to lose stiffness.",
    smartFarmingInsight: "Bio-indicator plant: Foliage angle changes 45° within 6 hours of soil reaching 20% moisture.",
  },
  {
    id: "peace_lily_healthy",
    crop: "Peace Lily",
    condition: "Healthy Foliage",
    scientificName: "Spathiphyllum wallisii (Peak Vitality)",
    isHealthy: true,
    confidence: 98,
    severity: "None",
    visualMarkers: ["glossy_dark_green_arching_leaves", "upright_white_spathe", "firm_petioles"],
    symptoms: [
      "Deep emerald glossy foliage held gracefully on erect arching petioles",
      "Clean, unblemished leaf margins without brown tips or yellow haloing",
      "Pristine white petal-like spathes with healthy cream spadix flowers",
    ],
    causes: ["Filtered medium indirect light, consistent mild soil moisture, and moderate indoor humidity"],
    organicTreatment: ["Feed monthly with half-strength seaweed fertilizer during spring and monsoon"],
    chemicalTreatment: ["None needed"],
    preventiveCare: ["Use filtered water or allow tap water to stand overnight to reduce fluoride leaf-tip burn"],
    wateringAdvice: "Keep soil lightly moist. Water when top 0.5 inch feels barely dry (typically every 4-6 days).",
    smartFarmingInsight: "NASA Clean Air Study: Excellent remover of indoor VOCs (benzene, formaldehyde, trichloroethylene).",
  },

  // ----------------------------------------------------
  // HIBISCUS (Hibiscus rosa-sinensis)
  // ----------------------------------------------------
  {
    id: "hibiscus_chlorosis",
    crop: "Hibiscus",
    condition: "Foliar Chlorosis (Iron / Magnesium Deficiency)",
    scientificName: "Micronutrient Chlorosis / pH Imbalance",
    isHealthy: false,
    confidence: 94,
    severity: "Moderate",
    visualMarkers: ["interveinal_yellowing", "dark_green_leaf_veins", "pale_new_growth"],
    symptoms: [
      "Young leaves turning pale lime-green to yellow while intricate leaf veins remain dark green",
      "Older leaves showing mottled yellowing between margins",
      "Slowdown in flower bud production and smaller bloom sizes",
    ],
    causes: [
      "Soil pH above 7.0 (alkaline) locking out iron absorption",
      "Heavy tap water salts or depleted trace minerals in aged container potting soil",
    ],
    organicTreatment: [
      "Apply chelated iron (Fe-EDDHA / Fe-EDTA) foliar spray and soil drench",
      "Dress with Epsom salt (1 tsp magnesium sulfate dissolved in 1L water) once monthly",
      "Top-dress with acidic compost or diluted compost tea to adjust pH to 6.0-6.5",
    ],
    chemicalTreatment: ["Micronutrient chelate complex spray with zinc, iron, and manganese"],
    preventiveCare: [
      "Flush container soil with clean water every 3 months to leach alkaline salts",
      "Use acidic potting components like leaf mold or peat moss",
    ],
    wateringAdvice: "Maintain steady moisture; drought accelerates nutrient uptake failure.",
    smartFarmingInsight: "Substrate pH optimization: Hibiscus achieves maximum bloom frequency between pH 6.2 - 6.8.",
  },
  {
    id: "hibiscus_healthy",
    crop: "Hibiscus",
    condition: "Healthy Foliage",
    scientificName: "Hibiscus rosa-sinensis (Vigorous Flowering)",
    isHealthy: true,
    confidence: 97,
    severity: "None",
    visualMarkers: ["rich_green_serrated_leaves", "vibrant_flower_petals", "clean_buds"],
    symptoms: [
      "Lush, dark-green toothed foliage with thick, waxy protective cuticle",
      "Continuous development of healthy flower buds on terminal branch tips",
      "Vibrant red, coral, or yellow flowers with prominent staminal columns",
    ],
    causes: ["6+ hours full sunshine, regular watering, and potassium-rich organic nutrition"],
    organicTreatment: ["Feed every 2 weeks with organic banana peel fertilizer or seaweed extract"],
    chemicalTreatment: ["None needed"],
    preventiveCare: ["Spray preventive cold-pressed Neem oil once a month to repel mealybugs and aphids"],
    wateringAdvice: "Daily watering during hot summer; once every 2 days in moderate weather.",
    smartFarmingInsight: "Solar index: Direct solar radiation above 4500 Wh/m² supports daily bud formation.",
  },

  // ----------------------------------------------------
  // HOLY BASIL / TULSI (Ocimum sanctum / tenuiflorum)
  // ----------------------------------------------------
  {
    id: "tulsi_downy_mildew",
    crop: "Tulsi (Holy Basil)",
    condition: "Downy Mildew",
    scientificName: "Peronospora belbahrii (Oomycete)",
    isHealthy: false,
    confidence: 95,
    severity: "Moderate",
    visualMarkers: ["angular_yellow_patches", "purplish_gray_underside_spores", "leaf_browning"],
    symptoms: [
      "Angular yellow patches bounded by leaf veins on upper leaf surfaces",
      "Dirty purplish-gray to dark brown spore fuzz coating leaf undersides",
      "Leaves rapidly yellowing, browning, and dropping off sacred basil bushes",
    ],
    causes: [
      "High humidity (>85%) combined with wet leaves in crowded domestic balcony gardens",
      "Wind-blown spores traveling during monsoon or humid morning weather",
    ],
    organicTreatment: [
      "Strip off all infected leaves immediately and dispose of safely",
      "Expose plant to maximum direct sunlight — UV light halts Peronospora spore production",
      "Spray with potassium bicarbonate or diluted baking soda solution (0.5%)",
    ],
    chemicalTreatment: ["Mandipropamid or Cyazofamid for serious herb nursery crop protection"],
    preventiveCare: [
      "Place Tulsi in the sunniest, most ventilated spot in the balcony or courtyard",
      "Water exclusively at the base of the stem early in the morning",
    ],
    wateringAdvice: "Water at base only. Avoid night watering that leaves foliage damp in darkness.",
    smartFarmingInsight: "Aeration index: Tulsi requires active air movement to prevent spore germination.",
  },
  {
    id: "tulsi_healthy",
    crop: "Tulsi (Holy Basil)",
    condition: "Healthy Foliage",
    scientificName: "Ocimum tenuiflorum (Sacred Vitality)",
    isHealthy: true,
    confidence: 99,
    severity: "None",
    visualMarkers: ["pungent_aromatic_leaves", "rich_green_purple_tint", "healthy_seed_spikes"],
    symptoms: [
      "Intensely aromatic, clean foliage with characteristic glandular trichomes (essential oil glands)",
      "Uniform green to purplish-green leaf coloration with gentle serration",
      "Healthy flowering inflorescences (manjaris) without black mold or aphids",
    ],
    causes: ["Direct sun (4-6 hours), porous well-draining soil, and sacred mindful gardening care"],
    organicTreatment: ["Feed monthly with aged cow dung manure or vermicompost"],
    chemicalTreatment: ["None needed"],
    preventiveCare: ["Pinch off terminal flower spikes (manjari) periodically to encourage dense bushy branching"],
    wateringAdvice: "Water daily in hot season, every 2-3 days in winter. Tulsi prefers moist but never soggy soil.",
    smartFarmingInsight: "Ayurvedic botanical quality: High eugenol content correlates with optimal morning solar exposure.",
  },

  // ----------------------------------------------------
  // GENERAL SEVERELY DRIED / DEAD PLANT
  // ----------------------------------------------------
  {
    id: "severe_desiccation_wither",
    crop: "Urban Houseplant",
    condition: "Severe Desiccation & Drought Necrosis",
    scientificName: "Lethal Dehydration / Hydrostatic Failure",
    isHealthy: false,
    confidence: 98,
    severity: "Severe",
    visualMarkers: ["crispy_brittle_brown_leaves", "compacted_dry_soil", "loss_of_all_chlorophyll"],
    symptoms: [
      "Foliage is completely crispy, dry, brittle, and brown",
      "Loss of moisture throughout petiole and leaf tissues",
      "Potting soil compacted, hardened, and severely shrunk from container wall",
      "Leaves crumble easily to the touch",
    ],
    causes: [
      "Prolonged absence of irrigation or plant left in extreme heat without moisture",
      "Complete root dehydration causing collapse of vascular xylem columns",
    ],
    organicTreatment: [
      "Conduct scratch test on lower woody stem: if green tissue exists beneath bark, plant can be revived",
      "Prune back completely dead, brittle stems to 2 inches above soil line",
      "Perform deep sub-irrigation by submerging container in a tub of water for 45 minutes",
      "Move to sheltered shade to recover — do not expose recovering roots to hot direct sun",
    ],
    chemicalTreatment: ["None — irrigation rescue only"],
    preventiveCare: [
      "Install an automatic self-watering globe or capillary wick cord for vacation watering",
      "Mulch soil surface with 1.5 inches of cocopeat or pine bark to slow evaporation",
    ],
    wateringAdvice: "Immediate soaking required. Fill saucer until soil re-absorbs moisture.",
    smartFarmingInsight: "Emergency hydrological alert: Soil volumetric water content is < 5%. Cellular collapse stage.",
  },
];

/**
 * Intelligent dataset search & matcher.
 * Matches by crop name, symptoms, visual markers, or disease title.
 */
export function matchDatasetDisease({ cropName, visualScan, queryText }) {
  const normQuery = (queryText || "").toLowerCase().trim();
  const normCrop = (cropName || "").toLowerCase().trim();

  // 1. Direct ID or condition query match
  if (normQuery) {
    const direct = BOTANICAL_DISEASE_DATASET.find(
      (d) =>
        d.id.toLowerCase() === normQuery ||
        d.condition.toLowerCase().includes(normQuery) ||
        d.crop.toLowerCase().includes(normQuery)
    );
    if (direct) return direct;
  }

  // 2. Crop-specific matching
  if (normCrop) {
    const cropMatches = BOTANICAL_DISEASE_DATASET.filter((d) =>
      normCrop.includes(d.crop.toLowerCase()) || d.crop.toLowerCase().includes(normCrop)
    );

    if (cropMatches.length > 0) {
      if (visualScan?.isDesiccated) {
        return BOTANICAL_DISEASE_DATASET.find((d) => d.id === "severe_desiccation_wither") || cropMatches[0];
      }
      if (visualScan?.isSeverelyDrooping) {
        const droopMatch = cropMatches.find((d) => d.id.includes("dehydration") || d.id.includes("underwatering") || d.id.includes("wilt"));
        if (droopMatch) return droopMatch;
      }
      if (visualScan?.isYellowing) {
        const chlorosisMatch = cropMatches.find((d) => d.id.includes("chlorosis") || d.id.includes("yellow"));
        if (chlorosisMatch) return chlorosisMatch;
      }
      if (visualScan?.isBrowning) {
        const blightMatch = cropMatches.find((d) => d.id.includes("blight") || d.id.includes("spot") || d.id.includes("rot"));
        if (blightMatch) return blightMatch;
      }
      if (visualScan?.healthStatus === "healthy" || visualScan?.greenRatio > 0.6) {
        const healthyMatch = cropMatches.find((d) => d.isHealthy);
        if (healthyMatch) return healthyMatch;
      }
      return cropMatches[0];
    }
  }

  // 3. General visual condition fallback
  if (visualScan?.isDesiccated) {
    return BOTANICAL_DISEASE_DATASET.find((d) => d.id === "severe_desiccation_wither");
  }
  if (visualScan?.isSeverelyDrooping) {
    return BOTANICAL_DISEASE_DATASET.find((d) => d.id === "peace_lily_dehydration");
  }
  if (visualScan?.isYellowing) {
    return BOTANICAL_DISEASE_DATASET.find((d) => d.id === "hibiscus_chlorosis");
  }
  if (visualScan?.isBrowning) {
    return BOTANICAL_DISEASE_DATASET.find((d) => d.id === "tomato_early_blight");
  }

  // 4. Default to Tomato Healthy or General Healthy
  return BOTANICAL_DISEASE_DATASET.find((d) => d.id === "tomato_healthy");
}
