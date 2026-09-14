"use client";

import { useState } from "react";
import { Button } from "./Button";
import { couple } from "@/lib/couple";
import { AddToCalendar } from "./AddToCalendar";

/**
 * Hero action row — RSVP (primary), Add-to-Calendar menu (multi-
 * provider: Google / Outlook / .ics-download-with-all-ceremonies),
 * Share (Web Share API with a clipboard fallback + "Copied" toast).
 */
export function HeroActions() {
  const [copied, setCopied] = useState(false);

  const rsvp = () => {
    if (typeof window === "undefined") return;
    const target = document.getElementById("rsvp");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const share = async () => {
    if (typeof window === "undefined") return;
    const payload = {
      title: `${couple.groom.firstName} & ${couple.bride.firstName}`,
      text: "We're getting married — 23.01.2027.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch {
      /* user cancelled or unavailable — fall through */
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — last-resort no-op */
    }
  };

  // Shared treatment for the three hero CTAs so they read as a set
  // against the dark-veiled photo backdrop: cream-tinted border,
  // cream text, gold-on-hover. RSVP keeps a faint indigo fill to
  // mark it as the primary action; Calendar + Share are
  // transparent so the trio reads as one continuous control bar.
  // No `!` prefix — tailwind-merge dedupes conflicting tokens so
  // these later-listed classes correctly replace the variant
  // defaults (text-indigo, border-indigo, etc.).
  const heroBtnBase =
    "min-w-[150px] md:min-w-[170px] border text-cream border-cream/55 bg-transparent hover:text-gold hover:border-gold transition-colors duration-300";
  const heroPrimary = "bg-indigo/55 hover:bg-indigo/70 backdrop-blur-sm";

  return (
    <div className="relative mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
      <Button
        variant="primary"
        size="md"
        onClick={rsvp}
        className={`${heroBtnBase} ${heroPrimary}`}
      >
        RSVP
      </Button>
      <AddToCalendar buttonClassName={heroBtnBase} />
      <Button
        variant="ghost"
        size="md"
        onClick={share}
        magnetic={false}
        className={heroBtnBase}
      >
        <ShareIcon /> {copied ? "Copied" : "Share"}
      </Button>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="3" cy="7" r="1.7" />
      <circle cx="11" cy="3" r="1.7" />
      <circle cx="11" cy="11" r="1.7" />
      <line x1="4.5" y1="6" x2="9.5" y2="3.5" />
      <line x1="4.5" y1="8" x2="9.5" y2="10.5" />
    </svg>
  );
}
