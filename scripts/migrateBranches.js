// One-off migration to enable multi-branch tenancy on existing data.
// Run from backend/:  node scripts/migrateBranches.js
//
// What it does:
//  - Stamps every existing product/purchase/sale/client with branch "AIDO_GROUP"
//    (all pre-existing data belongs to the original AIDO Group branch).
//  - Gives existing users a home branch of "AIDO_GROUP".
//  - Grants canSwitchBranches: true to every existing "Boss" so they can switch
//    between AIDO Group and AIDO Paper Bags. Workers keep canSwitchBranches: false.
//
// It is idempotent and safe to re-run.

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/connectDB.js";
import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import Client from "../models/Client.js";
import User from "../models/User.js";

const DEFAULT_BRANCH = "AIDO_GROUP";

const stampBranch = async (model, label) => {
  const res = await model.collection.updateMany(
    { $or: [{ branch: { $exists: false } }, { branch: null }] },
    { $set: { branch: DEFAULT_BRANCH } },
  );
  console.log(`${label}: ${res.modifiedCount} doc(s) stamped with ${DEFAULT_BRANCH}`);
  return res;
};

const run = async () => {
  connectDB();
  await new Promise((resolve, reject) => {
    mongoose.connection.once("connected", resolve);
    mongoose.connection.on("error", reject);
  });

  await stampBranch(Product, "Products");
  await stampBranch(Purchase, "Purchases");
  await stampBranch(Sale, "Sales");
  await stampBranch(Client, "Clients");

  const users = await User.collection.updateMany(
    { $or: [{ branch: { $exists: false } }, { branch: null }] },
    { $set: { branch: DEFAULT_BRANCH } },
  );
  console.log(`Users: ${users.modifiedCount} doc(s) given home branch ${DEFAULT_BRANCH}`);

  const bosses = await User.collection.updateMany(
    { role: { $regex: /^boss$/i }, canSwitchBranches: { $ne: true } },
    { $set: { canSwitchBranches: true } },
  );
  console.log(`Bosses: ${bosses.modifiedCount} user(s) granted canSwitchBranches`);

  const bossList = await User.find({ canSwitchBranches: true }).select("fullName email role branch").lean();
  console.log("\nSwitch-capable users (can move between branches):");
  bossList.forEach((b) => console.log(`  - ${b.fullName} <${b.email}> (${b.role})`));

  await mongoose.disconnect();
  console.log("\nMigration complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
