import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5173").split(",");

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGINS, credentials: true },
  maxHttpBufferSize: 5e6, // room for base64 sketch strokes / small audio blobs
});

// userId -> socketId
const userSocketMap = {};

// Ephemeral collaborative-canvas state per match room: { [matchId]: { strokes: [] } }
const canvasRooms = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function emitToUser(userId, event, payload) {
  const sid = userSocketMap[String(userId)];
  if (sid) io.to(sid).emit(event, payload);
}

const canvasRoom = (matchId) => `canvas:${matchId}`;

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  /* ------------------------------ presence ------------------------------ */
  socket.on("chat:typing", ({ to, matchId, isTyping }) => {
    emitToUser(to, "chat:typing", { from: userId, matchId, isTyping });
  });

  /* ----------------------- collaborative whiteboard -------------------- */
  socket.on("canvas:join", ({ matchId }) => {
    if (!matchId) return;
    socket.join(canvasRoom(matchId));
    const room = (canvasRooms[matchId] = canvasRooms[matchId] || { strokes: [] });
    // hydrate the late joiner with whatever is already on the board
    socket.emit("canvas:sync", { matchId, strokes: room.strokes });
    socket.to(canvasRoom(matchId)).emit("canvas:peer", { matchId, joined: true });
  });

  socket.on("canvas:leave", ({ matchId }) => {
    if (!matchId) return;
    socket.leave(canvasRoom(matchId));
    socket.to(canvasRoom(matchId)).emit("canvas:peer", { matchId, joined: false });
  });

  socket.on("canvas:stroke", ({ matchId, stroke }) => {
    if (!matchId || !stroke) return;
    const room = (canvasRooms[matchId] = canvasRooms[matchId] || { strokes: [] });
    room.strokes.push(stroke);
    if (room.strokes.length > 5000) room.strokes.shift();
    socket.to(canvasRoom(matchId)).emit("canvas:stroke", { matchId, stroke });
  });

  socket.on("canvas:cursor", ({ matchId, x, y }) => {
    socket.to(canvasRoom(matchId)).emit("canvas:cursor", { matchId, from: userId, x, y });
  });

  socket.on("canvas:undo", ({ matchId, strokeId }) => {
    const room = canvasRooms[matchId];
    if (room) room.strokes = room.strokes.filter((s) => s.id !== strokeId);
    socket.to(canvasRoom(matchId)).emit("canvas:undo", { matchId, strokeId });
  });

  socket.on("canvas:clear", ({ matchId }) => {
    if (canvasRooms[matchId]) canvasRooms[matchId].strokes = [];
    io.to(canvasRoom(matchId)).emit("canvas:clear", { matchId });
  });

  /* --------------------------- in-chat games -------------------------- */
  // Games are peer-to-peer relays; the thread only stores the final result.
  const relay = (event) => ({ to, ...rest }) => emitToUser(to, event, { from: userId, ...rest });
  socket.on("game:invite", relay("game:invite"));
  socket.on("game:accept", relay("game:accept"));
  socket.on("game:decline", relay("game:decline"));
  socket.on("game:move", relay("game:move"));
  socket.on("game:end", relay("game:end"));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
