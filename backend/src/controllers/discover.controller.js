import User from "../models/user.model.js";
import Swipe from "../models/swipe.model.js";

function haversineKm(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const GENDER_TO_BUCKET = { woman: "women", man: "men", nonbinary: "nonbinary", other: "nonbinary" };

function ageFromBirthdate(birthdate) {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

/**
 * A stack of candidate profiles: everyone the user hasn't swiped, hasn't
 * blocked (and isn't blocked by), filtered by mutual "show me" preference and
 * age, sorted by recency. Real photos are never sent here — only the sketch.
 */
export const getDiscoverStack = async (req, res) => {
  try {
    const me = req.user;

    const swipes = await Swipe.find({ from: me._id }).select("to").lean();
    const seen = new Set(swipes.map((s) => String(s.to)));

    const blockedByMe = (me.blockedUsers || []).map(String);

    const candidates = await User.find({
      _id: { $ne: me._id },
      onboarded: true,
      blockedUsers: { $ne: me._id },
    })
      .select("fullName drawnAvatar drawnAvatarStrokes bio birthdate gender orientation location interests doodleAnswers notebookTheme lastActiveAt")
      .sort({ lastActiveAt: -1 })
      .limit(120)
      .lean();

    const wantBuckets = new Set(me.preferences?.showMe || []);
    const myBucket = GENDER_TO_BUCKET[me.gender] || null;

    const stack = candidates.filter((u) => {
      if (seen.has(String(u._id))) return false;
      if (blockedByMe.includes(String(u._id))) return false;

      // age window
      const uAge = ageFromBirthdate(u.birthdate);
      if (uAge != null) {
        if (uAge < (me.preferences?.ageMin ?? 18)) return false;
        if (uAge > (me.preferences?.ageMax ?? 200)) return false;
      }

      // mutual orientation: I want their bucket, and their orientation includes mine
      const theirBucket = GENDER_TO_BUCKET[u.gender] || null;
      if (wantBuckets.size && theirBucket && !wantBuckets.has(theirBucket)) return false;
      if (myBucket && Array.isArray(u.orientation) && u.orientation.length) {
        if (!u.orientation.includes(myBucket)) return false;
      }

      // distance
      const dist = haversineKm(me.location, u.location);
      if (dist != null && dist > (me.preferences?.maxDistanceKm ?? 1e9)) return false;

      return true;
    });

    const shaped = stack.slice(0, 40).map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      age: ageFromBirthdate(u.birthdate),
      bio: u.bio,
      drawnAvatar: u.drawnAvatar,
      drawnAvatarStrokes: u.drawnAvatarStrokes,
      interests: u.interests,
      doodleAnswers: u.doodleAnswers,
      notebookTheme: u.notebookTheme,
      location: { label: u.location?.label || "" },
      distanceKm: haversineKm(me.location, u.location),
      // real photo intentionally withheld until a match reveals it
    }));

    res.status(200).json(shaped);
  } catch (error) {
    console.log("Error in getDiscoverStack:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
