import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { jwtSecret } from "./config/app-config.js";

const port = Number(process.env.PORT || 5000);

if (!jwtSecret) throw new Error("JWT_SECRET is required in production.");

connectDatabase()
  .then(() => app.listen(port, () => console.log(`Plant Nursery API listening on http://localhost:${port}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });