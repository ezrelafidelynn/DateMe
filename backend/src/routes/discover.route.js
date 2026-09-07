import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getDiscoverStack } from "../controllers/discover.controller.js";

const router = express.Router();

router.get("/", protectRoute, getDiscoverStack);

export default router;
