import { useRef, useState } from "react";
import { X } from "lucide-react";
import DrawingCanvas from "../draw/DrawingCanvas";

export default function SketchComposerModal({ title = "Send a sketch", quick = false, onClose, onSend }) {
  const ref = useRef(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const doc = ref.current?.export(560, 440, "#ffffff");
    if (!doc || !doc.strokes.length) return;
    setBusy(true);
    await onSend({ image: doc.image, strokes: doc.strokes, text: caption.trim() || undefined });
    setBusy(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral/60 p-3">
      <div className="w-full max-w-lg rounded-2xl bg-base-100 ink-border p-4 shadow-sketch-lg">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-script text-2xl">{title}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        <DrawingCanvas
          ref={ref}
          asp={1.3}
          minHeight={280}
          strokeLimit={quick ? 5 : null}
          timeLimitMs={quick ? 10000 : null}
        />

        {!quick && (
          <input
            className="input input-bordered mt-3 w-full"
            placeholder="Caption (optional)"
            value={caption}
            maxLength={140}
            onChange={(e) => setCaption(e.target.value)}
          />
        )}

        <button className="btn btn-primary mt-3 w-full" onClick={send} disabled={busy}>
          {quick ? "Send quick sketch" : "Send sketch"}
        </button>
      </div>
    </div>
  );
}
