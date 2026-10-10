import jwt from "jsonwebtoken";
import { jwtSecret, tokenCookie } from "../config/app-config.js";

export function createToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: "10d" });
}

export function setAuthCookie(res, user) {
  res.cookie("nursery_token", createToken(user), tokenCookie);
}

export function clearAuthCookie(res) {
  const { maxAge, ...options } = tokenCookie;
  res.clearCookie("nursery_token", options);
}

export function userPayload(user) {
  return { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone, address: user.address, wishlist: user.wishlist };
}