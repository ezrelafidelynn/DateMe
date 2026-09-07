import { Eraser, Pen, Highlighter, Pencil, Undo2, Redo2, Trash2 } from "lucide-react";
import { PALETTE } from "../../lib/drawing";

const TOOL_BTNS = [
  { id: "pencil", Icon: Pencil, label: "Pencil" },
  { id: "ink", Icon: Pen, label: "Ink pen" },
  { id: "marker", Icon: Highlighter, label: "Marker" },
  { id: "eraser", Icon: Eraser, label: "Eraser" },
];

export default function DrawToolbar({ tool, color, size, onTool, onColor, onSize, onUndo, onRedo, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-base-100/80 border-2 border-base-content/10 p-2">
      <div className="join">
        {TOOL_BTNS.map(({ id, Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-pressed={tool === id}
            onClick={() => onTool(id)}
            className={`btn btn-sm join-item ${tool === id ? "btn-primary" : "btn-ghost"}`}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`colour ${c}`}
            onClick={() => onColor(c)}
            className={`size-6 rounded-full border-2 ${
              color === c ? "border-base-content scale-110" : "border-base-content/20"
            }`}
            style={{ background: c }}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => onColor(e.target.value)}
          className="size-6 rounded cursor-pointer bg-transparent"
          aria-label="custom colour"
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-hand">
        size
        <input
          type="range"
          min="1"
          max="24"
          value={size}
          onChange={(e) => onSize(Number(e.target.value))}
          className="range range-xs w-24"
        />
      </label>

      <div className="join ml-auto">
        <button type="button" className="btn btn-sm join-item btn-ghost" onClick={onUndo} title="Undo">
          <Undo2 className="size-4" />
        </button>
        <button type="button" className="btn btn-sm join-item btn-ghost" onClick={onRedo} title="Redo">
          <Redo2 className="size-4" />
        </button>
        <button type="button" className="btn btn-sm join-item btn-ghost text-error" onClick={onClear} title="Clear">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
