import Link from "next/link";
import { Monogram } from "@/components/Monogram";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink text-cream flex flex-col items-center justify-center px-6 py-20 grain">
      <Monogram size={96} tone="gold" className="text-gold mx-auto" />
      <h1 className="mt-8 font-display italic text-4xl md:text-5xl">A page that hasn&rsquo;t been written</h1>
      <p className="mt-4 font-serif italic text-cream/70 text-center max-w-md">
        This corner of our story doesn&rsquo;t exist. Return to the invitation and start again.
      </p>
      <Link
        href="/"
        className="mt-10 kerning text-[11px] text-gold border-b border-gold/50 hover:border-gold pb-1 transition-colors"
      >
        ← back to the beginning
      </Link>
    </main>
  );
}
