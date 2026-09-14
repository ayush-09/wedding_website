"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import confetti from "canvas-confetti";
import { events } from "@/lib/events";
import { couple } from "@/lib/couple";
import { formatShortDate } from "@/lib/cn";
import { submitRSVP } from "@/lib/supabase";
import { Button } from "./Button";
import { useLanguage } from "./LanguageProvider";

type Step = "name" | "attending" | "events" | "message" | "done";

export function RSVPForm() {
  const { t, lang } = useLanguage();
  const kerningClass = lang === "en" ? "kerning" : "font-sanskrit tracking-wide";
  const displayClass = lang === "en" ? "font-display italic" : "font-sanskrit";
  const serifClass = lang === "en" ? "font-serif" : "font-sanskrit";
  const serifItalicClass = lang === "en" ? "font-serif italic" : "font-sanskrit";
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleEvent = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const burst = () => {
    const defaults = {
      spread: 360,
      ticks: 120,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 32,
      colors: ["#C9A961", "#5C1F2B", "#E8B7B7", "#F4C430", "#FAF3E7"],
    };
    confetti({ ...defaults, particleCount: 80, scalar: 1.2, origin: { x: 0.2, y: 0.6 } });
    confetti({ ...defaults, particleCount: 80, scalar: 1.2, origin: { x: 0.8, y: 0.6 } });
    confetti({
      ...defaults,
      particleCount: 140,
      scalar: 1,
      origin: { x: 0.5, y: 0.5 },
      shapes: ["circle", "square"],
    });
  };

  return (
    <section id="rsvp" className="relative py-32 px-6 bg-ink text-cream overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg viewBox="0 0 800 800" className="w-full h-full">
          <defs>
            <pattern id="rsvp-paisley" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M50 20 Q 80 30 70 60 Q 60 80 40 70 Q 20 60 30 40 Q 40 25 50 20 Z"
                fill="none"
                stroke="#C9A961"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#rsvp-paisley)" />
        </svg>
      </div>

      <div className="relative text-center mb-12">
        <span className={`text-[11px] text-gold ${kerningClass}`}>{t("rsvp.eyebrow")}</span>
        <h2 className={`mt-3 text-5xl md:text-6xl ${displayClass}`}>
          {t("rsvp.heading_a")} <span className="text-gold">{t("rsvp.heading_b")}</span>
        </h2>
      </div>

      <div className="relative max-w-xl mx-auto border border-cream/15 p-10 rounded-sm bg-cream/[0.03] backdrop-blur shadow-[0_0_60px_rgba(201,169,97,0.08)]">
        {step === "name" && (
          <Stage title={t("rsvp.stage.name.title")} displayClass={displayClass}>
            <input
              className={`w-full bg-transparent border-b border-cream/30 pb-2 text-xl placeholder:text-cream/40 outline-none focus:border-gold transition-colors ${serifClass}`}
              placeholder={t("rsvp.stage.name.placeholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button variant="primary" size="md" disabled={!name.trim()} onClick={() => setStep("attending")}>
              {t("rsvp.continue")}
            </Button>
          </Stage>
        )}

        {step === "attending" && (
          <Stage
            title={t("rsvp.stage.attending.title", { name: name.split(" ")[0] })}
            displayClass={displayClass}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 !py-5"
                onClick={() => {
                  setAttending("yes");
                  setStep("events");
                }}
              >
                {t("rsvp.stage.attending.yes")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 !py-5 !text-cream !border-cream/30 hover:!border-cream hover:!bg-cream hover:!text-ink"
                onClick={() => {
                  setAttending("no");
                  setStep("message");
                }}
              >
                {t("rsvp.stage.attending.no")}
              </Button>
            </div>
          </Stage>
        )}

        {step === "events" && (
          <Stage title={t("rsvp.stage.events.title")} displayClass={displayClass}>
            <div className="grid gap-2">
              {events.map((ev) => {
                const on = selected.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    onClick={() => toggleEvent(ev.id)}
                    data-cursor="hover"
                    className={`flex items-center justify-between px-4 py-3 border transition ${
                      on
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-cream/20 hover:border-cream/50"
                    }`}
                  >
                    <span className={`text-xl ${displayClass}`}>{ev.name}</span>
                    <span className={`text-[10px] opacity-70 ${kerningClass}`}>
                      {lang === "en"
                        ? formatShortDate(ev.date)
                        : t(`events.${ev.i18nKey}.shortDate` as const)}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button variant="primary" size="md" disabled={selected.length === 0} onClick={() => setStep("message")}>
              {t("rsvp.continue")}
            </Button>
          </Stage>
        )}

        {step === "message" && (
          <Stage title={t("rsvp.stage.message.title")} displayClass={displayClass}>
            <textarea
              className={`w-full bg-transparent border border-cream/20 p-3 text-lg placeholder:text-cream/40 outline-none focus:border-gold ${serifClass}`}
              placeholder={t("rsvp.stage.message.placeholder")}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              onClick={async () => {
                if (submitting) return;
                setSubmitting(true);
                setSubmitError(null);

                // Open the guest's mail app pre-filled to the couple.
                // This is the primary delivery channel — the RSVP lands
                // in akashvarshney117@gmail.com once the guest hits send.
                const selectedNames = events
                  .filter((e) => selected.includes(e.id))
                  .map((e) => e.name);
                const subject = `RSVP from ${name.trim()} — Akash & Falguni`;
                const body = [
                  `Name: ${name.trim()}`,
                  `Attending: ${attending === "yes" ? "Yes" : "No"}`,
                  `Ceremonies: ${selectedNames.length ? selectedNames.join(", ") : "—"}`,
                  `Message: ${message.trim() || "—"}`,
                ].join("\n");
                const mailto = `mailto:${couple.contact.rsvpEmail}?subject=${encodeURIComponent(
                  subject,
                )}&body=${encodeURIComponent(body)}`;
                if (typeof window !== "undefined") {
                  window.location.href = mailto;
                }

                // Best-effort persistence — records to Supabase if it's
                // configured, but a missing/failed DB never blocks the
                // mail flow or surfaces an error to the guest.
                await submitRSVP({
                  name: name.trim(),
                  attending: attending === "yes",
                  events: selected,
                  message: message.trim() || null,
                });
                setSubmitting(false);

                if (attending === "yes") {
                  burst();
                  // Kindle the presence diya in MandalaMerge3D. Keys
                  // mirror the constants in MandalaMerge3D.tsx — keep
                  // them in sync.
                  if (typeof window !== "undefined") {
                    try {
                      window.localStorage.setItem("fa-presence-lit", "1");
                    } catch {
                      // localStorage may be unavailable in private mode
                    }
                    window.dispatchEvent(new CustomEvent("fa-presence-lit"));
                  }
                }
                setStep("done");
              }}
            >
              {submitting ? t("rsvp.submitting") : t("rsvp.stage.message.submit")}
            </Button>
            {submitError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 text-sm text-rose ${serifItalicClass}`}
                role="alert"
              >
                {submitError}
              </motion.p>
            )}
          </Stage>
        )}

        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 10 }}
              className="mx-auto w-28 h-28 rounded-full border-2 border-gold flex items-center justify-center bg-gold/5"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 text-gold"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12.5 l4.5 4.5 l10 -11" />
              </svg>
            </motion.div>
            <div className={`mt-6 text-3xl text-gold ${displayClass}`}>{t("rsvp.done.received")}</div>
            <div className="hairline my-6 opacity-40" />
            <p className={`text-cream/80 ${serifItalicClass}`}>
              {attending === "yes"
                ? selected.length === 1
                  ? t("rsvp.done.yesMsgSingular", { name: name.split(" ")[0] })
                  : t("rsvp.done.yesMsg", {
                      count: String(selected.length),
                      name: name.split(" ")[0],
                    })
                : t("rsvp.done.noMsg", { name: name.split(" ")[0] })}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Stage({
  title,
  children,
  displayClass,
}: {
  title: string;
  children: React.ReactNode;
  displayClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h3 className={`text-2xl text-cream/90 ${displayClass}`}>{title}</h3>
      {children}
    </motion.div>
  );
}

