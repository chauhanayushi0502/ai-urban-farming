import jwt from "jsonwebtoken";
import { jwtSecret, tokenCookie } from "../config/app-config.js";

export function authenticate(req, res, next) {
  const token = req.cookies?.nursery_token;
  if (!token || !jwtSecret) return res.status(401).json({ message: "Please log in to continue." });
  try {
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.clearCookie("nursery_token", tokenCookie);
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

export function optionalAuthenticate(req, _res, next) {
  try {
    if (req.cookies?.nursery_token && jwtSecret) req.auth = jwt.verify(req.cookies.nursery_token, jwtSecret);
  } catch {
    req.auth = null;
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.auth?.role !== "admin") return res.status(403).json({ message: "Administrator access is required." });
  next();
}