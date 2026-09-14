"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/background.mp3";
const DEFAULT_VOLUME = 0.5; // clearly audible once the seal tap unlocks audio (was 0.18 — barely there)
const FADE_IN_S = 0.9;
const FADE_TOGGLE_S = 0.35;
const FADE_HIDE_S = 0.55;

// Scan the decoded buffer for the first/last non-silent samples so we can
// set precise loopStart/loopEnd and avoid the silence padding that MP3
// encoders add to each file (the usual source of an audible gap between
// loops).
function findLoopBounds(buffer: AudioBuffer): { loopStart: number; loopEnd: number } {
  const threshold = 0.002;
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  let start = 0;
  while (start < data.length && Math.abs(data[start]) < threshold) start++;
  let end = data.length - 1;
  while (end > start && Math.abs(data[end]) < threshold) end--;
  return {
    loopStart: start / sampleRate,
    loopEnd: (end + 1) / sampleRate,
  };
}

export function MusicPlayer() {
  const [available, setAvailable] = useState(false);
  const [muted, setMuted] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const loopBoundsRef = useRef<{ loopStart: number; loopEnd: number } | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const Ctor: typeof AudioContext | undefined =
      typeof window !== "undefined"
        ? window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;
    if (!Ctor) return;

    const ctx = new Ctor();
    ctxRef.current = ctx;

    fetch(AUDIO_SRC)
      .then((r) => {
        if (!r.ok) throw new Error("missing audio");
        return r.arrayBuffer();
      })
      .then((ab) => ctx.decodeAudioData(ab.slice(0)))
      .then((decoded) => {
        if (cancelled) return;
        bufferRef.current = decoded;
        loopBoundsRef.current = findLoopBounds(decoded);
        setAvailable(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      try {
        sourceRef.current?.stop();
      } catch {}
      sourceRef.current?.disconnect();
      gainRef.current?.disconnect();
      ctx.close().catch(() => {});
    };
  }, []);

  const startPlayback = useCallback(() => {
    if (startedRef.current) return;
    const ctx = ctxRef.current;
    const buffer = bufferRef.current;
    const bounds = loopBoundsRef.current;
    if (!ctx || !buffer || !bounds) return;

    try {
      console.debug("[MusicPlayer] startPlayback() — starting background loop");
    } catch {}

    if (ctx.state === "suspended") void ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = bounds.loopStart;
    source.loopEnd = bounds.loopEnd;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(gain);
    gain.connect(ctx.destination);

    try {
      source.start(0, bounds.loopStart);
    } catch {
      return;
    }

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(DEFAULT_VOLUME, now + FADE_IN_S);

    sourceRef.current = source;
    gainRef.current = gain;
    startedRef.current = true;
  }, []);

  // Start music only when the main invitation becomes visible (envelope
  // opens + 900ms → `fa-tour-start`). Don't start during the cinematic
  // intro or on arbitrary clicks.
  useEffect(() => {
    if (!available) return;
    const onTourStart = () => startPlayback();
    window.addEventListener("fa-tour-start", onTourStart);
    return () => window.removeEventListener("fa-tour-start", onTourStart);
  }, [available, startPlayback]);

  // Smooth fade on tab hide/show — the source never stops, so the loop
  // position is preserved. User perceives continuous playback.
  useEffect(() => {
    if (!available) return;

    const onVisibilityChange = () => {
      const ctx = ctxRef.current;
      const gain = gainRef.current;
      if (!ctx || !gain) return;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      if (document.hidden) {
        gain.gain.linearRampToValueAtTime(0, now + FADE_HIDE_S);
      } else if (!muted) {
        gain.gain.linearRampToValueAtTime(DEFAULT_VOLUME, now + FADE_HIDE_S);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [available, muted]);

  // Listen for a first user gesture to resume the AudioContext only.
  // Do NOT start playback here — background music must only begin on
  // the `fa-tour-start` event so it aligns with the invitation flow.
  useEffect(() => {
    if (!available) return;

    const onFirstGesture = () => {
      try {
        console.debug("[MusicPlayer] first user gesture — resuming AudioContext if suspended");
      } catch {}
      const ctx = ctxRef.current;
      if (ctx && ctx.state === "suspended") void ctx.resume();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };

    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, [available]);

  const toggle = () => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) {
      startPlayback();
      return;
    }
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    if (muted) {
      gain.gain.linearRampToValueAtTime(DEFAULT_VOLUME, now + FADE_TOGGLE_S);
      setMuted(false);
    } else {
      gain.gain.linearRampToValueAtTime(0, now + FADE_TOGGLE_S);
      setMuted(true);
    }
  };

  if (!available) return null;

  const showPlayingIcon = !muted;

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      data-cursor="hover"
      aria-label={showPlayingIcon ? "Mute sound" : "Play sound"}
      className={`fixed bottom-6 right-6 z-[56] w-12 h-12 rounded-full bg-ink border border-gold/40 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-shadow ${
        showPlayingIcon ? "shadow-[0_0_24px_rgba(212,168,75,0.45)]" : ""
      }`}
    >
      <span className="text-gold">
        {showPlayingIcon ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 L6 9 H3 v6 h3 l5 4 Z" />
            <path d="M15.5 8.5 a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5 a9 9 0 0 1 0 13" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 L6 9 H3 v6 h3 l5 4 Z" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        )}
      </span>
    </motion.button>
  );
}
