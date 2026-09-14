"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { couple } from "@/lib/couple";
import { Monogram } from "./Monogram";

/**
 * EnvelopeGate — plays after CinematicIntro on every full homepage load.
 *
 * Phase machine:
 *   · hidden   → not mounted
 *   · bridge   → brief "an invitation arrives" slide (~1.4s) between the
 *                intro's exit and the envelope reveal. The AF Monogram
 *                appears alone on the cosmic backdrop so it is already
 *                familiar in the viewer's eye when it reappears pressed
 *                into the wax seal a moment later — continuity, not a cut.
 *   · envelope → the full envelope + kadai frame + AF wax seal
 *
 * Lifecycle:
 *   · Listens for the `fa-intro-complete` event CinematicIntro dispatches
 *     when it finishes (timer or skip). A 19s fallback timer sits beyond
 *     the intro's 17.3s runtime as a safety net — firing earlier would
 *     mount the envelope invisibly behind the z-100 intro overlay.
 *   · No `hasRun` ref — that pattern blocks React StrictMode's second
 *     effect run in dev and leaves the envelope invisible. Cleanup
 *     already handles timer / listener teardown correctly.
 *   · Only runs on "/" — a direct visit to /ring-ceremony isn't gated.
 *
 * Interaction:
 *   · Tap seal → wax breaks → gold ring ripple → flap opens → the gate
 *     auto-advances into the site (~2s later, after the full opening
 *     animation completes), fading the overlay and dispatching
 *     `fa-tour-start`. No second "Enter the invitation" tap is required
 *     (client wanted the seal to open directly). The tap also plays a
 *     short synthesized chime for interactive feedback (the intro music
 *     itself plays during the film, not here).
 *   · Enter directly → overlay dismisses, no tour. Button is held back
 *     3.5s so the envelope's entrance lands before the escape hatch is
 *     visible; serif-italic rather than utility-style "skip" since this
 *     is a wedding, not a product onboarding.
 *
 * Theme: cosmic Shiva — deep indigo base, saffron sacred-fire halo from
 * the top, crescent-blue cool glow from the bottom, gold dust drifting,
 * wax seal wearing the full AF Monogram (wreath + crown + cipher + heart).
 */

type Phase = "hidden" | "bridge" | "envelope";

/**
 * Rotating CTA quotes — cycle every 5s while the envelope is on screen.
 * Each line references either the shake (visible cue) or the tap
 * (required interaction) so any one of them teaches the gesture. Kept
 * short enough to never wrap past the reserved two-line slot.
 */
const QUOTES = [
  "The seal is stirring — a gentle tap opens it.",
  "Ten years pressed into wax. Tap the seal to break it.",
  "This letter has waited a long time. Tap the seal.",
  "Some letters tremble to reach you. This is one.",
];

