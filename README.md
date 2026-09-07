# ✏️ EzMatch

**A drawing-first dating app.** No polished corporate bios — you draw your
avatar, you answer prompts by doodling, you swipe by leaving a hand-drawn ink
stamp, and once you match your chat is a shared sketchpad with mini-games.

Built by expanding the [EzChat](https://github.com/ezrelafidelynn/EzChat)
realtime engine (MERN + Socket.io + Tailwind + daisyUI).

---

## The idea

| Area | What EzMatch does |
| --- | --- |
| **Profiles** | Hand-drawn avatar on a `<canvas>`, "Draw to Answer" visual icebreakers ("Doodle your comfort food", "Draw our first date"), six customizable **notebook themes** (Grid Paper, Blueprint, Vintage Parchment, Chalkboard, Watercolour, Pastel Manga). |
| **Matching** | Swipe right = drop a hand-drawn **ink stamp** (heart / smiley / wax-seal / star). Attach a **5-stroke / 10-second sketch opener** instead of "Hey". **Blind sketch reveal**: real photos start fully blurred and un-blur as two people exchange messages and mutual drawings. |
| **Chat** | Text, **photo uploads** (downscaled client-side), freehand **sketch messages**, self-drawn **custom sticker packs** (saved to your account), **voice doodles** (a voice note whose scribble replays in sync), a real-time **collaborative whiteboard**, and typing indicators. |
| **Mini-games** | **Guess the Doodle** (60s Pictionary with live strokes), **Exquisite Corpse** (draw half each, folded), **Tic-Tac-Toe**, **Hangman** — all peer-to-peer over the socket, results posted to the thread. |
| **Safety** | Pluggable **sketch moderation** before delivery, one-tap **report / block / unmatch**, and **blur-first** delivery of drawings from brand-new matches (tap to reveal). |

---

## Tech

- **Backend** — Express, MongoDB/Mongoose, JWT auth (httpOnly cookie), Socket.io.
- **Frontend** — React + Vite, Zustand stores, Tailwind + daisyUI (custom themes), a
  single reusable `DrawingCanvas` engine (`frontend/src/lib/drawing.js` + `components/draw/`).
- **Images** — optional Cloudinary; with no keys set, data URLs are stored inline so it runs with zero image config.

### Drawing model

Every surface (profile, openers, chat, whiteboard, games) uses one stroke format,
normalised to `0..1` so a drawing replays at any size:

```js
{ id, tool: "pencil"|"ink"|"marker"|"eraser", color, size, points: [[x, y], …] }
```

### Key Socket.io events

`getOnlineUsers` · `match:new` · `match:reveal` · `match:closed` · `newMessage` ·
`chat:typing` · `canvas:join|sync|stroke|cursor|undo|clear` ·
`game:invite|accept|decline|move|end`

---

## Getting started

### 1. Requirements

- Node 18+
- **No database install needed.** If `MONGODB_URI` is unset, the backend starts
  an in-process `mongodb-memory-server` (it downloads a MongoDB binary once,
  ~600 MB, cached afterwards). That data is **ephemeral** — it lives only while
  the server process runs. Set `MONGODB_URI` (local `mongod` or a free Atlas
  cluster) for persistent data and for `npm run seed` to stick.

### 2. Configure

```bash
cp .env.example backend/.env
# edit backend/.env — at minimum set MONGODB_URI and JWT_SECRET
```

| Var | Notes |
| --- | --- |
| `MONGODB_URI` | required |
| `JWT_SECRET` | required — any long random string |
| `PORT` | default `5001` |
| `CLIENT_URL` | comma-separated allowed origins (default `http://localhost:5173`) |
| `CLOUDINARY_*` | optional — leave blank to store images inline |
| `MODERATION_PROVIDER` | `heuristic` (default). Seam for a real vision model in `backend/src/lib/moderation.js` |

### 3. Install & run (dev)

```bash
npm install --prefix backend
npm install --prefix frontend

# optional: 14 demo users with drawn profiles (password: 123456)
npm run seed

npm run dev:backend    # http://localhost:5001
npm run dev:frontend   # http://localhost:5173
```

### 4. Production build

```bash
npm run build          # installs both, builds the client
NODE_ENV=production npm start   # Express serves frontend/dist
```

---

## Project layout

```
backend/src
  models/        user, swipe, match, message, sticker, report
  controllers/   auth, discover, swipe, match, message, sticker
  lib/           socket (canvas + games relay), moderation, upload, db
frontend/src
  lib/drawing.js            stroke model + render/replay
  components/draw/          DrawingCanvas, DrawToolbar, SketchPlayer
  components/discover/      ProfileCard, StampSheet
  components/chat/          composer, bubbles, whiteboard, voice doodle, games/
  components/safety/        report / block / unmatch
  store/                    auth, theme, discover, match, chat, sticker (Zustand)
  pages/                    Onboarding, Discover, Matches, Chat, Profile, Settings
```

---

## Status / notes

This is a reference implementation of the concept — the full flow works end to
end (onboard → discover → stamp → match → draw/chat/play → gradual photo reveal).
Moderation is a local heuristic stub with a clean seam for a real image
classifier. Voice doodles use `MediaRecorder`; the scribble replays proportionally
to audio playback.
