import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB, disconnectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import discoverRoutes from "./routes/discover.route.js";
import swipeRoutes from "./routes/swipe.route.js";
import matchRoutes from "./routes/match.route.js";
import stickerRoutes from "./routes/sticker.route.js";

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
const CLIENT_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5173").split(",");

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "ezmatch" }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/stickers", stickerRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("EzMatch server running on PORT: " + PORT);
  connectDB();
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await disconnectDB();
    process.exit(0);
  });
}
