import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./db/connectDB.js";
import { userRoutes } from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cookieParser from "cookie-parser";
import { runMigrations } from "./db/migrations.js";

connectDB();

// Run auto-migrations once the database is connected. Runs exactly once (each
// migration records itself in the `migrations` collection), so restarting or
// redeploying never re-runs it. Runs in the background: it never blocks or
// crashes the server - failures are logged and retried on the next boot.
mongoose.connection.on("connected", () => {
  runMigrations().catch((err) => {
    console.error("[migration] Could not run auto-migrations:", err.message);
  });
});

const app = express();
// Disable ETag generation so authenticated GET requests are never returned
// as 304 Not Modified. The browser caches the /profile response with its
// ETag, then on re-login sends If-None-Match and Express replies 304, which
// axios treats as an error -> user gets logged out despite valid credentials.
app.disable("etag");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    // origin: "*",
    origin: [
      "http://localhost:5173",
      "https://aido-group-company-ltd.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Inventory Management API is running" });
});

// Lightweight health check used by the frontend for online/offline detection.
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
