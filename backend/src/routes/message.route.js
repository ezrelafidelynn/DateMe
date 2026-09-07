import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, revealMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:matchId", protectRoute, getMessages);
router.post("/:matchId", protectRoute, sendMessage);
router.patch("/reveal/:id", protectRoute, revealMessage);

export default router;
