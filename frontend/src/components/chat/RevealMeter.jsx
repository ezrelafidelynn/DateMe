import { Eye } from "lucide-react";

/** Thin bar under the chat header showing how close the photo reveal is. */
export default function RevealMeter({ value = 0 }) {
  return (
    <div className="flex items-center gap-2 bg-base-100/60 px-3 py-1.5">
      <Eye className="size-3.5 text-base-content/50" />
      <progress className="progress progress-primary h-1.5 flex-1" value={value} max="100" />
      <span className="font-hand text-xs text-base-content/55">
        {value >= 100 ? "revealed" : `${value}%`}
      </span>
    </div>
  );
}
