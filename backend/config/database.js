import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery";

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((m) => {
      cached.conn = m;
      return m;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  return cached.promise;
}