import Sticker from "../models/sticker.model.js";
import { uploadImage } from "../lib/upload.js";
import { moderateSketch } from "../lib/moderation.js";

export const getStickers = async (req, res) => {
  try {
    const stickers = await Sticker.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(stickers);
  } catch (error) {
    console.log("Error in getStickers:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSticker = async (req, res) => {
  try {
    const { name = "sticker", image, strokes } = req.body;
    if (!image) return res.status(400).json({ message: "image is required" });

    const verdict = await moderateSketch({ image, strokes });
    if (verdict.status === "blocked") {
      return res.status(422).json({ message: "That sticker was blocked by moderation." });
    }

    const sticker = await Sticker.create({
      userId: req.user._id,
      name: String(name).slice(0, 40),
      image: await uploadImage(image, "ezmatch/stickers"),
      strokes: strokes ?? null,
    });
    res.status(201).json(sticker);
  } catch (error) {
    console.log("Error in createSticker:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSticker = async (req, res) => {
  try {
    const sticker = await Sticker.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!sticker) return res.status(404).json({ message: "Sticker not found" });
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in deleteSticker:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
