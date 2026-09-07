import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStickers, createSticker, deleteSticker } from "../controllers/sticker.controller.js";

const router = express.Router();

router.get("/", protectRoute, getStickers);
router.post("/", protectRoute, createSticker);
router.delete("/:id", protectRoute, deleteSticker);

export default router;
