import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2, Pencil } from "lucide-react";
import DrawingCanvas from "../components/draw/DrawingCanvas";
import SketchPlayer from "../components/draw/SketchPlayer";
import { useAuthStore } from "../store/useAuthStore";
import { fileToDataUrl } from "../lib/utils";
import { DRAW_PROMPTS, INTEREST_SUGGESTIONS } from "../constants";

export default function ProfilePage() {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [bio, setBio] = useState(authUser?.bio || "");
  const [interests, setInterests] = useState(authUser?.interests || []);
  const [promptId, setPromptId] = useState(null);
  const avatarRef = useRef(null);
  const promptRef = useRef(null);

  const toggleInterest = (tag) =>
    setInterests((list) => (list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]));

  const saveText = () => updateProfile({ bio, interests }).then(() => toast.success("Saved"));

  const saveAvatar = async () => {
    const doc = avatarRef.current?.export(480, 480, "#ffffff");
    if (!doc?.strokes?.length) return toast.error("Draw something first");
    await updateProfile({ drawnAvatar: doc.image, drawnAvatarStrokes: doc.strokes });
    setEditingAvatar(false);
    toast.success("Avatar updated");
  };

  const savePromptAnswer = async () => {
    const prompt = DRAW_PROMPTS.find((p) => p.promptId === promptId);
    const doc = promptRef.current?.export(520, 400, "#ffffff");
    if (!doc?.strokes?.length) return toast.error("Draw an answer first");
    const others = (authUser.doodleAnswers || []).filter((d) => d.promptId !== promptId);
    await updateProfile({
      doodleAnswers: [...others, { promptId, prompt: prompt.prompt, image: doc.image, strokes: doc.strokes }],
    });
    setPromptId(null);
    toast.success("Answer saved");
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    await updateProfile({ profilePic: dataUrl });
    toast.success("Photo saved — it stays blurred until matches earn the reveal");
  };

  const answers = authUser?.doodleAnswers || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Avatar */}
      <section className="paper-card ink-border rounded-2xl p-4">
        <h2 className="font-script text-2xl mb-3">Drawn avatar</h2>
        {!editingAvatar ? (
          <div className="flex items-center gap-4">
            <img
              src={authUser?.drawnAvatar || "/avatar.png"}
              alt="avatar"
              className="size-28 rounded-full bg-base-200 object-cover ink-border-sm"
            />
            <button className="btn btn-outline btn-sm" onClick={() => setEditingAvatar(true)}>
              <Pencil className="size-4" /> Redraw
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <DrawingCanvas
              ref={avatarRef}
              asp={1}
              minHeight={300}
              initialStrokes={authUser?.drawnAvatarStrokes || []}
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm flex-1" onClick={() => setEditingAvatar(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm flex-1" onClick={saveAvatar} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="size-4 animate-spin" /> : "Save avatar"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Real photo */}
      <section className="paper-card ink-border rounded-2xl p-4">
        <h2 className="font-script text-2xl mb-2">Real photo</h2>
        <p className="font-hand text-sm text-base-content/60 mb-3">
          Optional. Stays blurred to matches and un-blurs as you exchange messages and drawings.
        </p>
        <label className="btn btn-outline btn-sm">
          <Camera className="size-4" /> {authUser?.profilePic ? "Replace photo" : "Add photo"}
          <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
        </label>
      </section>

      {/* Bio + interests */}
      <section className="paper-card ink-border rounded-2xl p-4 space-y-3">
        <h2 className="font-script text-2xl">About</h2>
        <input
          className="input input-bordered w-full"
          maxLength={120}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="One-line bio"
        />
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleInterest(tag)}
              className={`btn btn-xs ${interests.includes(tag) ? "btn-accent" : "btn-outline"}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveText} disabled={isUpdatingProfile}>
          Save about
        </button>
      </section>

      {/* Doodle answers */}
      <section className="paper-card ink-border rounded-2xl p-4">
        <h2 className="font-script text-2xl mb-3">Visual prompts</h2>
        {!promptId ? (
          <div className="grid grid-cols-2 gap-2">
            {DRAW_PROMPTS.map((p) => {
              const existing = answers.find((a) => a.promptId === p.promptId);
              return (
                <button
                  key={p.promptId}
                  onClick={() => setPromptId(p.promptId)}
                  className="rounded-xl border-2 border-base-content/15 p-2 text-left hover:border-primary"
                >
                  <p className="font-hand text-sm">{p.prompt}</p>
                  {existing ? (
                    <SketchPlayer
                      strokes={existing.strokes}
                      image={existing.image}
                      aspect={1.3}
                      className="mt-1 rounded ink-border-sm overflow-hidden"
                    />
                  ) : (
                    <span className="text-xs text-base-content/50">not answered</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-hand text-lg">
              {DRAW_PROMPTS.find((p) => p.promptId === promptId)?.prompt}
            </p>
            <DrawingCanvas
              ref={promptRef}
              asp={1.3}
              minHeight={280}
              initialStrokes={answers.find((a) => a.promptId === promptId)?.strokes || []}
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm flex-1" onClick={() => setPromptId(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm flex-1" onClick={savePromptAnswer}>
                Save answer
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
