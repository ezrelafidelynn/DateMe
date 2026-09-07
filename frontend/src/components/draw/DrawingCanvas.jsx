import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { newStroke, pointerPos, renderStrokes, strokesToDataURL, TOOLS } from "../../lib/drawing";
import DrawToolbar from "./DrawToolbar";

/**
 * The one drawing surface used everywhere: profile avatars, doodle prompts,
 * sketch openers, chat sketches, the collaborative whiteboard and the mini
 * games. Strokes are normalised 0..1 (see lib/drawing.js).
 *
 * Imperative handle: { export, clear, undo, redo, loadStrokes,
 *                      addRemoteStroke, removeStroke, applyClear }
 */
const DrawingCanvas = forwardRef(function DrawingCanvas(
  {
    asp: aspectRatio = 1,
    initialStrokes = [],
    readOnly = false,
    showToolbar = true,
    strokeLimit = null,
    timeLimitMs = null,
    onTimeUp,
    onChange,
    onStrokeCommit, // (stroke) => void  — for live collaboration
    className = "",
    minHeight = 220,
  },
  ref
) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const sizeRef = useRef({ w: 1, h: 1 });

  const strokesRef = useRef(initialStrokes.map((s) => ({ ...s })));
  const redoRef = useRef([]);
  const drawingRef = useRef(null);

  const [tool, setTool] = useState("ink");
  const [color, setColor] = useState("#1c1c1e");
  const [size, setSize] = useState(4);
  const [count, setCount] = useState(strokesRef.current.length);
  const [msLeft, setMsLeft] = useState(timeLimitMs);

  const limitReached = strokeLimit != null && count >= strokeLimit;

  /* ---------------------------- sizing / DPR --------------------------- */
  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const w = wrap.clientWidth;
    const h = Math.max(minHeight, Math.round(w / aspectRatio));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;
    sizeRef.current = { w, h };
    renderStrokes(ctx, strokesRef.current, w, h);
  }, [aspectRatio, minHeight]);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  /* ------------------------------- timer ------------------------------ */
  useEffect(() => {
    if (timeLimitMs == null) return undefined;
    setMsLeft(timeLimitMs);
    const started = Date.now();
    const iv = setInterval(() => {
      const left = timeLimitMs - (Date.now() - started);
      setMsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(iv);
        onTimeUp?.();
      }
    }, 100);
    return () => clearInterval(iv);
  }, [timeLimitMs, onTimeUp]);

  /* ---------------------------- redraw all --------------------------- */
  const redrawAll = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (ctxRef.current) renderStrokes(ctxRef.current, strokesRef.current, w, h);
  }, []);

  const emitChange = useCallback(() => {
    setCount(strokesRef.current.length);
    onChange?.(strokesRef.current.map((s) => ({ ...s })));
  }, [onChange]);

  /* ---------------------- incremental live draw --------------------- */
  const drawSegment = useCallback((stroke) => {
    const ctx = ctxRef.current;
    const { w, h } = sizeRef.current;
    const pts = stroke.points;
    if (!ctx || pts.length < 2) return;
    const t = TOOLS[stroke.tool] || TOOLS.pencil;
    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.lineCap = t.cap;
    ctx.lineJoin = t.join;
    ctx.lineWidth = Math.max(1, stroke.size * t.widthMul);
    ctx.strokeStyle = stroke.color;
    if (stroke.tool === "eraser") ctx.globalCompositeOperation = "destination-out";
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    ctx.beginPath();
    ctx.moveTo(a[0] * w, a[1] * h);
    ctx.lineTo(b[0] * w, b[1] * h);
    ctx.stroke();
    ctx.restore();
  }, []);

  /* --------------------------- pointer flow ------------------------- */
  const onPointerDown = (e) => {
    if (readOnly || limitReached) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const stroke = newStroke(tool, color, size);
    stroke.points.push(pointerPos(e, rect));
    drawingRef.current = stroke;
    redoRef.current = [];
  };

  const onPointerMove = (e) => {
    const stroke = drawingRef.current;
    if (!stroke) return;
    const rect = e.currentTarget.getBoundingClientRect();
    stroke.points.push(pointerPos(e, rect));
    drawSegment(stroke);
  };

  const finishStroke = () => {
    const stroke = drawingRef.current;
    drawingRef.current = null;
    if (!stroke) return;
    if (stroke.points.length === 1) stroke.points.push([stroke.points[0][0] + 0.001, stroke.points[0][1]]);
    strokesRef.current.push(stroke);
    redrawAll();
    emitChange();
    onStrokeCommit?.({ ...stroke });
  };

  /* --------------------------- imperative --------------------------- */
  const doClear = useCallback(() => {
    redoRef.current = strokesRef.current.splice(0);
    redrawAll();
    emitChange();
  }, [redrawAll, emitChange]);

  const doUndo = useCallback(() => {
    if (!strokesRef.current.length) return;
    redoRef.current.push(strokesRef.current.pop());
    redrawAll();
    emitChange();
  }, [redrawAll, emitChange]);

  const doRedo = useCallback(() => {
    if (!redoRef.current.length) return;
    strokesRef.current.push(redoRef.current.pop());
    redrawAll();
    emitChange();
  }, [redrawAll, emitChange]);

  useImperativeHandle(ref, () => ({
    export: (w, h, background) => ({
      image: strokesToDataURL(strokesRef.current, w, h, background),
      strokes: strokesRef.current.map((s) => ({ ...s })),
    }),
    getStrokes: () => strokesRef.current.map((s) => ({ ...s })),
    clear: doClear,
    undo: doUndo,
    redo: doRedo,
    loadStrokes: (strokes) => {
      strokesRef.current = (strokes || []).map((s) => ({ ...s }));
      redoRef.current = [];
      redrawAll();
      emitChange();
    },
    addRemoteStroke: (stroke) => {
      strokesRef.current.push(stroke);
      drawSegmentsFor(stroke);
      setCount(strokesRef.current.length);
    },
    removeStroke: (id) => {
      strokesRef.current = strokesRef.current.filter((s) => s.id !== id);
      redrawAll();
      setCount(strokesRef.current.length);
    },
    applyClear: () => {
      strokesRef.current = [];
      redoRef.current = [];
      redrawAll();
      setCount(0);
    },
  }));

  const drawSegmentsFor = (stroke) => {
    const ctx = ctxRef.current;
    const { w, h } = sizeRef.current;
    if (ctx) renderStrokes(ctx, [stroke], w, h);
    redrawAll();
  };

  const secs = msLeft == null ? null : Math.ceil(msLeft / 1000);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showToolbar && !readOnly && (
        <DrawToolbar
          tool={tool}
          color={color}
          size={size}
          onTool={setTool}
          onColor={setColor}
          onSize={setSize}
          onUndo={doUndo}
          onRedo={doRedo}
          onClear={doClear}
        />
      )}

      <div ref={wrapRef} className="relative w-full paper ink-border overflow-hidden">
        <canvas
          ref={canvasRef}
          className="canvas-surface block w-full"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
          onPointerCancel={finishStroke}
        />

        {secs != null && (
          <div className="absolute top-2 right-2 badge badge-neutral font-hand text-base">{secs}s</div>
        )}
        {strokeLimit != null && (
          <div className="absolute bottom-2 left-2 badge badge-outline font-hand">
            {count}/{strokeLimit} strokes
          </div>
        )}
        {limitReached && (
          <div className="absolute inset-x-0 bottom-0 bg-warning/90 text-warning-content text-center text-xs py-1 font-hand">
            stroke limit reached
          </div>
        )}
      </div>
    </div>
  );
});

export default DrawingCanvas;
