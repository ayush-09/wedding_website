"use client";

import { useEffect } from "react";
import { signalUserGesture } from "@/lib/gesture";

export default function FirstClickReplay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFirst = () => {
      try {
        try {
          console.debug("[FirstClickReplay] first gesture detected — signalling gesture");
        } catch {}
        try {
          const playIntro = (window as any).__fa_play_intro;
          if (typeof playIntro === "function") playIntro();
        } catch {}
        // Mark global flag so components that mount later can detect
        // a prior user gesture and attempt playback immediately.
        try {
          signalUserGesture();
        } catch {}
      } catch {
        // ignore
      }
    };
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("touchstart", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst as any);
      window.removeEventListener("touchstart", onFirst as any);
    };
  }, []);
  return null;
}
