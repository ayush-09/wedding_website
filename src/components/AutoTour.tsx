"use client";

import { useEffect, useRef, useState } from "react";

type LenisLike = {
  scrollTo: (
    target: number,
    opts?: {
      duration?: number;
      easing?: (t: number) => number;
      immediate?: boolean;
      force?: boolean;
    },
  ) => void;
  scroll: number;
  stop: () => void;
  start: () => void;
};

/**
 * AutoTour — headless guided scroll.
 *
 * Starts when `fa-tour-start` fires (EnvelopeGate dispatches it on
 * seal break) and smoothly scrolls from the current position to the
 * bottom of the page over ~90 s.
 *
 * Interaction model: any user action (wheel / touch / keydown /
 * click) *pauses* the tour. Each new interaction resets a short
 * "stillness" timer; after that timer elapses without further
 * input, the tour resumes from the current scroll position.
 *
 * Pacing is CONSTANT VELOCITY, not a single ease-in-out across the
 * whole page. The duration of any scroll leg is derived from the
 * remaining distance at a fixed viewport-heights-per-second rate,
 * with a gentle trapezoid ramp at the very start/end. This matters
 * because section heights here are wildly disproportionate — the
 * gallery alone is ~19 viewport heights (≈ 62 % of the page). A
 * cosine ease-in-out would peak velocity at the page midpoint,
 * exactly inside the gallery, whipping the photos by. Constant
 * velocity gives every section — and every gallery photo — the same
 * calm, readable pace regardless of where it falls.
 *
 * `tourActiveRef` gates the interaction handler so random clicks
 * before the envelope is opened don't kick off the tour.
 */

// Calm cinematic pace. Lower = slower. At 0.12 vh/s a full-viewport
// section glides past in ~8 s — slow enough to read passively without
// any input. (The gallery handles its own per-photo pacing via snap.)
const VH_PER_SECOND = 0.12;
// Stillness window before the tour resumes after a manual interaction.
const PAUSE_BEFORE_RESUME_MS = 5_000;
// The deliberate "little pause" when a section asks the tour to wait
// (e.g. the scratch card). Bounded — the tour glides on afterwards
// instead of hanging there forever. Active scratching extends it.
const HOLD_PAUSE_MS = 6_500;
// Floor so a tiny remaining distance never animates instantly.
const MIN_DURATION_MS = 1_200;

// Trapezoid velocity profile: ease in over the first RAMP, constant
// velocity through the middle, ease out over the last RAMP. Keeps the
// onset/landing soft without distorting the steady-state pace.
const RAMP = 0.06;
const easeTour = (t: number): number => {
  const r = RAMP;
  const v = 1 / (1 - r); // peak velocity so total distance integrates to 1
  if (t < r) return (v * t * t) / (2 * r);
  if (t > 1 - r) {
    const u = 1 - t;
    return 1 - (v * u * u) / (2 * r);
  }
  return v * (t - r / 2);
};

