import mongoose from "mongoose";

/**
 * A mutual stamp creates a Match. The "blind sketch reveal" is driven by
 * `revealProgress` (0..100): as two people exchange messages and mutual
 * drawings it climbs, gradually un-blurring their real photos.
 */
const matchSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    // sorted "idA:idB" so a pair can only match once
    userKey: { type: String, required: true, unique: true },

    messageCount: { type: Number, default: 0 },
    mutualSketchCount: { type: Number, default: 0 },
    revealProgress: { type: Number, default: 0 },

    lastMessageAt: { type: Date },
    openers: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        image: String,
      },
    ],

    active: { type: Boolean, default: true },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export function makeUserKey(a, b) {
  return [String(a), String(b)].sort().join(":");
}

/**
 * Reveal curve: every message nudges the photo clearer, mutual sketches count
 * double. Caps at 100.
 */
export function computeReveal({ messageCount = 0, mutualSketchCount = 0 }) {
  const raw = messageCount * 3 + mutualSketchCount * 6;
  return Math.max(0, Math.min(100, raw));
}

const Match = mongoose.model("Match", matchSchema);

export default Match;
