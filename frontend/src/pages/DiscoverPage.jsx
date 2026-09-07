import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader, RotateCw, Sparkles, X } from "lucide-react";
import ProfileCard from "../components/discover/ProfileCard";
import StampSheet from "../components/discover/StampSheet";
import { useDiscoverStore } from "../store/useDiscoverStore";
import { useMatchStore } from "../store/useMatchStore";
import { STAMP_STYLES } from "../constants";

export default function DiscoverPage() {
  const { stack, loading, loadStack, swipe } = useDiscoverStore();
  const { incomingStamps, loadIncomingStamps } = useMatchStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flash, setFlash] = useState(null); // { glyph }

  useEffect(() => {
    loadStack();
    loadIncomingStamps();
  }, [loadStack, loadIncomingStamps]);

  const top = stack[0];

  const doPass = () => top && swipe(top._id, "pass");

  const doStamp = async ({ stampStyle, opener }) => {
    if (!top) return;
    setSheetOpen(false);
    setFlash({ glyph: STAMP_STYLES.find((s) => s.id === stampStyle)?.glyph || "♥" });
    setTimeout(() => setFlash(null), 550);
    await swipe(top._id, "stamp", { stampStyle, opener });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {incomingStamps.length > 0 && (
        <Link
          to="/matches"
          className="mb-4 flex items-center gap-2 rounded-xl bg-secondary/15 px-3 py-2 text-sm font-hand"
        >
          <Sparkles className="size-4 text-secondary" />
          {incomingStamps.length} {incomingStamps.length === 1 ? "person has" : "people have"} stamped you
        </Link>
      )}

      <div className="relative min-h-[420px]">
        {loading && (
          <div className="grid h-64 place-items-center">
            <Loader className="size-8 animate-spin" />
          </div>
        )}

        {!loading && !top && (
          <div className="paper-card ink-border rounded-2xl p-8 text-center">
            <p className="font-script text-2xl">That&apos;s everyone for now</p>
            <p className="mt-1 font-hand text-base-content/60">
              New sketchbooks show up as people join.
            </p>
            <button className="btn btn-sm btn-outline mt-4" onClick={loadStack}>
              <RotateCw className="size-4" /> Refresh
            </button>
          </div>
        )}

        {top && (
          <>
            <ProfileCard user={top} />
            {flash && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="animate-stamp text-8xl text-accent drop-shadow">{flash.glyph}</span>
              </div>
            )}
          </>
        )}
      </div>

      {top && (
        <div className="mt-5 flex items-center justify-center gap-6">
          <button
            className="btn btn-circle btn-lg btn-outline border-2"
            onClick={doPass}
            aria-label="pass"
          >
            <X className="size-7" />
          </button>
          <button
            className="btn btn-circle btn-lg btn-primary text-2xl"
            onClick={() => setSheetOpen(true)}
            aria-label="stamp"
          >
            ♥
          </button>
        </div>
      )}

      {sheetOpen && top && (
        <StampSheet user={top} onCancel={() => setSheetOpen(false)} onConfirm={doStamp} />
      )}
    </div>
  );
}
