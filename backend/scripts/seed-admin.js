import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/index.js";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password === "change-this-before-seeding") {
    throw new Error("Set ADMIN_EMAIL and a new ADMIN_PASSWORD in the project .env before running this command.");
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery");
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    existingUser.role = "admin";
    existingUser.emailVerifiedAt ||= new Date();
    await existingUser.save();
    console.log(`Admin access enabled for ${email}. Existing password unchanged.`);
    return;
  }

  await User.create({ fullName: "Nursery Admin", email, password, role: "admin", emailVerifiedAt: new Date() });
  console.log(`Admin account created for ${email}. Sign in at http://localhost:5173/login.`);
}

seedAdmin().catch((error) => {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());