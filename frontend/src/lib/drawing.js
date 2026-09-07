/**
 * Stroke model shared by every drawing surface in EzMatch.
 *
 * A stroke is:
 *   { id, tool: "pencil"|"ink"|"marker"|"eraser", color, size, points: [[x,y], ...] }
 *
 * Points are normalised to 0..1 so the same drawing replays at any size — a
 * full-screen canvas, a chat bubble, or a tiny profile thumbnail.
 */

export const TOOLS = {
  pencil: { cap: "round", join: "round", alpha: 0.9, widthMul: 1 },
  ink: { cap: "round", join: "round", alpha: 1, widthMul: 1.4 },
  marker: { cap: "round", join: "round", alpha: 0.35, widthMul: 3.2 },
  eraser: { cap: "round", join: "round", alpha: 1, widthMul: 2.6 },
};

export const PALETTE = [
  "#1c1c1e", "#e4572e", "#3457d5", "#3aa76d",
  "#e6a417", "#e0567a", "#7b4fd4", "#ffffff",
];

let seq = 0;
export function newStroke(tool, color, size) {
  seq += 1;
  return {
    id: `s${Date.now().toString(36)}-${seq}`,
    tool,
    color,
    size,
    points: [],
  };
}

export function emptyDoc() {
  return [];
}

/** Normalised pointer position within an element's rect. */
export function pointerPos(evt, rect) {
  const x = (evt.clientX - rect.left) / rect.width;
  const y = (evt.clientY - rect.top) / rect.height;
  return [clamp01(x), clamp01(y)];
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Paint strokes onto a 2D context sized w x h.
 * `progress` (0..1) draws only the first portion — used to animate replays.
 */
export function renderStrokes(ctx, strokes, w, h, { progress = 1, background = null } = {}) {
  ctx.clearRect(0, 0, w, h);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  if (!Array.isArray(strokes) || !strokes.length) return;

  const totalPts = strokes.reduce((n, s) => n + (s.points?.length || 0), 0);
  const budget = Math.ceil(totalPts * clamp01(progress));
  let used = 0;

  for (const stroke of strokes) {
    const pts = stroke.points || [];
    if (pts.length === 0) continue;

    const t = TOOLS[stroke.tool] || TOOLS.pencil;
    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.lineCap = t.cap;
    ctx.lineJoin = t.join;
    ctx.lineWidth = Math.max(1, stroke.size * t.widthMul);
    ctx.strokeStyle = stroke.color;
    if (stroke.tool === "eraser") ctx.globalCompositeOperation = "destination-out";

    ctx.beginPath();
    for (let i = 0; i < pts.length; i += 1) {
      if (used >= budget) break;
      const [nx, ny] = pts[i];
      const x = nx * w;
      const y = ny * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      used += 1;
    }
    ctx.stroke();
    ctx.restore();
    if (used >= budget) break;
  }
}

/** Offscreen render of a stroke doc to a PNG data URL. */
export function strokesToDataURL(strokes, w = 480, h = 480, background = null) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  renderStrokes(ctx, strokes, w, h, { background });
  return canvas.toDataURL("image/png");
}

export function countStrokes(strokes) {
  return Array.isArray(strokes) ? strokes.length : 0;
}
