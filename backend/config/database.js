import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const DEFAULT_MONGO_URI =
  "mongodb+srv://dbuser:db%40user@test.ntennoc.mongodb.net/plant_nursery?retryWrites=true&w=majority";

export async function connectDatabase() {
  let uri = process.env.MONGO_URI;
  if (!uri || uri.includes("<username>") || uri.includes("<password>") || uri.includes("cluster0.mongodb.net")) {
    uri = DEFAULT_MONGO_URI;
  }

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