import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Circle, Square, X } from "lucide-react";
import DrawingCanvas from "../draw/DrawingCanvas";
import { fileToDataUrl } from "../../lib/utils";

/** Record a short voice note while doodling; the scribble replays in sync. */
export default function VoiceDoodleRecorder({ onClose, onSend }) {
  const canvasRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(await fileToDataUrl(blob));
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= 30) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error("Mic permission needed for voice doodles");
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    mediaRef.current?.state === "recording" && mediaRef.current.stop();
    setRecording(false);
  };

  const send = async () => {
    const doc = canvasRef.current?.export(480, 200, "#ffffff");
    if (!audioUrl) return toast.error("Record something first");
    await onSend({ audio: audioUrl, sketch: { image: doc?.image, strokes: doc?.strokes } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral/60 p-3">
      <div className="w-full max-w-md rounded-2xl bg-base-100 ink-border p-4 shadow-sketch-lg">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-script text-2xl">Voice doodle</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        <p className="font-hand text-sm text-base-content/60">Talk and scribble at the same time (max 30s).</p>

        <div className="my-3">
          <DrawingCanvas ref={canvasRef} asp={2.4} minHeight={140} />
        </div>

        <div className="flex items-center gap-3">
          {!recording ? (
            <button className="btn btn-primary btn-sm" onClick={start} disabled={!!audioUrl}>
              <Circle className="size-4 fill-current" /> Record
            </button>
          ) : (
            <button className="btn btn-error btn-sm" onClick={stop}>
              <Square className="size-4 fill-current" /> Stop ({seconds}s)
            </button>
          )}
          {audioUrl && <audio src={audioUrl} controls className="h-8 flex-1" />}
        </div>

        <button className="btn btn-primary mt-3 w-full" onClick={send} disabled={!audioUrl}>
          Send voice doodle
        </button>
      </div>
    </div>
  );
}
