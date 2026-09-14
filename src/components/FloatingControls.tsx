"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

/**
 * Top-of-viewport user-control chrome, split to opposite corners so
 * each control reads as its own affordance:
 *   · Theme toggle → top-left (global site chrome).
 *   · Language pill → top-right (content localisation).
 *
 * Both sit at z-40 — above page content but below the intro (z-100)
 * and envelope (z-95) overlays, so they appear naturally once those
 * dismiss.
 */
export function FloatingControls() {
  const entrance = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <>
      <motion.div
        {...entrance}
        className="fixed top-4 left-4 md:top-6 md:left-8 z-40"
      >
        <ThemeToggle />
      </motion.div>
      <motion.div
        {...entrance}
        className="fixed top-4 right-4 md:top-6 md:right-8 z-40"
      >
        <LanguageToggle />
      </motion.div>
    </>
  );
}
