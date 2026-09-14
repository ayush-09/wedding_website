"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { getPresenceCount, hasSupabase } from "@/lib/supabase";
import type { Language } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

const DEV_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function localizeNumber(n: number, lang: Language): string {
  const s = Math.max(0, Math.floor(n)).toString();
  if (lang === "en") return s;
  return s
    .split("")
    .map((c) => {
      const d = c.charCodeAt(0) - 48;
      return d >= 0 && d < 10 ? DEV_DIGITS[d] : c;
    })
    .join("");
}

/**
 * "X diyas alight" — community presence counter shown beneath the
 * mandala. Reads the server count once on mount, then optimistically
 * increments when this guest's own RSVP fires the kindle event. Hidden
 * silently when Supabase isn't configured or the count is zero.
 */
export function PresenceCounter() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!hasSupabase) return;
    let alive = true;
    getPresenceCount().then((c) => {
      if (alive && c !== null) setCount(c);
    });
    const onKindle = () => {
      setCount((prev) => (prev === null ? 1 : prev + 1));
    };
    window.addEventListener("fa-presence-lit", onKindle);
    return () => {
      alive = false;
      window.removeEventListener("fa-presence-lit", onKindle);
    };
  }, []);

  if (!hasSupabase) return null;
  if (count === null || count <= 0) return null;

  const key = count === 1 ? "presence.one" : "presence.many";
  const text = t(key, { count: localizeNumber(count, lang) });
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      aria-live="polite"
      className={`mt-3 md:mt-4 flex items-center justify-center gap-3 text-[10px] md:text-[11px] text-gold/85 ${kerningClass}`}
    >
      <span className="block w-6 h-px bg-gold/40" aria-hidden />
      <span>{text}</span>
      <span className="block w-6 h-px bg-gold/40" aria-hidden />
    </motion.div>
  );
}
