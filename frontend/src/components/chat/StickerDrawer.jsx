import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import DrawingCanvas from "../draw/DrawingCanvas";
import { useStickerStore } from "../../store/useStickerStore";

export default function StickerDrawer({ onClose, onSend }) {
  const { stickers, loaded, load, create, remove } = useStickerStore();
  const [drawing, setDrawing] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  const saveSticker = async () => {
    const doc = ref.current?.export(320, 320, null);
    if (!doc || !doc.strokes.length) return;
    const s = await create({ name: name || "sticker", image: doc.image, strokes: doc.strokes });
    if (s) {
      setDrawing(false);
      setName("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-neutral/60 p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-base-100 ink-border p-4 shadow-sketch-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-script text-2xl">Your stickers</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        {!drawing && (
          <>
            <div className="grid grid-cols-4 gap-2">
              <button
                className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-base-content/25"
                onClick={() => setDrawing(true)}
              >
                <Plus className="size-6" />
              </button>
              {stickers.map((s) => (
                <div key={s._id} className="group relative">
                  <button
                    className="w-full rounded-xl bg-base-200 p-1"
                    onClick={() => {
                      onSend({ id: s._id, image: s.image });
                      onClose();
                    }}
                  >
                    <img src={s.image} alt={s.name} className="aspect-square w-full object-contain" />
                  </button>
                  <button
                    className="absolute -right-1 -top-1 hidden rounded-full bg-error p-1 text-error-content group-hover:block"
                    onClick={() => remove(s._id)}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            {stickers.length === 0 && (
              <p className="mt-3 text-center font-hand text-base-content/60">
                Draw your first sticker — it saves to your account.
              </p>
            )}
          </>
        )}

        {drawing && (
          <div className="space-y-2">
            <DrawingCanvas ref={ref} asp={1} minHeight={240} />
            <input
              className="input input-bordered input-sm w-full"
              placeholder="Sticker name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm flex-1" onClick={() => setDrawing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm flex-1" onClick={saveSticker}>
                Save sticker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
