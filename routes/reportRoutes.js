// this is the /routes/reportRoutes.js

import express from "express";
import {
  dailyIncome,
  dailyExpense,
  dailyProfit,
  dailyLoss,
  weeklyIncome,
  weeklyExpense,
  monthlyIncome,
  monthlyExpense,
  annualIncome,
  annualExpense,
  lowStockItems,
  dailyClients,
  weeklyClients,
  weeklyProfit,
  weeklyLoss,
  monthlyProfit,
  monthlyLoss,
  annualProfit,
  annualLoss,
  recentTransactions,
  getInventorySummary,          // ← the useful function I added earlier
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * REPORT ROUTES
 * All routes are GET because these are reporting / dashboard endpoints.
 * 
 * Recommended usage in your main server file (app.js or server.js):
 * 
 * import reportRoutes from "./routes/reportRoutes.js";
 * app.use("/api/reports", reportRoutes);
 * 
 * Then you can call:
 * GET http://localhost:5000/api/reports/daily-income
 * GET http://localhost:5000/api/reports/low-stock?threshold=5
 * etc.
 */

// ==================== INCOME ====================
router.get("/income/daily", dailyIncome);
router.get("/income/weekly", weeklyIncome);
router.get("/income/monthly", monthlyIncome);
router.get("/income/annual", annualIncome);

// ==================== EXPENSE ====================
router.get("/expense/daily", dailyExpense);
router.get("/expense/weekly", weeklyExpense);
router.get("/expense/monthly", monthlyExpense);
router.get("/expense/annual", annualExpense);

// ==================== PROFIT & LOSS ====================
router.get("/profit/daily", dailyProfit);
router.get("/profit/weekly", weeklyProfit);
router.get("/profit/monthly", monthlyProfit);
router.get("/profit/annual", annualProfit);

router.get("/loss/daily", dailyLoss);
router.get("/loss/weekly", weeklyLoss);
router.get("/loss/monthly", monthlyLoss);
router.get("/loss/annual", annualLoss);

// ==================== CLIENTS ====================
router.get("/clients/daily", dailyClients);
router.get("/clients/weekly", weeklyClients);

// ==================== INVENTORY & STOCK ====================
router.get("/low-stock", lowStockItems);           // supports ?threshold=10
router.get("/inventory-summary", getInventorySummary);

// ==================== TRANSACTIONS ====================
router.get("/recent-transactions", recentTransactions);

export default router;