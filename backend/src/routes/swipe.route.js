import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { swipe, getIncomingStamps } from "../controllers/swipe.controller.js";

const router = express.Router();

router.post("/", protectRoute, swipe);
router.get("/incoming", protectRoute, getIncomingStamps);

export default router;
