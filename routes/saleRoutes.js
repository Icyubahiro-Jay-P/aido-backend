import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { branchMiddleware } from "../middleware/branchMiddleware.js";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  recordPayment,
} from "../controllers/saleController.js";

const router = express.Router();

router.use(authMiddleware, branchMiddleware);

// Create a new sale
router.post("/", createSale);

// Get all sales
router.get("/", getSales);

// Get a single sale by ID
router.get("/:id", getSaleById);

// Record a debt payment against a sale (reduces its outstanding balance)
router.post("/:id/pay", recordPayment);

// Update a sale by ID
router.put("/:id", updateSale);

// Delete a sale by ID
router.delete("/:id", deleteSale);

export default router;
