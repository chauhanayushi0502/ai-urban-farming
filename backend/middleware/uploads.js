import multer from "multer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { assetDirectory } from "../config/app-config.js";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const catalogDirectory = isServerless
  ? path.join("/tmp", "catalog")
  : path.join(assetDirectory, "images", "catalog");

try {
  for (const folder of ["categories", "products", "reviews"]) {
    mkdirSync(path.join(catalogDirectory, folder), { recursive: true });
  }
} catch {
  // Gracefully ignore in read-only serverless filesystems
}

const imageFilter = (_req, file, done) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return done(null, true);
  done(new Error("Please upload a JPG, PNG, or WebP image."));
};

export const plantPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const catalogImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, done) => {
      const dir = path.join(catalogDirectory, req.uploadFolder || "");
      try {
        mkdirSync(dir, { recursive: true });
      } catch {}
      done(null, dir);
    },
    filename: (_req, file, done) => done(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export function uploadCatalogImage(folder) {
  return (req, res, next) => {
    req.uploadFolder = folder;
    catalogImageUpload.single("image")(req, res, next);
  };
}

export function isValidPlantImage(buffer) {
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return jpeg || png || webp;
}

export function productImagePath(file) {
  return file ? `products/${file.filename}` : undefined;
}