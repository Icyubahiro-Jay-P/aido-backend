// backend/db/migrations.js
// Auto-migrations that run exactly once on server startup (and stay runnable
// manually via `npm run migrate:branches`). Each migration claims itself in the
// `migrations` collection before running, so a restart or redeploy on Render
// never re-runs it. A failed run is un-claimed and retried on the next boot.
//
// What the branch migration does (idempotent operations under the hood):
//  - Stamps every existing product/purchase/sale/client with branch "AIDO_GROUP"
//    (all pre-existing data belongs to the original AIDO Group branch).
//  - Gives existing users a home branch of "AIDO_GROUP".
//  - Grants canSwitchBranches: true to every existing "Boss" so they can switch
//    between AIDO Group and AIDO Paper Bags. Workers keep canSwitchBranches: false.
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import Client from "../models/Client.js";
import User from "../models/User.js";

const DEFAULT_BRANCH = "AIDO_GROUP";

const migrationsCollection = () => mongoose.connection.db.collection("migrations");

const stampBranch = async (model, label) => {
  const res = await model.collection.updateMany(
    { $or: [{ branch: { $exists: false } }, { branch: null }] },
    { $set: { branch: DEFAULT_BRANCH } },
  );
  console.log(
    `[migration] ${label}: ${res.modifiedCount} doc(s) stamped with ${DEFAULT_BRANCH}`,
  );
  return res;
};

export const MIGRATIONS = [
  {
    key: "branch_tenancy_v1",
    name: "Multi-branch tenancy: stamp existing data + grant Bosses switching",
    run: async () => {
      await stampBranch(Product, "Products");
      await stampBranch(Purchase, "Purchases");
      await stampBranch(Sale, "Sales");
      await stampBranch(Client, "Clients");

      const users = await User.collection.updateMany(
        { $or: [{ branch: { $exists: false } }, { branch: null }] },
        { $set: { branch: DEFAULT_BRANCH } },
      );
      console.log(
        `[migration] Users: ${users.modifiedCount} doc(s) given home branch ${DEFAULT_BRANCH}`,
      );

      const bosses = await User.collection.updateMany(
        { role: { $regex: /^boss$/i }, canSwitchBranches: { $ne: true } },
        { $set: { canSwitchBranches: true } },
      );
      console.log(
        `[migration] Bosses: ${bosses.modifiedCount} user(s) granted canSwitchBranches`,
      );
    },
  },
];

// Runs any pending migrations. Safe to call on every startup: completed
// migrations are recorded and skipped; only unclaimed ones run.
export const runMigrations = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database not connected; cannot run migrations");
  }

  for (const migration of MIGRATIONS) {
    const claim = await migrationsCollection().updateOne(
      { key: migration.key },
      {
        $setOnInsert: {
          key: migration.key,
          name: migration.name,
          status: "running",
          runAt: new Date(),
        },
      },
      { upsert: true },
    );

    if (claim.upsertedCount === 0) {
      console.log(`[migration] Skipping "${migration.name}" (already run)`);
      continue;
    }

    try {
      console.log(`[migration] Running "${migration.name}"...`);
      await migration.run();
      await migrationsCollection().updateOne(
        { key: migration.key },
        { $set: { status: "done", finishedAt: new Date() } },
      );
      console.log(`[migration] Completed "${migration.name}".`);
    } catch (err) {
      // Release the claim so a crashed/failed migration is retried next boot.
      await migrationsCollection().deleteOne({ key: migration.key });
      console.error(`[migration] Failed "${migration.name}":`, err);
    }
  }
};
