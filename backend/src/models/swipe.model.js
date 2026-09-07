import mongoose from "mongoose";

/**
 * A single "stamp or pass" decision. Swiping right on EzMatch leaves a
 * hand-drawn ink stamp (heart / smiley / wax-seal / star) and can carry a
 * tiny sketch opener (capped at a handful of strokes) instead of a "Hey".
 */
const swipeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["stamp", "pass"], required: true },
    stampStyle: {
      type: String,
      enum: ["heart", "smiley", "wax-seal", "star"],
      default: "heart",
    },
    opener: {
      image: { type: String, default: "" },
      strokes: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

swipeSchema.index({ from: 1, to: 1 }, { unique: true });

const Swipe = mongoose.model("Swipe", swipeSchema);

export default Swipe;
