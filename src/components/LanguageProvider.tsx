"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  translate,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);
const STORAGE_KEY = "af-lang";

/**
 * Wraps the app in a language context. English is the initial render
 * (matching the <html lang="en"> in layout) so there's no hydration
 * mismatch; if localStorage has a saved choice, we swap to it in a
 * useEffect right after hydration. The `<html lang>` attribute is
 * kept in sync so screen readers pick up the change.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "hi" || saved === "mr") {
        setLangState(saved);
      }
    } catch {
      /* private mode / disabled storage — ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const t = (key: TranslationKey, vars?: Record<string, string>) =>
    translate(key, lang, vars);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return ctx;
}
