import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import apiRoutes from "./routes/index.js";
import { assetDirectory, frontendBuildDirectory } from "./config/app-config.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/assets", express.static(assetDirectory, { maxAge: "1d" }));
app.use("/api", apiRoutes);
app.get("/api/*", (_req, res) => res.status(404).json({ message: "API route not found." }));
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendBuildDirectory));
  app.get("*", (_req, res) => res.sendFile(path.join(frontendBuildDirectory, "index.html")));
}

export default app;