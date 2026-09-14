"use client";

import { useEffect } from "react";

export default function FirstClickReplay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFirst = () => {
      try {
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
