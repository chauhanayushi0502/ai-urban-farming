import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const DEFAULT_MONGO_URI =
  "mongodb+srv://dbuser:db%40user@test.ntennoc.mongodb.net/plant_nursery?retryWrites=true&w=majority";

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  return cached.promise;
}