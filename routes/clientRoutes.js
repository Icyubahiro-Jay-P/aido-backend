import express from "express";
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

// Create a new client
router.post("/", createClient);

// Get all clients
router.get("/", getAllClients);

// Search clients
router.get("/search", searchClients);

// Get clients by status (query param)
// This is handled by the main GET route with status query param

// Get a single client by ID
router.get("/:id", getClientById);

// Update a client
router.put("/:id", updateClient);

// Delete a client
router.delete("/:id", deleteClient);

// Update client purchase stats
router.put("/:id/purchase-stats", updateClientPurchaseStats);

export default router;
