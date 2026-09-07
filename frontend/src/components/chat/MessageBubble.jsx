import { useState } from "react";
import { Eye, Gamepad2 } from "lucide-react";
import SketchPlayer from "../draw/SketchPlayer";
import VoiceDoodlePlayer from "./VoiceDoodlePlayer";
import { formatMessageTime } from "../../lib/utils";
import { GAMES } from "../../constants";

export default function MessageBubble({ message, mine, onReveal }) {
  const [peeked, setPeeked] = useState(false);
  const covered = message.blurUntilOpened && !mine && !peeked;
  const align = mine ? "items-end" : "items-start";

  const reveal = () => {
    setPeeked(true);
    onReveal?.(message._id);
  };

  return (
    <div className={`flex flex-col ${align} gap-0.5 animate-float-in`}>
      <div
        className={`relative max-w-[78%] rounded-2xl px-3 py-2 ${
          mine ? "bg-primary text-primary-content" : "bg-base-100 ink-border-sm"
        }`}
      >
        {message.type === "text" && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

        {message.type === "image" && (
          <img src={message.image} alt="" className="max-w-[220px] rounded-lg" />
        )}

        {(message.type === "sketch" || message.type === "voice-doodle") && (
          <div className="relative w-56 max-w-full">
            {message.type === "sketch" ? (
              <SketchPlayer
                strokes={message.sketch?.strokes}
                image={message.sketch?.image}
                animate={!mine && !covered}
                aspect={1.3}
                className="rounded-lg ink-border-sm overflow-hidden bg-base-100"
              />
            ) : (
              <VoiceDoodlePlayer
                audio={message.audio}
                strokes={message.sketch?.strokes}
                image={message.sketch?.image}
              />
            )}
            {covered && (
              <button
                onClick={reveal}
                className="absolute inset-0 grid place-items-center rounded-lg bg-base-300/80 backdrop-blur-md"
              >
                <span className="flex items-center gap-1 font-hand text-sm">
                  <Eye className="size-4" /> tap to reveal
                </span>
              </button>
            )}
            {message.text && <p className="mt-1 text-sm">{message.text}</p>}
          </div>
        )}

        {message.type === "sticker" && (
          <img src={message.sticker?.image} alt="sticker" className="w-28 drop-shadow" />
        )}

        {message.type === "game" && (
          <div className="flex items-center gap-2 font-hand">
            <Gamepad2 className="size-4" />
            <span>
              {GAMES.find((g) => g.id === message.game?.kind)?.label || "Game"} —{" "}
              {message.game?.result || "played"}
            </span>
          </div>
        )}

        {message.moderation?.status === "flagged" && (
          <span className="mt-1 block text-[10px] italic opacity-70">flagged for review</span>
        )}
      </div>
      <time className="px-1 text-[10px] text-base-content/45">
        {formatMessageTime(message.createdAt)}
      </time>
    </div>
  );
}
