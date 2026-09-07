import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { uploadImage } from "../lib/upload.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    generateToken(newUser._id, res);
    await newUser.save();

    const obj = newUser.toObject();
    delete obj.password;
    res.status(201).json(obj);
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    const obj = user.toObject();
    delete obj.password;
    res.status(200).json(obj);
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fields a user is allowed to set on their own profile.
const EDITABLE = [
  "fullName",
  "bio",
  "birthdate",
  "gender",
  "orientation",
  "location",
  "interests",
  "notebookTheme",
  "preferences",
];

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};
    const update = {};

    for (const key of EDITABLE) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Image-ish fields get funnelled through the uploader (Cloudinary or inline).
    if (body.profilePic !== undefined) {
      update.profilePic = await uploadImage(body.profilePic, "ezmatch/photos");
    }
    if (body.drawnAvatar !== undefined) {
      update.drawnAvatar = await uploadImage(body.drawnAvatar, "ezmatch/avatars");
      update.drawnAvatarStrokes = body.drawnAvatarStrokes ?? null;
    }
    if (Array.isArray(body.doodleAnswers)) {
      update.doodleAnswers = await Promise.all(
        body.doodleAnswers.map(async (d) => ({
          promptId: d.promptId,
          prompt: d.prompt,
          image: await uploadImage(d.image, "ezmatch/doodles"),
          strokes: d.strokes ?? null,
        }))
      );
    }

    if (body.onboarded === true) update.onboarded = true;
    update.lastActiveAt = new Date();

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    res.status(200).json(updated);
  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
