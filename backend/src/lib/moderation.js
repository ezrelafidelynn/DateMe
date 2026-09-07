/**
 * Sketch moderation.
 *
 * Freeform drawing needs a guardrail before a drawing is delivered. This is a
 * pluggable stub: it runs cheap local heuristics now and leaves one seam
 * (`MODERATION_PROVIDER`) for wiring a real vision model later — e.g. an
 * OmniRoute / OpenAI vision call that classifies the rendered PNG and maps its
 * verdict onto `{ status, reason, score }`.
 */

const NSFW_HINTS = ["nude", "nudes", "nsfw", "porn", "dick pic", "sextape"];

function heuristicScore({ text = "", strokes = [] }) {
  let score = 0;
  const lower = String(text).toLowerCase();
  if (NSFW_HINTS.some((w) => lower.includes(w))) score += 0.8;

  const strokeCount = Array.isArray(strokes) ? strokes.length : 0;
  if (strokeCount > 1500) score += 0.2; // dense graffiti / spam signal

  return Math.min(score, 1);
}

/**
 * @param {{ image?: string, text?: string, strokes?: any[] }} payload
 * @returns {Promise<{ status: "clean"|"flagged"|"blocked"|"pending", reason?: string, score: number }>}
 */
export async function moderateSketch(payload = {}) {
  const provider = process.env.MODERATION_PROVIDER || "heuristic";

  if (provider === "heuristic") {
    const score = heuristicScore(payload);
    if (score >= 0.75) {
      return { status: "blocked", reason: "auto: explicit-content-heuristic", score };
    }
    if (score >= 0.4) {
      return { status: "flagged", reason: "auto: needs-review", score };
    }
    return { status: "clean", score };
  }

  // Real provider not implemented in this reference build.
  return { status: "pending", reason: `provider "${provider}" not implemented`, score: 0 };
}
