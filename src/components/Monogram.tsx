"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  className?: string;
  animate?: boolean;
  tone?: "ink" | "gold" | "bone" | "ash" | "wine" | "saffron" | "crimson" | "indigo";
  showDate?: boolean;
  showNames?: boolean;
};

const TONE_CLASS: Record<NonNullable<Props["tone"]>, string> = {
  ink: "text-ink",
  gold: "text-gold",
  bone: "text-bone",
  ash: "text-ash",
  wine: "text-wine",
  saffron: "text-saffron",
  crimson: "text-crimson",
  indigo: "text-indigo",
};

/**
 * Botanical-wreath wedding monogram — inspired by classical gold-foil
 * stationery crests.
 *
 * Layers (drawn in z-order):
 *   · wreath of alternating silver-dollar eucalyptus + rosebud sprigs,
 *     with gaps at 12 and 6 o'clock for the crown and heart ornaments
 *   · heraldic 3-peak crown with tiny heart above at 12 o'clock
 *   · "AF" cipher in Pinyon Script — formal copperplate with swash caps,
 *     sized so the F's top-right scroll stays inside the wreath
 *   · heart + ribbon tails at 6 o'clock
 *   · tracked-caps names + tiny sans date below
 *
 * `animate={true}` triggers the romantic entrance sequence:
 *   1. wreath sprigs bloom from the bottom upward with spring stagger
 *   2. crown drops in from above with a gentle bounce
 *   3. cipher fades + scales into focus
 *   4. heart bounces in and then pulses like a heartbeat — continuous
 *   5. names and date fade in last
 * Full sequence: ~2.9 s, then the heartbeat carries on.
 */
