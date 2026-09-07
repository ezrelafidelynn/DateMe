import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import DrawingCanvas from "../components/draw/DrawingCanvas";
import ThemePicker from "../components/ThemePicker";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  DRAW_PROMPTS,
  GENDER_OPTIONS,
  INTEREST_SUGGESTIONS,
  SHOW_ME_OPTIONS,
} from "../constants";

const PROMPT_CHOICES = DRAW_PROMPTS.slice(0, 4);

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile, isUpdatingProfile, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState({
    birthdate: "",
    gender: "",
    showMe: [],
    bio: "",
    interests: [],
  });
  const [avatar, setAvatar] = useState(null); // { image, strokes }
  const [answers, setAnswers] = useState({}); // promptId -> { image, strokes, prompt }
  const [activePrompts, setActivePrompts] = useState([PROMPT_CHOICES[0].promptId, PROMPT_CHOICES[1].promptId]);

  const avatarRef = useRef(null);
  const promptRef = useRef(null);
  const [promptIdx, setPromptIdx] = useState(0);

  const steps = ["You", "Your avatar", "Draw two answers", "Pick a theme", "Finish"];
  const currentPrompt = useMemo(
    () => PROMPT_CHOICES.find((p) => p.promptId === activePrompts[promptIdx]),
    [activePrompts, promptIdx]
  );

  const toggle = (key, value) =>
    setBasics((b) => ({
      ...b,
      [key]: b[key].includes(value) ? b[key].filter((v) => v !== value) : [...b[key], value],
    }));

  const captureAvatar = () => {
    const doc = avatarRef.current?.export(480, 480, "#ffffff");
    if (!doc || doc.strokes.length === 0) return null;
    setAvatar(doc);
    return doc;
  };

  const capturePrompt = () => {
    const doc = promptRef.current?.export(520, 400, "#ffffff");
    if (!doc || doc.strokes.length === 0) return null;
    setAnswers((a) => ({
      ...a,
      [currentPrompt.promptId]: { ...doc, prompt: currentPrompt.prompt },
    }));
    return doc;
  };

  const next = () => {
    if (step === 0) {
      if (!basics.birthdate) return toast.error("Add your birthday");
      if (!basics.gender) return toast.error("Pick how you identify");
      if (!basics.showMe.length) return toast.error("Pick who to show you");
    }
    if (step === 1 && !captureAvatar()) return toast.error("Draw something first!");
    if (step === 2) {
      if (!capturePrompt()) return toast.error("Draw an answer first!");
      if (promptIdx === 0) {
        setPromptIdx(1);
        promptRef.current?.clear();
        return;
      }
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const back = () => {
    if (step === 2 && promptIdx === 1) {
      setPromptIdx(0);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = async () => {
    const age =
      basics.birthdate &&
      (Date.now() - new Date(basics.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age && age < 18) return toast.error("You must be 18+ to use EzMatch");

    try {
      await updateProfile({
        birthdate: basics.birthdate,
        gender: basics.gender,
        bio: basics.bio,
        interests: basics.interests,
        orientation: basics.showMe,
        notebookTheme: theme,
        preferences: { showMe: basics.showMe, ageMin: 18, ageMax: 60, maxDistanceKm: 160 },
        drawnAvatar: avatar?.image,
        drawnAvatarStrokes: avatar?.strokes,
        doodleAnswers: Object.entries(answers).map(([promptId, v]) => ({
          promptId,
          prompt: v.prompt,
          image: v.image,
          strokes: v.strokes,
        })),
        onboarded: true,
      });
      toast.success("You're on the canvas!");
      navigate("/");
    } catch {
      /* toast handled in store */
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ul className="steps w-full mb-6 text-xs font-hand">
        {steps.map((label, i) => (
          <li key={label} className={`step ${i <= step ? "step-primary" : ""}`}>
            {label}
          </li>
        ))}
      </ul>

      <div className="paper-card ink-border rounded-2xl p-5 space-y-4">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-script text-2xl">A few basics, {authUser?.fullName?.split(" ")[0]}</h2>

            <label className="form-control">
              <span className="label-text font-medium mb-1">Birthday</span>
              <input
                type="date"
                className="input input-bordered"
                value={basics.birthdate}
                onChange={(e) => setBasics({ ...basics, birthdate: e.target.value })}
              />
            </label>

            <div>
              <p className="label-text font-medium mb-1">I am a…</p>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setBasics({ ...basics, gender: g.id })}
                    className={`btn btn-sm ${basics.gender === g.id ? "btn-primary" : "btn-outline"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label-text font-medium mb-1">Show me</p>
              <div className="flex flex-wrap gap-2">
                {SHOW_ME_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggle("showMe", o.id)}
                    className={`btn btn-sm ${basics.showMe.includes(o.id) ? "btn-primary" : "btn-outline"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-script text-2xl">Draw your avatar</h2>
            <p className="text-sm text-base-content/60 font-hand">
              This is what people see first. No pressure — stick figures welcome.
            </p>
            <DrawingCanvas ref={avatarRef} asp={1} minHeight={320} />
          </div>
        )}

        {step === 2 && currentPrompt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-script text-2xl">{currentPrompt.prompt}</h2>
              <span className="badge badge-outline font-hand">{promptIdx + 1} / 2</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHOICES.map((p) => (
                <button
                  key={p.promptId}
                  type="button"
                  disabled={activePrompts.includes(p.promptId) && activePrompts[promptIdx] !== p.promptId}
                  onClick={() => {
                    const nextPrompts = [...activePrompts];
                    nextPrompts[promptIdx] = p.promptId;
                    setActivePrompts(nextPrompts);
                    promptRef.current?.clear();
                  }}
                  className={`btn btn-xs ${
                    activePrompts[promptIdx] === p.promptId ? "btn-secondary" : "btn-ghost"
                  }`}
                >
                  {p.prompt}
                </button>
              ))}
            </div>
            <DrawingCanvas
              key={currentPrompt.promptId + promptIdx}
              ref={promptRef}
              asp={1.3}
              minHeight={300}
              initialStrokes={answers[currentPrompt.promptId]?.strokes || []}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="font-script text-2xl">Pick your notebook</h2>
            <p className="text-sm text-base-content/60 font-hand">
              Sets the paper your whole profile is drawn on. Change it any time.
            </p>
            <ThemePicker value={theme} onChange={setTheme} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-script text-2xl">Last touches</h2>
            <label className="form-control">
              <span className="label-text font-medium mb-1">One-line bio</span>
              <input
                className="input input-bordered"
                maxLength={120}
                placeholder="I will beat you at Guess the Doodle"
                value={basics.bio}
                onChange={(e) => setBasics({ ...basics, bio: e.target.value })}
              />
            </label>
            <div>
              <p className="label-text font-medium mb-1">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle("interests", tag)}
                    className={`btn btn-xs ${
                      basics.interests.includes(tag) ? "btn-accent" : "btn-outline"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button className="btn btn-ghost btn-sm" onClick={back} disabled={step === 0 && promptIdx === 0}>
            <ChevronLeft className="size-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button className="btn btn-primary btn-sm" onClick={next}>
              Next <ChevronRight className="size-4" />
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={finish} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? <Loader2 className="size-4 animate-spin" /> : "Enter EzMatch"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
