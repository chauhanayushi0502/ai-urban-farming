import app from "../backend/app.js";
import { connectDatabase } from "../backend/config/database.js";

export default async function handler(req, res) {
  try {
    if (process.env.MONGO_URI) {
      await connectDatabase();
    }
  } catch (err) {
    console.warn("Serverless DB connection notice:", err.message);
  }

  return app(req, res);
}
