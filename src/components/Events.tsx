"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useRef, useState } from "react";
import { events, type WeddingEvent } from "@/lib/events";
import { formatLongDate } from "@/lib/cn";
import { useLanguage } from "./LanguageProvider";

export function Events() {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  return (
    <section
      id="events"
      className="relative py-24 md:py-28 lg:py-32 px-6 overflow-hidden bg-gradient-to-b from-paper via-[#EFE1C5] to-paper"
    >
      {/* ambient gold aura */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, rgba(212,168,75,0.12), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-[10px] md:text-[11px] text-indigo/60 ${kerningClass}`}
          >
            {t("events.eyebrow")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
            className={`mt-3 md:mt-4 text-[2.25rem] sm:text-5xl md:text-6xl text-ink leading-[1.05] ${displayClass}`}
          >
            {t("events.heading_a")} <span className="text-gold">{t("events.heading_b")}</span>
          </motion.h2>
        </div>

        <div className="grid gap-5 md:gap-6 sm:grid-cols-2">
          {events.map((ev, i) => (
            <EventCard key={ev.id} event={ev} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * EventCard
 *
 * Structure is a single flex-column so the footer aligns to the bottom of
 * every card regardless of description length — this guarantees all cards
 * in a row have matching footer baselines. No absolute-positioned overlaps
 * that fight with content at narrow viewports.
 *
 *   ┌──────────────── palette strip ───────────────┐
 *   │                                               │
 *   │  [01] · DATE                       [illus]    │
 *   │                                               │
 *   │  Event Name                                   │
 *   │  subtitle                                     │
 *   │  ─────────────                                │
 *   │  Time · 10:00 AM                              │
 *   │  Dress · Mustard & Marigold                   │
 *   │  Anthem · Title / Film                        │
 *   │                                               │
 *   │  Description paragraph...                     │
 *   │                                               │
 *   │  ─────────────                                │
 *   │  Passport stamp · unlocks on RSVP   ◦ ◦ ◦     │
 *   └───────────────────────────────────────────────┘
 *
 * Advanced hover layers (mouse spotlight, shimmer sweep, glow shadow) live
 * behind the content via z-index so the text is always readable.
 */
function EventCard({ event: ev, index: i }: { event: WeddingEvent; index: number }) {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifClass = lang === "en" ? "font-serif" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 24 });
  const sy = useSpring(my, { stiffness: 260, damping: 24 });
  const glowX = useTransform(sx, (v) => `${50 + v}%`);
  const glowY = useTransform(sy, (v) => `${50 + v}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(360px circle at ${x} ${y}, rgba(212,168,75,0.22), transparent 60%)`,
  );

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 50);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 50);
  };

  const handleEnter = () => setHovered(true);
  const handleLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
  };

  // Subtle alternating tilt direction per column so a row of
  // cards reads as gently animated rather than stamped twins.
  const lift = i % 2 === 0 ? -0.4 : 0.4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Tilt
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        glareEnable
        glareMaxOpacity={0.22}
        glareColor="#D4A84B"
        glarePosition="all"
        transitionSpeed={1400}
        scale={1.02}
        className="h-full relative"
      >
        {/* Palette aura — a blurred halo in the card's primary colour
            that blooms behind on hover. Sits *outside* the card so
            it extends past the edges for real atmosphere. */}
        <motion.div
          aria-hidden
          animate={{
            opacity: hovered ? 0.55 : 0,
            scale: hovered ? 1.08 : 0.9,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -inset-4 rounded-sm pointer-events-none -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${ev.palette[0]}55, transparent 65%)`,
            filter: "blur(30px)",
          }}
        />

        <motion.article
          ref={ref}
          onMouseMove={handleMove}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          whileHover={{ y: -8, rotate: lift }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="group relative bg-cream border border-ink/10 rounded-sm overflow-hidden flex flex-col h-full shadow-[0_8px_30px_rgba(15,15,38,0.05)] hover:shadow-[0_22px_60px_rgba(15,15,38,0.18)] transition-shadow duration-700"
          data-cursor="hover"
        >
          {/* Palette strip */}
          <div className="h-1.5 flex shrink-0">
            {ev.palette.map((c, k) => (
              <motion.span
                key={k}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 + k * 0.15, duration: 0.8 }}
                style={{ background: c }}
                className="flex-1 origin-left"
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative flex flex-col flex-1 p-6 md:p-8">
            {/* Cursor-reactive gold spotlight (absolute, behind text) */}
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: glowBg }}
            />

            {/* Header row: stamp + date · illustration */}
            <header className="relative flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 + 0.4, type: "spring", damping: 10 }}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full border-[1.5px] border-indigo/50 flex items-center justify-center bg-indigo/[0.03] shrink-0"
                >
                  <span className="font-display italic text-indigo text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </motion.div>
                <span className={`text-[9px] md:text-[10px] text-ink/55 leading-tight min-w-0 ${kerningClass}`}>
                  {lang === "en"
                    ? formatLongDate(ev.date)
                    : t(`events.${ev.i18nKey}.date` as const)}
                </span>
              </div>
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 text-gold/60 group-hover:text-gold transition-colors duration-500">
                <EventIllustration type={ev.icon} />
              </div>
            </header>

            {/* Title + subtitle */}
            <h3 className={`relative text-[2rem] sm:text-4xl md:text-5xl text-ink leading-[0.95] break-words ${displayClass}`}>
              {ev.name}
            </h3>
            <p className={`relative mt-2 text-ink/70 text-sm md:text-base leading-snug ${serifItalicClass}`}>
              {t(`events.${ev.i18nKey}.subtitle` as const)}
            </p>

            {/* Hairline */}
            <div className="relative hairline my-5 text-ink/30" />

            {/* Details */}
            <dl className={`relative grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-sm ${serifClass}`}>
              <dt className={`text-[10px] text-ink/50 pt-1 ${kerningClass}`}>{t("events.label.time")}</dt>
              <dd className="text-ink">{t(`events.${ev.i18nKey}.time` as const)}</dd>
              
              {ev.song && (
                <>
                  <dt className={`text-[10px] text-ink/50 pt-1 ${kerningClass}`}>{t("events.label.anthem")}</dt>
                  <dd className={`text-indigo min-w-0 ${lang === "en" ? "italic" : ""}`}>
                    <span className="break-words">{ev.song.title}</span>
                    <span className={`block text-[9px] text-ink/50 not-italic mt-0.5 break-words ${kerningClass}`}>
                      {ev.song.film}
                    </span>
                  </dd>
                </>
              )}
            </dl>

            {/* Description */}
            <p className={`relative mt-5 text-sm md:text-[15px] text-ink/75 leading-relaxed ${serifClass}`}>
              {t(`events.${ev.i18nKey}.description` as const)}
            </p>

            {/* Footer — mt-auto pins to card bottom */}
            <footer className="relative mt-auto pt-6 border-t border-dashed border-ink/15 flex items-center justify-between gap-3">
              <span className={`text-[9px] text-ink/45 truncate ${kerningClass}`}>
                {t("events.label.passport")}
              </span>
              <div className="flex gap-1.5 shrink-0">
                {ev.palette.map((c, k) => (
                  <motion.span
                    key={k}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: k * 0.35,
                    }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </footer>
          </div>

          {/* Shimmer sweep */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-[1400ms] ease-out"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(212,168,75,0.18) 50%, transparent 70%)",
            }}
          />

          {/* Themed wedding-vibe particles — colour drawn from the
              card's own palette so haldi rises in yellow, mehndi in
              green+magenta, vivah in red+gold, sangeet in gold+rose.
              Only mounted while hovered to avoid the 24 particles
              running animations on four idle cards. */}
          <AnimatePresence>
            {hovered && <EventParticles palette={ev.palette} />}
          </AnimatePresence>
        </motion.article>
      </Tilt>
    </motion.div>
  );
}

