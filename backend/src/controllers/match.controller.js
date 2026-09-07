import mongoose from "mongoose";
import Match from "../models/match.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Report from "../models/report.model.js";
import { emitToUser } from "../lib/socket.js";

/** All active matches for the current user, newest activity first. */
export const getMatches = async (req, res) => {
  try {
    const me = req.user._id;
    const matches = await Match.find({ users: me, active: true })
      .populate("users", "fullName drawnAvatar profilePic notebookTheme birthdate bio")
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    const shaped = matches.map((m) => {
      const withUser = m.users.find((u) => String(u._id) !== String(me));
      return {
        _id: m._id,
        withUser: revealPhoto(withUser, m.revealProgress),
        revealProgress: m.revealProgress,
        messageCount: m.messageCount,
        lastMessageAt: m.lastMessageAt,
        createdAt: m.createdAt,
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    console.log("Error in getMatches:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** One match with its full context (used by the chat screen). */
export const getMatch = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    const m = await Match.findOne({ _id: id, users: me })
      .populate("users", "fullName drawnAvatar profilePic notebookTheme age bio interests doodleAnswers")
      .lean();
    if (!m) return res.status(404).json({ message: "Match not found" });

    const withUser = m.users.find((u) => String(u._id) !== String(me));
    res.status(200).json({
      _id: m._id,
      withUser: revealPhoto(withUser, m.revealProgress),
      revealProgress: m.revealProgress,
      messageCount: m.messageCount,
      mutualSketchCount: m.mutualSketchCount,
      active: m.active,
    });
  } catch (error) {
    console.log("Error in getMatch:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Un-match: closes the thread for both people. */
export const unmatch = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    const m = await Match.findOne({ _id: id, users: me });
    if (!m) return res.status(404).json({ message: "Match not found" });

    m.active = false;
    m.closedBy = me;
    await m.save();

    const other = m.users.find((u) => String(u) !== String(me));
    emitToUser(other, "match:closed", { matchId: String(m._id) });
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in unmatch:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Block a user: closes any match and hides you from each other everywhere. */
export const blockUser = async (req, res) => {
  try {
    const me = req.user._id;
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: "Bad user" });

    await User.findByIdAndUpdate(me, { $addToSet: { blockedUsers: userId } });
    await Match.updateMany(
      { users: { $all: [me, userId] } },
      { active: false, closedBy: me }
    );

    emitToUser(userId, "match:closed", { blocked: true });
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in blockUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** File a report (optionally about a specific message / canvas snapshot). */
export const reportUser = async (req, res) => {
  try {
    const reporter = req.user._id;
    const { reported, matchId, reason = "", context = "" } = req.body;
    if (!mongoose.isValidObjectId(reported)) return res.status(400).json({ message: "Bad user" });

    await Report.create({ reporter, reported, matchId: matchId || undefined, reason, context });
    res.status(201).json({ ok: true });
  } catch (error) {
    console.log("Error in reportUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * The real photo is only attached once the reveal has made progress; below the
 * threshold the client just gets the drawn avatar. We also hand back a blur
 * amount so the UI can animate the un-blur.
 */
function revealPhoto(user, revealProgress = 0) {
  if (!user) return user;
  const blurPx = Math.max(0, Math.round((1 - revealProgress / 100) * 24));
  let age = null;
  if (user.birthdate) {
    age = Math.floor((Date.now() - new Date(user.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000));
  }
  const out = { ...user, age, revealProgress, photoBlurPx: blurPx };
  delete out.birthdate;
  if (revealProgress < 10) delete out.profilePic; // nothing to peek at yet
  return out;
}
