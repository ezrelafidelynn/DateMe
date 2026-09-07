import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMatches,
  getMatch,
  unmatch,
  blockUser,
  reportUser,
} from "../controllers/match.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMatches);
router.get("/:id", protectRoute, getMatch);
router.delete("/:id", protectRoute, unmatch);
router.post("/block/:userId", protectRoute, blockUser);
router.post("/report", protectRoute, reportUser);

export default router;
