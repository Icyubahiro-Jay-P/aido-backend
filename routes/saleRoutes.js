import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/saleController.js";

const router = express.Router();

/**
 * SALE ROUTES (CRUD)
 * 
 * Recommended usage in your main server file (app.js or server.js):
 * 
 * import saleRoutes from "./routes/saleRoutes.js";
 * app.use("/api/sales", saleRoutes);
 * 
 * Then you can call:
 * POST   http://localhost:5000/api/sales
 * GET    http://localhost:5000/api/sales
 * GET    http://localhost:5000/api/sales/67e3f9a2c8d9e1b2a3f4c5d6
 * PUT    http://localhost:5000/api/sales/67e3f9a2c8d9e1b2a3f4c5d6
 * DELETE http://localhost:5000/api/sales/67e3f9a2c8d9e1b2a3f4c5d6
 */

// ==================== CRUD OPERATIONS ====================

// Create a new sale
router.post("/", createSale);

// Get all sales
router.get("/", getSales);

// Get a single sale by ID
router.get("/:id", getSaleById);

// Update a sale by ID
router.put("/:id", updateSale);

// Delete a sale by ID
router.delete("/:id", deleteSale);

export default router;