/**
 * EventParticles — small coloured dots rising from the bottom of the
 * card with randomised drift. Each ceremony's palette tints them so
 * the cards feel distinct when you hover them (the yellow haldi card
 * breathes warmth; the dark sangeet card glimmers gold).
 */
function EventParticles({ palette }: { palette: string[] }) {
  const particles = Array.from({ length: 14 });
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {particles.map((_, idx) => {
        const colour = palette[idx % palette.length];
        const size = 3 + ((idx * 7) % 4);
        const xOffset = (idx * 37) % 100;
        const drift = ((idx * 13) % 40) - 20;
        const dur = 2.6 + ((idx * 11) % 15) / 10;
        const delay = (idx * 0.18) % 1.4;
        return (
          <motion.span
            key={idx}
            initial={{ y: "110%", x: 0, opacity: 0 }}
            animate={{
              y: "-20%",
              x: drift,
              opacity: [0, 0.9, 0.9, 0],
            }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.2, 0.75, 1],
            }}
            className="absolute rounded-full"
            style={{
              left: `${xOffset}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: colour,
              boxShadow: `0 0 ${size * 2}px ${colour}`,
            }}
          />
        );
      })}
    </motion.div>
  );
}

function EventIllustration({ type }: { type: WeddingEvent["icon"] }) {
  if (type === "haldi") {
    return (
      <motion.svg
        viewBox="0 0 40 40"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        fill="currentColor"
        className="w-full h-full"
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const cx = Math.round((20 + 8 * Math.cos(a)) * 100) / 100;
          const cy = Math.round((20 + 8 * Math.sin(a)) * 100) / 100;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx="4"
              ry="2.5"
              transform={`rotate(${i * 45} ${cx} ${cy})`}
              opacity="0.85"
            />
          );
        })}
        <circle cx="20" cy="20" r="3.5" fill="#fff" opacity="0.5" />
        <circle cx="20" cy="20" r="2" />
      </motion.svg>
    );
  }
  if (type === "mehendi") {
    return (
      <motion.svg
        viewBox="0 0 40 40"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
        fill="currentColor"
      >
        <path d="M 20 6 C 12 10 8 18 20 34 C 32 18 28 10 20 6 Z" opacity="0.9" />
        <path d="M 20 10 L 20 32" stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.55" />
        <path
          d="M 20 16 Q 14 18 12 22 M 20 16 Q 26 18 28 22 M 20 22 Q 15 24 13 28 M 20 22 Q 25 24 27 28"
          stroke="#fff"
          strokeWidth="0.5"
          fill="none"
          opacity="0.55"
        />
      </motion.svg>
    );
  }
  if (type === "sangeet" || type === "reception") {
    return (
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.line
            key={i}
            x1={10 + i * 7}
            x2={10 + i * 7}
            // Explicit initial values must match the first frame of
            // each keyframe array, otherwise Framer Motion passes
            // `undefined` to the SVG attribute on the first render
            // and the browser logs "Expected length, undefined".
            initial={{ y1: 14, y2: 26 }}
            animate={{ y1: [14, 8, 14], y2: [26, 32, 26] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.18,
            }}
          />
        ))}
      </svg>
    );
  }
  // wedding / vivah / default — sacred fire
  return (
    <motion.svg
      viewBox="0 0 40 40"
      className="w-full h-full"
      fill="currentColor"
      animate={{ scale: [1, 1.06, 0.97, 1.03, 1] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M 20 36 C 10 32 10 22 18 16 C 18 20 21 21 21 17 C 22 12 27 14 28 22 C 30 30 26 35 20 36 Z"
        opacity="0.95"
      />
      <path
        d="M 20 32 C 14 30 15 24 19 21 C 19 24 22 24 22 22 C 24 23 25 28 20 32 Z"
        fill="#fff"
        opacity="0.3"
      />
    </motion.svg>
  );
}
