import { Notification } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ user: req.auth.id }).sort({ createdAt: -1 }).limit(30).lean(),
    Notification.countDocuments({ user: req.auth.id, readAt: null }),
  ]);
  res.json({ items, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.auth.id },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  if (!notification) return res.status(404).json({ message: "Notification not found." });
  res.json(notification);
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.auth.id, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ message: "All notifications marked as read." });
});