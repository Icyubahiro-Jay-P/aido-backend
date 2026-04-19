import express from "express";
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchaseController.js";

const router = express.Router();

/**
 * PURCHASE ROUTES (CRUD)
 * 
 * Recommended usage in your main server file (app.js or server.js):
 * 
 * import purchaseRoutes from "./routes/purchaseRoutes.js";
 * app.use("/api/purchases", purchaseRoutes);
 * 
 * Then you can call:
 * POST   http://localhost:5000/api/purchases
 * GET    http://localhost:5000/api/purchases
 * GET    http://localhost:5000/api/purchases/67e3f9a2c8d9e1b2a3f4c5d6
 * PUT    http://localhost:5000/api/purchases/67e3f9a2c8d9e1b2a3f4c5d6
 * DELETE http://localhost:5000/api/purchases/67e3f9a2c8d9e1b2a3f4c5d6
 */

// ==================== CRUD OPERATIONS ====================

// Create a new purchase
router.post("/", createPurchase);

// Get all purchases
router.get("/", getPurchases);

// Get a single purchase by ID
router.get("/:id", getPurchaseById);

// Update a purchase by ID
router.put("/:id", updatePurchase);

// Delete a purchase by ID
router.delete("/:id", deletePurchase);

export default router;
