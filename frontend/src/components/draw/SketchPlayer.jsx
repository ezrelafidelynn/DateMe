import { useEffect, useRef, useState } from "react";
import { renderStrokes } from "../../lib/drawing";

/**
 * Renders a stroke document. `animate` replays it stroke-by-stroke (used for
 * sketch openers and the blind-reveal peek); otherwise it paints once.
 * Falls back to an <img> when only a rendered `image` is available.
 */
export default function SketchPlayer({
  strokes,
  image,
  animate = false,
  durationMs = 2200,
  className = "",
  aspect = 1,
  onDone,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [supported] = useState(() => Array.isArray(strokes) && strokes.length > 0);

  useEffect(() => {
    if (!supported) return undefined;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const paint = () => {
      const w = wrap.clientWidth;
      const h = Math.round(w / aspect);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w, h };
    };

    let raf;
    const { ctx, w, h } = paint();

    if (!animate) {
      renderStrokes(ctx, strokes, w, h);
      return undefined;
    }

    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      renderStrokes(ctx, strokes, w, h, { progress: p });
      if (p < 1) raf = requestAnimationFrame(tick);
      else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [strokes, animate, durationMs, aspect, supported, onDone]);

  if (!supported) {
    return image ? (
      <img src={image} alt="sketch" className={`bg-base-100 object-contain ${className}`} />
    ) : null;
  }

  return (
    <div ref={wrapRef} className={`w-full ${className}`}>
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
