import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  nationalIdentity: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);