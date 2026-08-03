import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { branchMiddleware } from "../middleware/branchMiddleware.js";
import {
  createClient,
  getAllClients,
  getClientById,
  getClientsByStatus,
  updateClient,
  deleteClient,
  searchClients,
  updateClientPurchaseStats,
} from "../controllers/clientController.js";

const router = express.Router();

router.use(authMiddleware, branchMiddleware);

// Create a new client
router.post("/", createClient);

// Get all clients
router.get("/", getAllClients);

// Search clients
router.get("/search", searchClients);

// Get a single client by ID
router.get("/:id", getClientById);

// Update a client
router.put("/:id", updateClient);

// Delete a client
router.delete("/:id", deleteClient);

// Update client purchase stats
router.put("/:id/purchase-stats", updateClientPurchaseStats);

export default router;
