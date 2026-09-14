"use client";

import { useEffect } from "react";
import { playIntroFromGesture, signalUserGesture } from "@/lib/gesture";

export default function FirstClickReplay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let handled = false;
    const onFirst = () => {
      if (handled) return;
      try {
        console.debug("[FirstClickReplay] first gesture detected — signalling gesture");
        const played = playIntroFromGesture();
        // Mark global flag so components that mount later can detect
        // a prior user gesture and attempt playback immediately.
        signalUserGesture();
        handled = played;
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
