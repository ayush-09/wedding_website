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
        // Mark global flag so components that mount later can detect
        // a prior user gesture and attempt playback immediately.
        try {
        signalUserGesture();
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
