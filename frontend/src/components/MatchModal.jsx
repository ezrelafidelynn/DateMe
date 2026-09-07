import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { useMatchStore } from "../store/useMatchStore";
import { useAuthStore } from "../store/useAuthStore";

export default function MatchModal() {
  const navigate = useNavigate();
  const { freshMatch, clearFreshMatch } = useMatchStore();
  const { authUser } = useAuthStore();
  if (!freshMatch) return null;

  const them = freshMatch.withUser || {};
  const myAvatar = authUser?.drawnAvatar || "/avatar.png";
  const theirAvatar = them.drawnAvatar || "/avatar.png";

  const goChat = () => {
    clearFreshMatch();
    navigate(`/chat/${freshMatch._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-base-100 ink-border shadow-sketch-lg animate-float-in">
        {/* hand-drawn flame confetti */}
        {[...Array(8)].map((_, i) => (
          <Flame
            key={i}
            className="absolute text-accent/30"
            style={{
              width: 20 + (i % 3) * 12,
              height: 20 + (i % 3) * 12,
              top: `${(i * 37) % 90}%`,
              left: `${(i * 53) % 92}%`,
              transform: `rotate(${i * 40}deg)`,
            }}
          />
        ))}

        <div className="relative p-6 text-center">
          <p className="font-script text-4xl text-primary drop-shadow">It&apos;s a Match!</p>
          <p className="font-hand text-base-content/60 mt-1">
            You and {them.fullName?.split(" ")[0]} both stamped each other.
          </p>

          <div className="my-6 flex items-center justify-center gap-4">
            <img
              src={myAvatar}
              alt="you"
              className="size-24 rounded-full object-cover ink-border bg-base-200 -rotate-1.5"
            />
            <Flame className="size-8 text-accent" />
            <img
              src={theirAvatar}
              alt={them.fullName}
              className="size-24 rounded-full object-cover ink-border bg-base-200 rotate-1.5"
            />
          </div>

          <div className="space-y-2">
            <button className="btn btn-primary w-full" onClick={goChat}>
              Send a sketch
            </button>
            <button className="btn btn-ghost w-full" onClick={clearFreshMatch}>
              Keep playing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
