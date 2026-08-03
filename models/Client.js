import mongoose from "mongoose";

const BRANCHES = ["AIDO_GROUP", "AIDO_PAPER_BAGS"];

const ClientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "Rwanda",
  },
  taxId: {
    type: String,
    default: "",
  },
  businessName: {
    type: String,
    default: "",
  },
  clientType: {
    type: String,
    enum: ["Individual", "Business"],
    default: "Individual",
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  registeredDate: {
    type: Date,
    default: Date.now,
  },
  lastPurchaseDate: {
    type: Date,
  },
  notes: {
    type: String,
    default: "",
  },
  branch: {
    type: String,
    enum: BRANCHES,
    required: true,
    index: true,
  },
});

// Emails are unique per branch (both businesses may share client contacts).
ClientSchema.index({ email: 1, branch: 1 }, { unique: true });

export default mongoose.model("Client", ClientSchema);
