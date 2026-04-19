import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, required: true, unique: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", ProductSchema);
