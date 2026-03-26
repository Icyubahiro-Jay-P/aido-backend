import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  nationalIdentity: { type: String, required: true, unique: true },
  dateOfBirth: { type: String, required: true },
  phoneNumber: { type: Number, required: true, unique: true },
  role: { type: String, required: true },
});

export default mongoose.model("User", UserSchema);