export function Monogram({
  size = 180,
  className,
  animate: animateProp = false,
  tone = "gold",
  showDate = true,
  showNames = true,
}: Props) {
  const CX = 160;
  const CY = 170;
  const R = 95;
  const anim = animateProp;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tailId = `afstar-tail-${uid}`;
  const glowId = `afstar-glow-${uid}`;

  // Shooting-star orbit: a parametric lemniscate (figure-8) that uses
  // the AF cipher's centre as its own centre. Left extreme = A, right
  // extreme = F. Parameter `t` sweeps π → 4π (1.5 cycles) so both loops
  // of the ∞ trace completely and the star lands on F. Animation runs
  // via requestAnimationFrame and writes directly to the SVG `transform`
  // attribute (user units). CSS transforms on SVG elements mix pixel
  // and viewBox units, which made an earlier motion-value implementation
  // unreliable — direct attribute writes avoid that.
  const starRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!anim) return;
    const el = starRef.current;
    if (!el) return;

    // Figure-8 sized + shifted so BOTH letters are fully enclosed.
    // Pinyon Script's F is visually heavier than the A because of its
    // top-right swash (which extends up-and-right past the F's advance
    // width). A symmetric lemniscate centred on the advance-width
    // midline (x=140) under-covers the F side, so:
    //   • LEM_CX shifted right by 5 to give the right loop more room
    //     without pulling the left loop off the A
    //   • LEM_A widened so the right extreme clears the swash tip
    //   • LEM_CY lifted + LEM_B grown so the upper peaks (at
    //     y ≈ LEM_CY − 0.354·LEM_B) reach up to the F-swash elevation
    const LEM_CX = 150;
    const LEM_CY = 168;
    const LEM_A = 65;
    const LEM_B = 120;

    // Timeline per cycle (ms):
    //   0 .. TRACE         → tracing infinity (A → F, 1.5 lemniscate cycles)
    //   TRACE .. +STAY     → held at F
    //   +STAY .. +FADE_OUT → fading out at F
    //   +FADE_OUT .. +GAP  → invisible, reset to A
    //   +GAP .. +FADE_IN   → fading in at A
    //   ... then repeat
    const INITIAL_FADE_DELAY_MS = 1800;
    const INITIAL_FADE_MS = 600;
    const MOTION_START_MS = 2400;
    const TRACE_MS = 5500;
    const STAY_MS = 700;
    const FADE_OUT_MS = 350;
    const GAP_MS = 250;
    const FADE_IN_MS = 350;
    const CYCLE_MS = TRACE_MS + STAY_MS + FADE_OUT_MS + GAP_MS + FADE_IN_MS;

    const sample = (tt: number): [number, number] => {
      const s = Math.sin(tt);
      const c = Math.cos(tt);
      const d = 1 + s * s;
      return [(LEM_A * c) / d, (LEM_B * s * c) / d];
    };

    el.style.opacity = "0";
    el.setAttribute("transform", "translate(85 168) rotate(90)");

    let startMs: number | null = null;
    let rafId = 0;

    const tick = (nowMs: number) => {
      if (startMs === null) startMs = nowMs;
      const sinceStart = nowMs - startMs;

      const initEl = sinceStart - INITIAL_FADE_DELAY_MS;
      const initialOpacity =
        initEl <= 0 ? 0 : initEl >= INITIAL_FADE_MS ? 1 : initEl / INITIAL_FADE_MS;

      const loopEl = sinceStart - MOTION_START_MS;
      let p = 0;
      let cycleOpacity = 1;
      if (loopEl > 0) {
        const cycleT = loopEl % CYCLE_MS;
        const stayEnd = TRACE_MS + STAY_MS;
        const fadeOutEnd = stayEnd + FADE_OUT_MS;
        const gapEnd = fadeOutEnd + GAP_MS;
        if (cycleT < TRACE_MS) {
          const raw = cycleT / TRACE_MS;
          p = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        } else if (cycleT < stayEnd) {
          p = 1;
        } else if (cycleT < fadeOutEnd) {
          p = 1;
          cycleOpacity = 1 - (cycleT - stayEnd) / FADE_OUT_MS;
        } else if (cycleT < gapEnd) {
          p = 0;
          cycleOpacity = 0;
        } else {
          p = 0;
          cycleOpacity = (cycleT - gapEnd) / FADE_IN_MS;
        }
      }

      const opacity = Math.max(0, Math.min(1, initialOpacity * cycleOpacity));
      el.style.opacity = opacity.toFixed(3);

      const t = Math.PI * (1 + 3 * p);
      const s = Math.sin(t);
      const c = Math.cos(t);
      const d = 1 + s * s;
      const x = LEM_CX + (LEM_A * c) / d;
      const y = LEM_CY + (LEM_B * s * c) / d;

      const eps = 0.001;
      const [x1, y1] = sample(t - eps);
      const [x2, y2] = sample(t + eps);
      const rot = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      el.setAttribute(
        "transform",
        `translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${rot.toFixed(3)})`,
      );

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [anim]);

  // Wreath positions. Skip within ±18° of 12 o'clock (for crown) and 6
  // o'clock (for heart). Compute a per-sprig bloomDelay so, when animated,
  // the wreath flowers outward from the bottom up both sides.
  type WreathSprig = {
    x: number; y: number; rot: number; type: number; key: number; bloomDelay: number;
  };
  const wreath: WreathSprig[] = [];
  for (let i = 0; i < 20; i++) {
    const deg = i * 18 - 90;
    const norm = ((deg % 360) + 360) % 360;
    const nearTop = norm >= 252 && norm <= 288; // 12 o'clock ± 18°
    const nearBottom = norm >= 72 && norm <= 108; // 6 o'clock ± 18°
    if (nearTop || nearBottom) continue;
    const rad = (deg * Math.PI) / 180;
    const x = Math.round((CX + R * Math.cos(rad)) * 100) / 100;
    const y = Math.round((CY + R * Math.sin(rad)) * 100) / 100;
    const rot = Math.round((deg + 90) * 100) / 100;
    // angular distance from 6 o'clock — closer sprigs bloom earlier
    let distFromBottom = Math.abs(deg - 90);
    if (distFromBottom > 180) distFromBottom = 360 - distFromBottom;
    const bloomDelay =
      Math.round((0.1 + (distFromBottom / 180) * 0.7) * 1000) / 1000;
    wreath.push({ x, y, rot, type: i % 4, key: i, bloomDelay });
  }

  return (
    <svg
      viewBox="0 0 320 340"
      width={size}
      height={(size * 340) / 320}
      preserveAspectRatio="xMidYMid meet"
      className={cn(
        "select-none drop-shadow-[0_2px_10px_rgba(212,168,75,0.2)]",
        TONE_CLASS[tone],
        className,
      )}
      role="img"
      aria-label="Akash and Falguni monogram"
    >
      {/* ─── Wreath sprigs — bloom from the bottom upward ─── */}
      {wreath.map((el) => (
        <g
          key={el.key}
          transform={`translate(${el.x}, ${el.y}) rotate(${el.rot})`}
        >
          <motion.g
            initial={anim ? { scale: 0, opacity: 0 } : false}
            animate={anim ? { scale: 1, opacity: 1 } : undefined}
            transition={
              anim
                ? {
                    delay: el.bloomDelay,
                    duration: 0.45,
                    type: "spring",
                    damping: 13,
                    stiffness: 210,
                  }
                : undefined
            }
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <Sprig type={el.type} />
          </motion.g>
        </g>
      ))}

      {/* ─── Crown ornament at 12 o'clock — drops in from above ─── */}
      <g transform={`translate(${CX}, 58)`}>
        <motion.g
          initial={anim ? { y: -50, opacity: 0 } : false}
          animate={anim ? { y: 0, opacity: 1 } : undefined}
          transition={
            anim
              ? {
                  delay: 0.9,
                  duration: 0.7,
                  type: "spring",
                  damping: 11,
                  stiffness: 180,
                }
              : undefined
          }
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <g fill="currentColor">
            <rect x="-11" y="0" width="22" height="3" rx="0.6" />
            <path d="M -11 0 L -9 -7 L -5 -3 L 0 -10 L 5 -3 L 9 -7 L 11 0 Z" />
            <circle cx="-9" cy="-8" r="1.2" />
            <circle cx="0" cy="-11" r="1.5" />
            <circle cx="9" cy="-8" r="1.2" />
          </g>
          <path
            d="M 0 -16 C -2.4 -19 -5 -17.5 -3 -14.5 C -1.5 -13 0 -12 0 -12 C 0 -12 1.5 -13 3 -14.5 C 5 -17.5 2.4 -19 0 -16 Z"
            fill="currentColor"
            opacity="0.9"
          />
        </motion.g>
      </g>

      {/* ─── AF cipher centrepiece.
             Pinyon Script at 94 px (shrunk from 108 so the F's top-right
             scroll sits cleanly inside the wreath's inner edge). Baseline
             at y=206 optically centres the ink within the wreath. ─── */}
      <motion.text
        x={CX - 20}
        y="206"
        textAnchor="middle"
        style={{
          fontFamily:
            "var(--font-cipher), 'Pinyon Script', 'Allura', 'Parisienne', cursive",
          fontSize: "94px",
          fontWeight: 400,
          letterSpacing: "-0.05em",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
        fill="currentColor"
        initial={anim ? { opacity: 0, scale: 0.82 } : false}
        animate={anim ? { opacity: 1, scale: 1 } : undefined}
        transition={
          anim
            ? {
                delay: 1.25,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }
            : undefined
        }
      >
        AF
      </motion.text>

      {/* ─── Heart + ribbon at 6 o'clock.
             Nested motion groups: the outer group handles the one-shot
             entrance (scale 0 → 1 with spring bounce); the inner group
             runs a continuous two-beat heartbeat (a big pump then a
             smaller follow-through, repeating forever). ─── */}
      <g transform={`translate(${CX}, 278)`}>
        <motion.g
          initial={anim ? { scale: 0, opacity: 0 } : false}
          animate={anim ? { scale: 1, opacity: 1 } : undefined}
          transition={
            anim
              ? {
                  delay: 1.4,
                  duration: 0.55,
                  type: "spring",
                  damping: 10,
                  stiffness: 190,
                }
              : undefined
          }
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <motion.g
            animate={anim ? { scale: [1, 1.18, 1, 1.1, 1] } : undefined}
            transition={
              anim
                ? {
                    duration: 1.2,
                    times: [0, 0.12, 0.28, 0.42, 0.58],
                    repeat: Infinity,
                    repeatDelay: 0.3,
                    delay: 2.1,
                    ease: "easeInOut",
                  }
                : undefined
            }
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <path
              d="M 0 3 C -6 -3 -11 -1 -8 4 C -5 8 -1 10 0 12 C 1 10 5 8 8 4 C 11 -1 6 -3 0 3 Z"
              fill="currentColor"
            />
            <g stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round">
              <path d="M -7 12 C -12 14 -17 15 -22 13 L -20 13.5 L -22 13 L -20 12" />
              <path d="M 7 12 C 12 14 17 15 22 13 L 20 13.5 L 22 13 L 20 12" />
            </g>
          </motion.g>
        </motion.g>
      </g>

      {/* ─── Names below wreath ─── */}
      {showNames && (
        <motion.g
          initial={anim ? { opacity: 0, y: 6 } : false}
          animate={anim ? { opacity: 1, y: 0 } : undefined}
          transition={anim ? { delay: 2.55, duration: 0.75 } : undefined}
        >
          <line
            x1="80"
            y1="305"
            x2="240"
            y2="305"
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.35"
          />
          <text
            x={CX}
            y="318"
            textAnchor="middle"
            style={{
              fontFamily:
                "var(--font-display), 'Italiana', 'Didot', 'Georgia', serif",
              fontSize: "11.5px",
              letterSpacing: "4.5px",
              fontWeight: 400,
              textTransform: "uppercase",
            }}
            fill="currentColor"
          >
            · AKASH &amp; FALGUNI ·
          </text>
        </motion.g>
      )}

      {/* ─── Date ─── */}
      {showDate && (
        <motion.text
          x={CX}
          y="333"
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: "7.5px",
            letterSpacing: "3.2px",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
          fill="currentColor"
          opacity={0.78}
          initial={anim ? { opacity: 0 } : false}
          animate={anim ? { opacity: 0.78 } : undefined}
          transition={anim ? { delay: 2.85, duration: 0.75 } : undefined}
        >
          23rd January 2027
        </motion.text>
      )}

      {/* ─── Shooting star tracing a figure-8 (infinity) through A & F ───
             Parametric lemniscate centered on the cipher. The star fades
             in at A, traces 1.5 full figure-8 cycles (so both loops draw
             completely), and freezes at F. Tail orients with motion
             direction via the per-frame rotation angle. ─── */}
      {anim && (
        <>
          <defs>
            <linearGradient
              id={tailId}
              x1="-60"
              y1="0"
              x2="0"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="45%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFF8E0" stopOpacity="1" />
            </linearGradient>
            <radialGradient
              id={glowId}
              cx="0"
              cy="0"
              r="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFF8E0" stopOpacity="0.55" />
              <stop offset="40%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g
            ref={starRef}
            transform="translate(85 168) rotate(90)"
            style={{ opacity: 0 }}
          >
            <path
              d="M -60 0 L 0 0"
              stroke={`url(#${tailId})`}
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M -34 0 L 0 0"
              stroke="#FFF8E0"
              strokeOpacity="0.55"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle r="16" fill={`url(#${glowId})`} />
            <path
              d="M 0 -9 L 2.2 -2.2 L 9 0 L 2.2 2.2 L 0 9 L -2.2 2.2 L -9 0 L -2.2 -2.2 Z"
              fill="currentColor"
            />
            <circle r="2.6" fill="#FFF8E0" />
            <circle r="1" fill="#FFFFFF" />
          </g>
        </>
      )}
    </svg>
  );
}

/**
 * Sprig — a small cluster of foliage oriented along the wreath tangent.
 * Per logo tutorial step 3 ("delicate sprigs of eucalyptus and rosebuds"),
 * the four variants alternate between eucalyptus (silver-dollar and
 * pointed-leaf) and rosebud forms so the wreath reads as that pairing.
 */
function Sprig({ type }: { type: number }) {
  if (type === 0) {
    // Silver-dollar eucalyptus — three pairs of round leaves on a thin stem
    return (
      <g>
        <line
          x1="-6"
          y1="0"
          x2="6"
          y2="0"
          stroke="currentColor"
          strokeWidth="0.45"
          opacity="0.85"
        />
        <g fill="currentColor">
          <ellipse cx="-4.5" cy="-1.9" rx="1.6" ry="2.2" opacity="0.92" />
          <ellipse cx="-4.5" cy="1.9" rx="1.6" ry="2.2" opacity="0.92" />
          <ellipse cx="0" cy="-2.4" rx="1.7" ry="2.5" opacity="0.95" />
          <ellipse cx="0" cy="2.4" rx="1.7" ry="2.5" opacity="0.95" />
          <ellipse cx="4.5" cy="-1.7" rx="1.4" ry="2" opacity="0.88" />
          <ellipse cx="4.5" cy="1.7" rx="1.4" ry="2" opacity="0.88" />
        </g>
      </g>
    );
  }
  if (type === 1) {
    // Rose bud — layered petals with a leaf tail
    return (
      <g fill="currentColor">
        <circle cx="0" cy="0" r="3" opacity="0.95" />
        <path
          d="M -2 -1 C -1 -2 1 -2 2 -1 C 1 0 -1 0 -2 -1 Z"
          fill="#fff"
          opacity="0.3"
        />
        <path
          d="M -1.6 0.3 C -0.5 -0.6 0.5 -0.6 1.6 0.3"
          stroke="#fff"
          strokeOpacity="0.3"
          strokeWidth="0.4"
          fill="none"
        />
        <path d="M -5 2 C -7 3 -8 2 -6 1 Z" opacity="0.7" />
      </g>
    );
  }
  if (type === 2) {
    // Eucalyptus spear — three narrow pointed leaves fanning out
    return (
      <g fill="currentColor">
        <path d="M -6 -2.5 C -2 -4 3 -3 6 -0.5 C 3 0.5 -2 -0.5 -6 -2.5 Z" opacity="0.9" />
        <path d="M -6 0 C -2 -1 4 -1 7 0 C 4 1 -2 1 -6 0 Z" opacity="0.92" />
        <path d="M -6 2.5 C -2 4 3 3 6 0.5 C 3 -0.5 -2 0.5 -6 2.5 Z" opacity="0.9" />
        <circle cx="-6.5" cy="0" r="0.9" opacity="0.85" />
      </g>
    );
  }
  // Open rosebud with small leaf pair — completes the rosebud variation
  return (
    <g fill="currentColor">
      <circle cx="0" cy="0" r="3.2" opacity="0.92" />
      <circle cx="-0.6" cy="-0.6" r="1.2" fill="#fff" opacity="0.35" />
      <path d="M -4 -1.8 C -6 -3 -7.5 -1.8 -5.2 -0.8 Z" opacity="0.8" />
      <path d="M -4 1.8 C -6 3 -7.5 1.8 -5.2 0.8 Z" opacity="0.8" />
    </g>
  );
}
