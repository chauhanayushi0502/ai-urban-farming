import app from "../backend/app.js";
import { connectDatabase } from "../backend/config/database.js";

let isConnected = false;

export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (err) {
    console.warn("Serverless DB connection notice:", err.message);
  }

  return new Promise((resolve, reject) => {
    res.on("finish", resolve);
    res.on("close", resolve);
    res.on("error", reject);
    app(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
