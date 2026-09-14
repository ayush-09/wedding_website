"use client";

import { motion } from "framer-motion";
import { usePageVisible } from "@/lib/usePageVisible";

/**
 * RomanceAmbience — three layered ambient effects over the whole
 * viewport. `pointer-events-none` throughout, so every click passes
 * to the real content.
 *
 *   1. Hearts (14) drifting up from below with a soft horizontal
 *      wobble, alternating gold + rose, each with a glow shadow.
 *      Three size tiers so it reads as *depth* — distant small
 *      hearts + close-up big ones — instead of a uniform curtain.
 *   2. Rose petals (8) falling from above, rotating slowly with a
 *      gentle side drift. Classic wedding-shower imagery; softer
 *      than butterflies and on-brand for this site's palette.
 *   3. Gold sparkles (9) — 4-point stars twinkling at fixed points
 *      across the viewport, scale-pulsing with 180° rotation.
 *
 * Z-index 30 — above page content (z-10), below intro (z-100),
 * envelope (z-95), and user controls (z-40). Skipped on
 * touch / coarse-pointer devices to save battery.
 */

const PETAL_COLORS = [
  "#E8B7B7", // rose pink
  "#D4A0A0", // dusty rose
  "#F39C5B", // soft saffron
  "#D4A84B", // gold
  "#C2185B", // fuchsia touch
  "#E8C89A", // warm cream
];

const HEARTS = Array.from({ length: 14 }).map((_, i) => ({
  seed: i,
  xStart: (i * 137 + 13) % 100,
  duration: 13 + (i % 5) * 1.8,
  delay: (i * 1.4) % 14,
  // Three size tiers for depth illusion
  size: [10, 14, 18][i % 3],
  color: i % 2 === 0 ? "#D4A84B" : "#E8B7B7",
  driftPhase: i % 2 === 0 ? 1 : -1,
}));

const PETALS = Array.from({ length: 8 }).map((_, i) => ({
  seed: i,
  xStart: (i * 97 + 5) % 100,
  duration: 14 + (i % 4) * 2.4,
  delay: (i * 2.1) % 12,
  size: 14 + (i % 3) * 4,
  color: PETAL_COLORS[i % PETAL_COLORS.length],
  spin: i % 2 === 0 ? 1 : -1,
  tilt: (i * 47) % 360,
}));

const SPARKLES = Array.from({ length: 9 }).map((_, i) => ({
  x: (i * 89 + 7) % 100,
  y: (i * 53 + 11) % 100,
  size: 6 + (i % 3) * 2,
  duration: 3 + (i % 3) * 0.7,
  delay: (i * 0.9) % 6,
}));

export function RomanceAmbience() {
  const visible = usePageVisible();

  if (typeof window !== "undefined") {
    const isCoarse =
      "ontouchstart" in window ||
      window.matchMedia?.("(pointer: coarse)").matches;
    if (isCoarse) return null;
    // Honour prefers-reduced-motion — the whole effect is decorative,
    // so skipping it is strictly better than forcing 30 motion loops
    // on someone who's asked the OS to tone animation down.
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return null;
  }

  // Unmount the whole particle tree while the tab is hidden. This
  // halts ~30 framer-motion loops immediately instead of waiting
  // for the browser to throttle the rAF loop in the background.
  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
    >
      {HEARTS.map((h) => (
        <Heart key={`ht-${h.seed}`} {...h} />
      ))}
      {PETALS.map((p) => (
        <Petal key={`pt-${p.seed}`} {...p} />
      ))}
      {SPARKLES.map((s, i) => (
        <Sparkle key={`sp-${i}`} {...s} />
      ))}
    </div>
  );
}

function Heart({
  xStart,
  duration,
  delay,
  size,
  color,
  driftPhase,
}: (typeof HEARTS)[number]) {
  const drift = 24 * driftPhase;
  return (
    <motion.span
      initial={{ y: "108vh", opacity: 0 }}
      animate={{
        y: "-12vh",
        x: [0, drift, -drift * 0.6, drift * 0.8, 0],
        opacity: [0, 0.65, 0.65, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        opacity: {
          duration,
          delay,
          repeat: Infinity,
          times: [0, 0.15, 0.85, 1],
        },
        x: {
          duration: duration * 0.55,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        },
      }}
      className="absolute block"
      style={{
        left: `${xStart}%`,
        width: size,
        height: size,
        color,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full"
        style={{
          filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}55)`,
        }}
      >
        <path d="M 12 21 L 3.5 12.5 C 0.5 9.5, 1 4.5, 5.5 3.5 C 8.5 2.8, 11 4.5, 12 7 C 13 4.5, 15.5 2.8, 18.5 3.5 C 23 4.5, 23.5 9.5, 20.5 12.5 Z" />
      </svg>
    </motion.span>
  );
}

function Petal({
  xStart,
  duration,
  delay,
  size,
  color,
  spin,
  tilt,
}: (typeof PETALS)[number]) {
  return (
    <motion.span
      initial={{ y: "-12vh", x: 0, rotate: tilt, opacity: 0 }}
      animate={{
        y: "112vh",
        x: [0, 36, -24, 18, -10, 0],
        rotate: tilt + spin * 540,
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        rotate: {
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        },
        opacity: {
          duration,
          delay,
          repeat: Infinity,
          times: [0, 0.12, 0.88, 1],
        },
        x: {
          duration: duration * 0.4,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      }}
      className="absolute block"
      style={{
        left: `${xStart}%`,
        width: size,
        height: size * 1.35,
        color,
      }}
    >
      <svg
        viewBox="0 0 24 32"
        className="w-full h-full"
        style={{
          filter: `drop-shadow(0 0 4px ${color}aa)`,
        }}
      >
        {/* Soft elongated petal — almond/teardrop shape with an
            inner midline vein so it reads as organic flora. */}
        <path
          d="M 12 2 Q 22 10 20 20 Q 17 30 12 30 Q 7 30 4 20 Q 2 10 12 2 Z"
          fill="currentColor"
          opacity="0.82"
        />
        <path
          d="M 12 4 Q 12 16 12 28"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </motion.span>
  );
}

function Sparkle({
  x,
  y,
  size,
  duration,
  delay,
}: (typeof SPARKLES)[number]) {
  return (
    <motion.span
      animate={{
        opacity: [0, 1, 0],
        scale: [0.4, 1.1, 0.4],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 2 + (delay % 3),
        ease: "easeInOut",
      }}
      className="absolute block"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 6px #D4A84B)" }}
      >
        <path
          d="M 12 2 L 13.5 10.5 L 22 12 L 13.5 13.5 L 12 22 L 10.5 13.5 L 2 12 L 10.5 10.5 Z"
          fill="#D4A84B"
        />
      </svg>
    </motion.span>
  );
}
