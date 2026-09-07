import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { GAMES } from "../../../constants";
import TicTacToe from "./TicTacToe";
import Hangman from "./Hangman";
import GuessTheDoodle from "./GuessTheDoodle";
import ExquisiteCorpse from "./ExquisiteCorpse";

const REGISTRY = {
  "tic-tac-toe": TicTacToe,
  hangman: Hangman,
  "guess-the-doodle": GuessTheDoodle,
  "exquisite-corpse": ExquisiteCorpse,
};

/**
 * Hosts the in-chat mini games. Invites, moves and results relay peer-to-peer
 * over the socket `game:*` events; only the final result is posted to the
 * thread (by the host) via `onPostResult`.
 */
export default function GamePanel({
  matchId,
  otherUser,
  onClose,
  onPostResult,
  onSendSketch,
  initialInvite = null,
}) {
  const socket = useAuthStore((s) => s.socket);
  const to = otherUser?._id;

  const [phase, setPhase] = useState(initialInvite ? "invited" : "menu");
  const [kind, setKind] = useState(initialInvite || null);
  const [role, setRole] = useState(null); // host | guest
  const [incoming, setIncoming] = useState(null); // last { move } from peer

  const send = useCallback(
    (move) => socket?.emit("game:move", { to, matchId, kind, move }),
    [socket, to, matchId, kind]
  );

  const endGame = useCallback(
    (result) => {
      socket?.emit("game:end", { to, matchId, kind, result });
      if (role === "host" && result) onPostResult(kind, result);
      onClose();
    },
    [socket, to, matchId, kind, role, onPostResult, onClose]
  );

  useEffect(() => {
    if (!socket) return undefined;
    const onInvite = ({ kind: k }) => {
      setKind(k);
      setPhase("invited");
    };
    const onAccept = ({ kind: k }) => {
      setKind(k);
      setRole("host");
      setPhase("playing");
    };
    const onDecline = () => setPhase("menu");
    const onMove = ({ move }) => setIncoming({ move, at: Date.now() });
    const onEnd = () => onClose();

    socket.on("game:invite", onInvite);
    socket.on("game:accept", onAccept);
    socket.on("game:decline", onDecline);
    socket.on("game:move", onMove);
    socket.on("game:end", onEnd);
    return () => {
      socket.off("game:invite", onInvite);
      socket.off("game:accept", onAccept);
      socket.off("game:decline", onDecline);
      socket.off("game:move", onMove);
      socket.off("game:end", onEnd);
    };
  }, [socket, onClose]);

  const invite = (k) => {
    setKind(k);
    setRole("host");
    setPhase("inviting");
    socket?.emit("game:invite", { to, matchId, kind: k });
  };

  const accept = () => {
    setRole("guest");
    setPhase("playing");
    socket?.emit("game:accept", { to, matchId, kind });
  };

  const decline = () => {
    socket?.emit("game:decline", { to, matchId, kind });
    setPhase("menu");
  };

  const ActiveGame = kind ? REGISTRY[kind] : null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral/60 p-3">
      <div className="w-full max-w-lg rounded-2xl bg-base-100 ink-border p-4 shadow-sketch-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-script text-2xl">Mini games</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        {phase === "menu" && (
          <div className="grid grid-cols-2 gap-2">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => invite(g.id)}
                className="rounded-xl border-2 border-base-content/15 p-3 text-left hover:border-primary"
              >
                <div className="font-hand text-lg">{g.label}</div>
                <div className="text-xs text-base-content/60">{g.blurb}</div>
              </button>
            ))}
          </div>
        )}

        {phase === "inviting" && (
          <p className="py-6 text-center font-hand text-lg">
            Waiting for {otherUser?.fullName?.split(" ")[0]} to accept…
          </p>
        )}

        {phase === "invited" && (
          <div className="py-6 text-center">
            <p className="font-hand text-lg">
              {otherUser?.fullName?.split(" ")[0]} wants to play{" "}
              <b>{GAMES.find((g) => g.id === kind)?.label}</b>
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button className="btn btn-ghost btn-sm" onClick={decline}>
                Decline
              </button>
              <button className="btn btn-primary btn-sm" onClick={accept}>
                Play
              </button>
            </div>
          </div>
        )}

        {phase === "playing" && ActiveGame && (
          <ActiveGame
            role={role}
            incoming={incoming}
            sendMove={send}
            endGame={endGame}
            sendSketch={onSendSketch}
          />
        )}
      </div>
    </div>
  );
}
