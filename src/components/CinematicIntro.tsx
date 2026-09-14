"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Monogram } from "./Monogram";
import { couple } from "@/lib/couple";

/**
 * INTRODUCTION FILM — four title cards on a cosmic Shiva backdrop, with
 * butterflies flying across on curved paths and petals drifting gently down
 * from the top. All SVG, all Framer Motion, no images required.
 */
export function CinematicIntro() {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [show, setShow] = useState(false);
  // completedRef prevents the "intro-complete" event from being
  // dispatched twice. Without it, skipping the intro early leaves
  // the t5 natural-end timer still pending — at t=16.5s it fires,
  // redispatches the event, and the EnvelopeGate restarts its
  // sequence even though the user may have already tapped the seal
  // or dismissed the envelope. That was the root cause of both the
  // "Enter directly does nothing" and "inner card reverts to the
  // envelope screen" bugs.
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    // Per user preference: a refresh restarts the whole experience —
    // intro replays, envelope re-appears, music resets. No
    // sessionStorage gating.

    setShow(true);
    // FAST MODE — snappy/cinematic pacing (~halved from the original
    // ~18 s film to ~8.5 s). Each card still gets enough hold for its
    // entrance choreography to finish before the card changes.
    const t1 = window.setTimeout(() => setStage(1), 1050);
    // Card 2 (monogram) holds ~2.3 s: enough for the entrance + a
    // heartbeat pulse before the card changes.
    const t2 = window.setTimeout(() => setStage(2), 3350);
    // Card 3 (names) holds ~3 s — letters settle and the sutra +
    // Sanskrit anchor get a beat to land before moving on.
    const t3 = window.setTimeout(() => setStage(3), 6400);
    // Card 4 (date) holds ~2.2 s. Fire the intro-complete event at the
    // same moment we begin fading the intro out so the EnvelopeGate
    // overlay (z-95) can fade in *beneath* the still-fading intro.
    const t4 = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      window.dispatchEvent(new Event("fa-intro-complete"));
      setShow(false);
    }, 8600);
    timersRef.current = [t1, t2, t3, t4];

    return () => {
      timersRef.current.forEach(window.clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // ── Introduction music ───────────────────────────────────
  // Begin the intro track ~3 s INTO the film, then play it for ~5 s
  // (so it runs 3 s → 8 s, ending just before the ~8.6 s film end).
  // Browsers block sound before a user gesture, so we attempt autoplay
  // at the 3 s mark and also arm a first-gesture fallback (any tap /
  // scroll / key starts it). The seal tap later plays its own chime, and
  // the persistent MusicPlayer loop starts at `fa-tour-start`.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;

    const TARGET_VOLUME = 0.85; // loud under the film
    const START_DELAY_MS = 3000; // begin 3 s into the film
    const PLAY_MS = 5000; // then play for ~5 s (3 s → 8 s)
    const FADE_IN_MS = 250;
    const FADE_OUT_MS = 600;

    const audio = new Audio("/audio/intoduction.mp3");
    audio.preload = "auto";
    audio.volume = 0;

    let cancelled = false;
    let started = false;
    let raf = 0;
    let stopTimer = 0;
    let removeGesture: (() => void) | null = null;

    const fade = (
      from: number,
      to: number,
      ms: number,
      onDone?: () => void,
    ) => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const step = (now: number) => {
        if (cancelled) return;
        const p = Math.min((now - start) / ms, 1);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * p));
        if (p < 1) raf = requestAnimationFrame(step);
        else onDone?.();
      };
      raf = requestAnimationFrame(step);
    };

    const begin = () => {
      // Guard against double-start (autoplay success + a gesture).
      if (cancelled || started) return;
      started = true;
      try {
        audio.currentTime = 0;
      } catch {
        /* setting currentTime can throw before metadata loads */
      }
      fade(0, TARGET_VOLUME, FADE_IN_MS);
      // Fade out so the 3 s clip ends cleanly rather than cutting off.
      stopTimer = window.setTimeout(
        () =>
          fade(audio.volume, 0, FADE_OUT_MS, () => {
            try {
              audio.pause();
            } catch {}
          }),
        Math.max(0, PLAY_MS - FADE_OUT_MS),
      );
    };

    const armGestureFallback = () => {
      if (cancelled || removeGesture) return;

      // cleanup function must be declared before the handler uses it
      let cleanupGestureListeners: (() => void) | null = null;

      const onGesture = () => {
        // Remove listeners and immediately attempt to play the intro
        // so the first user interaction starts audio right away.
        try {
          cleanupGestureListeners?.();
        } catch {}
        tryPlay();
      };

      cleanupGestureListeners = () => {
        try {
          window.removeEventListener("pointerdown", onGesture);
          window.removeEventListener("keydown", onGesture);
          window.removeEventListener("touchstart", onGesture);
          window.removeEventListener("fa-user-gesture", onGesture as any);
        } catch {}
        removeGesture = null;
      };

      window.addEventListener("pointerdown", onGesture, { once: true });
      window.addEventListener("keydown", onGesture, { once: true });
      window.addEventListener("touchstart", onGesture, { once: true });
      // external custom event used by other components to signal a gesture
      window.addEventListener("fa-user-gesture", onGesture as any, { once: true });
      removeGesture = cleanupGestureListeners;
    };

    // If an earlier component (e.g. FirstClickReplay) already recorded
    // a user gesture before this component mounted, attempt to play
    // immediately rather than waiting for the scheduled START_DELAY_MS.
    try {
      if ((window as any).__fa_user_gesture) {
        tryPlay();
      }
    } catch {}

    const tryPlay = () => {
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => begin()).catch(() => armGestureFallback());
      } else {
        begin();
      }
    };

    // Arm the first-gesture fallback immediately so an early tap can
    // unlock the short intro music on mobile, then also attempt autoplay
    // at the 3s mark as before.
    armGestureFallback();
    const startTimer = window.setTimeout(() => {
      tryPlay();
    }, START_DELAY_MS);

    const stopAll = () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      window.clearTimeout(stopTimer);
      removeGesture?.();
      try {
        audio.pause();
      } catch {}
    };

    // If the user SKIPS the intro (or it completes), `fa-intro-complete`
    // fires — stop the music, or prevent it from ever starting if the
    // skip happened before the 3 s start. The component stays mounted
    // (it only renders null after the film), so the unmount cleanup
    // alone wouldn't catch a skip; this listener does.
    const onIntroDone = () => stopAll();
    window.addEventListener("fa-intro-complete", onIntroDone);

    return () => {
      stopAll();
      window.removeEventListener("fa-intro-complete", onIntroDone);
    };
  }, []);

  const skip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    // Clear the pending stage timers so t5 can't fire at 16.5s and
    // redispatch the event while the user is already on the envelope
    // (or past it). useEffect cleanup only runs on unmount; this
    // component stays mounted for its exit animation, so the timers
    // would otherwise survive long enough to cause the re-trigger.
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    window.dispatchEvent(new Event("fa-intro-complete"));
    setShow(false);
  };

  const displayFont =
    "var(--font-display), 'Italiana', 'Didot', 'Bodoni 72', Georgia, serif";
  const serifItalic =
    "var(--font-serif), 'Cormorant Garamond', 'Garamond', Georgia, serif";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0F0A22 0%, #1B1535 50%, #0A0B20 100%)",
          }}
        >
          {/* Letterbox bars */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="absolute top-0 left-0 right-0 h-[7vh] md:h-[8vh] bg-black z-20"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="absolute bottom-0 left-0 right-0 h-[7vh] md:h-[8vh] bg-black z-20"
          />

          {/* Agni halo */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(900px 450px at 50% -2%, rgba(232,90,47,0.18), transparent 60%)",
            }}
          />
          {/* Neelkanth glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(700px 400px at 50% 102%, rgba(27,58,92,0.7), transparent 65%)",
            }}
          />
          {/* Starfield */}
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            {Array.from({ length: 50 }).map((_, i) => {
              const x = (i * 97) % 1200;
              const y = (i * 53 + 30) % 800;
              const r = (i % 4) * 0.3 + 0.4;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={r}
                  fill="#F5E6C9"
                  opacity={0.3 + (i % 5) * 0.1}
                />
              );
            })}
          </svg>

          {/* Drifting flower petals — behind title cards */}
          <FallingPetals />

          {/* Butterflies — behind title cards, above petals */}
          <Butterflies />

          {/* Vignette */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.35) 100%)",
            }}
          />
          {/* Film grain */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Title cards — sit above butterflies/petals */}
          <div className="relative z-10 h-full flex items-center justify-center px-6 py-[10vh] md:py-[12vh]">
            <AnimatePresence mode="wait">
              {stage === 0 && (
                <motion.div
                  key="c1"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -14,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto text-gold/90 mb-5 md:mb-7 leading-none"
                    style={{
                      fontFamily: displayFont,
                      fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    }}
                  >
                    ❦
                  </motion.div>
                  <p
                    className="text-gold/95"
                    style={{
                      fontFamily: "var(--font-sans), Inter, system-ui",
                      fontSize: "clamp(10px, 1.1vw, 12px)",
                      letterSpacing: "0.5em",
                      textTransform: "uppercase",
                      paddingLeft: "0.5em",
                    }}
                  >
                    A Love Story
                  </p>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="my-6 md:my-8 mx-auto h-px w-20 bg-gold/60 origin-center"
                  />
                  <p
                    className="italic text-ash"
                    style={{
                      fontFamily: serifItalic,
                      fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                      fontWeight: 300,
                      letterSpacing: "0.015em",
                    }}
                  >
                    presents
                  </p>
                </motion.div>
              )}

              {stage === 1 && (
                <motion.div
                  key="c2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.99,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-gold/95"
                    style={{
                      fontFamily: "var(--font-sans), Inter, system-ui",
                      fontSize: "clamp(10px, 1.1vw, 12px)",
                      letterSpacing: "0.55em",
                      textTransform: "uppercase",
                      paddingLeft: "0.55em",
                    }}
                  >
                    The Wedding Of
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="relative my-6 md:my-8 mx-auto"
                    style={{ width: "min(260px, 62vw)" }}
                  >
                    {/* Soft gold aura behind the monogram */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(244,196,80,0.2), transparent 65%)",
                        transform: "scale(1.2)",
                        filter: "blur(14px)",
                      }}
                    />
                    <Monogram
                      tone="gold"
                      showDate={false}
                      showNames={false}
                      animate
                      size={260}
                      className="relative w-full h-auto mx-auto"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.55, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4 mx-auto h-px w-16 bg-gold/50 origin-center"
                  />
                </motion.div>
              )}

              {stage === 2 && <NameCard fontFamily={displayFont} />}

              {stage === 3 && <DateCard fontFamily={displayFont} />}
            </AnimatePresence>
          </div>

          <button
            onClick={skip}
            className="absolute bottom-[9vh] md:bottom-[10vh] right-6 kerning text-[9px] text-ash/60 hover:text-gold transition-colors z-30"
          >
            skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────
   BUTTERFLIES
   Each butterfly is an SVG with a body, antennae, and four wings. The wing
   group flaps via `scaleX` on a continuous 0.28s loop — this compresses the
   wings toward the body then spreads them again, simulating a flap cycle.
   The outer wrapper animates the butterfly along a five-point curved
   waypoint path with `ease: "easeInOut"` for natural flight, a gentle
   roll/tilt with `rotate`, and a fade-in / fade-out on the entry and exit
   of the scene.
   ────────────────────────────────────────────────────────── */
