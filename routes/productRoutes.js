import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { branchMiddleware } from "../middleware/branchMiddleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.use(authMiddleware, branchMiddleware);

// Create a new product
router.post("/", createProduct);

// Get all products
router.get("/", getProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product by ID
router.put("/:id", updateProduct);

// Delete a product by ID
router.delete("/:id", deleteProduct);

export default router;
