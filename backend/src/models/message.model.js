import mongoose from "mongoose";

/**
 * Chat message. EzMatch keeps the original text/image messages and adds
 * creative types: freehand sketches, custom stickers, voice notes with a
 * synced scribble, and small game invites/results posted into the thread.
 */
const messageSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["text", "image", "sketch", "sticker", "voice-doodle", "game"],
      default: "text",
    },

    text: { type: String },
    image: { type: String },

    // sketch + voice-doodle share the strokes payload for replay
    sketch: {
      image: String, // rendered PNG data URL / hosted URL
      strokes: mongoose.Schema.Types.Mixed, // serialized strokes, normalized 0..1
      strokeLimit: Number, // e.g. 5 for quick openers
    },
    audio: { type: String }, // voice-doodle audio (data URL / hosted URL)

    sticker: {
      id: String,
      image: String,
    },

    game: {
      kind: { type: String }, // guess-the-doodle | exquisite-corpse | tic-tac-toe | hangman
      state: mongoose.Schema.Types.Mixed,
      result: String,
    },

    moderation: {
      status: {
        type: String,
        enum: ["clean", "flagged", "blocked", "pending"],
        default: "clean",
      },
      reason: String,
    },

    // drawings from a brand-new match arrive covered; the recipient taps to reveal
    blurUntilOpened: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
