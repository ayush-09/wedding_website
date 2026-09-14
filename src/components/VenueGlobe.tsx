"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef, useState } from "react";
import { usePageVisible } from "@/lib/usePageVisible";

/**
 * VenueGlobe — a photorealistic dotted globe rendered by `cobe` v2.
 *
 * Continents, coastlines, and ocean boundaries are visible as dot
 * density (no texture files required). The venue sits under a gold
 * marker; the globe auto-spins with drag to orbit.
 *
 * Implementation notes:
 *  · cobe v2 dropped the `onRender` callback present in v1 examples.
 *    We drive rotation via our own rAF loop calling `globe.update()`.
 *  · cobe needs real pixel dimensions at init — if the container
 *    hasn't laid out yet (lazy-import + below-the-fold combo), we
 *    retry on the next frame until it has size.
 *  · A React-managed wrapper `<div>` parents the canvas so React
 *    never loses track of the element when Fast Refresh swaps modules
 *    (the "removeChild" reconciliation error). All dynamic styling
 *    that used to mutate `canvas.style` directly now flows through
 *    React state + inline styles.
 */

type Props = {
  lat: number;
  lng: number;
  /**
   * Fires when the user taps near the pin without dragging. The
   * detection lives inside this component because the wrapper
   * already handles pointer events — an external overlay button
   * fights the globe's own pointer-capture logic.
   */
  onPinTap?: () => void;
};

// Max movement (px) during a pointerdown→up to still count as a tap.
const TAP_MOVEMENT_THRESHOLD = 6;
// Radius of the "pin zone" as a fraction of the min canvas dimension.
const PIN_TAP_RADIUS_RATIO = 0.18;

export function VenueGlobe({ lat, lng, onPinTap }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pointerDownClientX = useRef<number | null>(null);
  const phiAtPointerDown = useRef(0);
  const phiRef = useRef(0);
  // Tap-vs-drag detection refs
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);
  const movementRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const visible = usePageVisible();
  // Mirror in a ref so the rAF loop reads the latest value without
  // needing the effect to resubscribe on every visibility flip.
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let destroyed = false;

    const initialPhi = -((lng + 180) * Math.PI) / 180;
    phiRef.current = initialPhi;

    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };

    const start = () => {
      if (destroyed) return;
      const { w, h } = measure();
      if (w < 10 || h < 10) {
        window.requestAnimationFrame(start);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio, 2);
      const options: COBEOptions = {
        devicePixelRatio: dpr,
        width: w * dpr,
        height: h * dpr,
        phi: initialPhi,
        theta: lat > 0 ? 0.25 : -0.15,
        dark: 0.1,
        diffuse: 1.3,
        mapSamples: 18000,
        mapBrightness: 5.4,
        baseColor: [0.72, 0.62, 0.45],
        markerColor: [0.83, 0.66, 0.29],
        glowColor: [0.92, 0.78, 0.48],
        markers: [{ location: [lat, lng], size: 0.11 }],
      };
      globe = createGlobe(canvas, options);
      setReady(true);

      const tick = () => {
        if (destroyed || !globe) return;
        // Skip the entire frame when the tab is hidden — no cobe
        // update, no marker recompute, no repaint. Keeps scheduling
        // a frame though, so we pick up instantly on re-focus.
        if (!visibleRef.current) {
          raf = window.requestAnimationFrame(tick);
          return;
        }
        if (pointerDownClientX.current === null) {
          phiRef.current += 0.0035;
        }
        const { w: cw, h: ch } = measure();
        const t = performance.now() / 1000;
        const pulse = 0.11 + Math.sin(t * 2.2) * 0.035;
        globe.update({
          phi: phiRef.current,
          width: cw * dpr,
          height: ch * dpr,
          markers: [{ location: [lat, lng], size: pulse }],
        });
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(start);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(raf);
      try {
        globe?.destroy();
      } catch {
        /* cobe may have already released its context */
      }
    };
  }, [lat, lng]);

  // Pointer listeners live on the wrapper (not the canvas) so they
  // aren't affected by canvas remounts from cobe's internal state.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownClientX.current = e.clientX;
      phiAtPointerDown.current = phiRef.current;
      tapStartRef.current = { x: e.clientX, y: e.clientY };
      movementRef.current = 0;
      setDragging(true);
      wrapper.setPointerCapture(e.pointerId);
    };
    const onPointerUp = (e: PointerEvent) => {
      // If this was a tap (minimal movement) landing near the pin
      // zone (center of the canvas), fire the pin-tap callback.
      const tapStart = tapStartRef.current;
      if (
        onPinTap &&
        tapStart &&
        movementRef.current < TAP_MOVEMENT_THRESHOLD
      ) {
        const rect = wrapper.getBoundingClientRect();
        const localX = tapStart.x - rect.left;
        const localY = tapStart.y - rect.top;
        const dx = localX - rect.width / 2;
        const dy = localY - rect.height / 2;
        const dist = Math.hypot(dx, dy);
        const maxDist =
          Math.min(rect.width, rect.height) * PIN_TAP_RADIUS_RATIO;
        if (dist <= maxDist) onPinTap();
      }
      pointerDownClientX.current = null;
      tapStartRef.current = null;
      movementRef.current = 0;
      setDragging(false);
      if (wrapper.hasPointerCapture(e.pointerId)) {
        wrapper.releasePointerCapture(e.pointerId);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      const tapStart = tapStartRef.current;
      if (tapStart) {
        const moved = Math.hypot(
          e.clientX - tapStart.x,
          e.clientY - tapStart.y,
        );
        if (moved > movementRef.current) movementRef.current = moved;
      }
      if (pointerDownClientX.current === null) return;
      const delta = e.clientX - pointerDownClientX.current;
      phiRef.current = phiAtPointerDown.current + delta / 200;
    };

    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointerup", onPointerUp);
    wrapper.addEventListener("pointercancel", onPointerUp);
    wrapper.addEventListener("pointermove", onPointerMove);

    return () => {
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointerup", onPointerUp);
      wrapper.removeEventListener("pointercancel", onPointerUp);
      wrapper.removeEventListener("pointermove", onPointerMove);
    };
    // Re-subscribe if the tap handler changes so handlers always
    // close over the latest `onPinTap` reference.
  }, [onPinTap]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab",
      }}
      aria-label="Venue location on globe"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.9s ease-out",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}
