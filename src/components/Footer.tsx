"use client";

import { Monogram } from "./Monogram";
import { couple } from "@/lib/couple";
import { useLanguage } from "./LanguageProvider";
import { signalUserGesture, requestIntroReplay } from "@/lib/gesture";

export function Footer() {
  const { t, lang } = useLanguage();
  const replayIntro = () => {
    if (typeof window === "undefined") return;
    const playIntro = (window as any).__fa_play_intro;
    try {
      // Signal a user gesture so audio contexts can resume.
      signalUserGesture();
    } catch {}
    try {
      // Ask the CinematicIntro component to replay itself without a
      // full page reload.
      requestIntroReplay();
    } catch {}
    // Start audio directly inside the button's user activation. This is
    // required by mobile Safari and also avoids relying on event timing.
    try {
      if (typeof playIntro === "function") playIntro();
      else window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <footer className="relative py-20 md:py-24 px-6 text-center bg-paper border-t border-ink/10">
      <Monogram
        tone="gold"
        showDate={false}
        size={180}
        className="mx-auto w-[130px] md:w-[160px] h-auto"
      />

      <p className={`mt-8 md:mt-10 text-gold/80 text-lg md:text-xl leading-none ${
        lang === "en" ? "font-script" : "font-sanskrit italic"
      }`}>
        {t("footer.with_love")}
      </p>
      <p className="mt-2 md:mt-3 font-display italic text-xl sm:text-2xl md:text-3xl text-ink">
        {couple.groom.firstName}{" "}
        <span className="text-gold">&amp;</span>{" "}
        {couple.bride.firstName}
      </p>

      <p className="mt-2 md:mt-3 kerning text-[9px] text-indigo/55">
        {couple.tagline}
      </p>

      <div className="hairline mt-10 md:mt-12 max-w-[80px] mx-auto text-ink/40" />

      <p className={`mt-8 md:mt-10 italic text-sm md:text-base text-ink/65 max-w-md mx-auto leading-relaxed ${
        lang === "en" ? "font-serif" : "font-sanskrit not-italic"
      }`}>
        {t("footer.blessing")}
      </p>

      <p className={`mt-6 md:mt-8 text-sm text-ink/55 ${
        lang === "en" ? "font-serif" : "font-sanskrit"
      }`}>
        {t("footer.questions")}&nbsp;
        <a
          href={`mailto:${couple.contact.rsvpEmail}`}
          className="text-indigo underline underline-offset-4 hover:text-gold transition-colors break-words"
        >
          {couple.contact.rsvpEmail}
        </a>
      </p>

      <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px]">
        <button
          onClick={replayIntro}
          className={`text-indigo/60 hover:text-gold transition-colors ${
            lang === "en" ? "kerning" : "font-sanskrit tracking-wide"
          }`}
        >
          {t("footer.replay")}
        </button>
        <a
          href="#rsvp"
          className={`text-indigo/60 hover:text-gold transition-colors ${
            lang === "en" ? "kerning" : "font-sanskrit tracking-wide"
          }`}
        >
          {t("footer.backRsvp")}
        </a>
      </div>
    </footer>
  );
}
