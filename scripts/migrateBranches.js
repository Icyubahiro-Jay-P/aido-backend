// One-off migration for multi-branch tenancy on existing data.
// Run from backend/:  node scripts/migrateBranches.js
// (Or let the server run it automatically once on startup - see db/migrations.js)
//
// The migration itself lives in db/migrations.js (MIGRATIONS). It is recorded
// in the `migrations` collection after the first successful run, so this script
// is a manual trigger for the same logic the server auto-runs.

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/connectDB.js";
import { runMigrations } from "../db/migrations.js";
import User from "../models/User.js";

const run = async () => {
  connectDB();
  await new Promise((resolve, reject) => {
    mongoose.connection.once("connected", resolve);
    mongoose.connection.on("error", reject);
  });

  await runMigrations();

  const bossList = await User.find({ canSwitchBranches: true })
    .select("fullName email role branch")
    .lean();
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
