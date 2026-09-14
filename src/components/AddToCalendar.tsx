"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { couple } from "@/lib/couple";
import {
  ceremonyToCalendarEvent,
  downloadIcs,
  getAllCeremonies,
  getMainWeddingCeremony,
  googleCalendarUrl,
  makeIcsCalendar,
  outlookLiveUrl,
} from "@/lib/calendar";
import { Button } from "./Button";
import { useLanguage } from "./LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

// Falls through to the translated "venue tbd" copy until couple.venue.name
// is filled in with a real venue. Keeps the calendar entry meaningful
// in whichever language the guest has chosen.
function venueLabel(
  t: (key: TranslationKey, vars?: Record<string, string>) => string,
) {
  const name = couple.venue?.name as string | undefined;
  if (!name || name === "TBD") return t("calendar.venue_tbd");
  return name;
}

/**
 * AddToCalendar — a single button that opens a small menu with
 * three options: Google Calendar (opens prefilled create-event
 * flow), Outlook (same, via Outlook Live), and a .ics download
 * that packages *all four ceremonies* so Apple-Calendar / Fantastical
 * / other desktop clients can import them in one go.
 *
 * The Google / Outlook links only carry the main Vivah because
 * their prefill APIs only support one event per URL. Users on those
 * providers can hit the .ics option instead to add everything.
 *
 * Calendar content honours the currently-selected site language:
 * the event description is read from i18n and will be Hindi /
 * Marathi / English depending on what the user has chosen.
 */
export function AddToCalendar({
  buttonClassName,
}: {
  buttonClassName?: string;
} = {}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const buildMainEvent = () => {
    const ev = getMainWeddingCeremony();
    return ceremonyToCalendarEvent(ev, {
      title: t("calendar.event_title", {
        groom: couple.groom.firstName,
        bride: couple.bride.firstName,
        ceremony: ev.name,
      }),
      description: t("calendar.event_description_main"),
      location: venueLabel(t),
    });
  };

  const buildAllEvents = () => {
    const venue = venueLabel(t);
    return getAllCeremonies().map((ev) =>
      ceremonyToCalendarEvent(ev, {
        title: t("calendar.event_title", {
          groom: couple.groom.firstName,
          bride: couple.bride.firstName,
          ceremony: ev.name,
        }),
        description: t(`events.${ev.i18nKey}.description`),
        location: venue,
      }),
    );
  };

  const handleGoogle = () => {
    window.open(googleCalendarUrl(buildMainEvent()), "_blank", "noopener");
    setOpen(false);
  };

  const handleOutlook = () => {
    window.open(outlookLiveUrl(buildMainEvent()), "_blank", "noopener");
    setOpen(false);
  };

  const handleIcs = () => {
    downloadIcs(
      makeIcsCalendar(buildAllEvents()),
      "akash-falguni-wedding.ics",
    );
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="outline"
        size="md"
        className={buttonClassName}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CalendarIcon />
        <span className="hidden xs:inline">{t("calendar.add")}</span>
        <span className="xs:hidden">{t("calendar.add_short")}</span>
        <Chevron open={open} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[240px] bg-cream border border-gold/40 rounded-sm overflow-hidden shadow-[0_14px_34px_rgba(15,15,38,0.18)] z-50"
          >
            <MenuItem
              label={t("calendar.google")}
              hint={t("calendar.main_wedding_hint")}
              icon={<GoogleIcon />}
              onClick={handleGoogle}
            />
            <MenuItem
              label={t("calendar.outlook")}
              hint={t("calendar.main_wedding_hint")}
              icon={<OutlookIcon />}
              onClick={handleOutlook}
              divider
            />
            <MenuItem
              label={t("calendar.apple_ics")}
              hint={t("calendar.all_ceremonies_hint")}
              icon={<DownloadIcon />}
              onClick={handleIcs}
              divider
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  label,
  hint,
  icon,
  onClick,
  divider = false,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 font-serif text-sm text-ink hover:bg-gold/10 hover:text-gold transition flex items-start gap-3 ${
        divider ? "border-t border-ink/5" : ""
      }`}
    >
      <span className="mt-0.5 text-ink/70 group-hover:text-gold shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block leading-tight">{label}</span>
        <span className="block mt-0.5 kerning text-[8.5px] text-ink/45">
          {hint}
        </span>
      </span>
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="2" y="3" width="10" height="9" rx="1" />
      <line x1="2" y1="6" x2="12" y2="6" />
      <line x1="5" y1="2" x2="5" y2="4" />
      <line x1="9" y1="2" x2="9" y2="4" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M 2 4 L 5 7 L 8 4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#4285F4" />
      <text x="8" y="11" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">
        31
      </text>
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#0078D4" />
      <text x="8" y="11" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">
        O
      </text>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M 7 2 L 7 9 M 4 6.5 L 7 9.5 L 10 6.5 M 3 11 L 11 11 L 11 12 L 3 12 Z" />
    </svg>
  );
}
