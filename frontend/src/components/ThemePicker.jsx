import { Check } from "lucide-react";
import { NOTEBOOK_THEMES } from "../constants";

export default function ThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {NOTEBOOK_THEMES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            data-theme={t.id}
            className={`relative rounded-xl border-2 p-3 text-left transition ${
              active ? "border-primary shadow-sketch" : "border-base-content/15"
            }`}
          >
            {active && (
              <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-content">
                <Check className="size-3" />
              </span>
            )}
            <div className="flex gap-1 mb-2">
              {t.swatch.map((c) => (
                <span
                  key={c}
                  className="size-5 rounded border border-black/10"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="font-hand text-lg leading-tight text-base-content">{t.label}</div>
            <div className="text-xs text-base-content/60">{t.blurb}</div>
          </button>
        );
      })}
    </div>
  );
}
