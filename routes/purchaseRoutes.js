import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { branchMiddleware } from "../middleware/branchMiddleware.js";
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchaseController.js";

const router = express.Router();

router.use(authMiddleware, branchMiddleware);

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
