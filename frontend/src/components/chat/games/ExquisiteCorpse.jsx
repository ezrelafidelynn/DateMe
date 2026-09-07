import { useEffect, useRef, useState } from "react";
import { renderStrokes } from "../../../lib/drawing";
import DrawingCanvas from "../../draw/DrawingCanvas";

/**
 * Folded-paper drawing. The host draws the top half, the guest draws the
 * bottom half without seeing the top, then the two are stitched together.
 */
export default function ExquisiteCorpse({ role, incoming, sendMove, endGame, sendSketch }) {
  const isTop = role === "host";
  const canvasRef = useRef(null);
  const [mineDone, setMineDone] = useState(null); // { strokes }
  const [theirs, setTheirs] = useState(null); // { strokes }
  const [revealUrl, setRevealUrl] = useState(null);

  useEffect(() => {
    const m = incoming?.move;
    if (m?.t === "half") setTheirs({ strokes: m.strokes });
  }, [incoming]);

  const submit = () => {
    const doc = canvasRef.current?.export(600, 300, "#ffffff");
    if (!doc?.strokes?.length) return;
    setMineDone({ strokes: doc.strokes });
    sendMove({ t: "half", strokes: doc.strokes });
  };

  // Once both halves are in, stitch them (top half + bottom half).
  useEffect(() => {
    if (!mineDone || !theirs) return;
    const top = isTop ? mineDone.strokes : theirs.strokes;
    const bottom = isTop ? theirs.strokes : mineDone.strokes;

    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 600;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 600);
    // each half was drawn at 600x300; place stacked
    const half = document.createElement("canvas");
    half.width = 600;
    half.height = 300;
    const hctx = half.getContext("2d");
    renderStrokes(hctx, top, 600, 300, { background: "#ffffff" });
    ctx.drawImage(half, 0, 0);
    renderStrokes(hctx, bottom, 600, 300, { background: "#ffffff" });
    ctx.drawImage(half, 0, 300);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(600, 300);
    ctx.stroke();

    setRevealUrl(c.toDataURL("image/png"));
  }, [mineDone, theirs, isTop]);

  return (
    <div>
      {!mineDone && (
        <>
          <p className="mb-2 text-center font-hand text-lg">
            Draw the <b>{isTop ? "TOP" : "BOTTOM"}</b> half — they can&apos;t see yours.
          </p>
          <DrawingCanvas ref={canvasRef} asp={2} minHeight={200} />
          <button className="btn btn-primary btn-sm mt-2 w-full" onClick={submit}>
            Fold &amp; pass
          </button>
        </>
      )}

      {mineDone && !revealUrl && (
        <p className="py-6 text-center font-hand text-lg">
          Waiting for the other half…
        </p>
      )}

      {revealUrl && (
        <div className="text-center">
          <p className="font-script text-2xl">Ta-da! Your creature:</p>
          <img src={revealUrl} alt="exquisite corpse" className="mx-auto mt-2 w-64 ink-border rounded-lg" />
          <div className="mt-3 flex justify-center gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                sendSketch?.({ image: revealUrl });
                endGame("Exquisite Corpse: masterpiece made");
              }}
            >
              Send to chat
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => endGame("Exquisite Corpse: played")}>
              Just close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
