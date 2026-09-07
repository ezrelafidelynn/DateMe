import mongoose from "mongoose";
import Swipe from "../models/swipe.model.js";
import Match, { makeUserKey } from "../models/match.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { emitToUser } from "../lib/socket.js";
import { uploadImage } from "../lib/upload.js";
import { moderateSketch } from "../lib/moderation.js";

/**
 * Record a stamp (right) or pass (left). A stamp can carry a tiny sketch
 * opener. If the other person already stamped us, it's a Match — we create the
 * Match, drop any openers in as the first messages, and ping both sockets.
 */
export const swipe = async (req, res) => {
  try {
    const from = req.user._id;
    const { to, action, stampStyle = "heart", opener } = req.body;

    if (!mongoose.isValidObjectId(to)) {
      return res.status(400).json({ message: "Bad target" });
    }
    if (!["stamp", "pass"].includes(action)) {
      return res.status(400).json({ message: "action must be stamp or pass" });
    }
    if (String(to) === String(from)) {
      return res.status(400).json({ message: "Cannot swipe yourself" });
    }

    let openerPayload = { image: "", strokes: null };
    if (action === "stamp" && opener?.image) {
      const verdict = await moderateSketch({ strokes: opener.strokes });
      if (verdict.status === "blocked") {
        return res.status(422).json({ message: "That sketch was blocked by moderation." });
      }
      openerPayload = {
        image: await uploadImage(opener.image, "ezmatch/openers"),
        strokes: opener.strokes ?? null,
      };
    }

    await Swipe.findOneAndUpdate(
      { from, to },
      { from, to, action, stampStyle, opener: openerPayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (action === "pass") return res.status(200).json({ matched: false });

    // did they already stamp us?
    const reciprocal = await Swipe.findOne({ from: to, to: from, action: "stamp" });
    if (!reciprocal) {
      emitToUser(to, "swipe:incoming", { from: String(from), stampStyle });
      return res.status(200).json({ matched: false });
    }

    // --- it's a match ---
    const userKey = makeUserKey(from, to);
    let match = await Match.findOne({ userKey });
    if (!match) {
      const openers = [];
      if (openerPayload.image) openers.push({ from, image: openerPayload.image });
      if (reciprocal.opener?.image) openers.push({ from: to, image: reciprocal.opener.image });

      match = await Match.create({ users: [from, to], userKey, openers });

      // seed opener sketches as the first thread messages
      for (const o of openers) {
        const other = String(o.from) === String(from) ? to : from;
        await Message.create({
          matchId: match._id,
          senderId: o.from,
          receiverId: other,
          type: "sketch",
          sketch: { image: o.image, strokeLimit: 5 },
          blurUntilOpened: true,
        });
      }
      if (openers.length) {
        match.messageCount = openers.length;
        match.lastMessageAt = new Date();
        await match.save();
      }
    }

    const populated = await Match.findById(match._id)
      .populate("users", "fullName drawnAvatar profilePic notebookTheme bio")
      .lean();

    const forFrom = { ...populated, withUser: populated.users.find((u) => String(u._id) !== String(from)) };
    const forTo = { ...populated, withUser: populated.users.find((u) => String(u._id) !== String(to)) };

    emitToUser(to, "match:new", forTo);
    emitToUser(from, "match:new", forFrom);

    res.status(201).json({ matched: true, match: forFrom });
  } catch (error) {
    console.log("Error in swipe:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Users who stamped me that I haven't answered yet (a "who likes you" teaser). */
export const getIncomingStamps = async (req, res) => {
  try {
    const me = req.user._id;
    const incoming = await Swipe.find({ to: me, action: "stamp" }).select("from stampStyle createdAt").lean();
    const mine = await Swipe.find({ from: me }).select("to").lean();
    const answered = new Set(mine.map((s) => String(s.to)));

    const pendingIds = incoming.filter((s) => !answered.has(String(s.from))).map((s) => s.from);
    const users = await User.find({ _id: { $in: pendingIds } })
      .select("fullName drawnAvatar interests notebookTheme age")
      .lean();

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getIncomingStamps:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
