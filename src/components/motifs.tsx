import { cn } from "@/lib/cn";

type MotifProps = { size?: number; className?: string };

export function Om({ size = 120, className }: MotifProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn("select-none", className)} aria-label="Om">
      <defs>
        <radialGradient id="om-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#D4A84B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D4A84B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#om-glow)" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize="68"
        fontFamily="var(--font-sanskrit), 'Noto Serif Devanagari', serif"
        fontWeight="600"
        fill="currentColor"
      >
        &#x0950;
      </text>
    </svg>
  );
}

export function Trishul({ size = 80, className }: MotifProps) {
  return (
    <svg viewBox="0 0 60 120" width={(size * 60) / 120} height={size} className={cn(className)} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Shaft */}
        <line x1="30" y1="110" x2="30" y2="48" />
        {/* Middle prong */}
        <path d="M30 48 L 30 10 L 26 16 M30 10 L 34 16" />
        {/* Left prong */}
        <path d="M30 48 Q 12 45 10 22 L 12 30 M 10 22 L 16 28" />
        {/* Right prong */}
        <path d="M30 48 Q 48 45 50 22 L 48 30 M 50 22 L 44 28" />
        {/* Cross-bar ornament */}
        <path d="M 20 48 L 40 48" />
        <circle cx="30" cy="58" r="3" fill="currentColor" opacity="0.6" />
        {/* Tassel at bottom */}
        <path d="M 26 110 L 30 118 L 34 110" />
      </g>
    </svg>
  );
}

export function Damaru({ size = 60, className }: MotifProps) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={cn(className)} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M 20 15 L 60 15 L 48 38 L 60 62 L 20 62 L 32 38 Z" />
        <line x1="32" y1="38" x2="48" y2="38" strokeWidth="1" />
        {/* Beads on strings */}
        <circle cx="14" cy="38" r="1.5" fill="currentColor" />
        <circle cx="66" cy="38" r="1.5" fill="currentColor" />
        <path d="M 32 38 L 14 38" />
        <path d="M 48 38 L 66 38" />
      </g>
    </svg>
  );
}

export function Kailash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="peak" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="peak2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Back range */}
      <path
        d="M 0 400 L 0 240 L 220 110 L 380 190 L 520 130 L 720 220 L 900 140 L 1080 210 L 1280 120 L 1460 200 L 1600 150 L 1600 400 Z"
        fill="url(#peak)"
      />
      {/* Mid range */}
      <path
        d="M 0 400 L 0 300 L 180 230 L 340 280 L 520 210 L 700 290 L 900 240 L 1100 300 L 1300 220 L 1480 280 L 1600 240 L 1600 400 Z"
        fill="url(#peak2)"
      />
      {/* Front central peak — Kailash */}
      <path d="M 600 400 L 780 140 L 820 140 L 1000 400 Z" fill="currentColor" opacity="0.85" />
      <path
        d="M 720 220 L 780 160 L 800 160 L 860 220"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
    </svg>
  );
}

export function CrescentMoon({ size = 60, className }: MotifProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn(className)} aria-hidden>
      <defs>
        <radialGradient id="moon-glow" cx="40%" cy="40%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <path
        d="M 70 20 A 40 40 0 1 0 70 80 A 30 30 0 1 1 70 20 Z"
        fill="url(#moon-glow)"
      />
    </svg>
  );
}

export function Diya({ size = 48, className, flicker = true }: MotifProps & { flicker?: boolean }) {
  return (
    <svg viewBox="0 0 80 100" width={(size * 80) / 100} height={size} className={cn(className)} aria-hidden>
      {/* Bowl */}
      <path d="M 12 70 Q 40 90 68 70 Q 60 78 40 78 Q 20 78 12 70 Z" fill="currentColor" opacity="0.85" />
      <path d="M 10 68 Q 40 84 70 68" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      {/* Wick */}
      <line x1="40" y1="70" x2="40" y2="58" stroke="currentColor" strokeWidth="1" />
      {/* Flame */}
      <g className={flicker ? "origin-bottom" : ""} style={flicker ? { animation: "flicker 1.8s ease-in-out infinite alternate", transformBox: "fill-box", transformOrigin: "center bottom" } : undefined}>
        <path d="M 40 58 Q 32 44 40 30 Q 48 44 40 58 Z" fill="#F39C5B" />
        <path d="M 40 55 Q 36 45 40 36 Q 44 45 40 55 Z" fill="#FFD580" />
      </g>
      <style>{`@keyframes flicker { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.1) translateY(-1px)}}`}</style>
    </svg>
  );
}

