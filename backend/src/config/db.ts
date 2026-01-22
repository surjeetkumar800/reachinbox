import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGO_URI, {
      autoIndex: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed");

    if (error instanceof Error) {
      console.error("Reason:", error.message);
    } else {
      console.error("Unknown MongoDB error:", error);
    }

    // Gracefully shutdown the app if DB connection fails
    process.exit(1);
  }
};
