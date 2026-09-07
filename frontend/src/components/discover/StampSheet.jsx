import { useRef, useState } from "react";
import { X } from "lucide-react";
import DrawingCanvas from "../draw/DrawingCanvas";
import { STAMP_STYLES } from "../../constants";

/**
 * Bottom sheet shown when you tap Stamp: pick the stamp glyph and, optionally,
 * scribble a quick opener (capped at 5 strokes / 10 seconds) to send instead
 * of "Hey".
 */
export default function StampSheet({ user, onCancel, onConfirm }) {
  const [style, setStyle] = useState("heart");
  const [withOpener, setWithOpener] = useState(false);
  const openerRef = useRef(null);

  const confirm = () => {
    let opener = null;
    if (withOpener) {
      const doc = openerRef.current?.export(420, 320, "#ffffff");
      if (doc && doc.strokes.length) opener = { image: doc.image, strokes: doc.strokes };
    }
    onConfirm({ stampStyle: style, opener });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-base-100 ink-border p-4 shadow-sketch-lg animate-float-in">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-script text-2xl">Stamp {user.fullName?.split(" ")[0]}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onCancel}>
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {STAMP_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`flex-1 rounded-xl border-2 py-2 text-2xl ${
                style === s.id ? "border-primary bg-primary/10" : "border-base-content/15"
              }`}
              title={s.label}
            >
              {s.glyph}
            </button>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={withOpener}
            onChange={(e) => setWithOpener(e.target.checked)}
          />
          <span className="font-hand text-lg">Add a 5-stroke sketch opener</span>
        </label>

        {withOpener && (
          <div className="mt-3">
            <DrawingCanvas ref={openerRef} asp={1.3} minHeight={220} strokeLimit={5} timeLimitMs={10000} />
          </div>
        )}

        <button className="btn btn-primary mt-4 w-full" onClick={confirm}>
          Send stamp
        </button>
      </div>
    </div>
  );
}