export function Rudraksha({ count = 21, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="block rounded-full"
          style={{
            width: 9,
            height: 9,
            background:
              "radial-gradient(circle at 30% 30%, #8A4A2E 0%, #4A1F14 55%, #2A0F08 100%)",
            boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.4), 0 0 4px rgba(212, 168, 75, 0.25)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Ganesh — calligraphic seated glyph matching the Gemini gold-foil
 * reference card. Intentionally flowing rather than diagrammatic:
 *   · tall crown spike with a jewel finial (kalasha-style, not a dome)
 *   · pear-shaped head
 *   · trishul tilak on the forehead (not a dot)
 *   · closed meditative arcs for eyes (not open dots)
 *   · fan ears with a small spiral curl inside each (signature of
 *     the reference — the ears are the "swirl" that sells the style)
 *   · long S-trunk ending in a tight inward coil
 *   · calligraphic shoulder flourishes + seated-body base curls
 *     that suggest ornaments and lap without drawing a literal body
 * Single colour (currentColor) so it inherits gold on either theme.
 */
export function Ganesh({ size = 60, className }: MotifProps) {
  return (
    <svg
      viewBox="0 0 80 104"
      width={(size * 80) / 104}
      height={size}
      className={cn("select-none", className)}
      aria-label="Shri Ganesha"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Crown spike (shaft) */}
        <line x1="40" y1="6" x2="40" y2="17" />
        {/* Crown base cap */}
        <path d="M 36 17 Q 40 19 44 17" />

        {/* Head — flowing pear outline */}
        <path d="M 34 20 Q 24 24 22 34 Q 22 42 30 44 L 50 44 Q 58 42 58 34 Q 56 24 46 20" />

        {/* Forehead trishul tilak */}
        <path d="M 37 24 L 40 22 L 43 24" />
        <line x1="40" y1="22" x2="40" y2="30" />

        {/* Closed meditative eyes */}
        <path d="M 29 32 Q 32 35 35 32" />
        <path d="M 45 32 Q 48 35 51 32" />

        {/* Left fan ear with inward spiral */}
        <path d="M 26 28 Q 12 24 10 34 Q 12 44 26 42" />
        <path d="M 18 33 Q 21 32 22 35 Q 21 37 18 36" strokeWidth="1" />

        {/* Right fan ear with inward spiral */}
        <path d="M 54 28 Q 68 24 70 34 Q 68 44 54 42" />
        <path d="M 62 33 Q 59 32 58 35 Q 59 37 62 36" strokeWidth="1" />

        {/* Tusks */}
        <path d="M 34 42 Q 33 45 34 48" strokeWidth="1.1" />
        <path d="M 46 42 Q 47 45 46 48" strokeWidth="1.1" />

        {/* Trunk — long sweep ending in an inward coil */}
        <path d="M 40 44 Q 37 52 34 60 Q 30 68 36 70 Q 44 71 46 64 Q 45 60 41 60 Q 40 61 42 63" />

        {/* Neck collar — jewellery hint */}
        <path d="M 30 48 Q 40 52 50 48" strokeWidth="0.9" opacity="0.75" />

        {/* Shoulder flourishes — calligraphic body curls */}
        <path d="M 24 50 Q 16 58 20 70 Q 24 78 32 80" />
        <path d="M 56 50 Q 64 58 60 70 Q 56 78 48 80" />

        {/* Seated base curls — decorative, not literal */}
        <path d="M 28 84 Q 34 90 40 88 Q 46 90 52 84" strokeWidth="1.2" />
        <path d="M 34 94 Q 40 98 46 94" strokeWidth="1" opacity="0.75" />
      </g>

      {/* Crown jewel finial */}
      <circle cx="40" cy="4" r="1.8" fill="currentColor" />

      {/* Small ear jewels */}
      <circle cx="12" cy="32" r="0.7" fill="currentColor" opacity="0.7" />
      <circle cx="68" cy="32" r="0.7" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/**
 * ShivaParvati — Ardhanarishwara glyph combining the trishul (Shiva:
 * ascetic, vertical, three prongs pointing up) with a blooming lotus
 * at the base (Parvati: generative, outward, five petals). A crescent
 * rests on the trishul shaft (Shiva's moon) and a bindu sits above
 * the central prong. Single-colour line art + fills so it inherits
 * currentColor on either theme.
 */
export function ShivaParvati({ size = 72, className }: MotifProps) {
  return (
    <svg
      viewBox="0 0 80 92"
      width={(size * 80) / 92}
      height={size}
      className={cn("select-none", className)}
      aria-label="Shiva and Parvati"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Trishul shaft */}
        <line x1="40" y1="58" x2="40" y2="18" />
        {/* Centre prong tip */}
        <path d="M 36 24 L 40 18 L 44 24" />
        {/* Curved left prong */}
        <path d="M 40 58 Q 24 54 22 22 L 25 28 M 22 22 L 27 27" />
        {/* Curved right prong */}
        <path d="M 40 58 Q 56 54 58 22 L 55 28 M 58 22 L 53 27" />
        {/* Cross-bar on trishul base */}
        <path d="M 30 58 L 50 58" />
      </g>

      {/* Shiva's crescent moon on the shaft */}
      <path
        d="M 48 34 Q 55 34 55 40 Q 50 38 48 38 Z"
        fill="currentColor"
        opacity="0.75"
      />

      {/* Bindu above the central prong */}
      <circle cx="40" cy="13" r="1.3" fill="currentColor" />

      {/* Lotus at the base — Parvati */}
      <g fill="currentColor">
        {/* central petal */}
        <path d="M 40 64 Q 38 72 40 80 Q 42 72 40 64 Z" opacity="0.95" />
        {/* inner side petals */}
        <path d="M 32 66 Q 28 72 36 80 Q 36 72 32 66 Z" opacity="0.85" />
        <path d="M 48 66 Q 52 72 44 80 Q 44 72 48 66 Z" opacity="0.85" />
        {/* outer side petals */}
        <path d="M 25 70 Q 20 75 30 82 Q 31 76 25 70 Z" opacity="0.6" />
        <path d="M 55 70 Q 60 75 50 82 Q 49 76 55 70 Z" opacity="0.6" />
      </g>
      {/* lotus base line */}
      <path
        d="M 22 84 Q 40 86 58 84"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

export function TempleArch({ className, size = 200 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 200 240" width={size} height={(size * 240) / 200} className={cn(className)} aria-hidden>
      <path
        d="M 20 240 L 20 120 Q 100 20 180 120 L 180 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 40 240 L 40 130 Q 100 50 160 130 L 160 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <circle cx="100" cy="110" r="4" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
