import mongoose from "mongoose";

let memoryServer = null;

/**
 * Connect to MongoDB.
 *
 * - If `MONGODB_URI` is set, use it (local mongod or Atlas — data persists).
 * - Otherwise spin up an in-process `mongodb-memory-server` so EzMatch runs
 *   with zero database setup. That data is ephemeral: it lives only for the
 *   life of the process, so `npm run seed` only sticks with a real URI.
 */
export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      console.log("No MONGODB_URI set — started an in-memory MongoDB (ephemeral).");
    }

    const conn = await mongoose.connect(uri, { dbName: "ezmatch" });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) await memoryServer.stop();
};
