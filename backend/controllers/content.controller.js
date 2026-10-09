import { ContactMessage, Setting } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { settingsDefaults } from "../config/app-config.js";

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = { ...settingsDefaults };
  for (const setting of await Setting.find().lean()) settings[setting.key] = setting.value;
  res.json(settings);
});

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!String(name || "").trim() || !/^\S+@\S+\.\S+$/.test(String(email || "")) || !String(message || "").trim()) {
    return res.status(400).json({ message: "Name, a valid email, and a message are required." });
  }
  await ContactMessage.create({ name, email, message });
  res.status(201).json({ message: "Your message has been received." });
});