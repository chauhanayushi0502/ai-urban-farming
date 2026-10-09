import mongoose from "mongoose";

export async function connectDatabase() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery");
}