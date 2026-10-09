import { Notification } from "../models/index.js";

export async function createNotification({ user, type, title, message, link = "" }) {
  try {
    return await Notification.create({ user, type, title, message, link });
  } catch (error) {
    console.error("Failed to save in-app notification:", error.message);
    return null;
  }
}