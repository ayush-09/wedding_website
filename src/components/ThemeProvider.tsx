"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const STORAGE_KEY = "af-theme";

/**
 * Theme provider — mirrors LanguageProvider's shape for consistency.
 *
 * The site defaults to DARK mode. The SSR'd <html> carries the `dark`
 * class (see layout.tsx) and the initial state here is "dark", so first
 * paint matches and there's no hydration mismatch. On mount we read
 * localStorage and only switch to light if the visitor explicitly chose
 * it before; with no stored choice we stay dark regardless of the OS
 * preference.
 *
 * The `.dark` class is attached to <html> rather than <body>, matching
 * the CSS overrides in globals.css (`html.dark …`). Tailwind's
 * `darkMode: "class"` also resolves to that same selector, so we can
 * later sprinkle `dark:` variants if we outgrow the CSS approach.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
      // No stored choice → stay on the default (dark).
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
}
