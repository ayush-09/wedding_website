"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HeroActions } from "./HeroActions";
import { Monogram } from "./Monogram";
import { useLanguage } from "./LanguageProvider";

/**
 * Hero — responsive, single-column centered composition with a
 * scroll-linked parallax depth pass. As the user scrolls past the
 * hero each layer leaves at a slightly different pace, so the whole
 * composition feels like a camera pulling up + back into the page.
 *
 *   · halo     — fades + scales up fastest (the backdrop recedes)
 *   · monogram — drifts up most slowly (anchor of the composition)
 *   · names    — drift up a touch faster than monogram
 *   · labels   — drift and fade fastest so they clear the frame
 *                before the next section's headline lands
 *
 * Key sizing decisions:
 *   · Monogram uses CSS width (via className) so it scales with viewport
 *     instead of a fixed pixel size. `h-auto` preserves aspect.
 *   · Names use clamp(min, vw-value, max) so they remain legible at 360px
 *     and don't balloon past ~9rem at 1920px.
 *   · Actions wrap onto two lines on very narrow screens.
 */
export function Hero() {
  const { t, lang } = useLanguage();
  const tinyLabelClass =
    lang === "en" ? "kerning" : "font-sanskrit tracking-wide";

  // Scroll-linked parallax. `offset` pins the start at the top of the
  // hero entering the viewport and the end at the hero leaving, so
  // progress 0→1 tracks exactly one hero-height of scroll.
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Y-translation lanes, ordered from deepest (monogram) to closest
  // (labels). The numbers are in vh-ish px so the parallax reads at
  // every viewport size.
  const monogramY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const monogramScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const namesY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const labelsY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const actionsY = useTransform(scrollYProgress, [0, 1], [0, -180]);

  // Fade everything out over the last ~40% of scroll so the next
  // section can land on a clean paper ground instead of overlapping
  // ghosted hero text.
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Personalised greeting via `?to=Ravi` URL param. Sanitised to
  // letters / spaces / Devanagari and capped at 40 chars so a guest
  // can't smuggle markup or oversized strings into the engraving.
  const [guestName, setGuestName] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("to");
    if (!raw) return;
    const cleaned = raw
      .trim()
      .slice(0, 40)
      .replace(/[^a-zA-ZÀ-ſऀ-ॿ\s'-]/g, "");
    if (cleaned.length > 0) setGuestName(cleaned);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col items-center justify-end px-6 pb-16 md:pb-20 pt-24 overflow-hidden text-cream"
      style={{
        background:
          "radial-gradient(ellipse at center, #2A1825 0%, #160A18 70%, #0A040C 100%)",
      }}
    >
      {/* ─── DESKTOP DIPTYCH ─────────────────────────────────────
          Two hilltop photos side by side, like the two pages of
          an open wedding-invitation card. Hidden on mobile —
          stacking them top/bottom on phones produced an
          unprofessional split. Mobile uses a single-photo
          crossfade further down.
          Animated:
            · initial reveal zooms out from 1.18 → 1 + fades in
            · perpetual Ken Burns: subtle scale + pan loop, each
              side using a different period so the diptych always
              feels alive without ever syncing into a beat. */}
      <div className="hidden md:grid absolute inset-0 z-0 pointer-events-none grid-cols-2 overflow-hidden">
        <motion.div
          aria-hidden
          className="relative overflow-hidden"
          initial={{ scale: 1.18, opacity: 0 }}
          animate={{
            scale: [1, 1.07, 1.03, 1],
            x: ["0%", "-1.4%", "0.6%", "0%"],
            y: ["0%", "0.8%", "-0.6%", "0%"],
            opacity: 1,
          }}
          transition={{
            opacity: { duration: 2.2, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 32, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.7, 1] },
            x: { duration: 32, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.7, 1] },
            y: { duration: 32, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.7, 1] },
          }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
            style={{ objectPosition: "center 50%" }}
          />
        </motion.div>
        <motion.div
          aria-hidden
          className="relative overflow-hidden"
          initial={{ scale: 1.18, opacity: 0 }}
          animate={{
            scale: [1, 1.05, 1.08, 1],
            x: ["0%", "1.2%", "-0.8%", "0%"],
            y: ["0%", "-0.6%", "0.7%", "0%"],
            opacity: 1,
          }}
          transition={{
            opacity: { duration: 2.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 38, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
            x: { duration: 38, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
            y: { duration: 38, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
          }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/hero-bg-2.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
            style={{ objectPosition: "center 50%" }}
          />
        </motion.div>
      </div>

      {/* ─── MOBILE SINGLE-PHOTO CROSSFADE ───────────────────────
          On phones the diptych split looked like two photos
          slapped together. Show one full-bleed photo at a time
          and slowly crossfade between them every ~7 seconds, so
          guests get both pictures without any visible division.
          Each layer carries its own Ken Burns drift so the still
          phase still feels alive. */}
      <div className="md:hidden absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{
            opacity: [1, 1, 0, 0, 1],
            scale: [1, 1.08, 1.1, 1.02, 1],
            x: ["0%", "-2%", "1%", "-1%", "0%"],
          }}
          transition={{
            opacity: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.43, 0.5, 0.93, 1],
            },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.9, 1] },
            x: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.9, 1] },
          }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/hero-bg-2.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "75% 40%" }}
          />
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{
            opacity: [0, 0, 1, 1, 0],
            scale: [1.02, 1.06, 1, 1.08, 1.02],
            x: ["1%", "-1%", "0%", "1.5%", "1%"],
          }}
          transition={{
            opacity: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.43, 0.5, 0.93, 1],
            },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.9, 1] },
            x: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.9, 1] },
          }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 45%" }}
          />
        </motion.div>
      </div>

      {/* Diagonal gold light sweep — once every ~11s a translucent
          gold gradient flares across the diptych corner-to-corner,
          like a slow film-strip light leak. Pure CSS gradient
          dragged with framer-motion; no DOM cost beyond one div. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none mix-blend-screen"
        initial={{ opacity: 0, x: "-60%" }}
        animate={{
          opacity: [0, 0.35, 0.35, 0],
          x: ["-60%", "10%", "60%", "120%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatDelay: 6,
          ease: "easeInOut",
          times: [0, 0.2, 0.8, 1],
        }}
        style={{
          background:
            "linear-gradient(110deg, transparent 35%, rgba(244,196,80,0.18) 47%, rgba(255,235,180,0.42) 50%, rgba(244,196,80,0.18) 53%, transparent 65%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Vertical gold seam between the two desktop photos — the
          spine of the open card. Hidden on mobile (no diptych
          there). Slowly pulses so it reads as living foil. */}
      <motion.div
        aria-hidden
        className="hidden md:block absolute top-[12%] bottom-[12%] left-1/2 -translate-x-1/2 w-px z-[1] pointer-events-none"
        animate={{ opacity: [0.55, 0.95, 0.55] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(212,168,75,1) 25%, rgba(255,225,160,1) 50%, rgba(212,168,75,1) 75%, transparent 100%)",
          boxShadow: "0 0 8px rgba(244,196,80,0.45)",
        }}
      />

      {/* Mobile-only delicate corner ornaments — small gold
          art-deco brackets at top-left and bottom-right give the
          single mobile photo a framed feel without dividing it. */}
      <div
        aria-hidden
        className="md:hidden absolute top-6 left-6 z-[1] pointer-events-none w-12 h-12"
        style={{
          borderTop: "1px solid rgba(212,168,75,0.7)",
          borderLeft: "1px solid rgba(212,168,75,0.7)",
        }}
      />
      <div
        aria-hidden
        className="md:hidden absolute bottom-6 right-6 z-[1] pointer-events-none w-12 h-12"
        style={{
          borderBottom: "1px solid rgba(212,168,75,0.7)",
          borderRight: "1px solid rgba(212,168,75,0.7)",
        }}
      />

      {/* Theme-aware fade veil — softens the diptych photos so
          the monogram + italic names read clearly. Swaps to a
          deeper ink wash in dark mode (.hero-veil rule lives in
          globals.css). */}
      <div aria-hidden className="hero-veil absolute inset-0 z-[1] pointer-events-none" />

      {/* Personalised welcome banner — fades in only when ?to= is set */}
      {guestName && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.0 }}
          className="absolute top-10 md:top-14 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none"
        >
          <p className={`text-[10px] md:text-[11px] text-gold/85 ${tinyLabelClass}`}>
            A personal welcome to
          </p>
          <p
            className="mt-1 font-display italic text-cream drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]"
            style={{ fontSize: "clamp(1.25rem, 3.4vw, 2.25rem)" }}
          >
            {guestName}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ opacity: contentOpacity }}
        className="relative z-10 max-w-4xl w-full text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: monogramY, scale: monogramScale }}
          className="mx-auto mb-6 md:mb-8 relative w-[180px] sm:w-[210px] md:w-[240px]"
          aria-hidden
        >
          {/* Soft gold aura — gives the monogram a touch of glow
              against the veiled photo backdrop without imposing a
              hard medallion shape. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(244,196,80,0.32) 0%, rgba(244,196,80,0.12) 38%, transparent 72%)",
              transform: "scale(1.5)",
              filter: "blur(20px)",
            }}
          />
          <Monogram
            tone="gold"
            animate
            showDate={false}
            showNames={false}
            size={240}
            className="relative w-full h-auto mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.9 }}
          style={{ y: labelsY }}
          className={`text-[10px] md:text-[11px] text-cream/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] ${tinyLabelClass}`}
        >
          {t("hero.together")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: namesY }}
          className="mt-4 md:mt-5 font-display italic leading-[0.95] text-cream drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)]"
        >
          <span style={{ fontSize: "clamp(2rem, 6.5vw, 4.5rem)" }}>
            Akash
            <span className="text-gold font-display not-italic mx-2 md:mx-3">
              &amp;
            </span>
            Falguni
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.9 }}
          style={{ y: namesY }}
          className={`mt-4 md:mt-5 text-[11px] md:text-[12px] text-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${tinyLabelClass}`}
        >
          {t("hero.date")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.9 }}
          style={{ y: actionsY }}
          className="mt-6 md:mt-7"
        >
          <HeroActions />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        style={{ opacity: scrollCueOpacity }}
        className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className={`text-[9px] text-cream/55 ${tinyLabelClass}`}>
          {t("hero.scroll")}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 md:h-10 bg-gradient-to-b from-cream/55 to-transparent"
        />
      </motion.div>
    </section>
  );
}
