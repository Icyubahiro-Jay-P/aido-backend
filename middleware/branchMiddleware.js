// backend/middleware/branchMiddleware.js
// Resolves the tenant ("branch") for every business-data request.
// MUST be mounted AFTER authMiddleware.
import User from "../models/User.js";

export const BRANCHES = ["AIDO_GROUP", "AIDO_PAPER_BAGS"];

export const branchMiddleware = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select(
      "branch canSwitchBranches activeBranch",
    );
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Attach the authenticated user's own branch context for downstream use.
    req.homeBranch = user.branch;
    req.canSwitchBranches = user.canSwitchBranches;

    if (user.canSwitchBranches) {
      const headerBranch = req.headers["x-active-branch"];
      if (headerBranch && BRANCHES.includes(headerBranch)) {
        req.branch = headerBranch;
        if (headerBranch !== user.activeBranch) {
          // Fire-and-forget persistence of the last-viewed branch.
          User.findByIdAndUpdate(user._id, { activeBranch: headerBranch }).catch(() => {});
        }
      } else if (headerBranch) {
        // Present but invalid: reject loudly, never silently fall back.
        return res.status(400).json({ error: "Invalid branch context" });
      } else {
        req.branch = user.activeBranch || user.branch || "AIDO_GROUP";
      }
    } else {
      // Workers and fixed-branch Bosses are pinned to their home branch.
      // NEVER derived from client input.
      req.branch = user.branch;
    }

    if (!req.branch || !BRANCHES.includes(req.branch)) {
      return res.status(400).json({ error: "No branch context" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
