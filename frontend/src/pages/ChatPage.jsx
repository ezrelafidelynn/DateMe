import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";

import ChatHeader from "../components/chat/ChatHeader";
import MessageBubble from "../components/chat/MessageBubble";
import MessageComposer from "../components/chat/MessageComposer";
import SketchComposerModal from "../components/chat/SketchComposerModal";
import StickerDrawer from "../components/chat/StickerDrawer";
import VoiceDoodleRecorder from "../components/chat/VoiceDoodleRecorder";
import Whiteboard from "../components/chat/Whiteboard";
import GamePanel from "../components/chat/games/GamePanel";
import RevealMeter from "../components/chat/RevealMeter";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ChatPage() {
  const { matchId } = useParams();
  const { authUser } = useAuthStore();
  const {
    activeMatch,
    messages,
    isLoading,
    peerTyping,
    openThread,
    closeThread,
    subscribe,
    unsubscribe,
    send,
    revealMessage,
  } = useChatStore();

  const [overlay, setOverlay] = useState(null); // sketch | quick | sticker | voice | whiteboard | games
  const [gameInvite, setGameInvite] = useState(null);
  const endRef = useRef(null);
  const socket = useAuthStore((s) => s.socket);

  useEffect(() => {
    if (!socket) return undefined;
    const onInvite = ({ kind }) => {
      setGameInvite(kind);
      setOverlay("games");
    };
    socket.on("game:invite", onInvite);
    return () => socket.off("game:invite", onInvite);
  }, [socket]);

  useEffect(() => {
    openThread(matchId);
    subscribe();
    return () => {
      unsubscribe();
      closeThread();
    };
  }, [matchId, openThread, subscribe, unsubscribe, closeThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  if (isLoading || !activeMatch) {
    return (
      <div className="grid h-[70vh] place-items-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  const closed = activeMatch.active === false;

  const sendSketch = ({ image, strokes, text }) =>
    send({ type: "sketch", sketch: { image, strokes }, text });

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col">
      <ChatHeader match={activeMatch} />
      <RevealMeter value={activeMatch.revealProgress || 0} />

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            mine={String(m.senderId) === String(authUser._id)}
            onReveal={revealMessage}
          />
        ))}
        {peerTyping && (
          <p className="font-hand text-sm text-base-content/50">
            {activeMatch.withUser?.fullName?.split(" ")[0]} is drawing…
          </p>
        )}
        <div ref={endRef} />
      </div>

      <MessageComposer onOpen={setOverlay} disabled={closed} />

      {overlay === "sketch" && (
        <SketchComposerModal onClose={() => setOverlay(null)} onSend={sendSketch} />
      )}
      {overlay === "quick" && (
        <SketchComposerModal
          quick
          title="Quick 5-stroke sketch"
          onClose={() => setOverlay(null)}
          onSend={sendSketch}
        />
      )}
      {overlay === "sticker" && (
        <StickerDrawer
          onClose={() => setOverlay(null)}
          onSend={(sticker) => send({ type: "sticker", sticker })}
        />
      )}
      {overlay === "voice" && (
        <VoiceDoodleRecorder
          onClose={() => setOverlay(null)}
          onSend={({ audio, sketch }) => send({ type: "voice-doodle", audio, sketch })}
        />
      )}
      {overlay === "whiteboard" && (
        <Whiteboard
          matchId={matchId}
          onClose={() => setOverlay(null)}
          onSaveToChat={(doc) => {
            sendSketch({ image: doc.image, strokes: doc.strokes });
            setOverlay(null);
          }}
        />
      )}
      {overlay === "games" && (
        <GamePanel
          matchId={matchId}
          otherUser={activeMatch.withUser}
          initialInvite={gameInvite}
          onClose={() => {
            setOverlay(null);
            setGameInvite(null);
          }}
          onPostResult={(kind, result) => send({ type: "game", game: { kind, result } })}
          onSendSketch={({ image, strokes }) => sendSketch({ image, strokes })}
        />
      )}
    </div>
  );
}
