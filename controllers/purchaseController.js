import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";

// Create a new purchase
export const createPurchase = async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    
    // Update product quantities when purchase is created
    for (const item of purchase.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: item.quantityPurchased } },
        { new: true }
      );
    }
    
    await purchase.save();
    res.status(201).json({ message: "Purchase created successfully, stock updated", purchase });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all purchases
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ purchaseDate: -1 });
    res.status(200).json({ message: "Purchases retrieved successfully", purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single purchase by ID
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a purchase by ID
export const updatePurchase = async (req, res) => {
  try {
    const oldPurchase = await Purchase.findById(req.params.id);
    if (!oldPurchase) return res.status(404).json({ message: "Purchase not found" });
    
    // Reverse old product quantities
    for (const item of oldPurchase.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantityPurchased } },
        { new: true }
      );
    }
    
    // Apply new product quantities
    if (req.body.products) {
      for (const item of req.body.products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantityPurchased } },
          { new: true }
        );
      }
    }
    
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Purchase updated successfully", purchase });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a purchase by ID
export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    
    // Reverse product quantities when purchase is deleted
    for (const item of purchase.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantityPurchased } },
        { new: true }
      );
    }
    
    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
