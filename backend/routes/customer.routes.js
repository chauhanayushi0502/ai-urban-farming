import { Router } from "express";
import {
  addCartItem, addWishlistItem, checkout, getCart, getWishlist, listMyOrders,
  cancelMyOrder, removeCartItem, removeWishlistItem, updateCartItem,
} from "../controllers/shopping.controller.js";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notification.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get("/cart", authenticate, getCart);
router.post("/cart/items", authenticate, addCartItem);
router.patch("/cart/items/:productId", authenticate, updateCartItem);
router.delete("/cart/items/:productId", authenticate, removeCartItem);
router.post("/checkout", authenticate, checkout);
router.get("/orders/mine", authenticate, listMyOrders);
router.post("/orders/:id/cancel", authenticate, cancelMyOrder);
router.get("/notifications", authenticate, listNotifications);
router.patch("/notifications/read-all", authenticate, markAllNotificationsRead);
router.patch("/notifications/:id/read", authenticate, markNotificationRead);
router.get("/wishlist", authenticate, getWishlist);
router.put("/wishlist/:productId", authenticate, addWishlistItem);
router.delete("/wishlist/:productId", authenticate, removeWishlistItem);

export default router;