import express from "express";

import {
  registerUser,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  changePassword,
  deleteUser,
  logout,
  login,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";

const router = express.Router();
import { authMiddleware } from "../middleware/authMiddleware.js";
import { branchMiddleware } from "../middleware/branchMiddleware.js";

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/user/:id", authMiddleware, branchMiddleware, deleteUser);
router.get("/", authMiddleware, branchMiddleware, getAllUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export const userRoutes = router;