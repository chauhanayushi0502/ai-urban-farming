import "dotenv/config";
import mongoose from "mongoose";
import { Category, Product, User } from "../models/index.js";

const categoriesSeed = [
  { name: "Indoor plants", image: "indoor.jpg" },
  { name: "Outdoor plants", image: "outdoor.jpg" },
  { name: "Flowering plants", image: "floweringplant.jpg" },
  { name: "Plant Care & Protection", image: "tools.jpg" },
  { name: "Pots & planters", image: "pots1.jpg" },
  { name: "Seeds & tools", image: "seeds.jpg" },
];

const productSeed = [
  // Indoor plants
  ["Money Plant (Devil's Ivy)", "A graceful trailing plant with glossy, variegated heart-shaped leaves. Air-purifying and thrives in indirect light.", 249, 25, "Money Plant.jpg", "Indoor plants"],
  ["Snake Plant (Sansevieria)", "A sculptural, upright plant that releases oxygen at night. Forgiving of missed waterings and drought-tolerant.", 399, 20, "snake.jpg", "Indoor plants"],
  ["Peace Lily (Spathiphyllum)", "Soft white blooms and deep green leaves make this a calm air-purifying favorite for bright indoor spaces.", 549, 15, "Peace Lily.jpg", "Indoor plants"],
  ["ZZ Plant (Zamioculcas)", "Glossy emerald foliage that thrives in low light, stores moisture efficiently, and needs minimal watering.", 449, 18, "ZZ Plant.jpg", "Indoor plants"],
  ["Areca Palm Houseplant", "Feathery, arching tropical fronds that naturally humidify room air and soften bright living areas.", 599, 12, "plam.jpg", "Indoor plants"],

  // Outdoor plants
  ["Ficus Tree (Weeping Fig)", "A leafy outdoor statement plant with a strong architectural trunk and a lush, weeping canopy.", 899, 10, "FicusTree.jpg", "Outdoor plants"],
  ["Royal Garden Palm", "Stately outdoor garden palm with symmetrical fronds, ideal for sunny terraces and balcony focal points.", 749, 8, "plam.jpg", "Outdoor plants"],
  ["Evergreen Garden Shrub", "A sun-hardy ornamental foliage shrub that stays verdant throughout hot summer and monsoon seasons.", 349, 22, "outdoor.jpg", "Outdoor plants"],

  // Flowering plants
  ["Hibiscus (Gudhal)", "A sun-loving flowering plant with vivid red and coral blooms that attract helpful garden pollinators.", 329, 16, "Hibiscus.jpg", "Flowering plants"],
  ["Exotic Flowering Trio", "Dense flowering cluster with continuous seasonal buds for vibrant color on your balcony or patio.", 499, 14, "floweringplant.jpg", "Flowering plants"],

  // Plant Care & Protection
  ["Pure Cold-Pressed Neem Oil Spray (500ml)", "Organic cold-pressed bio-pesticide and fungicide. Effectively controls leaf blight, powdery mildew, aphids, and mites.", 249, 45, "tools.jpg", "Plant Care & Protection"],
  ["Liquid Seaweed Plant Tonic (Protein & Nutrients)", "100% natural micro-nutrient and plant protein tonic. Promotes lush chlorophyll, root vigor, and immunity.", 329, 40, "seeds.jpg", "Plant Care & Protection"],
  ["Organic Vermicompost Soil Food (5kg)", "Pure earthworm casting compost that improves soil water retention, aeration, and delivers organic nutrition.", 199, 60, "org.jpg", "Plant Care & Protection"],

  // Pots & planters
  ["Nursery Planter", "A simple breathable planter for giving a growing plant a comfortable new home.", 199, 20, "org.jpg", "Pots & planters"],
  ["Self-Watering Balcony Planter", "Smart sub-irrigation planter with a water level indicator to maintain optimal moisture without root rot.", 349, 25, "org.jpg", "Pots & planters"],
  ["Glazed Ceramic Planter with Saucer", "High-fired artisan breathable ceramic container with drainage hole to protect roots from temperature swings.", 449, 18, "pots1.jpg", "Pots & planters"],

  // Seeds & tools
  ["Garden Starter Seeds", "A small seed collection including basil, tomato, and microgreens for fresh home harvesting.", 149, 30, "seeds.jpg", "Seeds & tools"],
  ["Garden Hand Tools (3-Piece)", "Ergonomic stainless-steel trowel, cultivator, and transplanter for effortless potting and aerating.", 499, 18, "tools.jpg", "Seeds & tools"],
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery");
  
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
  console.log(`Seeded ${productSeed.length} products across ${categories.length} categories.`);

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