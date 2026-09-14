"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from "./LanguageProvider";

/**
 * Story — short invitation narrative.
 *
 * The paragraph reveals word-by-word as it enters the viewport so
 * reading the story feels like watching it come to mind rather than
 * finding a wall of text. Punctuation-aware split so commas and the
 * em-dash don't get orphaned to their own "word". Users who've opted
 * into reduced motion get a single fade-in block instead.
 */
export function Story() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const eyebrowClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const headingClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const bodyClass = lang === "en" ? "font-serif" : "font-sanskrit";

  const narrative = t("story.narrative");
  const words = narrative.split(/\s+/).filter(Boolean);

  return (
    <section className="relative py-24 md:py-28 lg:py-32 px-6 bg-cream">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto text-center"
      >
        <span className={`text-[10px] md:text-[11px] text-indigo/55 ${eyebrowClass}`}>
          {t("story.eyebrow")}
        </span>
        <h2 className={`mt-3 md:mt-4 text-[2rem] sm:text-4xl md:text-5xl text-ink leading-tight ${headingClass}`}>
          {t("story.heading")}
        </h2>

        <div className="hairline text-indigo/40 mt-8 md:mt-12 max-w-[80px] mx-auto" />

        {/* Editorial pull-quote \u2014 universal "manifestation" line.
            Sits prominently between the heading and the body so the
            section opens with the spiritual sentiment. Uses the
            shared QUOTE_REVEAL animation so all four whispered
            phrases on the site (this one + the Hinglish line below
            + the two personal lines under each family column) share
            the exact same fade-up-and-unblur signature. */}
        <motion.blockquote
          {...QUOTE_REVEAL}
          transition={{ ...QUOTE_REVEAL.transition, delay: 0.15 }}
          className="mt-10 md:mt-14"
        >
          <p
            className="font-display italic text-ink leading-[1.15]"
            style={{ fontSize: "clamp(1.45rem, 3.4vw, 2.25rem)" }}
          >
            <span className="text-gold/85">{"\u201C"}</span>
            When two hearts manifest the same, the universe definitely listens.
            <span className="text-gold/85">{"\u201D"}</span>
          </p>
        </motion.blockquote>

        {/* Hinglish whisper \u2014 quieter typographic weight, sits as
            a bridging line between the manifestation quote and the
            body narrative. */}
        <motion.p
          {...QUOTE_REVEAL}
          transition={{ ...QUOTE_REVEAL.transition, delay: 0.4 }}
          className="mt-6 md:mt-8 font-serif italic text-ink/65 text-sm md:text-base leading-relaxed tracking-[0.012em] max-w-xl mx-auto"
        >
          Ek waqt tha jab hum chhupte the{"\u2026"} aaj waqt hai jab humari kahani sab dekh rahe hain.
        </motion.p>

        <div className="hairline text-indigo/40 mt-10 md:mt-12 max-w-[60px] mx-auto" />

        {reduced ? (
          <p className={`mt-8 md:mt-12 text-base sm:text-lg md:text-xl lg:text-[1.45rem] text-ink/85 leading-[1.7] ${bodyClass}`}>
            {narrative}
          </p>
        ) : (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={PARAGRAPH}
            className={`mt-8 md:mt-12 text-base sm:text-lg md:text-xl lg:text-[1.45rem] text-ink/85 leading-[1.7] ${bodyClass}`}
          >
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                variants={WORD}
                className="inline-block"
              >
                {word}
                {i < words.length - 1 && "\u00A0"}
              </motion.span>
            ))}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

/**
 * Shared "quote" reveal — used here for the manifestation pull-quote
 * and the Hinglish whisper, and re-declared identically inside
 * `Family.tsx` for the two personal lines under each family column.
 * Keeping the values lined up across components is what makes all
 * four phrases feel like one editorial voice.
 */
export const QUOTE_REVEAL = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.4 } as const,
  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
};

// Orchestrates the reveal: a short lead-in, then each word staggers
// in one after another. 0.04s stagger is slow enough to read as a
// reveal but fast enough that a 60-word paragraph doesn't feel
// punishing on a short section.
const PARAGRAPH: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.04,
    },
  },
};

const WORD: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};
