"use client";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import { couple } from "@/lib/couple";
import { Monogram } from "./Monogram";
import { useLanguage } from "./LanguageProvider";

type Diff = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isNow: boolean;
  hasPassed: boolean;
};

function computeDiff(target: Date): Diff {
  const raw = target.getTime() - Date.now();
  const hasPassed = raw < 0;
  const ms = Math.max(0, raw);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, isNow: ms === 0, hasPassed };
}

export function Countdown() {
  const [diff, setDiff] = useState<Diff | null>(null);

  useEffect(() => {
    const target = new Date(couple.weddingDate);
    let id: number | null = null;
    const tick = () => setDiff(computeDiff(target));
    const start = () => {
      if (id !== null) return;
      tick();
      id = window.setInterval(tick, 1000);
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (diff?.hasPassed) return <CountdownMarried />;
  return <CountdownActive diff={diff} />;
}

/* ──────────────────────────────────────────────────────────
   ACTIVE COUNTDOWN — coin scratch-card reveal
   The live D/H/M/S timer sits at the top. Below it, a foil
   panel covers the magic date. The user rubs/scratches the
   foil with their finger or cursor to gradually erase it
   and uncover the date underneath, like a real scratch card.
   When ~45% of the foil has been scratched away, the rest
   auto-fades and fireworks fire.
   ────────────────────────────────────────────────────────── */
function CountdownActive({ diff }: { diff: Diff | null }) {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";

  const cells: [string, number | null][] = [
    [t("countdown.days"), diff?.days ?? null],
    [t("countdown.hours"), diff?.hours ?? null],
    [t("countdown.minutes"), diff?.minutes ?? null],
    [t("countdown.seconds"), diff?.seconds ?? null],
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isScratchingRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  // Live pointer position relative to the panel so we can render a
  // soft gold glow that follows the user's finger / cursor while
  // they're scratching.
  const [glow, setGlow] = useState<{ x: number; y: number } | null>(null);
  // Whether the page should currently be scroll-locked. Goes true
  // once the card centres in the viewport, false once it's revealed.
  // Whether the scratch card is on screen — drives only the gentle
  // "scratch me" vibration. (The auto-tour pause for this card was
  // removed; the tour now glides past without stopping.)
  const cardInView = useInView(panelRef, { amount: 0.6 });

  // ── Foil renderer ────────────────────────────────────────
  // Fills the canvas with a brushed-gold gradient + a noise
  // dust + the call-to-action text. Re-runs on resize so the
  // foil stays crisp at any breakpoint.
  const drawFoil = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Brushed-gold base — diagonal gradient with three stops
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "#EFD18C");
    grad.addColorStop(0.45, "#D4A84B");
    grad.addColorStop(1, "#A87A26");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Speckled foil texture — tiny cream + ink dots so the surface
    // doesn't read as flat plastic. Seed-stable per render.
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = Math.random() * 1.2;
      ctx.fillStyle =
        Math.random() > 0.5
          ? `rgba(255,245,210,${Math.random() * 0.18})`
          : `rgba(60,40,10,${Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Diagonal sheen band — subtle highlight slash for "polished" feel
    const sheen = ctx.createLinearGradient(
      rect.width * 0.2,
      0,
      rect.width * 0.8,
      rect.height,
    );
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.18)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Decorative inner border so the panel still reads as framed
    ctx.strokeStyle = "rgba(60,40,10,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, rect.width - 16, rect.height - 16);

    // Call-to-action label
    ctx.fillStyle = "rgba(40,25,8,0.85)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const titleSize = Math.max(22, Math.min(38, rect.width * 0.05));
    ctx.font = `italic 600 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText(
      "Scratch to reveal the date",
      rect.width / 2,
      rect.height / 2 - 6,
    );

    // Sub-kerning hint
    ctx.font = `500 11px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = "rgba(40,25,8,0.55)";
    // Manual letter-spacing — split chars with a space so the hint
    // reads as wide-tracked editorial caps even on browsers without
    // ctx.letterSpacing support.
    const hint = "STRETCH TO REVEAL".split("").join(" ");
    ctx.fillText(hint, rect.width / 2, rect.height / 2 + titleSize * 0.7);
  };

  // ── Mount: paint the foil + observe resizes ──────────────
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFoil(canvas);
    const ro = new ResizeObserver(() => drawFoil(canvas));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [reduced]);

  // ── Scratch logic ────────────────────────────────────────
  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    const last = lastPointRef.current;

    if (last) {
      // Draw a thick line from last point to current — the brush stroke
      ctx.beginPath();
      ctx.lineWidth = 46;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // First touch: round dab
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPointRef.current = { x, y };
  };

  // ── Celebration / fireworks ──────────────────────────────
  const celebrate = () => {
    if (typeof window === "undefined") return;
    if (reduced) return;
    const palette = ["#D4A84B", "#F5E6C9", "#E85A2F", "#F39C5B", "#E4D4A8"];
    confetti({
      particleCount: 130,
      spread: 110,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.62 },
      colors: palette,
      shapes: ["circle", "star"],
      scalar: 1.15,
      ticks: 220,
      zIndex: 100,
    });
    window.setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 55,
        angle: 65,
        origin: { x: 0.18, y: 0.7 },
        colors: palette,
        shapes: ["star"],
        scalar: 0.95,
        ticks: 200,
        zIndex: 100,
      });
    }, 180);
    window.setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 55,
        angle: 115,
        origin: { x: 0.82, y: 0.7 },
        colors: palette,
        shapes: ["star"],
        scalar: 0.95,
        ticks: 200,
        zIndex: 100,
      });
    }, 360);
    const driftStart = Date.now();
    const drift = window.setInterval(() => {
      if (Date.now() - driftStart > 2200) {
        window.clearInterval(drift);
        return;
      }
      confetti({
        particleCount: 18,
        spread: 90,
        startVelocity: 28,
        origin: {
          x: Math.random() * 0.7 + 0.15,
          y: Math.random() * 0.25 + 0.5,
        },
        colors: ["#D4A84B", "#F5E6C9"],
        shapes: ["circle"],
        scalar: 0.6,
        ticks: 160,
        gravity: 0.7,
        zIndex: 100,
      });
    }, 230);
  };

  const finishReveal = () => {
    if (revealed) return;
    setRevealed(true);
    celebrate();
  };

  // ── Pointer handlers ─────────────────────────────────────
  const updateGlow = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isScratchingRef.current = true;
    if (!hasStarted) setHasStarted(true);
    updateGlow(e);
    scratchAt(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    if (!isScratchingRef.current) return;
    updateGlow(e);
    scratchAt(e.clientX, e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasScratching = isScratchingRef.current;
    isScratchingRef.current = false;
    lastPointRef.current = null;
    setGlow(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer might already be released */
    }
    // A single completed stroke (down → maybe move → up) triggers
    // the reveal. The earlier 42%-cleared threshold meant the user
    // had to keep rubbing for ages; now any deliberate stretch of
    // the foil is enough.
    if (wasScratching) finishReveal();
  };

  // Reset to redraw the foil so the user can scratch again
  const cover = () => {
    setRevealed(false);
    setHasStarted(false);
    lastPointRef.current = null;
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas) drawFoil(canvas);
    });
  };

  // Tap-to-reveal fallback (keyboard + reduced-motion)
  const revealNow = () => {
    finishReveal();
  };

  // (Auto-tour pause for the scratch card was removed per request — the
  // tour now glides past without stopping here. The card still vibrates
  // gently while on screen via `cardInView` to invite a scratch.)

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-24 px-6 text-center overflow-hidden bg-sepia"
    >
      {/* Diya glow backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-gold/15 blur-3xl animate-shimmer" />
      </div>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`relative text-[11px] text-ink/55 ${kerningClass}`}
      >
        {t("countdown.eyebrow")}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        className={`relative mt-3 text-3xl sm:text-4xl md:text-5xl text-ink ${displayClass}`}
      >
        {t("countdown.heading_lead")}{" "}
        <span className="text-wine">{t("countdown.heading_highlight")}</span>
      </motion.h2>

      {/* Compact live timer — sits above the scratch card so the
          countdown remains visible while the date is hidden. */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative mt-8 md:mt-10 max-w-3xl mx-auto"
      >
        <TimerGrid cells={cells} kerningClass={kerningClass} />
      </motion.div>

      {/* Scratch panel — magic date underneath, foil canvas on top.
          Wrapped in a motion.div that gently vibrates while the card is
          on screen so it "asks" for attention without flailing.
          Vibration stops the moment the user begins scratching, and
          again on reveal. */}
      <motion.div
        ref={panelRef}
        animate={
          !revealed && !hasStarted && cardInView
            ? { x: [0, -3, 3, -2, 2, 0] }
            : { x: 0 }
        }
        transition={
          !revealed && !hasStarted && cardInView
            ? {
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 1.6,
                ease: "easeInOut",
              }
            : { duration: 0.4, ease: "easeOut" }
        }
        className="relative mt-7 md:mt-10 max-w-xl mx-auto h-[170px] sm:h-[185px] md:h-[200px] select-none"
      >
        {/* Soft framed border — the panel reads as a framed card */}
        <div className="absolute inset-0 border border-gold/30 rounded-sm pointer-events-none">
          <span aria-hidden className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold" />
          <span aria-hidden className="absolute -top-px -right-px w-3 h-3 border-t border-r border-gold" />
          <span aria-hidden className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-gold" />
          <span aria-hidden className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold" />
        </div>

        {/* Magic date — always rendered underneath the foil */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <MagicDate
            displayClass={displayClass}
            kerningClass={kerningClass}
            serifItalicClass={serifItalicClass}
          />
        </div>

        {/* Celebration overlays — mount only while revealed */}
        <AnimatePresence>
          {revealed && !reduced && (
            <>
              <Shockwave key="shockwave" />
              <Starburst key="starburst" />
            </>
          )}
        </AnimatePresence>

        {/* Foil canvas — disappears when revealed */}
        {!reduced && (
          <motion.canvas
            ref={canvasRef}
            initial={false}
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ touchAction: "none" }}
            className={`absolute inset-0 w-full h-full ${
              revealed ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        )}

        {/* Soft gold glow that follows the user's pointer while
            scratching — gives the rub gesture tactile feedback
            without hiding the foil. Pointer-events disabled so it
            never blocks the canvas. */}
        {!reduced && glow && !revealed && (
          <motion.div
            aria-hidden
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: glow.x,
              top: glow.y,
              width: 90,
              height: 90,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,235,180,0.55) 0%, rgba(244,196,80,0.25) 45%, rgba(244,196,80,0) 75%)",
              filter: "blur(2px)",
              mixBlendMode: "screen",
            }}
          />
        )}
      </motion.div>

      {/* Hint / control row — kept generously separated from the
          revealed magic date so the "Saturday — the day we begin"
          tagline doesn't crowd the "↻ Hide the date" button. */}
      <div className="relative mt-10 md:mt-12 flex items-center justify-center gap-4 min-h-[1.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          {!revealed ? (
            <motion.button
              key="hint"
              type="button"
              onClick={revealNow}
              initial={{ opacity: 0 }}
              animate={{ opacity: hasStarted ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`text-[10px] md:text-[11px] text-ink/55 hover:text-gold transition-colors ${kerningClass}`}
            >
              {t("countdown.cta_drag")}
            </motion.button>
          ) : (
            <motion.button
              key="reset"
              type="button"
              onClick={cover}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`text-[10px] md:text-[11px] text-ink/55 hover:text-gold transition-colors ${kerningClass}`}
            >
              ↻ {t("countdown.cta_hide")}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {diff?.isNow && (
        <p className={`relative mt-8 text-xl text-wine ${serifItalicClass}`}>
          {t("countdown.happening")}
        </p>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   TimerGrid — the live D/H/M/S ticker.
   ────────────────────────────────────────────────────────── */
function TimerGrid({
  cells,
  kerningClass,
}: {
  cells: [string, number | null][];
  kerningClass: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-8 w-full">
      {cells.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-gold/20 rounded-full" />
            <div
              suppressHydrationWarning
              className="relative font-display text-4xl sm:text-5xl md:text-7xl text-ink tabular-nums bg-gradient-to-b from-wine to-ink bg-clip-text [-webkit-background-clip:text] text-transparent min-w-[1.5ch] inline-block"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={value ?? "placeholder"}
                  initial={{ y: -20, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: 20, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {value === null ? "--" : String(value).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className={`mt-3 md:mt-4 text-[9px] md:text-[10px] text-ink/55 ${kerningClass}`}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MagicDate — the editorial reveal underneath the ticker.
   ────────────────────────────────────────────────────────── */
function MagicDate({
  displayClass,
  kerningClass,
  serifItalicClass,
}: {
  displayClass: string;
  kerningClass: string;
  serifItalicClass: string;
}) {
  return (
    <div className="text-center relative">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full bg-gold/15 blur-3xl pointer-events-none"
      />
      <p className={`relative text-[9px] md:text-[10px] text-indigo/55 ${kerningClass}`}>
        Save the day
      </p>
      {/* Compact date layout — sized to fit the smaller panel
          (170–200px) without spilling into the "Hide the date"
          control below. The accents (ordinal, separators, year)
          use text-wine (deep indigo) so the date stays readable on
          the cream sepia panel in light mode while still feeling
          editorial — gold-on-cream was washing out at ~2:1
          contrast which made the year hard to see. */}
      <p
        className={`relative mt-2 md:mt-2.5 text-ink leading-[0.95] ${displayClass}`}
        style={{ fontSize: "clamp(1.85rem, 6vw, 3.25rem)" }}
      >
        23<sup className="text-wine font-sans not-italic" style={{ fontSize: "0.42em" }}>
          rd
        </sup>
        <span className="text-wine mx-2 md:mx-3">·</span>
        January
        <span className="text-wine mx-2 md:mx-3">·</span>
        <span className="text-wine">2027</span>
      </p>
      <div className="hairline mt-3 md:mt-4 mx-auto max-w-[100px] text-indigo/40" />
      <p
        className={`relative mt-2.5 md:mt-3 text-ink/65 italic ${serifItalicClass}`}
        style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)" }}
      >
        Saturday — the day we begin
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SHOCKWAVE — gold radial burst centred on the panel that
   expands and fades when the date is revealed. Pseudo-3D feel
   from a bright gold core surrounded by a softer halo, both
   scaling outward but at slightly different rates so the
   composite "ripples" instead of moving as one block.
   ────────────────────────────────────────────────────────── */
function Shockwave() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5]"
    >
      {/* Bright core — short, sharp burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0.85 }}
        animate={{ scale: 5, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-24 h-24 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,235,180,0.9) 0%, rgba(244,196,80,0.45) 50%, rgba(244,196,80,0) 75%)",
          filter: "blur(4px)",
        }}
      />
      {/* Softer halo — slower, longer ripple */}
      <motion.div
        initial={{ scale: 0, opacity: 0.4 }}
        animate={{ scale: 8, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-32 h-32 rounded-full bg-gold/40 blur-2xl"
      />
      {/* Inner ring outline — adds depth so it reads as 3D */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: 4.5, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-32 h-32 rounded-full border-2 border-gold"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   STARBURST — radial array of gold rays that draw outward
   from the centre, plus a ring of small sparkle dots that
   pop into place at the tip of each ray. The two layers use
   different stagger timings + counter-rotation, giving a
   parallax feel that reads as 3D depth.
   ────────────────────────────────────────────────────────── */
function Starburst() {
  const RAY_COUNT = 18;
  const SPARKLE_COUNT = 9;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5]"
    >
      {/* Outer rotating rays — long, draw from centre out */}
      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute w-[420px] h-[420px] md:w-[560px] md:h-[560px]"
        initial={{ rotate: 0 }}
        animate={{ rotate: 12 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
      >
        {Array.from({ length: RAY_COUNT }).map((_, i) => {
          const angle = (i / RAY_COUNT) * 360;
          const long = i % 2 === 0;
          const length = long ? 86 : 64;
          return (
            <motion.line
              key={i}
              x1={0}
              y1={0}
              x2={length}
              y2={0}
              stroke="#D4A84B"
              strokeWidth={long ? 1.4 : 0.9}
              strokeLinecap="round"
              transform={`rotate(${angle})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.85, 0] }}
              transition={{
                duration: 1.6,
                delay: 0.05 + (i * 0.018),
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </motion.svg>

      {/* Inner counter-rotating sparkle ring */}
      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px]"
        initial={{ rotate: 0 }}
        animate={{ rotate: -22 }}
        transition={{ duration: 2.6, ease: "easeOut" }}
      >
        {Array.from({ length: SPARKLE_COUNT }).map((_, i) => {
          const angle = (i / SPARKLE_COUNT) * 360;
          const r = 70;
          const x = Math.cos((angle * Math.PI) / 180) * r;
          const y = Math.sin((angle * Math.PI) / 180) * r;
          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.4,
                delay: 0.25 + i * 0.06,
                ease: "easeOut",
              }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              {/* 4-point star shape */}
              <path
                d={`M ${x} ${y - 4} L ${x + 1.2} ${y} L ${x} ${y + 4} L ${x - 1.2} ${y} Z`}
                fill="#F5E6C9"
              />
              <path
                d={`M ${x - 4} ${y} L ${x} ${y + 1.2} L ${x + 4} ${y} L ${x} ${y - 1.2} Z`}
                fill="#F5E6C9"
              />
              <circle cx={x} cy={y} r={1.1} fill="#fff" opacity="0.9" />
            </motion.g>
          );
        })}
      </motion.svg>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   COUNTDOWN MARRIED — unchanged celebration card.
   ────────────────────────────────────────────────────────── */
function CountdownMarried() {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";

  return (
    <section className="relative py-32 px-6 text-center overflow-hidden bg-sepia">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-gold/20 blur-3xl"
        />
      </div>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`relative text-[11px] text-gold ${kerningClass}`}
      >
        {t("countdown.married.eyebrow")}
      </motion.span>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-6 flex justify-center"
      >
        <Monogram size={112} tone="gold" className="text-gold" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`relative mt-8 text-4xl md:text-6xl text-ink ${displayClass}`}
      >
        {t("countdown.married.heading")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className={`relative mt-5 text-lg md:text-xl text-ink/75 ${serifItalicClass}`}
      >
        {t("countdown.married.body")}
      </motion.p>

      <div className="hairline my-8 max-w-[80px] mx-auto opacity-50" />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.6 }}
        className={`relative text-sm md:text-base text-ink/60 ${serifItalicClass}`}
      >
        {t("countdown.married.thanks")}
      </motion.p>
    </section>
  );
}
