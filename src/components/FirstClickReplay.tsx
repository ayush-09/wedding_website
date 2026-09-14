"use client";

import { useEffect } from "react";
import { signalUserGesture } from "@/lib/gesture";

export default function FirstClickReplay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let handled = false;
    const onFirst = () => {
      if (handled) return;
      handled = true;
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
    window.addEventListener("pointerdown", onFirst, { capture: true });
    window.addEventListener("touchstart", onFirst, { capture: true });
    window.addEventListener("click", onFirst, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst, true);
      window.removeEventListener("touchstart", onFirst, true);
      window.removeEventListener("click", onFirst, true);
    };
  }, []);
  return null;
}
