"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Nazar (evil-eye) — discreet protective bead that follows the
 * pointer on desktop and surfaces under the finger on touch
 * devices. Replaces the per-card nazar that used to sit on the
 * Whispers cards: now there's exactly one, and it stays close to
 * wherever the guest is looking.
 *
 * Behaviour:
 *   · Desktop — fades in on first mousemove, follows the cursor
 *     with springed motion, fades out when the cursor leaves the
 *     viewport.
 *   · Touch  — appears at the touch point on `touchstart`, tracks
 *     the finger through `touchmove`, then fades out ~900ms after
 *     `touchend` so it feels like a brief watching-bead, not a
 *     stuck cursor.
 *   · `prefers-reduced-motion: reduce` opts out entirely.
 *   · Pointer-events disabled — never interferes with clicks/taps.
 *   · z-40 — above page content, below intro/envelope overlays.
 *
 * The bead itself is the boncuk-style concentric ring: indigo →
 * gold → cream → black pupil with a tiny specular highlight,
 * matching the protective bead motif used elsewhere in the site.
 */
const TOUCH_HIDE_DELAY_MS = 900;

export function EvilEyeCursor() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.6 });
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const isTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
      window.matchMedia?.("(pointer: coarse)").matches;

    const clearHide = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    // ── Desktop pointer ─────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    // ── Touch pointer ───────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      clearHide();
      x.set(t.clientX);
      y.set(t.clientY);
      setVisible(true);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      clearHide();
      x.set(t.clientX);
      y.set(t.clientY);
      if (!visible) setVisible(true);
    };
    const onTouchEnd = () => {
      clearHide();
      hideTimerRef.current = window.setTimeout(
        () => setVisible(false),
        TOUCH_HIDE_DELAY_MS,
      );
    };

    if (isTouch) {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    } else {
      window.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("mouseenter", onMouseEnter);
    }

    return () => {
      if (isTouch) {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
      } else {
        window.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseleave", onMouseLeave);
        document.removeEventListener("mouseenter", onMouseEnter);
      }
      clearHide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        opacity: visible ? 0.85 : 0,
        scale: visible ? 1 : 0.55,
      }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 pointer-events-none z-40"
      aria-hidden
    >
      <NazarGlyph />
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   Nazar (boncuk) — concentric protective bead. Subtle pulse so
   it reads as alive without dominating the cursor.
   ────────────────────────────────────────────────────────── */
function NazarGlyph() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={30}
      height={30}
      animate={{ scale: [1, 0.94, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "center", display: "block" }}
      filter="drop-shadow(0 3px 10px rgba(15,15,38,0.55))"
    >
      <circle cx="12" cy="12" r="11" fill="#1B1B3A" />
      <circle cx="12" cy="12" r="9" fill="#2A1B5E" opacity="0.85" />
      <circle cx="12" cy="12" r="7" fill="#D4A84B" />
      <circle cx="12" cy="12" r="5.2" fill="#F5E6C9" />
      <circle cx="12" cy="12" r="3.4" fill="#1B1B3A" />
      <circle cx="12" cy="12" r="1.7" fill="#0F0F26" />
      <circle cx="11" cy="11" r="0.55" fill="#fff" opacity="0.7" />
    </motion.svg>
  );
}
