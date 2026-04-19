import Client from "../models/Client.js";

// Create a new client
export const createClient = async (req, res) => {
  try {
    const { fullName, email, phone, address, city, country, taxId, businessName, clientType, notes } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Client with this email already exists" });
    }

    const client = new Client({
      fullName,
      email,
      phone,
      address,
      city,
      country: country || "Rwanda",
      taxId,
      businessName,
      clientType,
      notes,
    });

    await client.save();
    res.status(201).json({ message: "Client registered successfully", client });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ registeredDate: -1 });
    res.status(200).json({ message: "Clients retrieved successfully", clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single client by ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json({ message: "Client retrieved successfully", client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get clients by status
export const getClientsByStatus = async (req, res) => {
  try {
    const { status } = req.query; // Changed from req.params to req.query
    const clients = await Client.find({ status }).sort({ registeredDate: -1 });
    res.status(200).json({ message: "Clients retrieved successfully", clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If email is being updated, check for duplicates
    if (updateData.email) {
      const existingClient = await Client.findOne({ email: updateData.email, _id: { $ne: id } });
      if (existingClient) {
        return res.status(400).json({ message: "Email already in use by another client" });
      }
    }

    const client = await Client.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.status(200).json({ message: "Client updated successfully", client });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search clients
export const searchClients = async (req, res) => {
  try {
    const { query } = req.query;
    const clients = await Client.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { businessName: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json({ message: "Clients found", clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client purchase stats
export const updateClientPurchaseStats = async (req, res) => {
  try {
    const { clientId, amount } = req.body;
    
    const client = await Client.findByIdAndUpdate(
      clientId,
      {
        $inc: { totalPurchases: 1, totalSpent: amount },
        lastPurchaseDate: new Date(),
      },
      { new: true }
    );

    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json({ message: "Purchase stats updated", client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
