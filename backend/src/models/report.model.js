import mongoose from "mongoose";

/** A block/report event. Drawing apps need this reachable in one tap. */
const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
    reason: { type: String, default: "" },
    context: { type: String, default: "" }, // offending message id / canvas snapshot URL
    status: {
      type: String,
      enum: ["open", "reviewed", "actioned"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
