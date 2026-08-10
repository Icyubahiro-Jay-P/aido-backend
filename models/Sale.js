import mongoose from "mongoose";

const BRANCHES = ["AIDO_GROUP", "AIDO_PAPER_BAGS"];

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
  amountPaid: { type: Number, default: 0, min: 0 }, // Cash actually received
  balance: { type: Number, default: 0, min: 0 }, // Outstanding credit = totalAmount - amountPaid
  paymentMethod: { type: String, enum: ["Cash", "MoMo"], default: "Cash" },
  saleDate: { type: Date, default: Date.now },
  notes: { type: String },
  branch: {
    type: String,
    enum: BRANCHES,
    required: true,
    index: true,
  },
  clientMutationId: { type: String },
});

// Idempotency guard for offline sync replay: unique per branch.
// Partial filter indexes ONLY string clientMutationIds, so docs with a missing
// or null value are never indexed (avoids E11000 on duplicate null keys).
SaleSchema.index(
  { clientMutationId: 1, branch: 1 },
  {
    name: "cmi_branch_unique",
    unique: true,
    partialFilterExpression: { clientMutationId: { $type: "string" } },
  },
);

export default mongoose.model("Sale", SaleSchema);
