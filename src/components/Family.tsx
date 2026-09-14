"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { couple } from "@/lib/couple";
import { useLanguage } from "./LanguageProvider";
import { QUOTE_REVEAL } from "./Story";

/**
 * Traditional Indian wedding invitation block.
 *   · Ganesh invocation (Hindu opener)
 *   · Both families — groom LEFT, bride RIGHT
 *   · Formal request of presence + couple names
 *
 * Responsive:
 *   · Mobile: families stack vertically with a horizontal hairline between them
 *   · Desktop: two columns split by a vertical gold gradient seam
 */
export function Family() {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifClass = lang === "en" ? "font-serif" : "font-sanskrit";
  return (
    <section className="relative py-24 md:py-28 lg:py-32 px-6 overflow-hidden">
      {/* Background photograph — full-bleed couple photo behind the
          family invocation. Two-layer motion stack:
            · Outer wrapper handles the entry reveal (fades in + the
              photo zooms out from 1.18 → its resting size as the
              section enters the viewport).
            · Inner wrapper runs a perpetual Ken Burns drift (scale
              breathes 1.05 → 1.10, the photo gently pans left/right
              and tilts a fraction of a degree) so the background
              feels alive even when the user lingers on the
              invocation. Soft saturation breathe adds cinematic
              warmth.
          The veil layer at z-[1] above keeps the dark editorial
          text readable while the photograph bleeds through. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <motion.div
          initial={{ scale: 1.18 }}
          whileInView={{ scale: 1.06 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full"
        >
          <motion.div
            animate={{
              scale: [1.04, 1.1, 1.05, 1.04],
              x: ["0%", "-1.6%", "1%", "0%"],
              y: ["0%", "0.8%", "-0.6%", "0%"],
              filter: [
                "saturate(1)",
                "saturate(1.1)",
                "saturate(1.04)",
                "saturate(1)",
              ],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.35, 0.7, 1],
            }}
            className="relative w-full h-full"
            style={{ willChange: "transform, filter" }}
          >
            <Image
              src="/images/IMG-20251222-WA0065.jpg.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 30%" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
      <div aria-hidden className="family-veil absolute inset-0 z-[1] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Ganesh emblem + invocation — devotional opener mirroring
            the envelope card, larger here to anchor the section. */}
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center"
          >
            {/* Pulsing gold halo */}
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.5, 0.22] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gold/35 blur-[42px]" />
            </motion.div>

            <Image
              src="/images/ganesh.png"
              alt="Shri Ganesha"
              width={144}
              height={144}
              className="relative w-[116px] md:w-[144px] h-auto"
              style={{
                filter: "drop-shadow(0 0 20px rgba(212,168,75,0.45))",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center mt-2 md:mt-3"
          >
            <p className="sanskrit text-2xl sm:text-3xl md:text-4xl text-gold leading-tight">
              ॐ श्री गणेशाय नमः
            </p>
            <p className="mt-2 kerning text-[9px] text-indigo/60">
              oṁ śrī gaṇeśāya namaḥ
            </p>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`text-center mt-8 md:mt-10 italic text-base md:text-lg text-ink/75 ${
            lang === "en" ? "font-serif" : "font-sanskrit not-italic"
          }`}
        >
          {t("family.blessings")}
        </motion.p>

        <div className="hairline text-indigo/40 mt-8 md:mt-10 max-w-[100px] mx-auto" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="text-center mt-12 md:mt-14"
        >
          <span className={`text-[10px] md:text-[11px] text-indigo/55 ${kerningClass}`}>
            {t("family.our_families")}
          </span>
          <h2 className={`mt-3 md:mt-4 text-[2rem] sm:text-4xl md:text-5xl text-ink leading-[1.1] ${displayClass}`}>
            {t("family.joined")}
          </h2>
        </motion.div>

        {/* Two families */}
        <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-10 md:gap-20 relative">
          {/* Desktop vertical seam */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px hidden md:block bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          {/* Mobile horizontal divider between stacked columns */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-px md:hidden bg-gold/40" />

          <FamilyColumn
            label={t("family.groom_family")}
            surname={couple.families.groom.surname}
            father={couple.families.groom.father}
            mother={couple.families.groom.mother}
            withChildren={couple.families.groom.withChildren}
            blessedBy={couple.families.groom.blessedBy}
            personalQuote="From planning to marry her… destiny gave me the path to walk towards her."
            delay={0}
          />
          <FamilyColumn
            label={t("family.bride_family")}
            surname={couple.families.bride.surname}
            father={couple.families.bride.father}
            mother={couple.families.bride.mother}
            withChildren={couple.families.bride.withChildren}
            blessedBy={couple.families.bride.blessedBy}
            personalQuote="The elder daughter finally found a place where she doesn't have to be strong."
            delay={0.15}
          />
        </div>

        {/* Closing request */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="hairline text-indigo/40 max-w-[80px] mx-auto mb-8 md:mb-10" />
          <p className={`italic text-base md:text-lg lg:text-xl text-ink/80 max-w-2xl mx-auto leading-relaxed ${
            lang === "en" ? "font-serif" : "font-sanskrit not-italic"
          }`}>
            {t("family.request")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FamilyColumn({
  label,
  surname,
  father,
  mother,
  withChildren,
  blessedBy,
  personalQuote,
  delay,
}: {
  label: string;
  surname: string;
  father: string;
  mother: string;
  withChildren: string;
  blessedBy: string;
  /** Optional personal sentence shown below the blessing line —
   *  one for the groom, one for the bride. */
  personalQuote?: string;
  delay: number;
}) {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <span className={`text-[9px] text-indigo/50 ${kerningClass}`}>{label}</span>
      <ZigzagText
        text={t("family.surname_template", { surname })}
        className={`mt-3 text-xl sm:text-2xl md:text-3xl text-gold leading-tight ${displayClass}`}
        delayBase={delay + 0.25}
      />

      <div className="mt-6 md:mt-8 space-y-1.5">
        <p className="font-serif text-base md:text-lg lg:text-xl text-ink">{father}</p>
        <p className="font-serif italic text-sm md:text-base text-ink/55">&amp;</p>
        <p className="font-serif text-base md:text-lg lg:text-xl text-ink">{mother}</p>
      </div>

      <p className="mt-5 md:mt-6 font-serif italic text-sm md:text-base text-ink/70 max-w-xs mx-auto">
        {withChildren}
      </p>

      <div className="hairline text-indigo/30 max-w-[60px] mx-auto mt-6 md:mt-8 mb-4" />

      <p className="font-serif italic text-xs md:text-sm text-ink/55 max-w-xs mx-auto leading-relaxed">
        {blessedBy}
      </p>

      {/* Personal whisper — one quiet line per side. Same fade-up-
          and-unblur signature as the Story-section quotes, so all
          four phrases on the site share one entrance language. */}
      {personalQuote && (
        <motion.div
          {...QUOTE_REVEAL}
          transition={{ ...QUOTE_REVEAL.transition, delay: delay + 0.5 }}
          className="mt-7 md:mt-8 max-w-xs mx-auto"
        >
          <span aria-hidden className="block text-gold/70 text-sm leading-none">
            {"❦"}
          </span>
          <p className="mt-2 font-display italic text-[13px] md:text-sm text-ink/80 leading-relaxed">
            {personalQuote}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   ZigzagText
   Per-character entrance: each letter starts displaced
   alternately above/below the baseline (with a small
   counter-rotated tilt) and waves into place with a slow
   stagger. Reads as a zigzag of letters arriving — the
   surname literally walks to the centre.
   ────────────────────────────────────────────────────────── */
const ZIGZAG_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};

const ZIGZAG_CHAR: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: i % 2 === 0 ? -22 : 22,
    rotate: i % 2 === 0 ? -6 : 6,
  }),
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function ZigzagText({
  text,
  className,
  delayBase = 0,
}: {
  text: string;
  className?: string;
  delayBase?: number;
}) {
  // Split into Unicode code points so Devanagari surnames
  // (Hindi/Marathi translations) animate one glyph at a time.
  const chars = [...text];
  return (
    <motion.p
      variants={ZIGZAG_CONTAINER}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delayChildren: delayBase }}
      className={className}
      aria-label={text}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={ZIGZAG_CHAR}
          aria-hidden
          className="inline-block"
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </motion.p>
  );
}
