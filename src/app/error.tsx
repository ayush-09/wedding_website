"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Monogram } from "@/components/Monogram";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[wedding] runtime error", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-ink text-cream flex flex-col items-center justify-center px-6 py-20 grain">
      <Monogram size={96} tone="gold" className="text-gold mx-auto" />
      <h1 className="mt-8 font-display italic text-4xl md:text-5xl">A small hiccup in the story</h1>
      <p className="mt-4 font-serif italic text-cream/70 text-center max-w-md">
        Something went unexpectedly quiet. Try again, or return home.
      </p>
      <div className="mt-10 flex items-center gap-6">
        <button
          onClick={reset}
          className="kerning text-[11px] text-gold border-b border-gold/50 hover:border-gold pb-1 transition-colors"
        >
          try again
        </button>
        <Link
          href="/"
          className="kerning text-[11px] text-cream/70 hover:text-cream pb-1 transition-colors"
        >
          ← back home
        </Link>
      </div>
    </main>
  );
}
