import express from "express";

import {
  registerUser,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  changePassword,
  deleteUser,
  logout,
  login
} from "../controllers/userController.js";

const router = express.Router();
import { authMiddleware } from "../middleware/authMiddleware.js";

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/delete", authMiddleware, deleteUser);
router.get("/", authMiddleware, getAllUsers);

export const userRoutes = router;