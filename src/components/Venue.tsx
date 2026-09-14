"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { couple } from "@/lib/couple";
import { events } from "@/lib/events";
import { formatShortDate } from "@/lib/cn";
import { useLanguage } from "./LanguageProvider";

// Lazy-load the Three.js globe so the r3f + drei chunks don't land
// in the first paint bundle. The Venue section sits well below the
// fold, so we can defer the ~130 KB of 3D code until it's needed.
const VenueGlobe = dynamic(
  () => import("./VenueGlobe").then((m) => ({ default: m.VenueGlobe })),
  { ssr: false, loading: () => <GlobeFallback /> },
);

/**
 * Venue section — renders an embedded Google Map + directions link
 * once `couple.venue.mapsQuery` is set; otherwise shows an elegant
 * "revealing soon" placeholder so the page never looks broken while
 * the venue is being finalised. Embedded via the keyless public
 * `maps.google.com/maps?q=…&output=embed` pattern — works without
 * an API key and loads lazily.
 */
export function Venue() {
  const { t, lang } = useLanguage();

  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";

  const { name, city, mapsQuery } = couple.venue;
  // Optional exact short link supplied by the client (e.g. a
  // maps.app.goo.gl pin). When present we open this directly for
  // directions instead of a name-based search.
  const mapsUrl = (couple.venue as { mapsUrl?: string }).mapsUrl;
  // Cast through `string` because `couple` is `as const` — literal
  // types can't compare against the TBD sentinels otherwise.
  const hasVenue =
    (mapsQuery as string) !== "" && (name as string) !== "TBD";

  return (
    <section className="relative py-24 md:py-28 lg:py-32 px-6 bg-paper">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className={`text-[10px] md:text-[11px] text-indigo/55 ${kerningClass}`}>
            {t("venue.eyebrow")}
          </span>
          <h2 className={`mt-3 md:mt-4 text-[2rem] sm:text-4xl md:text-5xl text-ink leading-tight ${displayClass}`}>
            {t("venue.heading")}
          </h2>
        </motion.div>

        {hasVenue ? (
          <VenueRevealed name={name} city={city} mapsQuery={mapsQuery} mapsUrl={mapsUrl} />
        ) : (
          <VenuePlaceholder />
        )}

        <VenueBreakdown />
      </div>
    </section>
  );
}

/**
 * Ceremony-by-ceremony venue list — shown beneath the main globe
 * card so guests can see at a glance that Haldi/Mehndi are at the
 * Varshney family residence, Vivah is at Kalash Banquet Hall, and the
 * Sangeet venue is still being finalised. Events whose `venue` is
 * flagged `tentative` show a soft gold badge + an italic note so
 * nobody treats the placeholder as final.
 */
