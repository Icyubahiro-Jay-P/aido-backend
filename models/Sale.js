import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String, required: true },
      quantitySold: { type: Number, required: true, min: 1 },
      purchasePrice: { type: Number, required: true, min: 0 },
      unitPrice: { type: Number, required: true, min: 0 },
      totalPrice: { type: Number, required: true, min: 0 },
      profit: { type: Number, default: 0 }, // (unitPrice - purchasePrice) * quantitySold
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  totalProfit: { type: Number, default: 0 }, // Sum of all product profits
  paymentMethod: { type: String, enum: ["Cash", "MoMo"], default: "Cash" },
  saleDate: { type: Date, default: Date.now },
  notes: { type: String },
});

export default mongoose.model("Sale", SaleSchema);