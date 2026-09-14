import type { Metadata } from "next";
import {
  Italiana,
  Allura,
  Pinyon_Script,
  Cormorant_Garamond,
  Inter,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CinematicIntro } from "@/components/CinematicIntro";
import { CinematicReel } from "@/components/CinematicReel";
import { EnvelopeGate } from "@/components/EnvelopeGate";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount";
import { ScrollTriggerInit } from "@/components/ScrollTriggerInit";
import { MusicPlayer } from "@/components/MusicPlayer";
import { AutoTour } from "@/components/AutoTour";
import { ClientOnly } from "@/components/ClientOnly";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FloatingControls } from "@/components/FloatingControls";
import { EvilEyeCursor } from "@/components/EvilEyeCursor";
import { RomanceAmbience } from "@/components/RomanceAmbience";
import { couple } from "@/lib/couple";

/**
 * Typography system (six voices):
 *   --font-display → Italiana      (ultra-high-contrast Didone, Italian-
 *                                    fashion-magazine display serif; regular
 *                                    weight only — the silhouette carries it)
 *   --font-script  → Allura        (calligraphic flourishes, envelope names)
 *   --font-cipher  → Pinyon Script (formal copperplate with swash capitals,
 *                                    used exclusively for the AF monogram
 *                                    cipher — matches the gold-foil reference)
 *   --font-serif   → Cormorant     (body copy + italic flourishes)
 *   --font-sans    → Inter         (UI, kerned labels)
 *   --font-sanskrit→ Tiro Devanagari Hindi (Sanskrit set in authentic serif)
 */
// `display: "swap"` so text renders in a fallback serif immediately while the
// webfont is still downloading — avoids invisible text on the intro / envelope
// reveal where every second matters.
const display = Italiana({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Didot", "Bodoni 72", "Georgia", "serif"],
  weight: ["400"],
});

const script = Allura({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: ["400"],
});

const cipher = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-cipher",
  display: "swap",
  fallback: ["Allura", "Parisienne", "Great Vibes", "cursive"],
  weight: ["400"],
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sanskrit = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  variable: "--font-sanskrit",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: `${couple.groom.firstName} & ${couple.bride.firstName} — 23.01.2027`,
  description: `Akash Varshney and Falguni Sharma are getting married on the twenty-third of January, two thousand and twenty-seven.`,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/ganesh.png", type: "image/png" },
    ],
    apple: "/images/ganesh.png",
  },
  openGraph: {
    title: `${couple.groom.firstName} & ${couple.bride.firstName}`,
    description: "Join us as we tie the knot — 23.01.2027.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${couple.groom.firstName} & ${couple.bride.firstName}`,
    description: "Join us as we tie the knot — 23.01.2027.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${display.variable} ${script.variable} ${cipher.variable} ${serif.variable} ${sans.variable} ${sanskrit.variable}`}
    >
      <body className="grain font-serif bg-[var(--bg)] text-[var(--fg)]" suppressHydrationWarning>
        {/* Pre-paint splash — server-rendered dark cosmic backdrop sits
            above the cream body and below the intro/envelope so the
            first paint is never a cream-to-dark flash while React
            hydrates. Fades out via .fa-ready once EnvelopeGate
            dismisses, revealing the Hero beneath. */}
        <div
          id="fa-prepaint"
          aria-hidden
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            background:
              "linear-gradient(135deg, #0F0A22 0%, #1B1535 50%, #0A0B20 100%)",
            transition: "opacity 0.9s ease",
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <ClientOnly>
              <ScrollToTopOnMount />
              <ScrollTriggerInit />
              <CinematicIntro />
              <EnvelopeGate />
              <ScrollProgress />
              <CinematicReel />
              <MusicPlayer />
              <AutoTour />
              <FloatingControls />
              <EvilEyeCursor />
              <RomanceAmbience />
            </ClientOnly>
            <SmoothScroll>
              <div className="relative z-10">{children}</div>
            </SmoothScroll>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
