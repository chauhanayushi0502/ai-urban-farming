import fs from "node:fs";
import path from "node:path";

const src = path.resolve("assets");
const dest = path.resolve("frontend", "dist", "assets");

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log("✓ Assets copied successfully to frontend/dist/assets");
} else {
  console.warn("⚠ Assets directory not found:", src);
}
