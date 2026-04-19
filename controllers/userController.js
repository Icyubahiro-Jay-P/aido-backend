import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      nationalIdentity,
      dateOfBirth,
      phoneNumber,
      role,
      createdAt,
      updatedAt,
    } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      nationalIdentity,
      dateOfBirth,
      phoneNumber,
      role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Must be true for Render/HTTPS
      sameSite: "none", // Crucial: Allows cookie sharing between Vercel and Render
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login successful", token: token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user profile minus password
export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, nationalIdentity, dateOfBirth, phoneNumber } =
      req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.nationalIdentity = nationalIdentity || user.nationalIdentity;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();
    res.json({ message: "User profile updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find().select("-password").skip(skip).limit(limit);

    res.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "There is no user with that email" });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset url
    const resetUrl = `https://aido-group-company-ltd.vercel.app/reset-password/${resetToken}`;

    // 🔥 Beautiful HTML email based on your dashboard
    const message = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { margin:0; padding:0; background:#f4f7fa; font-family:'Inter',system-ui,sans-serif; }
        .email-container { max-width:600px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08); }
        .header { background:linear-gradient(135deg,#10b981,#059669); padding:40px 30px; text-align:center; color:white; }
        .header h1 { margin:0; font-size:28px; font-weight:700; }
        .content { padding:40px 35px; }
        .greeting { font-size:18px; font-weight:600; color:#1f2937; margin-bottom:8px; }
        .message { color:#4b5563; line-height:1.7; font-size:16px; margin-bottom:30px; }
        .button { display:inline-block; background:#10b981; color:white; padding:16px 36px; font-size:17px; font-weight:600; text-decoration:none; border-radius:12px; box-shadow:0 6px 20px rgba(16,185,129,0.3); }
        .button:hover { background:#059669; }
        .warning { background:#fef3c7; border-left:4px solid #f59e0b; padding:16px; border-radius:8px; margin:30px 0; color:#92400e; font-size:15px; }
        .footer { background:#f8fafc; padding:30px 35px; text-align:center; color:#6b7280; font-size:13px; border-top:1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Reset Your Password</h1>
            <p>Secure access to your building materials dashboard</p>
        </div>
        <div class="content">
            <p class="greeting">Hey ${user.fullName || "User"},</p>
            <p class="message">
                You requested a password reset for your Inventory Dashboard.<br><br>
                Click the button below to set a new password. This link expires in <strong>10 minutes</strong>.
            </p>
            <div style="text-align:center; margin:35px 0;">
                <a href="${resetUrl}" class="button" style="color:white;" target="_blank">Reset Password Now</a>
            </div>
            <div class="warning">
                <strong>⚠️ If you didn't request this, ignore this email.</strong><br>
                Your account is safe.
            </div>
        </div>
        <div class="footer">
            <p>Inventory Dashboard • Kigali, Rwanda</p>
            <p style="margin-top:10px; font-size:12px;">Thanks for corrabolating!</p>
        </div>
    </div>
</body>
</html>`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset - AIDO Group Company Limited",
        message, // Now sending full HTML
        html: message, // Most email services expect html field too
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ error: "Email could not be sent" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Set new password
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
