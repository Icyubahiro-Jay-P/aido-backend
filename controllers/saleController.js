import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// Create a new sale
export const createSale = async (req, res) => {
  try {
    const { products, clientName, paymentMethod, notes } = req.body;

    // Offline sync replay guard: never double-book the same sale.
    if (req.body.clientMutationId) {
      const existing = await Sale.findOne({
        clientMutationId: req.body.clientMutationId,
        branch: req.branch,
      });
      if (existing) {
        return res.status(200).json({
          message: "Sale already recorded",
          sale: existing,
          duplicate: true,
        });
      }
    }

    // Validate and enrich products with profit calculation
    const enrichedProducts = [];
    let totalProfit = 0;

    for (const item of products) {
      const product = await Product.findOne({ _id: item.productId, branch: req.branch });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productName} not found in this branch` });
      }

      // Validate stock availability
      if (product.quantity < item.quantitySold) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.productName}. Available: ${product.quantity}, Requested: ${item.quantitySold}`
        });
      }

      // Validate that unit price is higher than purchase price
      if (item.unitPrice <= product.purchasePrice) {
        return res.status(400).json({
          message: `Unit price for ${item.productName} (${item.unitPrice}) must be higher than purchase price (${product.purchasePrice})`
        });
      }

      // Calculate profit per product
      const profitPerUnit = item.unitPrice - product.purchasePrice;
      const productProfit = profitPerUnit * item.quantitySold;
      totalProfit += productProfit;

      enrichedProducts.push({
        productId: item.productId,
        productName: item.productName,
        quantitySold: item.quantitySold,
        purchasePrice: product.purchasePrice,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        profit: productProfit
      });
    }

    // Create the sale with profit information
    const saleData = {
      clientName,
      products: enrichedProducts,
      totalAmount: req.body.totalAmount,
      totalProfit,
      paymentMethod: paymentMethod || 'Cash',
      notes,
      branch: req.branch,
      clientMutationId: req.body.clientMutationId,
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Decrement product quantities in inventory
    for (const item of enrichedProducts) {
      await Product.findOneAndUpdate(
        { _id: item.productId, branch: req.branch },
        { $inc: { quantity: -item.quantitySold } },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Sale created successfully with profit calculated and inventory updated",
      sale
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ branch: req.branch }).sort({ saleDate: -1 });
    res.status(200).json({ message: "Sales retrieved successfully", sales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single sale by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, branch: req.branch });
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a sale by ID
export const updateSale = async (req, res) => {
  try {
    const oldSale = await Sale.findOne({ _id: req.params.id, branch: req.branch });
    if (!oldSale) return res.status(404).json({ message: "Sale not found" });

    const { products, clientName, paymentMethod, notes, totalAmount } = req.body;

    // Validate and enrich products with profit calculation
    const enrichedProducts = [];
    let totalProfit = 0;

    for (const newItem of products) {
      const oldItem = oldSale.products.find(p => p.productId.toString() === newItem.productId.toString());
      const quantityChange = newItem.quantitySold - (oldItem ? oldItem.quantitySold : 0);

      const product = await Product.findOne({ _id: newItem.productId, branch: req.branch });
      if (!product) {
        return res.status(404).json({ message: `Product ${newItem.productName} not found in this branch` });
      }

      // Validate stock availability for updated quantities
      if (product.quantity < quantityChange) {
        return res.status(400).json({
          message: `Insufficient stock for ${newItem.productName}. Available: ${product.quantity}`
        });
      }

      // Validate that unit price is higher than purchase price
      if (newItem.unitPrice <= product.purchasePrice) {
        return res.status(400).json({
          message: `Unit price for ${newItem.productName} (${newItem.unitPrice}) must be higher than purchase price (${product.purchasePrice})`
        });
      }

      // Calculate profit per product
      const profitPerUnit = newItem.unitPrice - product.purchasePrice;
      const productProfit = profitPerUnit * newItem.quantitySold;
      totalProfit += productProfit;

      enrichedProducts.push({
        productId: newItem.productId,
        productName: newItem.productName,
        quantitySold: newItem.quantitySold,
        purchasePrice: product.purchasePrice,
        unitPrice: newItem.unitPrice,
        totalPrice: newItem.totalPrice,
        profit: productProfit
      });
    }

    // Restore old quantities and deduct new quantities
    for (const oldItem of oldSale.products) {
      const newItem = enrichedProducts.find(p => p.productId.toString() === oldItem.productId.toString());
      if (newItem) {
        const quantityChange = newItem.quantitySold - oldItem.quantitySold;
        await Product.findOneAndUpdate(
          { _id: oldItem.productId, branch: req.branch },
          { $inc: { quantity: -quantityChange } },
          { new: true }
        );
      } else {
        // Product was removed, restore full quantity
        await Product.findOneAndUpdate(
          { _id: oldItem.productId, branch: req.branch },
          { $inc: { quantity: oldItem.quantitySold } },
          { new: true }
        );
      }
    }

    const updatedSaleData = {
      clientName,
      products: enrichedProducts,
      totalAmount,
      totalProfit,
      paymentMethod: paymentMethod || 'Cash',
      notes
    };

    const updatedSale = await Sale.findOneAndUpdate(
      { _id: req.params.id, branch: req.branch },
      updatedSaleData,
      { new: true },
    );
    res.status(200).json({
      message: "Sale updated successfully with profit recalculated and inventory adjusted",
      updatedSale
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a sale by ID
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, branch: req.branch });
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Restore product quantities to inventory when sale is deleted
    for (const item of sale.products) {
      await Product.findOneAndUpdate(
        { _id: item.productId, branch: req.branch },
        { $inc: { quantity: item.quantitySold } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Sale deleted successfully and inventory restored" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
