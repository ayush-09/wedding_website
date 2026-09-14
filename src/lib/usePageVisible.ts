"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `document.visibilityState`. Returns `true` when the tab
 * is the foreground tab, `false` when it's in another tab, minimised,
 * or the OS is showing the user a different window.
 *
 * Used to gate heavy per-frame work (cobe rAF, ambient-particle
 * rendering, etc.) so we don't burn the user's CPU while they're
 * away from the wedding site.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    // Sync the initial value after mount so the first render
    // matches SSR (visible=true) and we correct on the client.
    setVisible(document.visibilityState === "visible");

    const onChange = () => {
      setVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}
