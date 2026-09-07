import mongoose from "mongoose";

/** A user-drawn sticker saved to their account for reuse in chats. */
const stickerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, default: "sticker" },
    image: { type: String, required: true }, // data URL / hosted URL
    strokes: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Sticker = mongoose.model("Sticker", stickerSchema);

export default Sticker;
