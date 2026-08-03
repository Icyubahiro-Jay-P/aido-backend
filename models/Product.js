import mongoose from "mongoose";

const BRANCHES = ["AIDO_GROUP", "AIDO_PAPER_BAGS"];

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, required: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  branch: {
    type: String,
    enum: BRANCHES,
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// SKUs are unique per branch (both businesses may use overlapping SKUs).
ProductSchema.index({ sku: 1, branch: 1 }, { unique: true });

export default mongoose.model("Product", ProductSchema);
