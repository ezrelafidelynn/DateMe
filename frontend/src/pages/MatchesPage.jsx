import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader, MessageSquareDashed } from "lucide-react";
import RevealAvatar from "../components/RevealAvatar";
import { relativeTime } from "../lib/utils";
import { useMatchStore } from "../store/useMatchStore";

export default function MatchesPage() {
  const { matches, incomingStamps, loading, loadMatches, loadIncomingStamps } = useMatchStore();

  useEffect(() => {
    loadMatches();
    loadIncomingStamps();
  }, [loadMatches, loadIncomingStamps]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-script text-3xl mb-4">Your matches</h1>

      {incomingStamps.length > 0 && (
        <section className="mb-6">
          <h2 className="font-hand text-lg text-base-content/70 mb-2">Stamped you — stamp back to match</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {incomingStamps.map((u) => (
              <Link
                key={u._id}
                to="/"
                className="w-24 shrink-0 rounded-xl paper-card ink-border-sm p-2 text-center"
              >
                <img
                  src={u.drawnAvatar || "/avatar.png"}
                  alt={u.fullName}
                  className="size-16 mx-auto rounded-full bg-base-200 object-cover blur-[2px]"
                />
                <p className="mt-1 truncate font-hand text-sm">{u.fullName?.split(" ")[0]}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="grid h-40 place-items-center">
          <Loader className="size-8 animate-spin" />
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="paper-card ink-border rounded-2xl p-8 text-center">
          <MessageSquareDashed className="size-8 mx-auto text-base-content/40" />
          <p className="font-script text-2xl mt-2">No matches yet</p>
          <p className="font-hand text-base-content/60">Head to Discover and stamp a few sketchbooks.</p>
        </div>
      )}

      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m._id}>
            <Link
              to={`/chat/${m._id}`}
              className="flex items-center gap-3 rounded-xl paper-card ink-border-sm p-3 hover:shadow-sketch-lg transition"
            >
              <RevealAvatar
                drawn={m.withUser?.drawnAvatar}
                photo={m.withUser?.profilePic}
                progress={m.revealProgress}
                size={56}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-hand text-lg">{m.withUser?.fullName?.split(" ")[0]}</span>
                  <span className="text-xs text-base-content/50">{relativeTime(m.lastMessageAt || m.createdAt)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <progress
                    className="progress progress-primary h-1.5 w-full"
                    value={m.revealProgress}
                    max="100"
                  />
                  <span className="text-[11px] font-hand text-base-content/50">{m.revealProgress}%</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