function VenueBreakdown() {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifClass = lang === "en" ? "font-serif" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 md:mt-20 max-w-3xl mx-auto"
    >
      <div className="text-center mb-8 md:mb-10">
        <span className={`text-[10px] md:text-[11px] text-indigo/55 ${kerningClass}`}>
          {t("venue.breakdown.eyebrow")}
        </span>
        <h3 className={`mt-2 md:mt-3 text-2xl md:text-3xl text-ink leading-tight ${displayClass}`}>
          {t("venue.breakdown.heading")}
        </h3>
      </div>

      <ul className="divide-y divide-indigo/15 border-t border-b border-indigo/15">
        {events.map((ev, i) => (
          <motion.li
            key={ev.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="py-5 md:py-6 grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_2fr] gap-3 sm:gap-6 items-start"
          >
            <div className="min-w-0">
              <p className={`text-xl sm:text-2xl text-ink leading-none ${displayClass}`}>
                {ev.name}
              </p>
              <p className={`mt-1 text-[10px] text-indigo/60 ${kerningClass}`}>
                {lang === "en"
                  ? formatShortDate(ev.date)
                  : t(`events.${ev.i18nKey}.shortDate` as const)}
              </p>
            </div>

            <div className="min-w-0 text-left sm:text-right">
              {ev.venue ? (
                <>
                  <p className={`text-base sm:text-lg text-ink/85 leading-tight ${serifClass}`}>
                    {ev.venue.name}
                    {ev.venue.tentative && (
                      <span
                        className={`ml-2 align-middle inline-block px-2 py-[2px] text-[9px] tracking-[0.14em] uppercase text-gold border border-gold/50 rounded-sm ${kerningClass}`}
                      >
                        {t("venue.breakdown.tentative")}
                      </span>
                    )}
                  </p>
                  <p className={`mt-1 text-xs sm:text-sm text-ink/55 ${serifItalicClass}`}>
                    {ev.venue.city}
                  </p>
                  {ev.venue.tentative && (
                    <p className={`mt-2 text-[11px] text-ink/50 max-w-xs sm:ml-auto ${serifItalicClass}`}>
                      {t("venue.breakdown.tentative_note")}
                    </p>
                  )}
                </>
              ) : (
                <p className={`text-sm text-ink/50 ${serifItalicClass}`}>
                  {t("venue.breakdown.tbd")}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function VenueRevealed({
  name,
  city,
  mapsQuery,
  mapsUrl,
}: {
  name: string;
  city: string;
  mapsQuery: string;
  mapsUrl?: string;
}) {
  const { t, lang } = useLanguage();
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";

  const [opening, setOpening] = useState(false);

  // Prefer the client's exact pin link when supplied; otherwise fall
  // back to a name-based Google Maps search.
  const directionsHref =
    mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      mapsQuery,
    )}`;

  // Cinematic handoff to Google Maps — zoom/blur the globe, fade in
  // a gold "Opening directions…" overlay, then open Maps in a new
  // tab so guests land on a live directions view.
  const openDirections = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => {
      window.open(directionsHref, "_blank", "noopener");
      // Release state after another beat so repeat taps still work
      // if the user closes the Maps tab and comes back.
      window.setTimeout(() => setOpening(false), 1100);
    }, 900);
  };

  return (
    <div className="grid md:grid-cols-[1fr_1.4fr] gap-8 md:gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-center md:text-left"
      >
        <p className={`text-gold text-2xl sm:text-3xl md:text-4xl leading-tight ${displayClass}`}>
          {name}
        </p>
        <p className={`mt-2 md:mt-3 text-base md:text-lg text-ink/75 ${serifItalicClass}`}>
          {city}
        </p>

        <div className="hairline my-6 md:my-7 max-w-[70px] mx-auto md:mx-0 text-indigo/40" />

        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`group inline-flex items-center gap-2 text-gold hover:text-indigo text-sm md:text-base border-b border-gold/50 hover:border-indigo/50 pb-1 transition-colors ${serifItalicClass}`}
        >
          {t("venue.directions")}
          <ArrowIcon />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-sm overflow-hidden bg-[#0A0A1E] shadow-[0_18px_50px_rgba(15,15,38,0.28)]"
      >
        {/* Soft gold halo behind the canvas — gives the globe a
            lit-planet feel against the cream section background. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(212,168,75,0.18), transparent 65%)",
          }}
        />
        <div className="relative w-full aspect-square max-w-[420px] mx-auto">
          {/* Globe + attention layers scale together during the
              directions-handoff animation so the whole composition
              reads as one "zooming in" gesture. */}
          <motion.div
            animate={{
              scale: opening ? 1.35 : 1,
              filter: opening ? "blur(1.5px) brightness(1.1)" : "blur(0px) brightness(1)",
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <VenueGlobe
              lat={couple.venue.lat}
              lng={couple.venue.lng}
              onPinTap={openDirections}
            />

            {/* Concentric sonar rings — expand outward from pin area. */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute rounded-full border border-gold/70"
                  style={{
                    width: "24%",
                    height: "24%",
                    animation: `venue-ping 2.8s ease-out ${i * 0.9}s infinite`,
                    boxShadow: "0 0 12px rgba(212,168,75,0.55)",
                  }}
                />
              ))}
            </div>

            {/* Floating venue caption + downward arrow above globe. */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 -translate-x-1/2 top-3 md:top-4 flex flex-col items-center pointer-events-none"
            >
              <span className="kerning text-[9px] md:text-[10px] text-gold/90">
                {couple.venue.name}
              </span>
              <motion.svg
                viewBox="0 0 12 28"
                width={10}
                height={24}
                className="mt-1 text-gold/80"
                animate={{ y: [0, 4, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <line x1="6" y1="0" x2="6" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <path d="M 2 18 L 6 24 L 10 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.div>
          </motion.div>


          {/* Directions-handoff flash — radial gold bloom + text.
              Mounted only during `opening` so it never interferes
              when the user isn't actively opening the map. */}
          <AnimatePresence>
            {opening && (
              <>
                <motion.div
                  key="flash"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 2 }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(212,168,75,0.5) 0%, rgba(212,168,75,0.15) 40%, transparent 70%)",
                  }}
                />
                <motion.div
                  key="opening-text"
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="flex flex-col items-center gap-3">
                    <PulseBeacon />
                    <span className={`text-gold text-sm md:text-base ${displayClass}`}>
                      {t("venue.opening_directions")}
                    </span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        {/* Gold frame trim */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none border border-gold/30"
        />
      </motion.div>
    </div>
  );
}

function VenuePlaceholder() {
  const { t, lang } = useLanguage();
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="text-center max-w-xl mx-auto"
    >
      <div className="relative inline-flex items-center justify-center">
        {/* Pulsing halo (same breath cadence as the sacred section halos) */}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-56 h-56 md:w-64 md:h-64 rounded-full bg-gold/30 blur-[40px] pointer-events-none"
        />

        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border border-gold/50 bg-cream/40 backdrop-blur-sm flex items-center justify-center shadow-[0_10px_36px_rgba(212,168,75,0.18)]">
          <div className="flex flex-col items-center">
            <MapPinGlyph />
            <p className={`mt-3 text-gold text-lg md:text-xl leading-none ${displayClass}`}>
              {t("venue.tbd_heading")}
            </p>
          </div>
        </div>
      </div>

      <p className={`mt-8 md:mt-10 text-ink/70 text-sm md:text-base max-w-md mx-auto leading-relaxed ${serifItalicClass}`}>
        {t("venue.tbd_body")}
      </p>
    </motion.div>
  );
}

function PulseBeacon() {
  return (
    <motion.div
      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      className="w-3 h-3 rounded-full bg-gold"
      style={{ boxShadow: "0 0 18px rgba(212,168,75,0.9)" }}
    />
  );
}

function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0A0A1E]">
      <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border border-gold/30 bg-gradient-to-br from-indigo to-ink animate-pulse" />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-hover:translate-x-1"
      aria-hidden
    >
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  );
}

function MapPinGlyph() {
  return (
    <svg
      viewBox="0 0 40 48"
      width={42}
      height={50}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="text-gold"
      aria-hidden
    >
      <path d="M 20 4 C 11 4 5 10 5 18 C 5 28 20 44 20 44 C 20 44 35 28 35 18 C 35 10 29 4 20 4 Z" />
      <circle cx="20" cy="18" r="5" fill="currentColor" opacity="0.35" />
      <circle cx="20" cy="18" r="2.2" fill="currentColor" />
    </svg>
  );
}
