"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * CinematicReel — a single scroll-linked overlay that gives the
 * whole page a unified film-reel feel instead of 9 independent
 * sections. Nothing here captures clicks (pointer-events-none
 * throughout) and nothing changes section content.
 *
 *   1. Film-frame hairlines — two almost-invisible gold lines
 *      pinned to the very top and bottom of the viewport. They
 *      fade in after the user starts scrolling (so they don't
 *      interfere with the cinematic intro) and stay for the rest
 *      of the page, reading as the perforated edge of a film strip.
 *
 *   2. Scroll-linked vignette — four radial gradients in the
 *      corners that deepen as the user moves through the page.
 *      Minimal darkening at the hero (we want the paper ground
 *      clean) and strongest around the Gallery / RSVP so the
 *      closing sections feel intimate, like the theatre dimming
 *      as the credits approach.
 *
 * Z-index 25 — above page content (z-10, z-20), below intro (z-100),
 * envelope (z-95), scroll progress bar (z-55), and user controls (z-40).
 */
export function CinematicReel() {
  const { scrollYProgress } = useScroll();

  // Hairlines appear after ~3% scroll — enough that the envelope
  // open doesn't compete with them arriving, but early enough to
  // feel intentional. They hold full strength through the page.
  const hairlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.03, 0.06],
    [0, 0, 1],
  );

  // Vignette ramps from invisible at the hero to a restrained 0.45
  // opacity near the end. Two waypoints so the mid-page (Story /
  // Ardhanarishwara) already feels softly framed.
  const vignetteOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 1],
    [0, 0.25, 0.45],
  );

  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-[25]">
      {/* Top film-frame hairline */}
      <motion.div
        style={{ opacity: hairlineOpacity }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent"
      />

      {/* Bottom film-frame hairline */}
      <motion.div
        style={{ opacity: hairlineOpacity }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent"
      />

      {/* Corner vignette — radial darkening from each corner.
          `mix-blend-multiply` so it reads as ambient theatre-dim
          rather than a flat grey panel pasted on top. */}
      <motion.div
        style={{ opacity: vignetteOpacity }}
        className="absolute inset-0 mix-blend-multiply"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top left, transparent 55%, rgba(15,15,38,0.55) 100%)," +
              "radial-gradient(ellipse at top right, transparent 55%, rgba(15,15,38,0.55) 100%)," +
              "radial-gradient(ellipse at bottom left, transparent 55%, rgba(15,15,38,0.55) 100%)," +
              "radial-gradient(ellipse at bottom right, transparent 55%, rgba(15,15,38,0.55) 100%)",
          }}
        />
      </motion.div>
    </div>
  );
}
