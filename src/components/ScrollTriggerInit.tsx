"use client";

import { useEffect } from "react";

/**
 * Lazily loads GSAP ScrollTrigger, registers it on the global gsap singleton,
 * and integrates with the Lenis smooth-scroll instance exposed on `window.__lenis`.
 * Mount this once at the root (inside ClientOnly) so every component can safely
 * `import { ScrollTrigger } from "gsap/ScrollTrigger"` and use it.
 */
export function ScrollTriggerInit() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // Wait for Lenis to be available (SmoothScroll mounts in parallel).
      const connectLenis = () => {
        const lenis = (window as unknown as {
          __lenis?: {
            on: (event: string, cb: () => void) => void;
            raf: (time: number) => void;
          };
        }).__lenis;

        if (!lenis) {
          if (!cancelled) setTimeout(connectLenis, 50);
          return;
        }

        // Drive Lenis from a SINGLE source. `SmoothScroll` already runs
        // its own requestAnimationFrame loop calling `lenis.raf(time)`.
        // Previously this file ALSO did `gsap.ticker.add(t => lenis.raf(t
        // * 1000))`, so `lenis.raf` ran TWICE per frame with two
        // different time bases (rAF's navigation-start clock vs
        // gsap.ticker's own clock). Lenis computes `delta = time -
        // lastTime`, so alternating clocks produced wild ± deltas and the
        // scroll position oscillated every frame — the ROOT CAUSE of the
        // site-wide flicker (worst on mobile and during the AutoTour
        // glide). We now only SYNC ScrollTrigger to Lenis's scroll event;
        // we never tick raf here.
        lenis.on("scroll", () => ScrollTrigger.update());
        gsap.ticker.lagSmoothing(0);
        ScrollTrigger.refresh();
      };

      connectLenis();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
