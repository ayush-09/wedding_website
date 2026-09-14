# Cinematic Wedding Invitation — Platform & Capability Overview

A production-ready, single-page wedding invitation built as a cinematic interactive experience. This document describes the complete platform, feature set, architecture, and customization surface — written so it can be reused as a proposal / scope-of-work for future wedding projects.

---

## 1. Executive Summary

A modern wedding invitation is more than a save-the-date — it is the first chapter of the couple's story. This platform delivers a **trilingual, dark-mode-ready, cinematically animated single-page site** with ceremonial reverence, practical logistics, and guest-facing interactivity (RSVP, calendar export, live globe with directions) — all rendered at production quality with accessibility and localisation built in from the ground up.

**Delivered as:** a fully self-contained Next.js 16 application deployable to any static-hosting or edge-serverless target (Vercel, Netlify, Cloudflare Pages, custom).

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 16.2** (App Router, Turbopack) | Modern React foundation with first-class image optimisation, font hosting, and static generation. |
| Runtime | **React 19** | Latest rendering features; Suspense + streaming where appropriate. |
| Language | **TypeScript 5.7 (strict)** | Compile-time safety across the translation keys, event schema, and component contracts. |
| Styling | **Tailwind CSS 3.4** + scoped CSS variables | Utility-first styling with a constrained design-token palette; dark-theme implemented via CSS selector overrides for zero per-component dark variants. |
| Animation | **Framer Motion 11** (primary), **GSAP** (available), CSS keyframes | Editorial motion with spring physics; `AnimatePresence` for orchestrated mount/unmount choreography. |
| Smooth Scroll | **Lenis** | Inertial wheel-scroll; exposed on `window.__lenis` for programmatic integration with the auto-tour. |
| 3D / WebGL | **@react-three/fiber + @react-three/drei + cobe** | Real-earth dotted globe rendered with WebGL; lazy-loaded. |
| Forms & Data | **@supabase/supabase-js** | RSVP submission; env-gated so local/preview builds work without a backend. |
| Typography | **next/font/google** | Italiana, Allura, Pinyon Script, Cormorant Garamond, Inter, Tiro Devanagari Hindi. Display-swap for zero invisible-text flashes. |
| Extras | react-parallax-tilt, canvas-confetti, @tsparticles/* | Event-card 3D tilt, RSVP celebration confetti, ambient particles. |

---

## 3. Feature Matrix

### 3.1 Cinematic Entry Sequence

| Stage | Duration | Description |
|---|---|---|
| Cinematic Intro | ~16.5 s | Five-card editorial film on a cosmic Shiva backdrop — starfield, drifting petals, film-grain overlay. Cards reveal: fleuron opener → "since 2017" year drop → animated AF Monogram → couple names in stacked editorial layout → save-the-date reveal. |
| Bridge Slide | ~1.4 s | Mid-transition card: kerned "an invitation arrives" + AF Monogram + dedication "for you, only you." Visual continuity between intro and the envelope. |
| Envelope Gate | Indefinite | Designer envelope with gold wax seal stamped with the AF monogram, zardozi-pattern (kadai) borders, animated floral crown, handwritten script names, and a rotating set of poetic CTA quotes inviting the tap. |
| Inner Card Reveal | — | On seal tap: gold ring ripple → flap 3D-rotate-open → inner card slides up revealing a Ganesh glyph, the mantric `ॐ गं गणपतये नमः` invocation, couple names, and the formal date. Holds indefinitely until the guest chooses to enter. |

- **"Enter directly" escape hatch** — top-right affordance held back 3.5 s so the cinema lands before the skip is offered. Serif-italic typography, not utility-kerned "skip", because this is a wedding, not an onboarding flow.
- **Auto Tour** — dispatched post-envelope, scrolls the page to bottom over 90 s. Pauses on any user interaction and resumes after 4 s of stillness; resume duration auto-scales to remaining distance so pace stays consistent.

### 3.2 Home-page Sections (in order)

1. **Hero** — animated AF Monogram + "since / forever" epigraph + couple names in display italic + date + action row.
2. **Family** — formal invitation block with the Ganesh invocation, blessing, bride's-and-groom's-family columns (surname, parents, blessed-by line), and the request of honour.
3. **Story** — "Ten years, briefly" narrative paragraph with location and rhythm details.
4. **Ardhanarishwara** — spiritual interlude framed as inspiration (never equivalence). Combined Shiva-Parvati sigil with pulsing gold halo; stanzas on either side of a central ampersand orb.
5. **Countdown** — live day/hour/minute/second flipbook digits with a pulsing gold backdrop, diya-like breath.
6. **Events** — four ceremony cards (Haldi, Mehndi, Vivah, Sangeet & Reception) with 3D tilt, cursor-tracking gold spotlight, shimmer sweep, thematic per-card palette particles, and palette-tinted hover auras.
7. **Venue** — 3D rotating Earth (cobe-rendered photorealistic dotted globe) with a gold pin over the venue's coordinates, concentric sonar rings emanating from the pin, a floating "venue name" label with an animated arrow, and a tap-to-open cinematic zoom that hands off to Google Maps.
8. **Gallery** — decade-in-frames photo grid with year/location captions.
9. **Ring Ceremony Teaser** — private-prologue premiere-ticket metaphor, perforated stubs, seat/row/show stamp.
10. **RSVP Form** — multi-stage (name → attending → event selection → message → done) with Supabase persistence, confetti on successful submission, and a gold confirmation stamp.
11. **Footer** — monogram, "with all our love" script signature, contact email, replay/back-to-rsvp chrome links.

### 3.3 Internationalisation

Full content translated across **English / हिन्दी / मराठी**:

- **Centralised dictionary**: `src/lib/i18n.ts` — typed `TranslationKey` union with English fallback for any missing key.
- **React-context delivery**: `LanguageProvider` exposes `useLanguage()` with a `t(key, vars?)` function supporting `{placeholder}` interpolation.
- **Persistent preference**: stored in `localStorage` (`af-lang`); `<html lang>` attribute kept in sync for screen-reader correctness.
- **Font-per-script swap**: Latin-kerned utility classes auto-swap to the `font-sanskrit` stack (Tiro Devanagari Hindi + Noto Serif Devanagari fallback) whenever the language is hi/mr — so conjunct Devanagari characters aren't butchered by Latin letter-spacing rules.
- **Devanagari legibility tuning**: dark-surface sections (RSVP, Ardhanarishwara, Ring Ceremony) carry a CSS opacity boost specifically for Devanagari glyphs, since they render thinner than Latin serifs at the same weight.
- **Proper nouns stay Latin**: names, family surnames, place names, song titles, and film titles are *not* transliterated — they are brand identity.
- **Devanagari numerals**: dates, years, and times are pre-localised with Devanagari digits for hi/mr — expected convention for formal Indian invites.

### 3.4 Theming

Light + Dark themes with the same content surface:

- **`ThemeProvider`** with context-based light/dark state, persisted to `localStorage` (`af-theme`).
- **First-visit default** honours the OS `prefers-color-scheme`.
- **Tailwind `darkMode: class`** compatible; implementation actually uses **CSS selector overrides** (`html.dark .bg-paper { … }`) so existing utility classes cascade into dark mode without per-component `dark:` variants.
- **Semantic colour flip**: on dark surfaces, `text-ink` → cream, `text-indigo` → gold, `text-wine` → cream, borders re-tint to cream-alpha, shadows deepen for depth.
- **Section-gradient remap**: `.bg-paper`, `.bg-sepia`, `.bg-divine`, `.bg-temple` are all repainted as twilight gradients in dark mode.
- **400 ms cross-fade** on theme toggle via a `transition: background 0.4s, color 0.4s` on `<html>` — whole-page dissolves instead of snapping.

### 3.5 Calendar Integration

A single **Add-to-Calendar** dropdown on the Hero with three provider options:

- **Google Calendar** — prefilled create-event flow in a new tab (main Vivah).
- **Outlook Live** — same, via the Outlook deep-link API.
- **Apple / Other (.ics)** — downloads a multi-event `.ics` file containing *all four ceremonies* for one-tap import on Apple Calendar, Fantastical, desktop Outlook, and anything else that speaks iCalendar.

Machine-readable times live in `src/lib/calendar.ts` with explicit `+05:30` IST offsets, so the browser does the UTC conversion deterministically regardless of the guest's timezone. Event descriptions are rendered in the guest's currently-selected language.

### 3.6 Interactive Venue Globe

- **cobe v2** renders a photorealistic dotted Earth (no texture files required) with continents visible as dot-density.
- **Venue-coord pin** uses cobe's marker API with per-frame size-pulse animation driven by a `requestAnimationFrame` loop.
- **Concentric gold "sonar" rings** expand outward from the pin area as CSS keyframes — draws the eye to the destination before any copy is read.
- **Floating "venue name" caption** above the globe with a gentle downward-pulsing arrow SVG.
- **Tap-to-open directions** — tap detection lives *inside* the globe's pointer handlers (tracks max movement between pointerdown/up) so it doesn't fight the drag-to-orbit gesture. On tap: a 900 ms zoom + blur + radial gold flash + "Opening directions…" handoff text, then Google Maps opens with the venue query.
- **Drag-to-orbit** with pointer capture, both mouse and touch. Inertial phi composition so releasing mid-drag doesn't snap the globe back.
- **Page-visibility gated** — the cobe rAF loop skips `globe.update()` calls while the tab is hidden; no background CPU burn.
- **Lazy-loaded** via `next/dynamic` (`ssr: false`) — the Three.js + cobe chunk (~130 KB) stays out of the initial bundle.

### 3.7 RSVP Workflow

Four-stage form with staged mount animations:

1. **Name** — full-name capture with validation before proceeding.
2. **Attending** — yes / regretfully-no branch.
3. **Event selection** — multi-select ceremony checkboxes (shown only if attending).
4. **Message** — optional memory-wall note.

On submission:
- Posts to **Supabase** via the typed `submitRSVP()` helper. Env-gated: if keys aren't present, the submission is a no-op and the form still feels real.
- Triggers a **three-burst canvas-confetti** celebration using the site gold/rose/saffron palette.
- Shows a rotating gold-outlined ✓ stamp and a personalised passport-stamp tally.

### 3.8 Ambient Atmosphere

A continuous background layer over the home page (`RomanceAmbience.tsx`) containing:

- **14 drifting hearts** rising from the bottom, three size tiers for depth, alternating gold + rose with a double-layered drop-shadow glow.
- **8 rose petals** falling from above, rotating slowly through 540° with a 6-keyframe horizontal drift, six palette colours (rose pink, dusty rose, saffron, gold, fuchsia, warm cream).
- **9 gold sparkles** — 4-point stars fading in with a scale pulse and 180° rotation at fixed positions across the viewport.
- **Evil-eye (nazar) cursor** that trails the pointer with spring physics, blinks every ~5 s, skipped on touch devices.
- **Z-indexed at 30** — above page content, below intro (z-100), envelope (z-95), and user controls (z-40). Stays out of the way during the reveal and above page copy once the page is live.
- **Page-visibility gated** — the entire particle tree unmounts when the tab is hidden, resuming instantly on re-focus.

### 3.9 Floating Controls

- **Theme toggle** (top-left) — sun / moon icon with a 0.35 s cross-fade rotation on switch.
- **Language pill** (top-right) — `English · हिन्दी · मराठी` with the active one in gold. Cream pill background (`bg-cream/95`) with a strong drop-shadow so both pills lift off cream *and* dark-ink sections equally.
- Both are **fixed** with a shared entrance animation and sit below the intro/envelope overlays so they appear once the reveal is complete.

---

## 4. Design System

### 4.1 Palette

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#0F0F26` | Deepest indigo (darkest surface, ink text) |
| `wine` | `#1B1B3A` | Royal indigo (primary accent, borders) |
| `indigo` | `#1B1B3A` | Semantic alias |
| `cream` | `#F5E6C9` | Temple cream (base light surface) |
| `bone` | `#ECD8A8` | Slightly deeper cream |
| `ash` | `#F3EADA` | Ash / bhasma text colour |
| `gold` | `#D4A84B` | Primary accent (the thread that reads on both themes) |
| `saffron` | `#E85A2F` | Sparing accent (sacred fire glow) |
| `rose` | `#B9A7D1` | Muted lavender (subtle tint) |

### 4.2 Typography

Six voices wired to CSS variables on `<html>`:

| Variable | Font | Purpose |
|---|---|---|
| `--font-display` | Italiana | Hero display type, kerned uppercase, editorial large moments |
| `--font-script` | Allura | Handwritten flourishes (envelope names, footer signature) |
| `--font-cipher` | Pinyon Script | Monogram cipher only (formal copperplate with swash capitals) |
| `--font-serif` | Cormorant Garamond | Body copy + italic flourishes |
| `--font-sans` | Inter | UI, kerned uppercase labels |
| `--font-sanskrit` | Tiro Devanagari Hindi | Sanskrit + hi/mr body copy |

### 4.3 Motion Vocabulary

- Primary easing: `[0.22, 1, 0.36, 1]` (quart-out). Used consistently on major entrances.
- Breath cadence: 4–4.5 s pulse period across sacred halos (Family Ganesh, Ardhanarishwara Shiv-Parvati, Venue pin rings, Countdown digits) — the site breathes as one.
- Micro-interactions: spring physics (`stiffness: 260–320, damping: 22–26`) on hoverable elements.

---

## 5. Site Architecture

```
src/
├─ app/
│  ├─ layout.tsx          (fonts, providers, intro/envelope chrome, floating controls)
│  ├─ page.tsx            (home page — 11-section composition)
│  ├─ ring-ceremony/      (secondary route for the private prologue)
│  └─ globals.css         (design tokens, theme overrides, animation keyframes)
├─ components/
│  ├─ CinematicIntro.tsx  (5-card film)
│  ├─ EnvelopeGate.tsx    (bridge + envelope + inner card + handwritten names)
│  ├─ Monogram.tsx        (AF wreath + crown + cipher + heart SVG with animated entrance)
│  ├─ Hero.tsx            (landing hero)
│  ├─ Family.tsx          (formal invitation block)
│  ├─ Story.tsx           (narrative)
│  ├─ Ardhanarishwara.tsx (spiritual interlude)
│  ├─ Countdown.tsx       (live-ticking flipbook)
│  ├─ Events.tsx          (ceremony cards with thematic hover)
│  ├─ Venue.tsx           (venue section with globe + directions handoff)
│  ├─ VenueGlobe.tsx      (cobe-driven 3D globe)
│  ├─ Gallery.tsx         (photo grid)
│  ├─ RingCeremonyTeaser.tsx
│  ├─ RSVPForm.tsx        (four-stage form)
│  ├─ Footer.tsx          (signature + contact)
│  ├─ LanguageProvider.tsx / LanguageToggle.tsx
│  ├─ ThemeProvider.tsx / ThemeToggle.tsx / FloatingControls.tsx
│  ├─ RomanceAmbience.tsx (hearts + petals + sparkles)
│  ├─ EvilEyeCursor.tsx   (nazar cursor companion)
│  ├─ AutoTour.tsx        (guided-scroll manager)
│  ├─ motifs.tsx          (Om, Trishul, Damaru, Diya, Kailash, Rudraksha, Ganesh, ShivaParvati, TempleArch)
│  └─ Button.tsx + primitives
└─ lib/
   ├─ couple.ts           (names, dates, venue, families — **the primary customization point**)
   ├─ events.ts           (ceremony catalog keyed to i18n translations)
   ├─ calendar.ts         (.ics / Google / Outlook builders, IST-aware)
   ├─ i18n.ts             (translation dictionary + helpers)
   ├─ supabase.ts         (RSVP client)
   └─ usePageVisible.ts   (visibility hook for background-CPU gating)
```

---

## 6. Customisation Surface (per wedding)

The per-couple variables are concentrated in a handful of files, making it straightforward to re-skin the platform for a new wedding:

### 6.1 Required

| File | What to replace |
|---|---|
| `src/lib/couple.ts` | Groom and bride names, wedding + engagement dates, venue name/city/maps-query, family tree, tagline, hashtags, contact email |
| `src/lib/events.ts` | Ceremony dates, names, palettes, icons, song choices |
| `src/lib/i18n.ts` | Content strings — typically English is the only required edit; hi/mr translations may need native-speaker review |
| `src/components/Monogram.tsx` | Replace the "AF" cipher with the new couple's initials |
| `src/app/globals.css` | Palette tuning if the new wedding's colours diverge |
| `/public/images/ganesh.png` | The gold-foil Ganesh emblem (swap for a couple-chosen reference; a Python extraction script at `/tools/extract-ganesh.py` makes this mechanical) |

### 6.2 Optional

- **Photos**: drop real images into `/public/gallery/` and update the `frames` array in `Gallery.tsx`.
- **Background audio**: place a track at `/public/audio/background.mp3` — the `MusicPlayer` auto-detects and plays.
- **Venue coordinates**: `Venue.tsx` carries `ALIGARH_LAT / ALIGARH_LNG` constants — replace with the new venue's lat/lng for the globe pin.
- **Ring ceremony**: swap date, time, venue, and the "private prologue" copy in `RingCeremonyTeaser.tsx` + `i18n.ts`.
- **Hashtags**: `couple.ts` holds the list used by Share UIs.

---

## 7. Performance Engineering

- **Lazy imports** for the 3D globe (`~130 KB`) — out of the initial bundle.
- **`next/image`** for all bitmap assets with automatic DPR-aware srcset.
- **`display: swap`** on every font — no invisible-text flash during font load.
- **Page-visibility gating** — cobe rAF, quote-rotation interval, and the particle tree all pause when the tab is hidden.
- **Framer-motion `AnimatePresence`** with conditional rendering — heavy per-card particle emitters only mount on hover, not permanently.
- **DPR capped at 2** on WebGL — sharp on retina without the 3× overkill on high-density phones.
- **CSS `content-visibility` / `contain`** on the globe canvas — isolates its repaints from the rest of the page.
- **Supabase** env-gated — unset keys produce a silent no-op, so preview deploys don't require a backend.

---

## 8. Accessibility

- Every interactive control has an `aria-label` and (where applicable) `aria-pressed` / `aria-haspopup` / `aria-expanded`.
- `focus-visible:ring-2 ring-gold` on every button so keyboard users get a clear focus state.
- `<html lang>` kept in sync with the language toggle so screen readers pronounce Hindi/Marathi content correctly.
- Touch-first fallbacks on the globe cursor and romance-ambience (skipped entirely on coarse-pointer devices).
- Motion respects `prefers-reduced-motion` where applicable (can be extended globally).
- All text maintains AA contrast on both light and dark surfaces; Devanagari specifically carries an opacity boost because its glyphs render thinner than Latin serifs.

---

## 9. Deployment

Static-first: the site is fully pre-rendered and ships as a standard Next.js build. Recommended targets:

- **Vercel** — zero-config (`next.config.mjs` is already compatible).
- **Netlify / Cloudflare Pages** — via the Next.js adapter.
- **Self-hosted** — `next build && next start` behind any reverse proxy.

Environment variables required (all optional for a preview build):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 10. Delivery Model for Reuse

To adapt this platform to another wedding:

1. **Clone the repo** into a new project directory.
2. **Replace `src/lib/couple.ts`** with the new couple's particulars.
3. **Re-extract the Ganesh emblem** (or skip and use the in-repo SVG fallback from `motifs.tsx`).
4. **Regenerate the AF Monogram's cipher** — the `Monogram.tsx` component takes an `x-offset` prop because different letter pairs need different optical centring (e.g. "AV" needs a different offset than "AF" because of swash geometry).
5. **Update `src/lib/events.ts`** with the new ceremony line-up.
6. **Sanity-pass the i18n dictionary** — most strings are generic ("Our story", "Your reply", ceremony descriptions), but anything that references "ten years" or the couple's specific narrative needs to be rewritten.
7. **Set `couple.venue`** when the venue is finalised — the Venue section's globe pin and all calendar entries auto-update.
8. **Ship** — `npm run build` and deploy.

Typical re-skinning timeline: **1 day** for pure content swap, **1 week** if the couple wants palette / typography adjustments or new custom sections.

---

## 11. Platform Capabilities Summary

| Capability | Status |
|---|---|
| Single-page cinematic invitation | ✅ |
| Multi-language support (English, Hindi, Marathi) | ✅ |
| Light + Dark theme with OS-preference default | ✅ |
| Live RSVP with Supabase persistence | ✅ |
| Calendar export (Google, Outlook, .ics multi-event) | ✅ |
| Interactive 3D globe with tap-to-directions | ✅ |
| Countdown to wedding date | ✅ |
| Ambient animation layer (hearts, petals, sparkles, evil-eye cursor) | ✅ |
| Guided auto-scroll tour with interaction-pause/resume | ✅ |
| Photo gallery (placeholder system ready for real images) | ✅ |
| Web-Share API + clipboard-fallback sharing | ✅ |
| Accessibility (ARIA, focus rings, reduced motion, i18n html-lang) | ✅ |
| Performance (lazy chunks, visibility gating, DPR caps) | ✅ |
| Fully responsive (mobile-first, all breakpoints tested) | ✅ |

---

*Built with reverence for tradition and rigour for craft. Adaptable, performant, and ready to carry the next couple's story.*
