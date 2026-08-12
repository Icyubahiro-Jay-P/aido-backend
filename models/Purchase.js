import mongoose from "mongoose";

const BRANCHES = ["AIDO_GROUP", "AIDO_PAPER_BAGS"];

const PurchaseSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: { type: String, required: true },
      quantityPurchased: { type: Number, required: true, min: 1 },
      unitCost: { type: Number, required: true, min: 0 },
      totalCost: { type: Number, required: true, min: 0 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ["Cash", "MoMo", "Credit"],
    default: "Cash",
  },
  purchaseDate: { type: Date, default: Date.now },
  invoiceNumber: { type: String },
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
PurchaseSchema.index(
  { clientMutationId: 1, branch: 1 },
  {
    name: "cmi_branch_unique",
    unique: true,
    partialFilterExpression: { clientMutationId: { $type: "string" } },
  },
);

export default mongoose.model("Purchase", PurchaseSchema);
