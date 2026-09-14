"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Snap from "lenis/snap";
import type Lenis from "lenis";
import { galleryPhotos, type GalleryPhoto } from "@/lib/gallery";
import { useLanguage } from "./LanguageProvider";

/**
 * Gallery — scroll-driven cinematic photo reel with Instagram-Reels
 * style snapping AND a tap-to-open full-screen lightbox.
 *
 * The section is N × VH_PER_PHOTO tall; the photo layer is sticky-
 * pinned to the viewport so scrolling drives a sequence of full-bleed
 * photos that crossfade with a DIFFERENT transition each (Ken Burns,
 * slide, blur, rotate, saturation, dolly-zoom…), so the journey feels
 * like a film reel rather than a slideshow.
 *
 * INTERACTION
 *  · Tap / click any photo → opens an elegant dark lightbox at that
 *    photo, with prev/next buttons, arrow keys, ESC, backdrop click,
 *    and swipe on touch. This is the core "user-interactive" win.
 *  · The right-rail dots AND the live counter are real navigation —
 *    clicking a dot (or the counter) scrolls the reel to that photo.
 *
 * SNAP — while the reel fills the viewport, a Lenis `mandatory` snap
 * is engaged: every photo has an invisible scroll marker, and once the
 * user stops scrolling the page settles on exactly one photo (up /
 * down, like reels). The snap is gated by an IntersectionObserver so
 * it ONLY acts inside the gallery — elsewhere the page scrolls freely.
 *
 * Crossfade math is keyed so each photo sits at FULL opacity exactly at
 * its snap marker (progress = i / (N-1)), so snapping always lands on a
 * cleanly-resolved image rather than mid-transition.
 *
 * ACCESSIBILITY — honours prefers-reduced-motion (heavy scroll
 * transforms collapse, snap disabled); lightbox is a labelled modal
 * dialog with focus moved to the close button on open and all controls
 * keyboard-reachable with visible focus rings.
 */
type Effect =
  | "kenBurns"
  | "slideX"
  | "slideY"
  | "blurZoom"
  | "rotateScale"
  | "diagonal"
  | "saturate"
  | "dollyZoom";

// Effect rotation — each photo gets the next effect in sequence so
// no two adjacent photos share a transition. Wraps around if the
// gallery has more photos than effects.
const EFFECTS: Effect[] = [
  "kenBurns",
  "slideX",
  "blurZoom",
  "rotateScale",
  "diagonal",
  "saturate",
  "slideY",
  "dollyZoom",
];

// Scroll distance allocated per photo (in viewport heights). One
// viewport per photo keeps the snap markers a clean 100vh apart and
// makes a single decisive scroll advance one photo.
const VH_PER_PHOTO = 100;

const photoAlt = (p: GalleryPhoto) => `${p.caption}, ${p.year}`;

