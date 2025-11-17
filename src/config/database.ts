import mongoose from "mongoose";

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("🟢 MongoDB already connected");
      return;
    }

    const DB_URI = process.env.DB_URI;
    if (!DB_URI) {
      throw new Error("DB_URI environment variable is not defined");
    }

    try {
      console.log("🔄 Connecting to MongoDB...");
      
      await mongoose.connect(DB_URI, {
        retryWrites: true,
        w: "majority",
      });

      this.isConnected = true;
      console.log("🟢 MongoDB connected successfully");

      // Handle connection events
      mongoose.connection.on("error", (error) => {
        console.error("🔴 MongoDB connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("🟡 MongoDB disconnected");
        this.isConnected = false;
      });
    

    } catch (error) {
      console.error("🔴 MongoDB connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log("🔴 MongoDB disconnected");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default Database.getInstance();