export function EnvelopeGate() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  // Defensive guard: once the sequence has started, it should never
  // re-start — even if an extra `fa-intro-complete` event sneaks
  // through. Without this, any stray dispatch (stuck timer, dev
  // hot-reload, etc.) would resurrect the envelope after the user
  // has already opened it or dismissed it.
  const startedRef = useRef(false);
  const envelopeTimerRef = useRef<number | null>(null);
  // Holds the auto-advance timer scheduled when the seal is tapped, and
  // a one-shot guard so `enterSite` can't run twice (timer + a stray tap).
  const enterTimerRef = useRef<number | null>(null);
  const enteredRef = useRef(false);
  // A short synthesized "chime" plays on the seal tap for tactile,
  // interactive feedback as the wax breaks. Generated via Web Audio
  // inside the tap gesture, so it always plays — and needs no asset.
  // (The intro *music* plays during the film, not here.)
  const sealAudioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;

    let fallbackTimer: number | null = null;

    const startSequence = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      // Fire phase="bridge" immediately so the dark cosmic overlay
      // covers the homepage at the same moment the intro begins
      // fading. Any delay here leaves the homepage visible through
      // the still-fading intro — a jarring flash of site content.
      setPhase("bridge");
      envelopeTimerRef.current = window.setTimeout(
        () => setPhase("envelope"),
        900,
      );
    };

    const onIntroDone = () => {
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      startSequence();
    };

    window.addEventListener("fa-intro-complete", onIntroDone);
    // Fallback timer sits beyond the intro's 18s runtime as a safety
    // net — firing earlier would mount the envelope invisibly behind
    // the z-100 intro overlay.
    fallbackTimer = window.setTimeout(startSequence, 23000);

    return () => {
      window.removeEventListener("fa-intro-complete", onIntroDone);
      if (envelopeTimerRef.current !== null) {
        window.clearTimeout(envelopeTimerRef.current);
      }
      if (enterTimerRef.current !== null) {
        window.clearTimeout(enterTimerRef.current);
      }
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    };
  }, []);

  // Cycle the CTA quotes only while the envelope phase is live
  // AND the tab is visible — so the interval doesn't keep firing
  // in a background tab.
  useEffect(() => {
    if (phase !== "envelope") return;
    let id: number | null = null;
    const start = () => {
      if (id !== null) return;
      id = window.setInterval(() => {
        setQIdx((q) => (q + 1) % QUOTES.length);
      }, 5000);
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
  }, [phase]);

  const clearPendingTransitions = () => {
    // Cancel any pending bridge→envelope transition so it can't
    // bring the envelope back after the user has already opened
    // or dismissed it.
    if (envelopeTimerRef.current !== null) {
      window.clearTimeout(envelopeTimerRef.current);
      envelopeTimerRef.current = null;
    }
  };

  // Short gold "chime" on the seal tap — tactile feedback as the wax
  // breaks. Two soft sine bells (a root + the perfect fifth above) with
  // a quick attack and a gentle bell decay. Synthesized via Web Audio,
  // created inside the tap gesture so the browser always lets it play.
  const playSealSound = () => {
    try {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      sealAudioCtxRef.current = ctx;
      const now = ctx.currentTime;
      const notes: { freq: number; delay: number; dur: number }[] = [
        { freq: 880, delay: 0, dur: 0.6 }, // A5
        { freq: 1318.5, delay: 0.07, dur: 0.7 }, // E6 (perfect fifth)
      ];
      for (const { freq, delay, dur } of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t0 = now + delay;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.28, t0 + 0.012); // quick attack
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // bell decay
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
      }
      // Free the context once the chime has rung out.
      window.setTimeout(() => {
        ctx.close().catch(() => {});
        if (sealAudioCtxRef.current === ctx) sealAudioCtxRef.current = null;
      }, 1000);
    } catch {
      /* Web Audio unavailable — silently skip the chime */
    }
  };

  const stopSealSound = () => {
    if (sealAudioCtxRef.current) {
      sealAudioCtxRef.current.close().catch(() => {});
      sealAudioCtxRef.current = null;
    }
  };

  const open = () => {
    // Tapping the seal breaks the wax and opens the flap, then the gate
    // proceeds into the site on its own — no second "Enter the
    // invitation" tap required (client request). A repeat tap during the
    // brief opening flourish just enters immediately.
    if (opened) {
      enterSite();
      return;
    }
    setOpened(true);
    clearPendingTransitions();
    // Seal tap → play the interactive chime as the wax breaks.
    playSealSound();
    // Auto-advance into the site only after the FULL seal-break +
    // flap-open + card-rise animation has played (~2 s, card settles
    // at ~1.8 s) so it never looks cut off — then it "opens directly"
    // with no second tap.
    enterTimerRef.current = window.setTimeout(enterSite, 2000);
  };

  const enterSite = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    setPhase("hidden");
    // Fade the pre-paint splash so the Hero beneath becomes visible
    // as the envelope completes its exit fade.
    document.body.classList.add("fa-ready");
    window.setTimeout(() => {
      window.dispatchEvent(new Event("fa-tour-start"));
    }, 900);
  };

  const skip = () => {
    if (opened) return;
    clearPendingTransitions();
    document.body.classList.add("fa-ready");
    setPhase("hidden");
  };

  // Tear down the seal-chime audio context if the gate unmounts.
  useEffect(() => {
    return () => stopSealSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <motion.div
          key="envelope-gate"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
          className="fixed inset-0 z-[95] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0F0A22 0%, #1B1535 50%, #0A0B20 100%)",
          }}
        >
          {/* Sacred fire — Agni halo from the top (persists across phases) */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(900px 500px at 50% -5%, rgba(232,90,47,0.2), transparent 55%)",
            }}
          />
          {/* Neelkanth deep-blue cosmic glow from the bottom (persists) */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(700px 400px at 50% 105%, rgba(27,58,92,0.7), transparent 65%)",
            }}
          />

          <GoldDust />

          {/* Phase-switched content. mode="wait" ensures the bridge
              fully exits before the envelope enters — no ghosting,
              no overlapping monograms in the middle of the screen. */}
          <AnimatePresence mode="wait">
            {phase === "bridge" && <BridgeSlide key="bridge" />}

            {phase === "envelope" && (
              <motion.div
                key="envelope"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {/* Main column */}
                <div className="relative h-full flex flex-col items-center justify-center px-6 py-10 md:py-16 gap-5 md:gap-8">
                  <AnimatePresence>
                    {!opened && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        className="w-full max-w-[420px]"
                      >
                        <FloralCrown />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {!opened && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        transition={{ duration: 0.9 }}
                        className="text-center"
                      >
                        <HandwrittenNames />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={open}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    initial={{ scale: 0.85, y: 60, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: opened ? 1 : 1.015 }}
                    className="relative w-[min(92vw,540px)] aspect-[1.55/1] cursor-pointer group"
                    style={{ perspective: "1400px" }}
                    aria-label="Tap the seal to open the invitation"
                    data-cursor="hover"
                  >
                    {/* Envelope body */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FAEFD4] via-[#F3E5BC] to-[#E6D5A0] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-60 mix-blend-overlay"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
                        }}
                      />
                      <div className="absolute inset-[14px] border border-[rgba(172,130,58,0.45)]" />
                      <div className="absolute inset-[18px] border border-[rgba(172,130,58,0.2)]" />

                      {/* Kadai / zardozi ethnic embroidery frame */}
                      <KadaiBorder />

                      <svg
                        viewBox="0 0 100 66"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <path d="M 0 0 L 50 44 L 100 0" fill="none" stroke="rgba(27,27,58,0.1)" strokeWidth="0.2" />
                        <path d="M 0 66 L 50 44 L 100 66" fill="none" stroke="rgba(27,27,58,0.12)" strokeWidth="0.2" />
                      </svg>

                      <CornerFlourish position="tl" />
                      <CornerFlourish position="tr" />
                      <CornerFlourish position="bl" />
                      <CornerFlourish position="br" />

                      {/* Handwritten address — visible on the front of
                          the envelope when closed. Now sits at 82%
                          so the centred wax seal (50%) doesn't crowd
                          it. Fades out the moment the envelope is
                          tapped so the inner card becomes the focus. */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: opened ? 0 : 1 }}
                        transition={{
                          delay: opened ? 0 : 1.6,
                          duration: opened ? 0.35 : 0.7,
                        }}
                        className="absolute left-0 right-0 text-center px-10 pointer-events-none"
                        style={{ top: "82%" }}
                      >
                        <p className="font-script text-indigo/80 text-[1.4rem] sm:text-2xl md:text-3xl leading-none">
                          To our dearest guest
                        </p>
                        <div className="hairline mt-2.5 mb-2.5 md:mt-3 md:mb-3 max-w-[44px] mx-auto text-indigo/40" />
                        <p className="kerning text-[8px] md:text-[9px] text-indigo/60">
                          23 · 01 · 2027
                        </p>
                      </motion.div>

                      {/* Inner card — slides out on click */}
                      <motion.div
                        initial={{ y: 14, scale: 0.94, opacity: 0 }}
                        animate={{
                          y: opened ? -42 : 14,
                          scale: opened ? 1.04 : 0.94,
                          opacity: opened ? 1 : 0,
                        }}
                        transition={{
                          duration: opened ? 1.2 : 0,
                          delay: opened ? 0.6 : 0,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute inset-7 bg-cream border border-gold/45 shadow-[0_18px_40px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-4 md:p-6 text-center"
                      >
                        {/* Ganesh invocation — the traditional opener
                            of any Indian wedding invitation. The
                            emblem is sourced from the Gemini reference
                            (gold-foil Ganesh on cream), background-
                            removed via colour extraction so only the
                            gold silhouette remains on transparent.
                            The Sanskrit below is the mantric bija form
                            (Om Gaṃ Ganapataye Namaḥ) — the version
                            usually paired with this class of
                            ornamental Ganesh emblem. */}
                        <Image
                          src="/images/ganesh.png"
                          alt="Shri Ganesha"
                          width={72}
                          height={72}
                          className="mx-auto mb-1 md:mb-1.5"
                          priority
                        />
                        <p className="sanskrit text-base md:text-xl text-gold leading-none">
                          ॐ गं गणपतये नमः
                        </p>

                        <div className="hairline my-3 md:my-4 max-w-[70px] mx-auto text-indigo/40" />

                        <p className="kerning text-[9px] text-indigo/55">You are invited</p>
                        <p className="mt-2 md:mt-3 font-display italic text-xl sm:text-2xl md:text-3xl text-ink leading-tight">
                          {couple.groom.firstName}
                          <span className="text-gold not-italic mx-1.5">&amp;</span>
                          {couple.bride.firstName}
                        </p>
                        <p className="mt-2 md:mt-3 kerning text-[9px] text-gold">23 · 01 · 2027</p>
                      </motion.div>
                    </div>

                    {/* Top flap */}
                    <motion.svg
                      viewBox="0 0 100 50"
                      preserveAspectRatio="none"
                      initial={{ rotateX: 0 }}
                      animate={{ rotateX: opened ? -172 : 0, y: opened ? -6 : 0 }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        transformOrigin: "50% 0%",
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                      }}
                      className="absolute top-0 left-0 right-0 w-full aspect-[2/1] pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                    >
                      <defs>
                        <linearGradient id="envflap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FAEFD4" />
                          <stop offset="100%" stopColor="#D7C486" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 0 L 100 0 L 50 50 Z" fill="url(#envflap)" stroke="rgba(172,130,58,0.55)" strokeWidth="0.3" />
                      <path d="M 0 0 L 50 50 L 100 0" fill="none" stroke="rgba(27,27,58,0.18)" strokeWidth="0.5" />
                    </motion.svg>

                    {/* Centered seal layers — wrapping each in an
                        inset-0 flex-center container guarantees the
                        wax seal sits at the geometric centre of the
                        envelope regardless of the seal's own
                        bounding-box (the wax drips push the box
                        slightly off-square so a transform-based
                        centering was nudging the seal a few pixels
                        below the true centre). */}

                    {/* Click ripple */}
                    <AnimatePresence>
                      {opened && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <motion.div
                            key="ripple"
                            initial={{ scale: 0, opacity: 0.9 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{ duration: 1.1, ease: "easeOut" }}
                            className="w-28 h-28 rounded-full border-2 border-gold"
                          />
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Seal halo */}
                    {!opened && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <motion.div
                          aria-hidden
                          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gold/25 blur-[40px]" />
                        </motion.div>
                      </div>
                    )}

                    {/* Wax seal with the AF monogram logo inside. */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <motion.div
                        animate={{
                          scale: opened ? 0 : hover ? 1.04 : 1,
                          rotate: opened ? 45 : hover ? 4 : 0,
                          opacity: opened ? 0 : 1,
                          y: opened ? 22 : 0,
                        }}
                        transition={{
                          duration: opened ? 0.55 : 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <motion.div
                          animate={
                            opened || hover
                              ? { rotate: 0 }
                              : { rotate: [0, -9, 9, -7, 7, -4, 4, -2, 2, 0] }
                          }
                          transition={
                            opened || hover
                              ? { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                              : {
                                  duration: 0.8,
                                  times: [0, 0.1, 0.22, 0.33, 0.44, 0.55, 0.66, 0.78, 0.89, 1],
                                  repeat: Infinity,
                                  repeatDelay: 1.8,
                                  ease: "easeInOut",
                                }
                          }
                        >
                          <WaxSealLogo />
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.button>

                  {/* No "Enter the invitation" button — tapping the seal
                      auto-advances into the site (see `open`). */}

                  {/* CTA — lives inside the main flex column so it
                      always sits below the envelope. The previous
                      absolute-bottom placement was getting pushed
                      off-screen on shorter viewports when the
                      centered envelope eats the space below it. */}
                  <AnimatePresence>
                    {!opened && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 1.4, duration: 0.7 }}
                        className="text-center px-6 w-full max-w-lg"
                      >
                        <p className="kerning text-[10px] md:text-[11px] text-gold/90">
                          tap the seal
                        </p>
                        <div className="mt-3 md:mt-4 h-10 md:h-12 flex items-start justify-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={qIdx}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6, transition: { duration: 0.4 } }}
                              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                              className="font-serif italic text-sm md:text-base text-cream/85 max-w-sm mx-auto leading-relaxed"
                            >
                              {QUOTES[qIdx]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enter directly — held back 3.5s so the envelope's
                    cinematic entrance lands before the escape hatch
                    is offered. Serif-italic rather than utility-kerned
                    "skip" since this is a wedding, not onboarding. */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.9 }}
                  onClick={skip}
                  className="absolute top-5 right-5 md:top-6 md:right-6 font-serif italic text-xs md:text-sm text-cream/45 hover:text-gold hover:tracking-wide transition-all"
                >
                  Enter directly →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────
   BRIDGE SLIDE — the breath between the intro's fade-out and
   the envelope reveal. Kerned line of intent, a hairline, the
   AF Monogram alone on the cosmic backdrop, and a serif-italic
   dedication. Holds ~1.4s so the monogram registers in the
   viewer's eye before they see it pressed into the wax.
   ────────────────────────────────────────────────────────── */
function BridgeSlide() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.span
        initial={{ opacity: 0, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, letterSpacing: "0.42em" }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="kerning text-[10px] md:text-[11px] text-gold/85"
      >
        an invitation arrives
      </motion.span>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hairline mt-5 md:mt-6 max-w-[80px] text-gold/55 origin-center"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 md:mt-8"
        style={{
          filter: "drop-shadow(0 0 24px rgba(212,168,75,0.32))",
        }}
      >
        <Monogram
          tone="gold"
          showDate={false}
          showNames={false}
          size={150}
          className="w-[120px] md:w-[150px] h-auto"
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.7 }}
        className="mt-6 md:mt-7 font-serif italic text-cream/80 text-sm md:text-base"
      >
        for you, only you.
      </motion.p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   WAX SEAL — the AF Monogram logo now sits inside the wax.
   The Monogram already brings its own wreath / crown / heart,
   so we drop the previous crown + script-AF overlays and keep
   only the physical wax affordances (glossy highlight, drips,
   slowly rotating dashed outer ring).
   ────────────────────────────────────────────────────────── */
function WaxSealLogo() {
  return (
    <div className="relative">
      {/* Rotating dashed gold ring (outer halo) — slowed and more
          subtle for an editorial feel */}
      <motion.svg
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 80, ease: "linear", repeat: Infinity }}
        className="absolute -inset-[7px] md:-inset-[10px] pointer-events-none"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="48.5"
          fill="none"
          stroke="rgba(212,168,75,0.5)"
          strokeWidth="0.6"
          strokeDasharray="0.8 2.4"
        />
      </motion.svg>

      {/* Main wax body — deeper burgundy gradient with stronger
          inner shadow for an embossed pressed-wax look. */}
      <div
        className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #b32a3a 0%, #7d1d2a 42%, #4d101a 78%, #2c0810 100%)",
          boxShadow:
            "0 18px 42px rgba(0,0,0,0.7), 0 6px 14px rgba(0,0,0,0.5), inset -10px -10px 22px rgba(0,0,0,0.55), inset 8px 8px 18px rgba(255,200,180,0.18)",
        }}
      >
        {/* Inner gold rim — gives the seal a foil-stamped border
            line so the wax reads as a properly pressed bead, not
            a flat circle. */}
        <span
          aria-hidden
          className="absolute inset-[6px] rounded-full pointer-events-none"
          style={{
            border: "0.5px solid rgba(212,168,75,0.55)",
            boxShadow: "inset 0 0 8px rgba(212,168,75,0.25)",
          }}
        />

        {/* Glossy highlight — top-left specular */}
        <span
          aria-hidden
          className="absolute top-2.5 left-3.5 w-9 h-4 rounded-full bg-white/35"
          style={{ filter: "blur(5px)", transform: "rotate(-22deg)" }}
        />

        {/* AF Monogram pressed into the wax. Larger, with a
            multi-layer shadow stack so the gold reads as
            embossed rather than printed. */}
        <div
          className="relative z-10"
          style={{
            filter:
              "drop-shadow(0 1px 0 rgba(255,225,160,0.6)) drop-shadow(0 -1px 0 rgba(0,0,0,0.55)) drop-shadow(0 0 5px rgba(212,168,75,0.55))",
          }}
        >
          <Monogram
            tone="gold"
            showDate={false}
            showNames={false}
            size={132}
            className="w-[100px] md:w-[124px] h-auto"
          />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   KADAI BORDER — zardozi-style gold embroidery strips on all
   four sides of the envelope body. Paisley (boota) + bead
   trios repeat along each edge, giving the "old ethics"
   royal-wedding-card feel without conflicting with the corner
   flourishes or the flap diagonals.
   ────────────────────────────────────────────────────────── */
function KadaiBorder() {
  const gold = "%23B8892F";
  const h = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='10' viewBox='0 0 30 10'><g fill='none' stroke='${gold}' stroke-width='0.55' stroke-linecap='round'><path d='M 5 5 Q 2 2 5 2 Q 8 2 8 5 Q 8 8 5 8 Q 2 8 5 5 Z'/><path d='M 8.6 5 L 11 5'/><path d='M 15 5 L 17.4 5'/></g><circle cx='13' cy='5' r='0.95' fill='${gold}'/><g fill='${gold}' opacity='0.85'><circle cx='22' cy='3' r='0.5'/><circle cx='20' cy='6.4' r='0.5'/><circle cx='24' cy='6.4' r='0.5'/></g></svg>")`;
  const v = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='30' viewBox='0 0 10 30'><g fill='none' stroke='${gold}' stroke-width='0.55' stroke-linecap='round'><path d='M 5 5 Q 2 2 5 2 Q 8 2 8 5 Q 8 8 5 8 Q 2 8 5 5 Z'/><path d='M 5 8.6 L 5 11'/><path d='M 5 15 L 5 17.4'/></g><circle cx='5' cy='13' r='0.95' fill='${gold}'/><g fill='${gold}' opacity='0.85'><circle cx='3' cy='22' r='0.5'/><circle cx='6.4' cy='20' r='0.5'/><circle cx='6.4' cy='24' r='0.5'/></g></svg>")`;

  return (
    <>
      {/* top */}
      <div
        aria-hidden
        className="absolute top-[26px] left-[44px] right-[44px] h-[10px] opacity-85 pointer-events-none"
        style={{ backgroundImage: h, backgroundRepeat: "repeat-x", backgroundSize: "auto 100%" }}
      />
      {/* bottom */}
      <div
        aria-hidden
        className="absolute bottom-[26px] left-[44px] right-[44px] h-[10px] opacity-85 pointer-events-none"
        style={{ backgroundImage: h, backgroundRepeat: "repeat-x", backgroundSize: "auto 100%" }}
      />
      {/* left */}
      <div
        aria-hidden
        className="absolute left-[26px] top-[44px] bottom-[44px] w-[10px] opacity-85 pointer-events-none"
        style={{ backgroundImage: v, backgroundRepeat: "repeat-y", backgroundSize: "100% auto" }}
      />
      {/* right */}
      <div
        aria-hidden
        className="absolute right-[26px] top-[44px] bottom-[44px] w-[10px] opacity-85 pointer-events-none"
        style={{ backgroundImage: v, backgroundRepeat: "repeat-y", backgroundSize: "100% auto" }}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   FLORAL CROWN — sprigs + crowned heart meeting in center.
   ────────────────────────────────────────────────────────── */
function FloralCrown() {
  return (
    <svg viewBox="0 0 400 80" className="w-full h-auto text-gold" aria-hidden>
      <motion.path
        d="M 10 40 C 60 22, 130 56, 190 42"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M 390 40 C 340 22, 270 56, 210 42"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      />
      <motion.g
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <ellipse cx="50" cy="30" rx="6" ry="2" transform="rotate(-28 50 30)" opacity="0.85" />
        <ellipse cx="85" cy="34" rx="5" ry="2" transform="rotate(-18 85 34)" opacity="0.85" />
        <ellipse cx="120" cy="46" rx="6" ry="2" transform="rotate(-5 120 46)" opacity="0.9" />
        <ellipse cx="155" cy="48" rx="5" ry="2" transform="rotate(6 155 48)" opacity="0.85" />
        <ellipse cx="180" cy="44" rx="4" ry="1.8" transform="rotate(14 180 44)" opacity="0.8" />
        <circle cx="70" cy="27" r="1.8" opacity="0.95" />
        <circle cx="135" cy="50" r="1.6" opacity="0.95" />
        <ellipse cx="350" cy="30" rx="6" ry="2" transform="rotate(28 350 30)" opacity="0.85" />
        <ellipse cx="315" cy="34" rx="5" ry="2" transform="rotate(18 315 34)" opacity="0.85" />
        <ellipse cx="280" cy="46" rx="6" ry="2" transform="rotate(5 280 46)" opacity="0.9" />
        <ellipse cx="245" cy="48" rx="5" ry="2" transform="rotate(-6 245 48)" opacity="0.85" />
        <ellipse cx="220" cy="44" rx="4" ry="1.8" transform="rotate(-14 220 44)" opacity="0.8" />
        <circle cx="330" cy="27" r="1.8" opacity="0.95" />
        <circle cx="265" cy="50" r="1.6" opacity="0.95" />
      </motion.g>
      <motion.g
        transform="translate(200, 42)"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6, type: "spring", damping: 11 }}
      >
        <rect x="-8" y="-6" width="16" height="2" rx="0.5" opacity="0.9" />
        <path d="M -8 -6 L -6 -12 L -3 -8 L 0 -14 L 3 -8 L 6 -12 L 8 -6 Z" opacity="0.9" />
        <circle cx="-6" cy="-13" r="1" />
        <circle cx="0" cy="-15.5" r="1.3" />
        <circle cx="6" cy="-13" r="1" />
        <motion.path
          d="M 0 4 C -6 -2 -11 -1 -8 4 C -5 7 0 10 0 12 C 0 10 5 7 8 4 C 11 -1 6 -2 0 4 Z"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
        />
      </motion.g>
    </svg>
  );
}

function HandwrittenNames() {
  return (
    <p
      className="flex flex-wrap items-baseline justify-center gap-x-2 md:gap-x-3 leading-none"
      style={{ filter: "drop-shadow(0 2px 10px rgba(212,168,75,0.35))" }}
    >
      <motion.span
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
        className="font-script text-gold text-[2.6rem] sm:text-6xl md:text-7xl inline-block"
      >
        {couple.groom.firstName}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.45, type: "spring", damping: 12 }}
        className="font-display italic text-gold/90 text-2xl sm:text-3xl md:text-4xl inline-block"
      >
        &amp;
      </motion.span>
      <motion.span
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ delay: 1.6, duration: 0.6, ease: "easeOut" }}
        className="font-script text-gold text-[2.6rem] sm:text-6xl md:text-7xl inline-block"
      >
        {couple.bride.firstName}
      </motion.span>
    </p>
  );
}

