/**
 * Calendar utilities — .ics generation and third-party calendar URL
 * builders for Google Calendar and Outlook Live.
 *
 * All ceremony times are stored here in IST (UTC+05:30) and
 * converted to UTC when serialised. The i18n dictionary owns the
 * *displayed* time strings (which have Devanagari numerals for hi
 * and mr); this file owns the *machine-readable* times that go into
 * actual calendar entries.
 */

import { events as ceremonies, type WeddingEvent } from "./events";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
};

const CEREMONY_TIMES: Record<
  WeddingEvent["i18nKey"],
  { startH: number; startM: number; endH: number; endM: number }
> = {
  haldi: { startH: 10, startM: 0, endH: 12, endM: 30 },
  mehendi: { startH: 16, startM: 0, endH: 19, endM: 0 },
  wedding: { startH: 11, startM: 0, endH: 14, endM: 30 },
};

const pad = (n: number) => String(n).padStart(2, "0");

function dateInIST(dateStr: string, h: number, m: number): Date {
  // ISO string with explicit +05:30 offset — browser does the
  // local→UTC conversion deterministically regardless of user's tz.
  return new Date(`${dateStr}T${pad(h)}:${pad(m)}:00+05:30`);
}

export type CeremonyLookup = {
  title: string;
  description: string;
  location: string;
};

export function ceremonyToCalendarEvent(
  ev: WeddingEvent,
  info: CeremonyLookup,
): CalendarEvent {
  const t = CEREMONY_TIMES[ev.i18nKey];
  return {
    id: `akash-falguni-${ev.id}`,
    title: info.title,
    description: info.description,
    location: info.location,
    start: dateInIST(ev.date, t.startH, t.startM),
    end: dateInIST(ev.date, t.endH, t.endM),
  };
}

export function getMainWeddingCeremony(): WeddingEvent {
  const wedding = ceremonies.find((c) => c.i18nKey === "wedding");
  if (!wedding) throw new Error("wedding ceremony missing from events.ts");
  return wedding;
}

export function getAllCeremonies(): WeddingEvent[] {
  return ceremonies;
}

function toIcsTime(d: Date): string {
  // YYYYMMDDTHHMMSSZ — .ics and Google-render URLs both accept this.
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/[,;]/g, (m) => "\\" + m)
    .replace(/\n/g, "\\n");
}

function makeIcsEventBlock(e: CalendarEvent): string {
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@akash-falguni-wedding`,
    `DTSTAMP:${toIcsTime(new Date())}`,
    `DTSTART:${toIcsTime(e.start)}`,
    `DTEND:${toIcsTime(e.end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.description)}`,
    `LOCATION:${escapeIcs(e.location)}`,
    "END:VEVENT",
  ].join("\r\n");
}

export function makeIcsCalendar(events: CalendarEvent[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Akash-Falguni Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.map(makeIcsEventBlock),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toIcsTime(e.start)}/${toIcsTime(e.end)}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookLiveUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: e.start.toISOString(),
    enddt: e.end.toISOString(),
    body: e.description,
    location: e.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function downloadIcs(content: string, filename: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
