import { create } from "zustand";
import { NOTEBOOK_THEMES, DEFAULT_THEME } from "../constants";

const VALID = new Set(NOTEBOOK_THEMES.map((t) => t.id));
const stored = localStorage.getItem("ezmatch-theme");

export const useThemeStore = create((set) => ({
  theme: VALID.has(stored) ? stored : DEFAULT_THEME,
  setTheme: (theme) => {
    if (!VALID.has(theme)) return;
    localStorage.setItem("ezmatch-theme", theme);
    set({ theme });
  },
}));
