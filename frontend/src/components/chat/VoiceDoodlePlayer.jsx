import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { renderStrokes } from "../../lib/drawing";

/** A voice note whose scribble draws itself in sync with playback. */
export default function VoiceDoodlePlayer({ audio, strokes, image }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !Array.isArray(strokes)) return;
    const w = wrap.clientWidth;
    const h = Math.round(w / 2.4);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderStrokes(ctx, strokes, w, h, { progress });
  }, [strokes, progress]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play();
  };

  return (
    <div className="w-56 max-w-full">
      <div ref={wrapRef} className="rounded-lg ink-border-sm overflow-hidden bg-base-100">
        {Array.isArray(strokes) ? (
          <canvas ref={canvasRef} className="block w-full" />
        ) : (
          image && <img src={image} alt="doodle" className="w-full" />
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <button className="btn btn-xs btn-circle btn-primary" onClick={toggle}>
          {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
        </button>
        <progress className="progress progress-primary h-1.5 flex-1" value={progress} max="1" />
      </div>
      <audio
        ref={audioRef}
        src={audio}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(1);
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setProgress(el.currentTime / el.duration);
        }}
        className="hidden"
      />
    </div>
  );
}
