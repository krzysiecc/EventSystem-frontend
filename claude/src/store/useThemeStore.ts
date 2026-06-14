import { create } from "zustand";

export type Theme = "light" | "dark" | "mono";

const STORAGE_KEY = "eh-theme";
const DEFAULT_THEME: Theme = "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Wczytuje motyw z localStorage i ustawia atrybut data-theme na <html>. */
  initializeFromStorage: () => void;
}

const readStored = (): Theme => {
  try {
    const t = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return t === "light" || t === "dark" || t === "mono" ? t : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const apply = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

/**
 * @description Globalny store motywu (Light / Dark / Mono).
 * Trzyma wybór w localStorage i synchronizuje atrybut data-theme na <html>.
 * Wzorowany na useAuthStore — ten sam styl inicjalizacji ze storage.
 */
export const useThemeStore = create<ThemeState>((set) => {
  const initial = readStored();

  return {
    theme: initial,

    setTheme: (theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* ignore */
      }
      apply(theme);
      set({ theme });
    },

    initializeFromStorage: () => {
      const theme = readStored();
      apply(theme);
      set({ theme });
    },
  };
});
