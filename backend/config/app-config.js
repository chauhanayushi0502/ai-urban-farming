import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const projectRoot = path.resolve(backendDirectory, "..");
export const assetDirectory = path.join(projectRoot, "assets");
export const frontendBuildDirectory = path.join(projectRoot, "frontend", "dist");
export const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-development-secret-change-before-deploy");
export const tokenCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 10 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const settingsDefaults = {
  site_name: "ગ્રીન લીફ પ્લાન્ટ નર્સરી",
  contact_email: "greenleafnursery@gmail.com",
  contact_phone: "+91 98765 43210",
  address: "અમદાવાદ, ગુજરાત, ભારત",
  facebook: "#",
  instagram: "#",
  twitter: "#",
  currency: "₹",
  shipping_charge: "50",
  tax_rate: "5",
  gemini_api_key: process.env.GEMINI_API_KEY || "",
};