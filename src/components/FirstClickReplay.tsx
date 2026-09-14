"use client";

import { useEffect } from "react";

export default function FirstClickReplay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFirst = () => {
      try {
        try {
          console.debug("[FirstClickReplay] first gesture detected — setting flag and dispatching");
        } catch {}
        // Mark global flag so components that mount later can detect
        // a prior user gesture and attempt playback immediately.
        try {
          (window as any).__fa_user_gesture = true;
        } catch {}
        window.dispatchEvent(new Event("fa-user-gesture"));
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
