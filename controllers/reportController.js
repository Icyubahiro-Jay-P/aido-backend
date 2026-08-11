// this is the /controllers/reportController.js
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";

// Profit is recognised only from money actually received, not money still owed.
// For credit sales, only the paid share of the profit counts: totalProfit x (amountPaid / totalAmount).
const PAID_PROFIT_SUM = {
  $sum: {
    $cond: [
      { $gt: ["$totalAmount", 0] },
      {
        $multiply: [
          "$totalProfit",
          {
            $divide: [
              { $ifNull: ["$amountPaid", "$totalAmount"] },
              "$totalAmount",
            ],
          },
        ],
      },
      0,
    ],
  },
};

export const dailyIncome = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalIncome: { $sum: { $ifNull: ["$amountPaid", "$totalAmount"] } } } }
    ]);

    const income = result.length > 0 ? result[0].totalIncome : 0;
    res.status(200).json({ data: income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dailyExpense = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Purchase.aggregate([
      { $match: { branch: req.branch, purchaseDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalExpense: { $sum: "$totalAmount" } } }
    ]);

    const expense = result.length > 0 ? result[0].totalExpense : 0;
    res.status(200).json({ data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dailyProfit = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Use totalProfit field directly from sales (calculated at time of sale)
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const profit = result.length > 0 ? result[0].totalProfit : 0;
    res.status(200).json({ data: profit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dailyLoss = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Loss = negative profit (when profit < 0)
    // With validation preventing unitPrice <= purchasePrice, loss should be 0
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const totalProfit = result.length > 0 ? result[0].totalProfit : 0;
    const loss = totalProfit < 0 ? Math.abs(totalProfit) : 0;

    res.status(200).json({ data: loss });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const weeklyIncome = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalIncome: { $sum: { $ifNull: ["$amountPaid", "$totalAmount"] } } } }
    ]);

    const income = result.length > 0 ? result[0].totalIncome : 0;
    res.status(200).json({ data: income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const weeklyExpense = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const result = await Purchase.aggregate([
      { $match: { branch: req.branch, purchaseDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalExpense: { $sum: "$totalAmount" } } }
    ]);

    const expense = result.length > 0 ? result[0].totalExpense : 0;
    res.status(200).json({ data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const monthlyIncome = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalIncome: { $sum: { $ifNull: ["$amountPaid", "$totalAmount"] } } } }
    ]);

    const income = result.length > 0 ? result[0].totalIncome : 0;
    res.status(200).json({ data: income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const monthlyExpense = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await Purchase.aggregate([
      { $match: { branch: req.branch, purchaseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalExpense: { $sum: "$totalAmount" } } }
    ]);

    const expense = result.length > 0 ? result[0].totalExpense : 0;
    res.status(200).json({ data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const annualIncome = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, totalIncome: { $sum: { $ifNull: ["$amountPaid", "$totalAmount"] } } } }
    ]);

    const income = result.length > 0 ? result[0].totalIncome : 0;
    res.status(200).json({ data: income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const annualExpense = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    const result = await Purchase.aggregate([
      { $match: { branch: req.branch, purchaseDate: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, totalExpense: { $sum: "$totalAmount" } } }
    ]);

    const expense = result.length > 0 ? result[0].totalExpense : 0;
    res.status(200).json({ data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const lowStockItems = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10; // default low-stock threshold = 10
    const lowStock = await Product.find({
      branch: req.branch,
      quantity: { $lt: threshold }
    }).select("productName unitPrice purchasePrice quantity");

    res.status(200).json(lowStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dailyClients = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: "$clientName" } }
    ]);

    res.status(200).json({ data: result.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const weeklyClients = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$clientName" } }
    ]);

    res.status(200).json({ data: result.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const weeklyProfit = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Use totalProfit field directly from sales (calculated at time of sale)
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const profit = result.length > 0 ? result[0].totalProfit : 0;
    res.status(200).json({ data: profit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const weeklyLoss = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Loss = negative profit (when profit < 0)
    // With validation preventing unitPrice <= purchasePrice, loss should be 0
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const totalProfit = result.length > 0 ? result[0].totalProfit : 0;
    const loss = totalProfit < 0 ? Math.abs(totalProfit) : 0;

    res.status(200).json({ data: loss });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const monthlyProfit = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Use totalProfit field directly from sales (calculated at time of sale)
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const profit = result.length > 0 ? result[0].totalProfit : 0;
    res.status(200).json({ data: profit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const monthlyLoss = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Loss = negative profit (when profit < 0)
    // With validation preventing unitPrice <= purchasePrice, loss should be 0
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const totalProfit = result.length > 0 ? result[0].totalProfit : 0;
    const loss = totalProfit < 0 ? Math.abs(totalProfit) : 0;

    res.status(200).json({ data: loss });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const annualProfit = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    // Use totalProfit field directly from sales (calculated at time of sale)
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const profit = result.length > 0 ? result[0].totalProfit : 0;
    res.status(200).json({ data: profit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const annualLoss = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    // Loss = negative profit (when profit < 0)
    // With validation preventing unitPrice <= purchasePrice, loss should be 0
    const result = await Sale.aggregate([
      { $match: { branch: req.branch, saleDate: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } }
    ]);

    const totalProfit = result.length > 0 ? result[0].totalProfit : 0;
    const loss = totalProfit < 0 ? Math.abs(totalProfit) : 0;

    res.status(200).json({ data: loss });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recentTransactions = async (req, res) => {
  try {
    const limitCount = parseInt(req.query.limit) || 10;

    // Get recent sales as income transactions (amount = cash actually received)
    const sales = await Sale.find({ branch: req.branch })
      .select("_id clientName totalAmount amountPaid saleDate")
      .sort({ saleDate: -1 })
      .limit(limitCount)
      .lean();

    const saleTransactions = sales.map(sale => ({
      _id: sale._id,
      type: 'income',
      description: `Sale to ${sale.clientName}`,
      amount: sale.amountPaid ?? sale.totalAmount,
      date: sale.saleDate
    }));

    // Get recent purchases as expense transactions
    const purchases = await Purchase.find({ branch: req.branch })
      .select("_id supplierName totalAmount purchaseDate")
      .sort({ purchaseDate: -1 })
      .limit(limitCount)
      .lean();

    const purchaseTransactions = purchases.map(purchase => ({
      _id: purchase._id,
      type: 'expense',
      description: `Purchase from ${purchase.supplierName}`,
      amount: purchase.totalAmount,
      date: purchase.purchaseDate
    }));

    // Combine and sort by date
    const allTransactions = [...saleTransactions, ...purchaseTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limitCount);

    res.status(200).json({ data: allTransactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * getInventorySummary – provides a quick dashboard overview using only the current Product model.
 */
export const getInventorySummary = async (req, res) => {
  try {
    const products = await Product.find({ branch: req.branch });

    const totalProducts = products.length;

    const totalStockValueAtPurchase = products.reduce((sum, product) => {
      return sum + (product.quantity * product.purchasePrice);
    }, 0);

    const totalStockValueAtSale = products.reduce((sum, product) => {
      return sum + (product.quantity * product.unitPrice);
    }, 0);

    const lowStockCount = products.filter(p => p.quantity < 10).length;

    res.status(200).json({
      totalProducts,
      totalStockValueAtPurchasePrice: totalStockValueAtPurchase,
      totalStockValueAtSalePrice: totalStockValueAtSale,
      lowStockCount,
      message: "Summary calculated from current stock levels"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
