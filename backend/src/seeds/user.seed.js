import { config } from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

config();

/** Build a tiny procedural "hand-drawn" avatar as an SVG data URL. */
function doodleAvatar(seed, hue) {
  const wobble = (n) => (Math.sin(seed * 9301 + n * 49297) * 233280) % 7;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="hsl(${hue} 70% 92%)"/>
    <g fill="none" stroke="hsl(${hue} 45% 25%)" stroke-width="4" stroke-linecap="round">
      <path d="M60 ${70 + wobble(1)} q40 -30 ${80 + wobble(2)} 2" />
      <circle cx="${80 + wobble(3)}" cy="90" r="6" fill="hsl(${hue} 45% 25%)"/>
      <circle cx="${122 + wobble(4)}" cy="90" r="6" fill="hsl(${hue} 45% 25%)"/>
      <path d="M78 125 q22 20 ${44 + wobble(5)} 0" />
      <path d="M40 150 q60 40 120 0 q10 -70 -20 -110 q-40 -30 -80 0 q-30 40 -20 110z" />
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PROMPTS = [
  { promptId: "comfort-food", prompt: "Doodle your favourite comfort food" },
  { promptId: "first-date", prompt: "Draw where we should go on our first date" },
  { promptId: "spirit-animal", prompt: "Sketch your spirit animal" },
];

const INTERESTS = [
  ["sketching", "matcha", "thrifting"],
  ["climbing", "vinyl", "ramen"],
  ["watercolour", "cats", "hiking"],
  ["comics", "coffee", "film photography"],
  ["gardening", "baking", "board games"],
  ["synths", "skating", "sci-fi"],
];

const THEMES = ["grid-paper", "blueprint", "parchment", "chalkboard", "watercolor", "manga"];

const base = [
  ["Emma Thompson", "woman", ["men", "nonbinary"], 27],
  ["Olivia Miller", "woman", ["women"], 24],
  ["Sophia Davis", "woman", ["men"], 31],
  ["Ava Wilson", "nonbinary", ["women", "nonbinary"], 26],
  ["Isabella Brown", "woman", ["men", "women"], 29],
  ["Mia Johnson", "woman", ["men"], 22],
  ["Charlotte Williams", "woman", ["nonbinary", "men"], 33],
  ["James Anderson", "man", ["women"], 28],
  ["William Clark", "man", ["women", "nonbinary"], 30],
  ["Benjamin Taylor", "man", ["men"], 26],
  ["Lucas Moore", "man", ["women"], 25],
  ["Henry Jackson", "man", ["women"], 34],
  ["Alexander Martin", "nonbinary", ["men", "women", "nonbinary"], 27],
  ["Daniel Rodriguez", "man", ["women"], 32],
];

const seedUsers = base.map(([fullName, gender, orientation, age], i) => {
  const hue = (i * 37) % 360;
  const first = fullName.split(" ")[0].toLowerCase();
  return {
    email: `${first}@example.com`,
    fullName,
    password: "123456",
    gender,
    orientation,
    birthdate: new Date(Date.now() - age * 365.25 * 24 * 3600 * 1000),
    bio: `${first} here — will absolutely challenge you to Guess the Doodle.`,
    drawnAvatar: doodleAvatar(i + 1, hue),
    profilePic: `https://randomuser.me/api/portraits/${
      gender === "woman" ? "women" : "men"
    }/${(i % 9) + 1}.jpg`,
    interests: INTERESTS[i % INTERESTS.length],
    notebookTheme: THEMES[i % THEMES.length],
    location: { label: "Jakarta", lat: -6.2 + (i % 5) * 0.02, lng: 106.8 + (i % 5) * 0.02 },
    doodleAnswers: PROMPTS.map((p, k) => ({
      ...p,
      image: doodleAvatar(i * 10 + k + 3, (hue + k * 40) % 360),
    })),
    preferences: {
      ageMin: 18,
      ageMax: 45,
      maxDistanceKm: 160,
      showMe: orientation,
    },
    onboarded: true,
  };
});

async function seedDatabase() {
  try {
    await connectDB();
    const salt = await bcrypt.genSalt(10);
    const hashed = await Promise.all(
      seedUsers.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, salt) }))
    );
    await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });
    await User.insertMany(hashed);
    console.log(`Seeded ${hashed.length} EzMatch users (password: 123456)`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