export function Gallery() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const N = galleryPhotos.length;

  // Lightbox open index (null = closed).
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Reads the currently-snapped photo index straight from scroll.
  const currentIndex = useCallback(
    () => (N > 1 ? Math.round(scrollYProgress.get() * (N - 1)) : 0),
    [N, scrollYProgress],
  );

  // Scrolls the reel so photo `i` lands at its snap marker. Used by
  // the dot rail + counter to turn them into real navigation. Prefers
  // the marker element (works with or without Lenis); falls back to a
  // computed offset.
  const scrollToPhoto = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(N - 1, i));
      const marker = markerRefs.current[clamped];
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      window.dispatchEvent(new Event("fa-tour-pause"));
      if (marker && lenis) {
        lenis.scrollTo(marker, { offset: 0 });
        return;
      }
      if (marker) {
        marker.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [N, reduced],
  );

  const openLightbox = useCallback(
    (i?: number) => setLightbox(i ?? currentIndex()),
    [currentIndex],
  );

  // ── Reels snap ────────────────────────────────────────────
  // Build a Lenis `mandatory` snap over the per-photo markers, gated to
  // the gallery via an IntersectionObserver on the sticky stage. Skipped
  // entirely under prefers-reduced-motion (free scroll for those users).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let snap: Snap | null = null;
    let io: IntersectionObserver | null = null;
    const removers: Array<() => void> = [];
    const engaged = { current: false };
    const cooldown = { current: false };
    let cooldownTimer = 0;

    // Decisive wheel advance — one notch = one photo (desktop / trackpad).
    // Capture phase so it runs BEFORE Lenis's window wheel listener;
    // stopPropagation then prevents Lenis from handling (and from emitting
    // `virtual-scroll`), so the mandatory snap never double-fires on wheel.
    const onWheelCapture = (e: WheelEvent) => {
      if (!engaged.current || !snap) return;
      if (cooldown.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (dir === 0) return;
      const nearest = N > 1 ? Math.round(scrollYProgress.get() * (N - 1)) : 0;
      const target = nearest + dir;
      if (target < 0 || target > N - 1) return; // let Lenis scroll out
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(new Event("fa-tour-pause"));
      cooldown.current = true;
      cooldownTimer = window.setTimeout(() => {
        cooldown.current = false;
      }, 760);
      snap.goTo(target);
    };

    const setup = () => {
      if (cancelled) return;
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      // Lenis mounts in a sibling effect — retry until it's exposed.
      if (!lenis) {
        requestAnimationFrame(setup);
        return;
      }

      snap = new Snap(lenis, {
        type: "mandatory",
        duration: 0.7,
        easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic — snappy settle
      });
      snap.stop();

      markerRefs.current.forEach((m) => {
        if (m && snap) removers.push(snap.addElement(m, { align: "start" }));
      });

      const stage = stageRef.current;
      if (stage) {
        io = new IntersectionObserver(
          (entries) => {
            const e = entries[0];
            if (!e || !snap) return;
            const isIn = e.intersectionRatio >= 0.9;
            engaged.current = isIn;
            if (isIn) snap.start();
            else snap.stop();
          },
          { threshold: [0, 0.9, 1] },
        );
        io.observe(stage);
      }

      window.addEventListener("wheel", onWheelCapture, {
        passive: false,
        capture: true,
      });
    };

    setup();

    return () => {
      cancelled = true;
      window.clearTimeout(cooldownTimer);
      window.removeEventListener("wheel", onWheelCapture, { capture: true });
      removers.forEach((r) => r());
      io?.disconnect();
      snap?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subtle dark veil that breathes with scroll.
  const veilOpacity = useTransform(scrollYProgress, [0, 0.05, 1], [0.55, 0.45, 0.45]);

  return (
    <section
      ref={ref}
      className="relative bg-ink text-cream"
      style={{ height: `${N * VH_PER_PHOTO}svh` }}
    >
      {/* Invisible snap markers — one per photo. Use `svh` to match the
          sticky stage's `100svh` below. Mixing `vh` (track) with `svh`
          (stage) meant the mobile URL bar showing/hiding resized the
          track but not the stage, so the reel reflowed and the snap
          markers drifted off the photos — a mobile flicker source. */}
      {galleryPhotos.map((_, i) => {
        const topVh = N > 1 ? (i / (N - 1)) * (N * VH_PER_PHOTO - 100) : 0;
        return (
          <div
            key={`snap-${i}`}
            ref={(el) => {
              markerRefs.current[i] = el;
            }}
            aria-hidden
            className="absolute left-0 w-px h-px pointer-events-none"
            style={{ top: `${topVh}svh` }}
          />
        );
      })}

      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Photo stack */}
        {galleryPhotos.map((p, i) => (
          <ScrollPhotoLayer
            key={p.src}
            photo={p}
            index={i}
            total={N}
            progress={scrollYProgress}
            effect={EFFECTS[i % EFFECTS.length]}
            reduced={!!reduced}
          />
        ))}

        {/* Persistent veil + grain so type stays legible */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            opacity: veilOpacity,
            background:
              "radial-gradient(ellipse at center, rgba(8,4,14,0.30) 0%, rgba(8,4,14,0.65) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-[5] opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Tap-to-open hit layer — sits over the photos (below the
            chrome) so a tap anywhere on the image opens the lightbox at
            the currently-shown photo, without stealing clicks from the
            dots / counter / captions (which carry higher z + their own
            handlers). */}
        <button
          type="button"
          onClick={() => openLightbox()}
          aria-label={t("gallery.open_hint")}
          className="absolute inset-0 z-[6] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 focus-visible:ring-inset"
        />

        {/* Top-left header */}
        <div className="absolute top-6 md:top-10 left-6 md:left-10 z-10 max-w-[60%] pointer-events-none">
          <p className={`text-[10px] md:text-[11px] text-gold/90 ${kerningClass}`}>
            {t("gallery.eyebrow")}
          </p>
          <h2 className={`mt-1.5 md:mt-2 text-xl sm:text-2xl md:text-4xl text-cream/95 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] ${displayClass}`}>
            {t("gallery.heading")}
          </h2>
        </div>

        {/* Live photo counter — clickable nav (advances one photo) */}
        <PhotoCounter
          total={N}
          progress={scrollYProgress}
          onStep={(dir) => scrollToPhoto(currentIndex() + dir)}
        />

        {/* Right-side dot rail — clickable nav (desktop only) */}
        <PhotoDots total={N} progress={scrollYProgress} onJump={scrollToPhoto} label={t("gallery.go_to")} />

        {/* Per-photo captions + tap hint */}
        {galleryPhotos.map((p, i) => (
          <ScrollPhotoCaption
            key={`cap-${p.src}`}
            photo={p}
            index={i}
            total={N}
            progress={scrollYProgress}
            hint={t("gallery.open_hint")}
            onOpen={() => openLightbox(i)}
          />
        ))}

        {/* Scroll cue */}
        <ScrollCue progress={scrollYProgress} />
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            index={lightbox}
            onClose={() => setLightbox(null)}
            onNavigate={(i) => setLightbox(i)}
            reduced={!!reduced}
            t={t}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Per-photo scroll window.
   ────────────────────────────────────────────────────────── */
function photoWindow(index: number, total: number) {
  const step = total > 1 ? 1 / (total - 1) : 1;
  const c = total > 1 ? index / (total - 1) : 0.5;
  const wStart = Math.max(0, c - step);
  const wEnd = Math.min(1, c + step);
  return { step, c, wStart, wEnd, wMid: (wStart + wEnd) / 2 };
}

/* ──────────────────────────────────────────────────────────
   ScrollPhotoLayer — one full-bleed photo.
   ────────────────────────────────────────────────────────── */
function ScrollPhotoLayer({
  photo,
  index,
  total,
  progress,
  effect,
  reduced,
}: {
  photo: GalleryPhoto;
  index: number;
  total: number;
  progress: MotionValue<number>;
  effect: Effect;
  reduced: boolean;
}) {
  const { c, wStart, wEnd, wMid } = photoWindow(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const opacity = useTransform(
    progress,
    isFirst ? [c, wEnd] : isLast ? [wStart, c] : [wStart, c, wEnd],
    isFirst ? [1, 0] : isLast ? [0, 1] : [0, 1, 0],
  );

  // Heavy transforms collapse to identity under reduced motion — the
  // crossfade (opacity) is kept, but no zoom / slide / rotate / blur.
  const scale = useTransform(
    progress,
    [wStart, wMid, wEnd],
    reduced
      ? [1, 1, 1]
      : effect === "kenBurns"
        ? [1.0, 1.06, 1.14]
        : effect === "rotateScale"
          ? [0.92, 1.02, 1.06]
          : effect === "blurZoom"
            ? [1.18, 1, 1.04]
            : effect === "dollyZoom"
              ? [1.4, 1, 0.92]
              : effect === "diagonal"
                ? [1.06, 1, 1.06]
                : [1, 1, 1],
  );

  const x = useTransform(
    progress,
    [wStart, wEnd],
    reduced
      ? ["0%", "0%"]
      : effect === "slideX"
        ? ["35%", "-35%"]
        : effect === "diagonal"
          ? ["-15%", "15%"]
          : ["0%", "0%"],
  );

  const y = useTransform(
    progress,
    [wStart, wEnd],
    reduced
      ? ["0%", "0%"]
      : effect === "slideY"
        ? ["28%", "-28%"]
        : effect === "diagonal"
          ? ["-15%", "15%"]
          : ["0%", "0%"],
  );

  const rotate = useTransform(
    progress,
    [wStart, wEnd],
    reduced ? [0, 0] : effect === "rotateScale" ? [-5, 5] : [0, 0],
  );

  const blurAmt = useTransform(
    progress,
    [wStart, wMid, wEnd],
    reduced ? [0, 0, 0] : effect === "blurZoom" ? [22, 0, 14] : [0, 0, 0],
  );
  const saturateAmt = useTransform(
    progress,
    [wStart, wMid, wEnd],
    reduced ? [1, 1, 1] : effect === "saturate" ? [0.1, 1.15, 0.1] : [1, 1, 1],
  );
  const filter = useTransform(
    [blurAmt, saturateAmt],
    ([b, s]) => `blur(${b}px) saturate(${s})`,
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        scale,
        x,
        y,
        rotate,
        filter,
        willChange: "transform, opacity, filter",
      }}
    >
      <Image
        src={photo.src}
        alt={photoAlt(photo)}
        fill
        priority={index < 2}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: photo.focus ?? "center" }}
      />
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   ScrollPhotoCaption — text card per photo + a "tap to view" hint
   that doubles as an explicit, keyboard-reachable open button.
   ────────────────────────────────────────────────────────── */
