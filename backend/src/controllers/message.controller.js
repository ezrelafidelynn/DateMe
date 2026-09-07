import Match, { computeReveal } from "../models/match.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { uploadImage } from "../lib/upload.js";
import { moderateSketch } from "../lib/moderation.js";

async function loadMembership(matchId, userId) {
  const match = await Match.findOne({ _id: matchId, users: userId });
  if (!match) return null;
  const other = match.users.find((u) => String(u) !== String(userId));
  return { match, other };
}

export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const membership = await loadMembership(matchId, req.user._id);
    if (!membership) return res.status(404).json({ message: "Match not found" });

    const messages = await Message.find({ matchId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Send a message into a match. Handles every type: text, image, sketch,
 * sticker, voice-doodle, and a game result card. Sketches are moderated
 * before delivery; a brand-new match's drawings arrive covered.
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { matchId } = req.params;
    const membership = await loadMembership(matchId, senderId);
    if (!membership) return res.status(404).json({ message: "Match not found" });
    if (!membership.match.active) return res.status(410).json({ message: "This match is closed" });

    const { other, match } = membership;
    const { type = "text", text, image, sketch, sticker, audio, game } = req.body;

    const doc = { matchId, senderId, receiverId: other, type };
    let isSketchy = false;

    if (type === "text") {
      if (!text?.trim()) return res.status(400).json({ message: "Empty message" });
      doc.text = text.trim();
    } else if (type === "image") {
      doc.image = await uploadImage(image, "ezmatch/chat");
      if (text?.trim()) doc.text = text.trim();
    } else if (type === "sketch") {
      isSketchy = true;
      const verdict = await moderateSketch({ image: sketch?.image, text, strokes: sketch?.strokes });
      doc.moderation = { status: verdict.status, reason: verdict.reason };
      if (verdict.status === "blocked") {
        return res.status(422).json({ message: "That drawing was blocked by moderation." });
      }
      doc.sketch = {
        image: await uploadImage(sketch?.image, "ezmatch/sketch"),
        strokes: sketch?.strokes ?? null,
        strokeLimit: sketch?.strokeLimit ?? null,
      };
      if (text?.trim()) doc.text = text.trim();
    } else if (type === "sticker") {
      doc.sticker = { id: sticker?.id, image: await uploadImage(sticker?.image, "ezmatch/stickers") };
    } else if (type === "voice-doodle") {
      isSketchy = true;
      doc.audio = await uploadImage(audio, "ezmatch/audio");
      doc.sketch = { image: await uploadImage(sketch?.image, "ezmatch/sketch"), strokes: sketch?.strokes ?? null };
    } else if (type === "game") {
      doc.game = { kind: game?.kind, state: game?.state ?? null, result: game?.result ?? "" };
    } else {
      return res.status(400).json({ message: `Unknown message type: ${type}` });
    }

    // First few drawings from a fresh match land blurred until tapped.
    if ((type === "sketch" || type === "voice-doodle") && match.messageCount < 4) {
      doc.blurUntilOpened = true;
    }

    const message = await Message.create(doc);

    // Advance the blind-sketch reveal.
    match.messageCount += 1;
    if (isSketchy) match.mutualSketchCount += 1;
    match.revealProgress = computeReveal(match);
    match.lastMessageAt = new Date();
    await match.save();

    const receiverSocketId = getReceiverSocketId(String(other));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
      io.to(receiverSocketId).emit("match:reveal", {
        matchId: String(matchId),
        revealProgress: match.revealProgress,
      });
    }

    res.status(201).json({ message, revealProgress: match.revealProgress });
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Recipient taps a blurred drawing to open it. */
export const revealMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Message.findById(id);
    if (!msg || String(msg.receiverId) !== String(req.user._id)) {
      return res.status(404).json({ message: "Message not found" });
    }
    msg.blurUntilOpened = false;
    await msg.save();
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in revealMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
