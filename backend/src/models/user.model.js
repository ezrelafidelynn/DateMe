import mongoose from "mongoose";

/**
 * One answer to a visual icebreaker prompt ("Doodle your comfort food").
 * We keep both the rendered image (for fast display) and, optionally, the
 * serialized strokes so the doodle can be re-animated on a profile.
 */
const doodleAnswerSchema = new mongoose.Schema(
  {
    promptId: { type: String, required: true },
    prompt: { type: String, required: true },
    image: { type: String, default: "" },
    strokes: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },

    // Real photo. On EzMatch this stays blurred until a match earns the reveal.
    profilePic: { type: String, default: "" },

    // --- Drawing-first profile ---
    drawnAvatar: { type: String, default: "" }, // hand-drawn avatar (image data URL / hosted URL)
    drawnAvatarStrokes: { type: mongoose.Schema.Types.Mixed }, // optional strokes for re-animation
    bio: { type: String, default: "", maxlength: 300 },
    birthdate: { type: Date },
    gender: {
      type: String,
      enum: ["woman", "man", "nonbinary", "other", ""],
      default: "",
    },
    orientation: { type: [String], default: [] }, // who they're into: ["women","men","nonbinary"]
    location: {
      label: { type: String, default: "" },
      lat: { type: Number },
      lng: { type: Number },
    },
    interests: { type: [String], default: [] },
    doodleAnswers: { type: [doodleAnswerSchema], default: [] },
    notebookTheme: { type: String, default: "grid-paper" },

    // --- Matching preferences ---
    preferences: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 60 },
      maxDistanceKm: { type: Number, default: 160 },
      showMe: { type: [String], default: [] }, // ["women","men","nonbinary"]
    },

    // --- Safety ---
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    onboarded: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.virtual("age").get(function getAge() {
  if (!this.birthdate) return null;
  const diff = Date.now() - new Date(this.birthdate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;
