import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Gamepad2, ImagePlus, Mic, PenLine, Plus, Send, Smile, SquarePen, X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { downscaleImage } from "../../lib/utils";

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
  const [image, setImage] = useState(null); // downscaled data URL
  const [trayOpen, setTrayOpen] = useState(false);
  const typingRef = useRef(false);
  const fileRef = useRef(null);

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

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");
    try {
      setImage(await downscaleImage(file));
    } catch {
      toast.error("Could not read that image");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    const value = text.trim();
    if (!value && !image) return;

    setText("");
    setImage(null);
    setTyping(false);
    typingRef.current = false;

    if (image) await send({ type: "image", image, text: value || undefined });
    else await send({ type: "text", text: value });
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

      {image && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <img src={image} alt="to send" className="size-16 rounded-lg object-cover ink-border-sm" />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-base-300"
            >
              <X className="size-3" />
            </button>
          </div>
          <span className="font-hand text-sm text-base-content/60">photo ready — add a caption or send</span>
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

        <button
          type="button"
          className="btn btn-circle btn-sm btn-ghost"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          title="Send a photo"
        >
          <ImagePlus className="size-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />

        <input
          className="input input-bordered input-sm flex-1 sm:input-md"
          placeholder={disabled ? "This match is closed" : image ? "Add a caption…" : "Write something…"}
          value={text}
          disabled={disabled}
          onChange={(e) => onType(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary btn-circle btn-sm"
          disabled={isSending || disabled || (!text.trim() && !image)}
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
