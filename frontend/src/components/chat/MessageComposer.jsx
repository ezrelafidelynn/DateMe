import { useRef, useState } from "react";
import { Gamepad2, Mic, PenLine, Plus, Send, Smile, SquarePen } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

const TRAY = [
  { id: "sketch", label: "Sketch", Icon: PenLine },
  { id: "quick", label: "5-stroke", Icon: SquarePen },
  { id: "sticker", label: "Sticker", Icon: Smile },
  { id: "voice", label: "Voice doodle", Icon: Mic },
  { id: "whiteboard", label: "Shared canvas", Icon: PenLine },
  { id: "games", label: "Games", Icon: Gamepad2 },
];

export default function MessageComposer({ onOpen, disabled }) {
  const { send, isSending, setTyping } = useChatStore();
  const [text, setText] = useState("");
  const [trayOpen, setTrayOpen] = useState(false);
  const typingRef = useRef(false);

  const onType = (v) => {
    setText(v);
    if (!typingRef.current) {
      typingRef.current = true;
      setTyping(true);
    }
    clearTimeout(typingRef.timeout);
    typingRef.timeout = setTimeout(() => {
      typingRef.current = false;
      setTyping(false);
    }, 1200);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text.trim();
    setText("");
    setTyping(false);
    typingRef.current = false;
    await send({ type: "text", text: value });
  };

  return (
    <div className="border-t-2 border-base-content/10 bg-base-100/80 p-2">
      {trayOpen && (
        <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {TRAY.map(({ id, label, Icon }) => (
            <button
              key={id}
              className="flex flex-col items-center gap-1 rounded-xl border-2 border-base-content/10 p-2 text-xs hover:border-primary"
              onClick={() => {
                setTrayOpen(false);
                onOpen(id);
              }}
            >
              <Icon className="size-5 text-primary" />
              {label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2">
        <button
          type="button"
          className={`btn btn-circle btn-sm ${trayOpen ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTrayOpen((v) => !v)}
          disabled={disabled}
        >
          <Plus className={`size-5 transition-transform ${trayOpen ? "rotate-45" : ""}`} />
        </button>
        <input
          className="input input-bordered input-sm flex-1 sm:input-md"
          placeholder={disabled ? "This match is closed" : "Write something…"}
          value={text}
          disabled={disabled}
          onChange={(e) => onType(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-circle btn-sm" disabled={isSending || disabled || !text.trim()}>
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
