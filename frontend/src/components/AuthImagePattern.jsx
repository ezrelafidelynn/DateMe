import { Coffee, Heart, PawPrint, Pencil, Pizza, Plane, Smile, Star, Sun } from "lucide-react";

const ICONS = [Pencil, Heart, Coffee, PawPrint, Star, Plane, Pizza, Smile, Sun];

export default function AuthImagePattern({ title, subtitle }) {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {ICONS.map((Icon, i) => (
            <div
              key={i}
              className={`aspect-square grid place-items-center paper-card ink-border-sm ${
                i % 2 === 0 ? "animate-pulse -rotate-1.5" : "rotate-1.5"
              }`}
            >
              <Icon className="size-8 text-primary" />
            </div>
          ))}
        </div>
        <h2 className="font-script text-3xl mb-3">{title}</h2>
        <p className="text-base-content/60 font-hand text-lg">{subtitle}</p>
      </div>
    </div>
  );
}
