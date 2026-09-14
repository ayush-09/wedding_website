"use client";

import { Fragment } from "react";
import { LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

/**
 * Language selector — three labels with a middot separator between
 * each, housed in a cream pill with a blurred backdrop. Pure pill
 * content; the parent FloatingControls strip owns positioning so
 * the language pill and the theme toggle appear as one row.
 */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="flex items-center gap-2 md:gap-3 bg-cream/95 backdrop-blur-md border border-ink/15 rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-[0_6px_22px_rgba(15,15,38,0.22)]"
      role="group"
      aria-label="Language selector"
    >
      {LANGUAGES.map((l, i) => {
        const active = lang === l.code;
        return (
          <Fragment key={l.code}>
            {i > 0 && (
              <span aria-hidden className="text-ink/20 text-[10px]">
                ·
              </span>
            )}
            <button
              onClick={() => setLang(l.code)}
              className={`font-serif text-[11px] md:text-xs leading-none transition-colors ${
                active
                  ? "text-gold font-medium"
                  : "text-ink/55 hover:text-ink"
              }`}
              aria-pressed={active}
              aria-label={`${l.label}`}
            >
              {l.native}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
