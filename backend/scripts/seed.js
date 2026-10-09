import "dotenv/config";
import mongoose from "mongoose";
import { Category, Product, User } from "../models/index.js";

const categoriesSeed = [
  { name: "ઇન્ડોર છોડ (Indoor plants)", image: "indoor.jpg" },
  { name: "આઉટડોર છોડ (Outdoor plants)", image: "outdoor.jpg" },
  { name: "ફૂલોના છોડ (Flowering plants)", image: "floweringplant.jpg" },
  { name: "છોડની સંભાળ અને રક્ષણ (Plant Care)", image: "tools.jpg" },
  { name: "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)", image: "pots1.jpg" },
  { name: "બીજ અને ઓજારો (Seeds & Tools)", image: "seeds.jpg" },
];

const productSeed = [
  // Indoor plants
  ["મની પ્લાન્ટ (Money Plant)", "ચમકદાર, દિલ આકારના પાંદડા ધરાવતો છોડ. હવાને શુદ્ધ કરે છે અને પરોક્ષ પ્રકાશમાં ખીલે છે.", 249, 25, "Money Plant.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["સ્નેક પ્લાન્ટ (Snake Plant)", "રાત્રે ઓક્સિજન છોડતો અને સૂર્યપ્રકાશ વિના પણ જીવતો ઉત્તમ ઇન્ડોર છોડ.", 399, 20, "snake.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["પીસ લીલી (Peace Lily)", "સફેદ સુંદર ફૂલો અને ઘેરા લીલા પાંદડા ધરાવતો હવા શુદ્ધ કરતો લોકપ્રિય છોડ.", 549, 15, "Peace Lily.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["ZZ પ્લાન્ટ (ZZ Plant)", "ઓછા પ્રકાશમાં પણ લીલોછમ રહેતો અને ઓછા પાણીની જરૂરિયાત વાળો સુંદર છોડ.", 449, 18, "ZZ Plant.jpg", "ઇન્ડોર છોડ (Indoor plants)"],
  ["એરેકા પામ (Areca Palm)", "ઘરની હવામાં કુદરતી ભેજ જાળવી રાખતો અને સુંદર દેખાવ આપતો ટ્રોપિકલ પામ.", 599, 12, "plam.jpg", "ઇન્ડોર છોડ (Indoor plants)"],

  // Outdoor plants
  ["ફિકસ ટ્રી (Ficus Tree)", "મજબૂત થડ અને ઘેરા લીલા પાંદડા ધરાવતો આઉટડોર ગાર્ડન છોડ.", 899, 10, "FicusTree.jpg", "આઉટડોર છોડ (Outdoor plants)"],
  ["રોયલ ગાર્ડન પામ (Garden Palm)", "તડકામાં અને બાલ્કનીમાં સુંદર દેખાવ આપતો રોયલ પામ છોડ.", 749, 8, "plam.jpg", "આઉટડોર છોડ (Outdoor plants)"],
  ["એવરગ્રીન ગાર્ડન શ્રબ (Garden Shrub)", "ઉનાળા અને ચોમાસામાં સતત લીલોછમ રહેતો આઉટડોર છોડ.", 349, 22, "outdoor.jpg", "આઉટડોર છોડ (Outdoor plants)"],

  // Flowering plants
  ["જાસૂદ / ગુડહલ (Hibiscus)", "લાલ અને ગુલાબી રંગના સુંદર ફૂલો આપતો તડકો પસંદ કરતો છોડ.", 329, 16, "Hibiscus.jpg", "ફૂલોના છોડ (Flowering plants)"],
  ["એક્ઝોટિક કલરફુલ ફ્લાવર ટ્રીઓ", "બાલ્કની અને બગીચા માટે સતત ફૂલો આપતો સુંદર રંગબેરંગી છોડ.", 499, 14, "floweringplant.jpg", "ફૂલોના છોડ (Flowering plants)"],

  // Plant Care & Protection
  ["શુદ્ધ લીમડાનું તેલ સ્પ્રે - 500ml (Neem Oil)", "જૈવિક કીટનાશક અને ફૂગનાશક. પાંદડાના રોગો, ગીચોડા અને જીવાત સામે રક્ષણ આપે છે.", 249, 45, "tools.jpg", "છોડની સંભાળ અને રક્ષણ (Plant Care)"],
  ["લિક્વિડ સીવીડ પ્લાન્ટ ટોનિક (Seaweed Food)", "100% કુદરતી માઇક્રો-ન્યુટ્રિઅન્ટ અને પ્લાન્ટ પ્રોટીન ટોનિક. છોડનો વિકાસ ઝડપી બનાવે છે.", 329, 40, "seeds.jpg", "છોડની સંભાળ અને રક્ષણ (Plant Care)"],
  ["જૈવિક વર્મીકમ્પોસ્ટ અળસિયાનું ખાતર (5kg)", "માટીની ભેજ સંગ્રહ શક્તિ વધારતું અને શુદ્ધ ઓર્ગેનિક પોષણ પૂરું પાડતું ખાતર.", 199, 60, "org.jpg", "છોડની સંભાળ અને રક્ષણ (Plant Care)"],

  // Pots & planters
  ["નર્સરી ગ્રોઈંગ કુંડું (Nursery Planter)", "છોડના સારા વિકાસ માટે યોગ્ય હવાયુક્ત કુંડું.", 199, 20, "org.jpg", "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)"],
  ["સેલ્ફ-વોટરિંગ બાલ્કની પ્લેન્ટર", "પાણીનું સ્તર દર્શાવતા નિર્દેશક સાથેનું સ્માર્ટ કુંડું, મૂળ સડ્યા વિના ભેજ જાળવે છે.", 349, 25, "org.jpg", "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)"],
  ["ગ્લેઝ્ડ સિરામિક કુંડું પ્લેટ સાથે", "ડ્રેનેજ હોલ ધરાવતું ટકાઉ અને આકર્ષક સિરામિક કુંડું.", 449, 18, "pots1.jpg", "કુંડાં અને પ્લેન્ટર્સ (Pots & Planters)"],

  // Seeds & tools
  ["ગાર્ડન સ્ટાર્ટર બીજ કિટ (Seeds Pack)", "તુલસી, ટામેટા અને લીલા શાકભાજી ઉગાડવા માટે શુદ્ધ બીજનું પેકેટ.", 149, 30, "seeds.jpg", "બીજ અને ઓજારો (Seeds & Tools)"],
  ["ગાર્ડન ટૂલ્સ સેટ - 3 નંગ (Garden Tools)", "માટી ખોદવા અને છોડ વાવવા માટે સ્ટેનલેસ સ્ટીલ ગાર્ડનિંગ ઓજારો.", 499, 18, "tools.jpg", "બીજ અને ઓજારો (Seeds & Tools)"],
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery");
  
  // Clean existing categories and products to re-seed cleanly in Gujarati
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Insert categories
  for (const c of categoriesSeed) {
    await Category.create(c);
  }
  const categories = await Category.find();
  const categoryByName = new Map(categories.map((c) => [c.name, c._id]));

  // Insert products
  for (const [name, description, price, stock, image, categoryName] of productSeed) {
    const catId = categoryByName.get(categoryName);
    if (!catId) continue;
    await Product.create({ name, description, price, stock, image, category: catId });
  }
  console.log(`Seeded ${productSeed.length} products across ${categories.length} categories in Gujarati.`);

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