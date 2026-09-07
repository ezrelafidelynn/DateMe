import toast from "react-hot-toast";
import ThemePicker from "../components/ThemePicker";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { NOTEBOOK_THEMES } from "../constants";

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { authUser, updateProfile } = useAuthStore();

  const choose = async (id) => {
    setTheme(id);
    if (authUser) {
      try {
        await updateProfile({ notebookTheme: id });
      } catch {
        /* toast handled in store */
      }
    }
  };

  const current = NOTEBOOK_THEMES.find((t) => t.id === theme);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-script text-3xl">Notebook themes</h1>
      <p className="font-hand text-base-content/60 mb-4">
        Your theme sets the paper the whole app — and your profile — is drawn on.
      </p>

      <ThemePicker value={theme} onChange={choose} />

      <div className="mt-6 paper-card ink-border rounded-2xl p-4">
        <h2 className="font-hand text-xl mb-2">Preview — {current?.label}</h2>
        <div data-theme={theme} className="paper rounded-xl ink-border overflow-hidden">
          <div className="bg-base-100/70 p-4 space-y-3">
            <div className="flex gap-2">
              <span className="badge badge-primary">primary</span>
              <span className="badge badge-secondary">secondary</span>
              <span className="badge badge-accent">accent</span>
            </div>
            <div className="chat chat-start">
              <div className="chat-bubble bg-base-100 ink-border-sm text-base-content">
                doodle me a coffee?
              </div>
            </div>
            <div className="chat chat-end">
              <div className="chat-bubble chat-bubble-primary">on it ☕</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toast.success("Looks good!")}>
              Sample button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