export function AutoTour() {
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const resumeTimerRef = useRef<number | null>(null);
  const tourActiveRef = useRef(false);
  // Tracks whether we've already cancelled the in-flight Lenis
  // scrollTo for the current pause. Without this guard, every
  // single wheel event re-pins Lenis to the current position,
  // which cancels the user's own wheel input — the page feels
  // un-scrollable until the tour completes.
  const pausedRef = useRef(false);
  // External "hold": when a section needs the auto-tour to wait
  // for an interaction (e.g. the Countdown scratch card), it
  // dispatches `fa-tour-hold` and the resume timer is suppressed
  // until `fa-tour-release` fires. The user can still scroll
  // manually — only the AUTO scroll is paused.
  const heldRef = useRef(false);

  const getLenis = (): LenisLike | null => {
    if (typeof window === "undefined") return null;
    return (window as unknown as { __lenis?: LenisLike }).__lenis ?? null;
  };

  const clearRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  // Duration for a scroll leg from its distance, at the constant
  // VH_PER_SECOND pace. Independent of where on the page the leg
  // falls, so every section scrolls at the same speed.
  const durationForDistance = (distancePx: number): number => {
    const vh = window.innerHeight || 1;
    const distanceVh = Math.abs(distancePx) / vh;
    return Math.max(MIN_DURATION_MS, (distanceVh / VH_PER_SECOND) * 1000);
  };

  const runScroll = () => {
    if (typeof window === "undefined") return;

    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetY = totalHeight;
    if (targetY <= window.scrollY + 50) {
      // Already at the bottom — nothing to do; tour is done.
      playingRef.current = false;
      setPlaying(false);
      tourActiveRef.current = false;
      return;
    }

    const durationMs = durationForDistance(targetY - window.scrollY);

    playingRef.current = true;
    setPlaying(true);
    startTimeRef.current = performance.now();

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetY, {
        duration: durationMs / 1000,
        easing: easeTour,
      });
      const tick = (now: number) => {
        const p = Math.min((now - startTimeRef.current) / durationMs, 1);
        if (p < 1 && playingRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          playingRef.current = false;
          setPlaying(false);
          if (p >= 1) tourActiveRef.current = false;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Fallback if Lenis isn't mounted yet — animate window.scrollTo.
    const startY = window.scrollY;
    const tick = (now: number) => {
      const p = Math.min((now - startTimeRef.current) / durationMs, 1);
      const eased = easeTour(p);
      window.scrollTo(0, startY + eased * (targetY - startY));
      if (p < 1 && playingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        playingRef.current = false;
        setPlaying(false);
        if (p >= 1) tourActiveRef.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const play = () => {
    tourActiveRef.current = true;
    pausedRef.current = false;
    clearResumeTimer();
    runScroll();
  };

  const pauseAndScheduleResume = () => {
    // Only respond to interactions *during* a tour. Random clicks
    // before the envelope opens should not trigger auto-scroll.
    if (!tourActiveRef.current) return;

    // Pin Lenis + stop our rAF only on the *first* interaction of
    // this pause session. Re-pinning on every wheel event is what
    // made the page feel unscrollable — each wheel would cancel
    // the user's own smooth-wheel input by resetting Lenis.
    if (!pausedRef.current) {
      pausedRef.current = true;
      playingRef.current = false;
      setPlaying(false);
      clearRaf();
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(lenis.scroll, { immediate: true });
    }

    // Each new interaction still resets the resume timer — so a
    // user actively reading / tapping / scrolling (or scratching the
    // card) keeps the tour quiet for another full window.
    clearResumeTimer();
    // A held section (e.g. the scratch card) gets a longer, deliberate
    // pause — but a BOUNDED one, so the tour glides on afterwards
    // rather than hanging there forever waiting for an interaction.
    const delay = heldRef.current ? HOLD_PAUSE_MS : PAUSE_BEFORE_RESUME_MS;
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      pausedRef.current = false;
      // Once we resume, we're no longer "held" — the bounded pause is
      // spent. A fresh hold (card re-entering view) would re-arm it.
      heldRef.current = false;

      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const remainingFraction =
        1 - Math.min(1, window.scrollY / totalHeight);
      if (remainingFraction <= 0.01) {
        tourActiveRef.current = false;
        return;
      }

      // Constant velocity — runScroll derives its own duration from
      // the remaining distance, so the pace is unchanged after a pause.
      runScroll();
    }, delay);
  };

  // External trigger: envelope open
  useEffect(() => {
    const handler = () => play();
    window.addEventListener("fa-tour-start", handler);
    return () => window.removeEventListener("fa-tour-start", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hold/release — external sections can pause the auto-tour
  // indefinitely while keeping native user scroll alive. The hold
  // pins our internal pause flag and clears any pending resume
  // timer; the release schedules a normal resume countdown.
  useEffect(() => {
    const onHold = () => {
      if (!tourActiveRef.current) return;
      heldRef.current = true;
      // Pin the current position and arm the bounded HOLD_PAUSE_MS
      // beat. The user can still scratch / scroll — each interaction
      // re-extends this same pause; absent any, it resumes on its own.
      pauseAndScheduleResume();
    };
    const onRelease = () => {
      if (!heldRef.current) return;
      heldRef.current = false;
      // Reveal (or the card leaving view) drops us to the normal
      // short stillness window — long enough to enjoy the fireworks,
      // then the tour carries on.
      if (tourActiveRef.current) pauseAndScheduleResume();
    };
    window.addEventListener("fa-tour-hold", onHold);
    window.addEventListener("fa-tour-release", onRelease);
    return () => {
      window.removeEventListener("fa-tour-hold", onHold);
      window.removeEventListener("fa-tour-release", onRelease);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interaction listeners — always on. They no-op unless
  // `tourActiveRef.current` is true (guarded inside pauseAndScheduleResume).
  useEffect(() => {
    const onInteract = () => pauseAndScheduleResume();
    window.addEventListener("wheel", onInteract, { passive: true });
    window.addEventListener("touchstart", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    window.addEventListener("click", onInteract);
    // The Gallery's reels snap swallows wheel events (capture +
    // stopPropagation) so they never reach the `wheel` listener above;
    // it dispatches `fa-tour-pause` instead so scrubbing the reel still
    // pauses the auto-tour like any other interaction.
    window.addEventListener("fa-tour-pause", onInteract);
    return () => {
      window.removeEventListener("wheel", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("fa-tour-pause", onInteract);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup any pending frames / timers on unmount.
  useEffect(() => {
    return () => {
      clearRaf();
      clearResumeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Headless — no visible UI.
  void playing;
  return null;
}
