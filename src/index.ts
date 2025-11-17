import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import database from "./config/database";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import limiter from './middleware/rateLimiter'
import stripeRoutes from "./routes/stripe";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Crowdera Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      admin: "/admin",
      products: "/products",
      cart: "/cart",
    },
    database: {
      connected: database.getConnectionStatus(),
    },
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use("/auth", authRoutes);

// Admin routes (protected)
app.use("/admin", limiter.limiter, adminRoutes);

// Product routes
app.use("/products", limiter.limiter, productRoutes);

// Cart routes (protected)
app.use("/cart", cartRoutes);

// Stripe routes
app.use("/stripe", stripeRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Initialize server with database connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;