function ScrollPhotoCaption({
  photo,
  index,
  total,
  progress,
  hint,
  onOpen,
}: {
  photo: GalleryPhoto;
  index: number;
  total: number;
  progress: MotionValue<number>;
  hint: string;
  onOpen: () => void;
}) {
  const { c, wStart, wEnd } = photoWindow(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const inHold = (wStart + c) / 2;
  const outHold = (c + wEnd) / 2;

  const opacity = useTransform(
    progress,
    isFirst
      ? [c, outHold, wEnd]
      : isLast
        ? [wStart, inHold, c]
        : [wStart, inHold, outHold, wEnd],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    isFirst ? [c, wEnd] : isLast ? [wStart, c] : [wStart, c, wEnd],
    isFirst ? [0, -22] : isLast ? [26, 0] : [26, 0, -22],
  );

  return (
    <motion.div
      className="absolute bottom-10 md:bottom-14 left-6 md:left-10 z-10 max-w-[78%] md:max-w-[60%]"
      style={{ opacity, y }}
    >
      <p className="kerning text-[9.5px] md:text-[10px] text-gold/90 mb-1 md:mb-2 pointer-events-none">
        {String(index + 1).padStart(2, "0")} · {photo.year}
      </p>
      <p
        className="font-display italic text-cream leading-[0.95] drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)] pointer-events-none"
        style={{ fontSize: "clamp(2rem, 6.5vw, 4.25rem)" }}
      >
        {photo.caption}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 md:mt-4 inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 rounded-full text-[10px] md:text-[11px] kerning text-cream/80 hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <span
          aria-hidden
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gold/70 text-gold"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {hint}
      </button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   PhotoCounter — live "01 / 12" + prev/next nav buttons.
   ────────────────────────────────────────────────────────── */
function PhotoCounter({
  total,
  progress,
  onStep,
}: {
  total: number;
  progress: MotionValue<number>;
  onStep: (dir: number) => void;
}) {
  const current = useTransform(progress, (p) => {
    const idx = total > 1 ? Math.round(p * (total - 1)) : 0;
    return Math.max(1, Math.min(total, idx + 1));
  });

  return (
    <div className="absolute top-6 md:top-10 right-6 md:right-10 z-10 flex items-center gap-1.5">
      <motion.span className="kerning text-[14px] md:text-[18px] text-cream/95 tabular-nums">
        <CounterDigits value={current} />
      </motion.span>
      <span className="kerning text-[10px] md:text-[12px] text-cream/55">
        / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

function CounterDigits({ value }: { value: MotionValue<number> }) {
  const text = useTransform(value, (v) => String(v).padStart(2, "0"));
  return <motion.span>{text}</motion.span>;
}

/* ──────────────────────────────────────────────────────────
   PhotoDots — vertical dot rail on the right; each dot is a real
   nav button (clicking scrolls the reel to that photo).
   ────────────────────────────────────────────────────────── */
function PhotoDots({
  total,
  progress,
  onJump,
  label,
}: {
  total: number;
  progress: MotionValue<number>;
  onJump: (i: number) => void;
  label: string;
}) {
  return (
    <div className="hidden md:flex flex-col items-center gap-1 absolute right-5 lg:right-9 top-1/2 -translate-y-1/2 z-10">
      {Array.from({ length: total }).map((_, i) => (
        <Dot
          key={i}
          index={i}
          total={total}
          progress={progress}
          onClick={() => onJump(i)}
          label={`${label} ${i + 1}`}
        />
      ))}
    </div>
  );
}

function Dot({
  index,
  total,
  progress,
  onClick,
  label,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  onClick: () => void;
  label: string;
}) {
  const { c, wStart, wEnd } = photoWindow(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const opacity = useTransform(
    progress,
    isFirst ? [c, wEnd] : isLast ? [wStart, c] : [wStart, c, wEnd],
    isFirst ? [1, 0.35] : isLast ? [0.35, 1] : [0.35, 1, 0.35],
  );
  const scale = useTransform(
    progress,
    isFirst ? [c, wEnd] : isLast ? [wStart, c] : [wStart, c, wEnd],
    isFirst ? [1.6, 1] : isLast ? [1, 1.6] : [1, 1.6, 1],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // 24px hit area (with internal padding) keeps the rail discreet
      // but easily clickable; the visible dot stays 6px.
      className="group flex h-6 w-6 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80"
    >
      <motion.span
        style={{ opacity, scale }}
        className="block w-1.5 h-1.5 rounded-full bg-gold transition-transform group-hover:scale-150"
      />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   ScrollCue — fades out as soon as the user starts scrolling.
   ────────────────────────────────────────────────────────── */
function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.05], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
    >
      <span className="kerning text-[9px] text-cream/65">Scroll</span>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-px h-8 md:h-10 bg-gradient-to-b from-cream/55 to-transparent"
      />
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   Lightbox — full-screen dark modal viewer.

   · role="dialog" aria-modal + accessible label
   · focus moves to the close button on open; ESC + backdrop close
   · prev/next via buttons, arrow keys, and touch swipe
   · counter + caption; ≥44px touch targets; reduced-motion aware
   ────────────────────────────────────────────────────────── */
function Lightbox({
  index,
  onClose,
  onNavigate,
  reduced,
  t,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
  reduced: boolean;
  t: (key: Parameters<ReturnType<typeof useLanguage>["t"]>[0]) => string;
}) {
  const N = galleryPhotos.length;
  const photo = galleryPhotos[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [dir, setDir] = useState(0); // for slide direction of the image

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      onNavigate((index + delta + N) % N);
    },
    [index, N, onNavigate],
  );

  // Move focus to the close button on open; lock body scroll; restore
  // focus + scroll on unmount.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevActive = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, []);

  // Keyboard: ESC closes, arrows navigate, Tab is trapped within dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const fade = reduced
    ? { duration: 0.15 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

  const imgVariants = reduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (d: number) => ({ opacity: 0, x: d >= 0 ? 60 : -60, scale: 0.98 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -60 : 60, scale: 0.98 }),
      };

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("gallery.viewer")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/95 backdrop-blur-md"
      onClick={(e) => {
        // Backdrop click closes (only when the click is on the backdrop
        // itself, not bubbled from inner controls/image).
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* Close */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t("gallery.close")}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cream/25 bg-ink/40 text-cream/90 hover:bg-ink/70 hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 kerning text-[12px] md:text-[14px] text-cream/80 tabular-nums">
        {String(index + 1).padStart(2, "0")}
        <span className="text-cream/45"> / {String(N).padStart(2, "0")}</span>
      </div>

      {/* Prev */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={t("gallery.prev")}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-cream/25 bg-ink/40 text-cream/90 hover:bg-ink/70 hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={t("gallery.next")}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-cream/25 bg-ink/40 text-cream/90 hover:bg-ink/70 hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Image stage */}
      <div className="relative h-[78vh] w-[88vw] md:h-[82vh] md:w-[78vw] max-w-6xl">
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.div
            key={photo.src}
            custom={dir}
            variants={imgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={fade}
            className="absolute inset-0"
          >
            <Image
              src={photo.src}
              alt={photoAlt(photo)}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-10 text-center px-6 pointer-events-none">
        <p className="font-display italic text-cream text-2xl md:text-4xl leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
          {photo.caption}
        </p>
        <p className="kerning mt-1 text-[10px] md:text-[11px] text-gold/90">
          {photo.year}
        </p>
      </div>
    </motion.div>
  );
}
