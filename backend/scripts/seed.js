import "dotenv/config";
import mongoose from "mongoose";
import { Category, Product, User, Coupon } from "../models/index.js";

const couponsSeed = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 299,
    maxDiscountAmount: 200,
    description: "10% off on your first order above ₹299",
    isActive: true,
  },
  {
    code: "SPRING20",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 799,
    maxDiscountAmount: 400,
    description: "20% off on gardening essentials above ₹799",
    isActive: true,
  },
  {
    code: "GREEN50",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 399,
    description: "Flat ₹50 off on orders above ₹399",
    isActive: true,
  },
];

const categoriesSeed = [
  { name: "Indoor plants", image: "indoor.jpg" },
  { name: "Outdoor plants", image: "outdoor.jpg" },
  { name: "Flowering plants", image: "floweringplant.jpg" },
  { name: "Plant Care & Protection", image: "tools.jpg" },
  { name: "Pots & planters", image: "pots1.jpg" },
  { name: "Seeds & tools", image: "seeds.jpg" },
  { name: "ઇન્ડોર છોડ (Indoor plants)", image: "indoor.jpg" },
  { name: "આઉટડોર છોડ (Outdoor plants)", image: "outdoor.jpg" },
  { name: "ફૂલોના છોડ (Flowering plants)", image: "floweringplant.jpg" },
  { name: "છોડની સંભાળ અને રક્ષણ (Plant Care)", image: "tools.jpg" },
  { name: "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)", image: "pots1.jpg" },
  { name: "બીજ અને ઓજારો (Seeds & Tools)", image: "seeds.jpg" },
];