function GoldDust() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
      {Array.from({ length: 30 }).map((_, i) => {
        const xPct = (i * 137) % 100;
        const dur = 7 + (i % 7);
        const delay = (i * 0.31) % 9;
        const size = 1 + (i % 3) * 0.5;
        return (
          <motion.span
            key={i}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "-10%", opacity: [0, 0.7, 0.7, 0] }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.1, 0.9, 1],
            }}
            className="absolute block rounded-full bg-gold"
            style={{
              left: `${xPct}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: "0 0 6px rgba(212,168,75,0.8)",
            }}
          />
        );
      })}
    </div>
  );
}

function CornerFlourish({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "top-3 left-3",
    tr: "top-3 right-3",
    bl: "bottom-3 left-3",
    br: "bottom-3 right-3",
  }[position];
  const rot = {
    tl: "",
    tr: "rotate-90",
    br: "rotate-180",
    bl: "-rotate-90",
  }[position];
  return (
    <svg viewBox="0 0 28 28" className={`absolute ${pos} ${rot} w-7 h-7 text-[rgba(172,130,58,0.65)]`} aria-hidden>
      <path d="M 3 13 Q 3 3 13 3" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M 5 9 Q 7 7 9 5" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="3" cy="3" r="1.2" fill="currentColor" />
      <circle cx="10" cy="3" r="0.55" fill="currentColor" opacity="0.6" />
      <circle cx="3" cy="10" r="0.55" fill="currentColor" opacity="0.6" />
      <path d="M 13 3 L 15 3" stroke="currentColor" strokeWidth="0.3" />
      <path d="M 3 13 L 3 15" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  );
}
