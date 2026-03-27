import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String, required: true },
      quantityPurchased: { type: Number, required: true, min: 1 },
      unitCost: { type: Number, required: true, min: 0 },
      totalCost: { type: Number, required: true, min: 0 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["Cash", "Card", "Check", "Transfer"], default: "Cash" },
  purchaseDate: { type: Date, default: Date.now },
  invoiceNumber: { type: String },
  notes: { type: String },
});

export default mongoose.model("Purchase", PurchaseSchema);
