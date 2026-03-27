// this is the /routes/productRoutes.js

import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

/**
 * PRODUCT ROUTES (CRUD)
 * 
 * Recommended usage in your main server file (app.js or server.js):
 * 
 * import productRoutes from "./routes/productRoutes.js";
 * app.use("/api/products", productRoutes);
 * 
 * Then you can call:
 * POST   http://localhost:5000/api/products
 * GET    http://localhost:5000/api/products
 * GET    http://localhost:5000/api/products/67e3f9a2c8d9e1b2a3f4c5d6
 * PUT    http://localhost:5000/api/products/67e3f9a2c8d9e1b2a3f4c5d6
 * DELETE http://localhost:5000/api/products/67e3f9a2c8d9e1b2a3f4c5d6
 */

// ==================== CRUD OPERATIONS ====================

// Create a new product
router.post("/", createProduct);

// Get all products
router.get("/", getProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product by ID
router.put("/:id", updateProduct);     // You can also use PATCH if you prefer partial updates

// Delete a product by ID
router.delete("/:id", deleteProduct);

export default router;