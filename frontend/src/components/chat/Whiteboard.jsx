import { useEffect, useRef } from "react";
import { Save, Trash2, X } from "lucide-react";
import DrawingCanvas from "../draw/DrawingCanvas";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Real-time shared canvas. Strokes relay through the socket `canvas:*` events;
 * the server keeps an ephemeral snapshot so a late joiner is hydrated.
 */
export default function Whiteboard({ matchId, onClose, onSaveToChat }) {
  const socket = useAuthStore((s) => s.socket);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!socket) return undefined;
    socket.emit("canvas:join", { matchId });

    const onSync = ({ strokes }) => canvasRef.current?.loadStrokes(strokes || []);
    const onStroke = ({ stroke }) => canvasRef.current?.addRemoteStroke(stroke);
    const onClear = () => canvasRef.current?.applyClear();
    const onUndo = ({ strokeId }) => canvasRef.current?.removeStroke(strokeId);

    socket.on("canvas:sync", onSync);
    socket.on("canvas:stroke", onStroke);
    socket.on("canvas:clear", onClear);
    socket.on("canvas:undo", onUndo);

    return () => {
      socket.emit("canvas:leave", { matchId });
      socket.off("canvas:sync", onSync);
      socket.off("canvas:stroke", onStroke);
      socket.off("canvas:clear", onClear);
      socket.off("canvas:undo", onUndo);
    };
  }, [socket, matchId]);

  const handleCommit = (stroke) => socket?.emit("canvas:stroke", { matchId, stroke });
  const clearShared = () => socket?.emit("canvas:clear", { matchId });

  const saveToChat = () => {
    const doc = canvasRef.current?.export(720, 540, "#ffffff");
    if (doc?.strokes?.length) onSaveToChat(doc);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base-200">
      <div className="flex items-center justify-between border-b-2 border-base-content/10 bg-base-100 px-3 py-2">
        <h3 className="font-script text-2xl">Shared canvas</h3>
        <div className="flex gap-1">
          <button className="btn btn-sm btn-ghost" onClick={saveToChat} title="Save into chat">
            <Save className="size-4" /> Save
          </button>
          <button className="btn btn-sm btn-ghost text-error" onClick={clearShared} title="Clear for both">
            <Trash2 className="size-4" />
          </button>
          <button className="btn btn-sm btn-ghost btn-circle" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <DrawingCanvas ref={canvasRef} asp={1.35} minHeight={420} onStrokeCommit={handleCommit} />
        <p className="mt-2 text-center font-hand text-sm text-base-content/50">
          You&apos;re both drawing on the same page. &ldquo;Save&rdquo; drops it into the chat.
        </p>
      </div>
    </div>
  );
}