const productSeed = [
  // Indoor plants (English)
  ["Money Plant (Devil's Ivy)", "A graceful trailing plant with glossy, variegated heart-shaped leaves. Air-purifying and thrives in indirect light.", 249, 25, "Money Plant.jpg", "Indoor plants"],
  ["Snake Plant (Sansevieria Trifasciata)", "A sculptural, upright plant that releases oxygen at night. Forgiving of missed waterings and drought-tolerant.", 399, 20, "snake.jpg", "Indoor plants"],
  ["Peace Lily (Spathiphyllum Wallisii)", "Soft white blooms and deep green leaves make this a calm air-purifying favorite for bright indoor spaces.", 549, 15, "Peace Lily.jpg", "Indoor plants"],
  ["ZZ Plant (Zamioculcas Zamiifolia)", "Glossy emerald foliage that thrives in low light, stores moisture efficiently, and needs minimal watering.", 449, 18, "ZZ Plant.jpg", "Indoor plants"],
  ["Areca Palm Houseplant", "Feathery, arching tropical fronds that naturally humidify room air and soften bright living areas.", 599, 12, "plam.jpg", "Indoor plants"],
  ["Lush Indoor Foliage Plant", "A compact, vibrant indoor accent plant suited for study desks, side tables, and filtered window corners.", 299, 24, "indoor.jpg", "Indoor plants"],

  // Outdoor plants (English)
  ["Ficus Tree (Weeping Fig)", "A leafy outdoor statement plant with a strong architectural trunk and a lush, weeping canopy.", 899, 10, "FicusTree.jpg", "Outdoor plants"],
  ["Royal Garden Palm", "Stately outdoor garden palm with symmetrical fronds, ideal for sunny terraces and balcony focal points.", 749, 8, "plam.jpg", "Outdoor plants"],
  ["Evergreen Garden Shrub", "A sun-hardy ornamental foliage shrub that stays verdant throughout hot summer and monsoon seasons.", 349, 22, "outdoor.jpg", "Outdoor plants"],
  ["Sun-Loving Patio Accent Tree", "A robust landscape specimen that thrives in full outdoor sunlight with low maintenance requirements.", 799, 14, "FicusTree.jpg", "Outdoor plants"],

  // Flowering plants (English)
  ["Hibiscus (Gudhal - Tropical Red)", "A sun-loving flowering plant with vivid red and coral blooms that attract helpful garden pollinators.", 329, 16, "Hibiscus.jpg", "Flowering plants"],
  ["Exotic Flowering Trio", "Dense flowering cluster with continuous seasonal buds for vibrant color on your balcony or patio.", 499, 14, "floweringplant.jpg", "Flowering plants"],
  ["Fragrant Terrace Blossom Plant", "Sweet-scented flowering specimen that blossoms abundantly during sunny spring and monsoon days.", 379, 19, "floweringplant.jpg", "Flowering plants"],

  // Plant Care & Protection (English)
  ["Pure Cold-Pressed Neem Oil Spray (500ml)", "Organic cold-pressed bio-pesticide and fungicide. Effectively controls leaf blight, powdery mildew, aphids, and mites.", 249, 45, "tools.jpg", "Plant Care & Protection"],
  ["Liquid Seaweed Plant Tonic (Protein & Nutrients)", "100% natural micro-nutrient and plant protein tonic. Promotes lush chlorophyll, root vigor, and immunity.", 329, 40, "seeds.jpg", "Plant Care & Protection"],
  ["Organic Vermicompost Soil Food (5kg)", "Pure earthworm casting compost that improves soil water retention, aeration, and delivers organic nutrition.", 199, 60, "org.jpg", "Plant Care & Protection"],
  ["Bio-Active Plant Booster & Root Stimulator", "Concentrated organic growth catalyst that enriches soil microbial life and accelerates healthy root establishment.", 279, 35, "tools.jpg", "Plant Care & Protection"],

  // Pots & planters (English)
  ["Eco-Clay Breathable Nursery Planter (8-inch)", "A simple porous clay planter for giving growing seedlings and repotted house plants a comfortable home.", 199, 20, "org.jpg", "Pots & planters"],
  ["Self-Watering Balcony Planter (Dual Reservoir)", "Smart sub-irrigation planter with a water level indicator to maintain optimal moisture without root rot.", 349, 25, "org.jpg", "Pots & planters"],
  ["Glazed Artisan Ceramic Planter with Saucer", "High-fired artisan breathable ceramic container with drainage hole to protect roots from temperature swings.", 449, 18, "pots1.jpg", "Pots & planters"],
  ["Textured Minimalist Round Planter (10-inch)", "Durable weather-resistant designer planter with drainage disc, ideal for indoor fiddle leaf figs and snake plants.", 399, 22, "pots1.jpg", "Pots & planters"],

  // Seeds & tools (English)
  ["Kitchen Garden Starter Seeds Pack", "Organic heirloom seed pack containing Italian sweet basil, cherry tomato, and cilantro for home harvesting.", 149, 30, "seeds.jpg", "Seeds & tools"],
  ["Heavy-Duty Ergonomic Garden Hand Tools (3-Piece)", "Stainless-steel trowel, cultivator rake, and transplanter with rubber grips for effortless potting and aerating.", 499, 18, "tools.jpg", "Seeds & tools"],
  ["Precision Botanical Pruning Shears", "Ultra-sharp bypass pruning snips for clean leaf trimming, deadheading blooms, and harvesting herbs.", 299, 25, "tools.jpg", "Seeds & tools"],

  // Gujarati Products
  ["મની પ્લાન્ટ (Money Plant)", "ચમકદાર, દિલ આકારના પાંદડા ધરાવતો છોડ. હવાને શુદ્ધ કરે છે અને પરોક્ષ પ્રકાશમાં ખીલે છે.", 249, 25, "Money Plant.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["સ્નેક પ્લાન્ટ (Snake Plant)", "રાત્રે ઓક્સિજન છોડતો અને સૂર્યપ્રકાશ વિના પણ જીવતો ઉત્તમ ઇન્ડોર છોડ.", 399, 20, "snake.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["પીસ લીલી (Peace Lily)", "સફેદ સુંદર ફૂલો અને ઘેરા લીલા પાંદડા ધરાવતો હવા શુદ્ધ કરતો લોકપ્રિય છોડ.", 549, 15, "Peace Lily.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["ZZ પ્લાન્ટ (ZZ Plant)", "ઓછા પ્રકાશમાં પણ લીલોછમ રહેતો અને ઓછા પાણીની જરૂરિયાત વાળો સુંદર છોડ.", 449, 18, "ZZ Plant.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["એરેકા પામ (Areca Palm)", "ઘરની હવામાં કુદરતી ભેજ જાળવી રાખતો અને સુંદર દેખાવ આપતો ટ્રોપિકલ પામ.", 599, 12, "plam.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["ફિકસ ટ્રી (Ficus Tree)", "મજબૂત થડ અને ઘેરા લીલા પાંદડા ધરાવતો આઉટડોર ગાર્ડન છોડ.", 899, 10, "FicusTree.jpg", "આઉટડોર છોડ (Outdoor plants)"],
  ["રોયલ ગાર્ડન પામ (Garden Palm)", "તડકામાં અને બાલ્કનીમાં સુંદર દેખાવ આપતો રોયલ પામ છોડ.", 749, 8, "plam.jpg", "આઉટડોર છોડ (Outdoor plants)"],
  ["એવરગ્રીન ગાર્ડન શ્રબ (Garden Shrub)", "ઉનાળા અને ચોમાસામાં સતત લીલોછમ રહેતો આઉટડોર છોડ.", 349, 22, "outdoor.jpg", "આઉટડોર છોડ (Outdoor plants)"],
  ["જાસૂદ / ગુડહલ (Hibiscus)", "લાલ અને ગુલાબી રંગના સુંદર ફૂલો આપતો તડકો પસંદ કરતો છોડ.", 329, 16, "Hibiscus.jpg", "ફૂલોના છોડ (Flowering plants)"],
  ["એક્ઝોટિક કલરફુલ ફ્લાવર ટ્રીઓ", "બાલ્કની અને બગીચા માટે સતત ફૂલો આપતો સુંદર રંગબેરંગી છોડ.", 499, 14, "floweringplant.jpg", "ફૂલોના છોડ (Flowering plants)"],
  ["શુદ્ધ લીમડાનું તેલ સ્પ્રે - 500ml (Neem Oil)", "જૈવિક કીટનાશક અને ફૂગનાશક. પાંદડાના રોગો, ગીચોડા અને જીવાત સામે રક્ષણ આપે છે.", 249, 45, "tools.jpg", "છોડની સંભાળ અને રક્ષણ (Plant Care)"],
  ["લિક્વિડ સીવીડ પ્લાન્ટ ટોનિક (Seaweed Food)", "100% કુદરતી માઇક્રો-ન્યુટ્રિઅન્ટ અને પ્લાન્ટ પ્રોટીન ટોનિક. છોડનો વિકાસ ઝડપી બનાવે છે.", 329, 40, "seeds.jpg", "છોડની સંભાળ અને રક્ષણ (Plant Care)"],
  ["જૈવિક વર્મીકમ્પોસ્ટ અળસિયાનું ખાતર (5kg)", "માટીની ભેજ સંગ્રહ શક્તિ વધારતું અને શુદ્ધ ઓર્ગેનિક પોષણ પૂરું પાડતું ખાતર.", 199, 60, "org.jpg", "છોડની સંભાળ અને રક્ષણ (Plant Care)"],
  ["નર્સરી ગ્રોઈંગ કુંડું (Nursery Planter)", "છોડના સારા વિકાસ માટે યોગ્ય હવાયુક્ત કુંડું.", 199, 20, "org.jpg", "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)"],
  ["સેલ્ફ-વોટરિંગ બાલ્કની પ્લેન્ટર", "પાણીનું સ્તર દર્શાવતા નિર્દેશક સાથેનું સ્માર્ટ કુંડું, મૂળ સડ્યા વિના ભેજ જાળવે છે.", 349, 25, "org.jpg", "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)"],
  ["ગ્લેઝ્ડ સિરામિક કુંડું પ્લેટ સાથે", "ડ્રેનેજ હોલ ધરાવતું ટકાઉ અને આકર્ષક સિરામિક કુંડું.", 449, 18, "pots1.jpg", "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)"],
  ["ગાર્ડન સ્ટાર્ટર બીજ કિટ (Seeds Pack)", "તુલસી, ટામેટા અને લીલા શાકભાજી ઉગાડવા માટે શુદ્ધ બીજનું પેકેટ.", 149, 30, "seeds.jpg", "બીજ અને ઓજારો (Seeds & Tools)"],
  ["ગાર્ડન ટૂલ્સ સેટ - 3 નંગ (Garden Tools)", "માટી ખોદવા અને છોડ વાવવા માટે સ્ટેનલેસ સ્ટીલ ગાર્ડનિંગ ઓજારો.", 499, 18, "tools.jpg", "બીજ અને ઓજારો (Seeds & Tools)"]
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery");
  
  // Upsert coupons
  for (const c of couponsSeed) {
    await Coupon.findOneAndUpdate({ code: c.code }, { $setOnInsert: c }, { upsert: true });
  }

  // Upsert categories
  for (const c of categoriesSeed) {
    await Category.findOneAndUpdate({ name: c.name }, { $setOnInsert: c }, { upsert: true });
  }
  const categories = await Category.find();
  const categoryByName = new Map(categories.map((c) => [c.name, c._id]));

  // Upsert products
  for (const [name, description, price, stock, image, categoryName] of productSeed) {
    const catId = categoryByName.get(categoryName);
    if (!catId) continue;
    await Product.findOneAndUpdate(
      { name },
      { name, description, price, stock, image, category: catId },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${productSeed.length} products across ${categories.length} categories with coupons.`);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && password !== "change-this-before-seeding") {
    const account = await User.findOne({ email });
    if (account) {
      account.role = "admin";
      account.emailVerifiedAt ||= new Date();
      await account.save();
      console.log(`Administrator access enabled for ${email}.`);
    } else {
      await User.create({ fullName: "Nursery Admin", email, password, role: "admin", emailVerifiedAt: new Date() });
      console.log(`Administrator account created for ${email}.`);
    }
  } else {
    console.log("No administrator created. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then run npm run seed.");
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());