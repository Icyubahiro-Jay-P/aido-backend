import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String, required: true },
      quantitySold: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      totalPrice: { type: Number, required: true, min: 0 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["Cash", "Card", "Check", "Transfer"], default: "Cash" },
  saleDate: { type: Date, default: Date.now },
  notes: { type: String },
});

export default mongoose.model("Sale", SaleSchema);