function Butterflies() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden>
      <Butterfly
        delay={1.4}
        duration={8.5}
        size={30}
        color="#D4A84B"
        waypoints={[
          { x: "6vw", y: "84vh" },
          { x: "22vw", y: "62vh" },
          { x: "42vw", y: "40vh" },
          { x: "62vw", y: "28vh" },
          { x: "82vw", y: "16vh" },
          { x: "100vw", y: "10vh" },
        ]}
        tilts={[0, 6, -3, 5, -2, 0]}
        flapSpeed={0.3}
      />
      <Butterfly
        delay={6.2}
        duration={9}
        size={24}
        color="#F3D9A8"
        waypoints={[
          { x: "102vw", y: "28vh" },
          { x: "82vw", y: "42vh" },
          { x: "58vw", y: "52vh" },
          { x: "34vw", y: "46vh" },
          { x: "10vw", y: "62vh" },
          { x: "-6vw", y: "76vh" },
        ]}
        tilts={[0, -5, 4, -3, 6, -2]}
        flapSpeed={0.34}
      />
    </div>
  );
}

type ButterflyProps = {
  delay: number;
  duration: number;
  size: number;
  color: string;
  waypoints: { x: string; y: string }[];
  tilts: number[];
  flapSpeed: number;
};

function Butterfly({
  delay,
  duration,
  size,
  color,
  waypoints,
  tilts,
  flapSpeed,
}: ButterflyProps) {
  const xs = waypoints.map((p) => p.x);
  const ys = waypoints.map((p) => p.y);

  return (
    <motion.div
      initial={{ opacity: 0, x: xs[0], y: ys[0], rotate: 0 }}
      animate={{
        x: xs,
        y: ys,
        rotate: tilts,
        opacity: [0, 1, 1, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: [0.45, 0.05, 0.55, 0.95],
      }}
      className="absolute top-0 left-0"
      style={{ willChange: "transform, opacity" }}
    >
      <ButterflySVG size={size} color={color} flapSpeed={flapSpeed} />
    </motion.div>
  );
}

function ButterflySVG({
  size,
  color,
  flapSpeed,
}: {
  size: number;
  color: string;
  flapSpeed: number;
}) {
  return (
    <svg
      viewBox="0 0 40 30"
      width={size}
      height={(size * 30) / 40}
      style={{
        display: "block",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
      }}
    >
      {/* Body — thin dark vertical ellipse */}
      <ellipse cx="20" cy="15" rx="0.8" ry="6.5" fill="#2b1a12" />
      {/* Antennae — thin curved lines with tiny round tips */}
      <path
        d="M 19.6 9 C 17 5 14 4 12 5"
        stroke="#2b1a12"
        strokeWidth="0.35"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 20.4 9 C 23 5 26 4 28 5"
        stroke="#2b1a12"
        strokeWidth="0.35"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="12" cy="5" r="0.45" fill="#2b1a12" />
      <circle cx="28" cy="5" r="0.45" fill="#2b1a12" />

      {/* Wings flap group — scaleX oscillates to compress/spread */}
      <motion.g
        animate={{ scaleX: [1, 0.22, 1] }}
        transition={{
          duration: flapSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {/* Upper-left wing */}
        <path
          d="M 20 12 C 10 2 0 7 3 17 C 10 14 17 13 20 14 Z"
          fill={color}
          opacity="0.92"
        />
        {/* Upper-right wing */}
        <path
          d="M 20 12 C 30 2 40 7 37 17 C 30 14 23 13 20 14 Z"
          fill={color}
          opacity="0.92"
        />
        {/* Lower-left wing */}
        <path
          d="M 20 15 C 13 18 9 27 16 28.5 C 19 23 20 18 20 16 Z"
          fill={color}
          opacity="0.78"
        />
        {/* Lower-right wing */}
        <path
          d="M 20 15 C 27 18 31 27 24 28.5 C 21 23 20 18 20 16 Z"
          fill={color}
          opacity="0.78"
        />
        {/* Small highlight spots on upper wings */}
        <circle cx="8" cy="12" r="1.2" fill="#fff" opacity="0.4" />
        <circle cx="32" cy="12" r="1.2" fill="#fff" opacity="0.4" />
        <circle cx="12" cy="14" r="0.6" fill="#2b1a12" opacity="0.5" />
        <circle cx="28" cy="14" r="0.6" fill="#2b1a12" opacity="0.5" />
      </motion.g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   PETALS
   Each petal is a single filled teardrop SVG wrapped in a motion.div. The
   wrapper animates `y` linearly from off-screen top to off-screen bottom
   and `rotate` a random amount over the fall. A small `x` keyframe sway
   adds a wind-drift feel. Each petal fades in at 10% of its fall and out
   at 90%. Positions, durations, delays, rotations, sizes, and colours are
   seeded from the index so server and client produce identical markup.
   ────────────────────────────────────────────────────────── */
function FallingPetals() {
  const petalConfigs = Array.from({ length: 10 }).map((_, i) => {
    const xStart = (i * 137) % 100; // 0–99 vw
    const duration = 9 + (i % 5); // 9–13s (slower, more graceful fall)
    const delay = (i * 0.55) % 6; // 0–6s staggered entry
    const rotateEnd = ((i % 5) - 2) * 120 + 90; // -150..+330 deg
    const size = 6 + (i % 4) * 2; // 6–12 (slightly smaller)
    const drift = ((i % 7) - 3) * 3; // -9..+9 vw
    const palette = [
      { fill: "#D4A84B", opacity: 0.7 }, // gold (toned down)
      { fill: "#F5E6C9", opacity: 0.62 }, // cream
      { fill: "#E8B7B7", opacity: 0.58 }, // soft pink
      { fill: "#EFCB8A", opacity: 0.66 },  // warm blush
    ];
    const color = palette[i % palette.length];
    return {
      key: i,
      xStart,
      xEnd: xStart + drift,
      duration,
      delay,
      rotateEnd,
      size,
      color,
    };
  });

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none z-[4] overflow-hidden"
    >
      {petalConfigs.map((p) => (
        <motion.div
          key={p.key}
          initial={{ y: "-10vh", x: `${p.xStart}vw`, rotate: 0, opacity: 0 }}
          animate={{
            y: "112vh",
            x: [`${p.xStart}vw`, `${(p.xStart + p.xEnd) / 2}vw`, `${p.xEnd}vw`],
            rotate: p.rotateEnd,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
            times: [0, 0.1, 0.9, 1],
          }}
          className="absolute top-0 left-0"
          style={{ willChange: "transform, opacity" }}
        >
          <svg
            viewBox="0 0 20 30"
            width={p.size}
            height={p.size * 1.5}
            style={{
              display: "block",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
            }}
          >
            <path
              d="M 10 2 C 16 8 16 22 10 28 C 4 22 4 8 10 2 Z"
              fill={p.color.fill}
              opacity={p.color.opacity}
            />
            {/* Soft inner vein */}
            <path
              d="M 10 6 L 10 24"
              stroke="#fff"
              strokeOpacity="0.2"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   CARD 4 — NAMES, stacked editorial layout

   Akash and Falguni are set on separate lines, each entering from
   its own side. Between them sits a luminous gold ampersand drawn
   in Fraunces italic — the boutique/magazine way of saying "and,"
   chosen over a literal heart because it reads as elegance rather
   than cliché.

   Composition, top to bottom:
     · kerned label "TOGETHER FOREVER"
     · Akash    (slides in from LEFT)
     · &        (gold Fraunces italic ampersand, reveals with scale+glow)
     · Falguni  (slides in from RIGHT)
     · Hairline gold sutra with center bindu
     · प्रेम · prema · love
   ────────────────────────────────────────────────────────── */
function NameCard({ fontFamily }: { fontFamily: string }) {
  const groom = couple.groom.firstName;
  const bride = couple.bride.firstName;
  const letterStagger = 0.035;

  const labelDelay = 0.05;
  const akashStart = 0.25;
  const akashDuration = 0.5;
  const akashEnd = akashStart + (groom.length - 1) * letterStagger + akashDuration;

  const ampStart = akashEnd + 0.05;
  const ampSettled = ampStart + 0.35;

  const falguniStart = ampSettled + 0.03;
  const falguniEnd = falguniStart + (bride.length - 1) * letterStagger + akashDuration;

  const sutraDelay = falguniEnd + 0.15;
  const sanskritDelay = sutraDelay + 0.45;

  return (
    <motion.div
      key="c4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.4 }}
      className="relative text-center"
    >
      {/* Subtle breathing gold aura — purely ambient */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.22, 0.16, 0.24, 0.18] }}
        transition={{
          duration: 5,
          delay: 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 65% 90% at 50% 50%, rgba(212,168,75,0.22), transparent 70%)",
          transform: "scale(1.4)",
        }}
      />

      {/* Kerned label */}
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: labelDelay }}
        className="relative text-gold/95"
        style={{
          fontFamily: "var(--font-sans), Inter, system-ui",
          fontSize: "clamp(10px, 1.1vw, 12px)",
          letterSpacing: "0.55em",
          textTransform: "uppercase",
          paddingLeft: "0.55em",
        }}
      >
        Together Forever
      </motion.p>

      {/* AKASH — stacked, slides from LEFT */}
      <div
        className="relative text-ash leading-[0.95] mt-7 md:mt-9 whitespace-nowrap"
        style={{
          fontFamily,
          fontSize: "clamp(2.75rem, 7.8vw, 5.5rem)",
          fontWeight: 400,
          letterSpacing: "0.045em",
          textTransform: "uppercase",
        }}
      >
        {[...groom].map((ch, i) => (
          <motion.span
            key={`g${i}`}
            initial={{ opacity: 0, x: -30, y: 6 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
              duration: akashDuration,
              delay: akashStart + i * letterStagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {ch}
          </motion.span>
        ))}
      </div>

      {/* Ornamental gold ampersand — Fraunces italic has a beautiful one */}
      <div className="relative my-3 md:my-4 flex items-center justify-center">
        {/* Radial glow beneath the ampersand */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.55, 0.4], scale: [0.5, 1.1, 1] }}
          transition={{
            duration: 1.2,
            delay: ampStart,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.6, 1],
          }}
          className="absolute"
          style={{
            width: "clamp(3rem, 8vw, 5.5rem)",
            height: "clamp(3rem, 8vw, 5.5rem)",
            background:
              "radial-gradient(circle, rgba(244,196,80,0.55), rgba(212,168,75,0.2) 45%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />

        <motion.span
          initial={{ opacity: 0, scale: 0.55, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.9,
            delay: ampStart,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative italic leading-none"
          style={{
            fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(3.25rem, 9vw, 6.5rem)",
            fontWeight: 300,
            color: "rgb(212, 168, 75)",
            textShadow:
              "0 0 18px rgba(244,196,80,0.45), 0 0 40px rgba(244,196,80,0.18)",
          }}
        >
          &amp;
        </motion.span>

        {/* Faint pulsing ring for life */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.35, 0], scale: [0.9, 1.4, 1.7] }}
          transition={{
            duration: 3.2,
            delay: ampStart + 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute rounded-full"
          style={{
            width: "clamp(2.5rem, 6vw, 4rem)",
            height: "clamp(2.5rem, 6vw, 4rem)",
            border: "1px solid rgba(244,196,80,0.4)",
          }}
        />
      </div>

      {/* FALGUNI — stacked below, slides from RIGHT */}
      <div
        className="relative text-ash leading-[0.95] whitespace-nowrap"
        style={{
          fontFamily,
          fontSize: "clamp(2.75rem, 7.8vw, 5.5rem)",
          fontWeight: 400,
          letterSpacing: "0.045em",
          textTransform: "uppercase",
        }}
      >
        {[...bride].map((ch, i) => (
          <motion.span
            key={`b${i}`}
            initial={{ opacity: 0, x: 30, y: 6 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
              duration: akashDuration,
              delay: falguniStart + i * letterStagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {ch}
          </motion.span>
        ))}
      </div>

      {/* Curvy gold sutra beneath the names */}
      <svg
        aria-hidden
        viewBox="0 0 300 20"
        className="relative mt-8 md:mt-10 mx-auto h-5 w-[min(280px,78%)] overflow-visible"
      >
        <motion.path
          d="M 8 10 Q 80 2 150 10 T 292 10"
          stroke="rgb(212, 168, 75)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{
            pathLength: {
              duration: 0.7,
              delay: sutraDelay,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: { duration: 0.3, delay: sutraDelay },
          }}
        />
        <motion.circle
          cx="150"
          cy="10"
          r="2.2"
          fill="rgb(212, 168, 75)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: sutraDelay + 0.55,
            duration: 0.4,
            type: "spring",
            damping: 11,
          }}
        />
      </svg>

      {/* Sanskrit emotional anchor */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sanskritDelay, duration: 0.5 }}
        className="relative mt-5 md:mt-6"
      >
        <p className="sanskrit text-gold text-xl md:text-2xl leading-none">
          प्रेम
        </p>
        <p
          className="mt-2 text-gold/80"
          style={{
            fontFamily: "var(--font-sans), Inter, system-ui",
            fontSize: "clamp(9px, 1vw, 10.5px)",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            paddingLeft: "0.5em",
          }}
        >
          Prema · Love
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   CARD 5 — DATE, editorial treatment
   Kerned label, day + month on one line with gold separator,
   thin hairline, then a large italic year drop-in.
   ────────────────────────────────────────────────────────── */
function DateCard({ fontFamily }: { fontFamily: string }) {
  const labelDelay = 0.05;
  const baseDelay = 0.3;
  const letterStagger = 0.03;

  const day = "23";
  const month = "January";
  const year = "2027";

  const rdDelay = baseDelay + day.length * letterStagger + 0.05;
  const separatorDelay = rdDelay + 0.15;
  const monthStartDelay = separatorDelay + 0.1;
  const hairlineDelay = monthStartDelay + month.length * letterStagger + 0.15;
  const yearStartDelay = hairlineDelay + 0.25;

  return (
    <motion.div
      key="c5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: labelDelay }}
        className="text-gold/95"
        style={{
          fontFamily: "var(--font-sans), Inter, system-ui",
          fontSize: "clamp(10px, 1.1vw, 12px)",
          letterSpacing: "0.55em",
          textTransform: "uppercase",
          paddingLeft: "0.55em",
        }}
      >
        Save The Date
      </motion.p>

      <div
        className="mt-6 md:mt-8 text-ash leading-none"
        style={{
          fontFamily,
          fontSize: "clamp(2rem, 5.5vw, 3.4rem)",
          fontWeight: 400,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {[...day].map((d, i) => (
          <motion.span
            key={`d${i}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: baseDelay + i * letterStagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {d}
          </motion.span>
        ))}
        <motion.sup
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: rdDelay }}
          className="inline-block text-gold ml-0.5 align-super"
          style={{
            fontSize: "0.42em",
            fontWeight: 400,
            fontFamily: "var(--font-sans), Inter, system-ui",
            letterSpacing: "0.1em",
            textTransform: "lowercase",
          }}
        >
          rd
        </motion.sup>
        <motion.span
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: separatorDelay, type: "spring", damping: 12 }}
          className="inline-block text-gold mx-3 md:mx-5"
          style={{ fontSize: "0.7em" }}
        >
          ·
        </motion.span>
        {[...month].map((ch, i) => (
          <motion.span
            key={`m${i}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: monthStartDelay + i * letterStagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {ch}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: hairlineDelay, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7 md:mt-9 mx-auto h-px w-32 md:w-40 bg-gold/70 origin-center"
      />

      <div
        className="mt-6 md:mt-8 text-gold leading-none"
        style={{
          fontFamily,
          fontSize: "clamp(3.25rem, 10vw, 6.5rem)",
          fontWeight: 400,
          letterSpacing: "0.03em",
        }}
      >
        {[...year].map((d, i) => (
          <motion.span
            key={`y${i}`}
            initial={{ opacity: 0, y: -45, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: yearStartDelay + i * 0.11,
              type: "spring",
              damping: 12,
              stiffness: 170,
            }}
            className="inline-block"
          >
            {d}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
