# CLAUDE.md — Akash & Falguni Wedding Site

Project context for Claude Code. Keep this file updated as the site evolves.

## The event

**Akash Varshney (groom) & Falguni Sharma (bride)** — getting married **23 January 2027**. Single-page invitation + RSVP experience.

## Stack

| | |
|---|---|
| Framework | Next.js **16.2.4** (App Router, Turbopack) |
| Runtime | React **19** |
| Language | TypeScript 5.7, strict |
| Styling | Tailwind CSS 3.4 + a small set of CSS variables in `globals.css` |
| Animation | Framer Motion **11.18** (primary), GSAP (registered, available), CSS keyframes |
| Smooth scroll | Lenis — exposed on `window.__lenis` for other components |
| 3D | `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` (used by `VenueGlobe`; `MandalaMerge3D` exists on disk but is currently orphan) |
| Particles | `canvas-confetti` (Countdown fireworks); `@tsparticles/*` available |
| Data | `@supabase/supabase-js` (RSVPs; env-gated) |
| Extras | `react-parallax-tilt` (event cards) |

Scripts: `npm run dev` (Turbopack), `npm run build`, `npm run typecheck`.

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx          ← fonts, metadata (OG + favicon), global chrome
│  ├─ page.tsx            ← the invitation home page (9 sections)
│  ├─ not-found.tsx       ← on-brand 404 page
│  ├─ error.tsx           ← runtime error boundary
│  ├─ robots.ts           ← SEO: allow / (no other routes exist)
│  ├─ sitemap.ts          ← SEO: reads NEXT_PUBLIC_SITE_URL
│  ├─ opengraph-image.tsx ← dynamic OG image generator (ImageResponse)
│  ├─ twitter-image.tsx   ← re-exports OG generator for Twitter card
│  └─ globals.css         ← tailwind base + css vars + utility classes
├─ components/
│  ├─ CinematicIntro.tsx  ← 4-card opening film (fast mode, ~8.6 s)
│  ├─ CinematicReel.tsx   ← scroll-linked film-edge hairlines + corner vignette
│  ├─ EnvelopeGate.tsx    ← wax-seal envelope shown after intro
│  ├─ Monogram.tsx        ← the AF botanical-wreath logo (animated + static)
│  ├─ Hero.tsx            ← landing hero w/ animated monogram, photo crossfade, scroll parallax
│  ├─ Family.tsx          ← Ganesh invocation + both families on a photo background, zigzag surnames, personal whisper per side
│  ├─ Story.tsx           ← short invitation narrative + manifestation pull-quote + Hinglish whisper, word-by-word body reveal
│  ├─ Countdown.tsx       ← live D/H/M/S timer + scratch-card reveal of magic date with fireworks; swaps to "Just Married" post-date
│  ├─ Events.tsx          ← 3D-tilt event cards
│  ├─ Venue.tsx           ← Kalash Banquet Hall globe + per-ceremony breakdown
│  ├─ VenueGlobe.tsx      ← r3f globe, lazy-loaded inside Venue
│  ├─ Gallery.tsx         ← sticky scroll-driven full-bleed photo reel (11 photos, 8 unique transitions)
│  ├─ RSVPForm.tsx        ← mailto-delivered RSVP (opens guest's mail app to couple.contact.rsvpEmail); Supabase write best-effort; "Thank you!" confirmation
│  ├─ Footer.tsx          ← monogram + replay-intro button + mail link
│  ├─ MusicPlayer.tsx     ← optional background audio
│  ├─ AutoTour.tsx        ← headless constant-velocity scroll-through (post-envelope, VH_PER_SECOND pace); fa-tour-hold / fa-tour-release events let sections pause it (bounded)
│  ├─ ScrollProgress.tsx  ← top progress bar
│  ├─ ScrollTriggerInit.tsx ← registers GSAP ScrollTrigger + Lenis bridge
│  ├─ EvilEyeCursor.tsx   ← nazar bead that follows pointer on desktop AND under-finger on touch
│  ├─ HeroActions.tsx     ← RSVP / Calendar / Share trio
│  ├─ AddToCalendar.tsx   ← Google / Outlook / .ics dropdown
│  ├─ PresenceCounter.tsx ← live "X diyas alight" via Supabase
│  ├─ MandalaMerge3D.tsx  ← 3D mandala (currently orphan; left on disk for revival)
│  └─ ...                 ← UI primitives (Button, Theme, Floating controls, motifs, etc.)
└─ lib/
   ├─ couple.ts           ← names, hashtags, date, venue (+ lat/lng), family details
   ├─ events.ts           ← ceremony list — each event carries its own `venue`
   ├─ gallery.ts          ← curated photo manifest for Gallery.tsx (11 photos)
   ├─ calendar.ts         ← .ics / Google / Outlook URL builders
   ├─ i18n.ts             ← three-language dictionary (en / hi / mr), 120 keys
   ├─ supabase.ts         ← client helper, env-gated `hasSupabase` flag
   ├─ cn.ts               ← clsx + tailwind-merge wrapper, plus date helpers
   └─ usePageVisible.ts   ← visibility hook
```

## Home page composition (`src/app/page.tsx`)

1. **Hero** *(in `<ClientOnly>`)* — animated AF monogram + names + date + CTA, mobile photo crossfade, scroll-parallax exit
2. **Family** — Ganesh invocation + both families on a full-bleed photo background, zigzag surname animation, gold corner brackets, personal whisper line under each side
3. **Story** — short invitation narrative, prefaced by an italic display pull-quote ("When two hearts manifest the same…") and a Hinglish whisper ("Ek waqt tha jab hum chhupte the…"), word-by-word body reveal
4. **Countdown** *(in `<ClientOnly>`)* — live D/H/M/S timer above a foil **scratch card**; user rubs the foil to reveal the magic date with **fireworks** (canvas-confetti + Shockwave + Starburst). Pauses the AutoTour while in view via `fa-tour-hold` events. Post-23.01.2027 swaps to `CountdownMarried` panel.
5. **Events** — ceremony cards with 3D tilt, spotlight, shimmer
6. **Venue** — Kalash Banquet Hall globe + per-ceremony breakdown list (data from `events[*].venue`)
7. **Gallery** — sticky scroll-pinned full-bleed reel of 11 curated photos. Each photo gets a unique transition (kenBurns / slideX / blurZoom / rotateScale / diagonal / saturate / slideY / dollyZoom). Editorial chrome: live counter, dot rail, per-photo caption.
8. **RSVPForm** — name + attendance + events + message. On submit it opens the guest's **mail app pre-filled** (To: `couple.contact.rsvpEmail` = akashvarshney117@gmail.com; subject `RSVP from {name} — Akash & Falguni`; body lists name/attending/ceremonies/message). The Supabase insert still runs as **best-effort** (records if configured, never surfaces an error), then the form shows the **"Thank you!"** confirmation (the old "reply box isn't ready" error path is gone).
9. **Footer** — monogram + replay-intro button + mail link

Chrome (in `layout.tsx`, inside `<ClientOnly>`):
`ScrollToTopOnMount → ScrollTriggerInit → CinematicIntro → EnvelopeGate → ScrollProgress → CinematicReel → MusicPlayer → AutoTour → FloatingControls → EvilEyeCursor → RomanceAmbience`

## Cinematic Intro (`src/components/CinematicIntro.tsx`)

Four title cards on a cosmic Shiva backdrop (indigo + saffron halo + neelkanth glow + starfield + drifting petals + butterflies + letterbox bars + film grain). **Fast mode** — total duration **~8.6 s** (was ~18 s; client wanted it quick). All four cards are retained; stage holds + per-card entrance/exit choreography were tightened proportionally so nothing is cut mid-entrance.

| Stage | Time | Content | Notes |
|---|---|---|---|
| 0 | 0 – 1.05s | gold fleuron ❦ + kerned "A Love Story" + hairline + "presents" | — |
| 1 | 1.05 – 3.35s | kerned "The Wedding Of" + animated **Monogram** + bottom hairline | hold sized so the monogram's entrance + a heartbeat fit |
| 2 | 3.35 – 6.4s | "Together Forever" label + **Akash** + luminous gold **&** + **Falguni** + sutra + **प्रेम / Prema · Love** | stacked editorial layout; name sequence lands ~2.8 s, inside the hold |
| 3 | 6.4 – 8.6s | "Save the Date" + **23rd · January** + hairline + huge **2027** | spring year drop-in |

Control events dispatched:
- `fa-intro-complete` → fires at the end; `EnvelopeGate` listens
- `fa-tour-start` → fires 900 ms after envelope opens; `AutoTour` listens

`sessionStorage` is **not** used to gate intro/envelope — both play on every refresh (per user preference).

**Intro music** — `CinematicIntro` plays `/public/audio/intoduction.mp3` from the **start** (`currentTime = 0`) the moment the film shows, **loud** (volume **~0.85**), with a short fade-in (**0.3 s**, no pop). It now spans the full fast-mode runtime (`PLAY_MS` 8600) and fades out over **1.1 s** ending right as the film fades, instead of stopping at the old 5 s mark. Note the filename spelling `intoduction.mp3` (as the user uploaded it) — distinct from `background.mp3`. It's a standalone `HTMLAudioElement`, independent of the persistent `MusicPlayer` Web-Audio loop (which uses `background.mp3` and only starts at `fa-tour-start`). Because browsers block sound-on-load without a prior gesture, it attempts autoplay and, if refused, starts on the first user gesture during the intro; everything is torn down when the intro unmounts/skips.

## EnvelopeGate (`src/components/EnvelopeGate.tsx`)

Cream parchment envelope with a kadai/zardozi gold border. The wax seal sits at the **geometric centre** of the envelope (flex-center in absolute inset-0 wrappers — the wax drips were nudging a transform-based centre off by a few pixels).

The seal is a deep burgundy radial gradient (`#b32a3a → #2c0810`) with:
- A `0.5 px` inner gold-foil rim sitting `6 px` in from the edge
- A multi-layer drop-shadow stack (cream highlight + ink lowlight + gold halo) that makes the **AF Monogram** inside read as embossed
- A slowly rotating dashed gold outer ring (80 s loop)

Tap → wax breaks → gold-ring ripple → flap rotates open → invitation card emerges → click card to fire `fa-tour-start`.

## Countdown (`src/components/Countdown.tsx`)

Two layers stacked vertically:
1. Live **D / H / M / S** timer (with rotateX flip-card on each tick)
2. **Scratch card panel** below the timer:
   - Magic date underneath (`23 · January · 2027` + `Saturday — the day we begin`)
   - Brushed-gold foil canvas on top with the label `Scratch to reveal the date`
   - User rubs / drags any direction; `globalCompositeOperation = "destination-out"` erases the foil under the cursor
   - Single completed pointer-stroke triggers reveal — fade canvas + fire **fireworks**
   - Reset button below ("↻ Hide the date") redraws the foil

**Fireworks layers** (only when revealed, only without `prefers-reduced-motion`):
- `canvas-confetti` — centre rocket + two angled side rockets + 2.2 s gold drift
- `<Shockwave>` — three concentric gold rings expand outward at different rates
- `<Starburst>` — 18 gold rays + 9 cream sparkles, counter-rotating SVG layers

**Scroll-lock interface**: while the section is centred in viewport AND not yet revealed, dispatches `fa-tour-hold` to pause the AutoTour's auto-scroll. User can still scroll manually. Releases on reveal or when section leaves viewport. Card **vibrates** subtly (`x: [0,-3,3,-2,2,0]` over 0.6 s, 1.6 s repeat-delay) while waiting for interaction.

## Gallery (`src/components/Gallery.tsx`)

Sticky scroll-pinned full-bleed photo reel with **Instagram-Reels snapping**. Section is `N × VH_PER_PHOTO` (currently `11 × 100 vh = 1100 vh`) tall; the inner stage is sticky to the viewport. As guests scroll, the active photo crossfades into the next using one of **8 unique transitions**:

`kenBurns | slideX | slideY | blurZoom | rotateScale | diagonal | saturate | dollyZoom`

**Reels snap** — a Lenis `Snap` (`lenis/snap`, `type: 'mandatory'`, easeOutCubic, 0.7 s) is attached over one invisible scroll **marker per photo**. Once the user stops scrolling the page settles on exactly one photo (up/down). It is gated by an `IntersectionObserver` on the sticky stage (`ratio ≥ 0.9 → snap.start()`, else `snap.stop()`) so it ONLY acts inside the gallery — the rest of the page scrolls freely, and at the first/last photo the snap returns no target so you scroll out cleanly. The snap reacts only to real `virtual-scroll` (wheel/touch) input, so the headless `AutoTour`'s programmatic glide is never fought: **idle = slow auto-pan, user input = snap to a photo**. Skipped entirely under `prefers-reduced-motion`. Crossfade math is keyed so each photo is at full opacity exactly at its marker (`progress = i/(N-1)`), so a snap always lands on a resolved image, never mid-transition. This is intentional snap (escapable, input-only) — NOT the rejected "lock native scroll" behaviour.

Editorial chrome:
- Top-left: pinned eyebrow + heading
- Top-right: live photo counter `01 / 12`
- Right rail (desktop): vertical dot indicator, active dot scales × 1.6 + brightens — **dots are now buttons** that scroll the reel to that photo (Lenis `scrollTo` the marker, fallback `scrollIntoView`), pausing AutoTour during the jump
- Bottom-left: per-photo caption + photo number + year + a "Tap to view" pill
- Bottom-centre: animated "Scroll" cue, fades after 5 % progress

**Interactive lightbox** — tapping/clicking the active photo (a full-stage hit button) or the caption pill opens an elegant full-screen `Lightbox` (dark blurred backdrop, `object-contain` so portrait/landscape never crop). Navigation: prev/next buttons, ← / → arrow keys, and touch swipe (50 px threshold, loops). Dismiss via close button, ESC, or backdrop click. Accessibility: `role="dialog" aria-modal="true"` + label, focus moves to close on open and is restored on close, focus trapped within, body scroll locked, ≥44 px touch targets, visible gold `focus-visible` rings. Under `prefers-reduced-motion` the lightbox transitions collapse to a plain fade. Visible strings use i18n keys (`gallery.open_hint / close / prev / next / viewer / go_to`) in en/hi/mr.

Photo manifest lives in `src/lib/gallery.ts`. Each entry: `src`, `caption`, `year`, `span` (visual hint, not used in current reel layout), `reveal`, `hover` (legacy from masonry layout, retained for re-use), `focus` (object-position so faces don't crop awkwardly).

## Whispers — distributed quotes

Four personal phrases live across the site (no separate "Whispers" section any more):

| Phrase | Location | Style |
|---|---|---|
| "When two hearts manifest the same, the universe definitely listens." | Story — pull-quote | display italic, gold curly quotation marks |
| "Ek waqt tha jab hum chhupte the… aaj waqt hai jab humari kahani sab dekh rahe hain." | Story — sub-quote | serif italic, smaller, ink/65 |
| "From planning to marry her… destiny gave me the path to walk towards her." | Family — groom column footer | display italic, prefixed by gold ❦ |
| "The elder daughter finally found a place where she doesn't have to be strong." | Family — bride column footer | display italic, prefixed by gold ❦ |

All four use a shared `QUOTE_REVEAL` motion preset (exported from `Story.tsx`, imported by `Family.tsx`): `opacity 0 → 1`, `y +18 → 0`, `blur(6px) → blur(0)`, 1.1 s, ease `[0.22, 1, 0.36, 1]`. Only the `delay` varies so they stagger naturally inside their sections.

## Monogram (`src/components/Monogram.tsx`) — the AF logo

Custom SVG. Layers (z-order): wreath (14 sprigs around `R=95`, gaps at 12 & 6 o'clock for crown + heart), heraldic 3-peak crown, "AF" cipher in **Pinyon Script** at 94 px (offset `x={CX-20}` to compensate for the F's right-swash), heart + ribbon, optional tracked-caps names + tiny date.

`animate={true}` runs a ~1.95 s entrance: sprigs bloom from bottom, crown drops with spring, cipher fades + scales in, heart bounces in then runs a continuous **two-pump heartbeat** `[1, 1.18, 1, 1.1, 1]` every 1.5 s. Used animated in `CinematicIntro` Card 1 and the Hero's central medallion. Used static in `Footer` and inside the `EnvelopeGate` wax seal.

## EvilEyeCursor (`src/components/EvilEyeCursor.tsx`)

Single boncuk-style nazar bead (concentric indigo → gold → cream → black-pupil + tiny specular highlight) that follows the pointer.

- **Desktop** — springed motion (`stiffness 260, damping 22`); fades in on first `mousemove`, out on `mouseleave`.
- **Touch** — appears at the touch point on `touchstart`, tracks finger through `touchmove`, fades 900 ms after `touchend`.
- Auto-skipped under `prefers-reduced-motion: reduce`.
- Pulse animation: gentle `scale [1, 0.94, 1]` over 2.2 s loop.
- `pointer-events: none`, `z-40`.

## Site-wide animation pass

1. **Hero parallax** — `useScroll` on hero ref drives parallel `useTransform` lanes for monogram (slowest), names, labels, actions (fastest). Halo scales 1 → 1.6 and fades. Mobile crossfades two background photos every 6 s with independent Ken Burns.
2. **Family Ken Burns** — full-bleed couple photo behind Ganesh invocation + family columns, with a continuous 26 s scale + pan loop and a theme-aware cream/ink veil (`.family-veil` in `globals.css`).
3. **Story word-by-word reveal** — narrative splits into per-word `motion.span`s. `staggerChildren: 0.04`, `delayChildren: 0.15`. Each word lifts 12 px + un-blurs from `blur(4px)`. Honours `useReducedMotion()`.
4. **Family ZigzagText** — surname headlines (`The Varshney Family` / `The Sharma Family`) split per character; even-index chars start `-22 px` above + tilted `-6°`, odd-index start `+22 px` below + `+6°`, settle to baseline with `0.045 s` stagger. Splits by Unicode code point so Devanagari translations animate too.
5. **CinematicReel overlay** — fixed pointer-events-none overlay at `z-[25]`: faint gold hairlines pinned to viewport top + bottom (fade in after ~3 % scroll) + four-corner radial vignette (`mix-blend-multiply`, opacity `0 → 0.25 → 0.45` across the page).

GSAP is wired up via `ScrollTriggerInit.tsx` (mounted in layout). Future sections can import `{ ScrollTrigger } from "gsap/ScrollTrigger"` safely.

## Typography system (`src/app/layout.tsx`)

Six voices, wired to CSS variables on `<html>`:

| Variable | Font | Purpose |
|---|---|---|
| `--font-display` | **Italiana** (regular 400 only — no italic) | Hero display type: "AKASH", "FALGUNI", "23RD JANUARY", "2027". Use uppercase + tracked letterspacing. |
| `--font-script` | **Allura** | Handwritten flourishes (envelope address). |
| `--font-cipher` | **Pinyon Script** | Monogram cipher only — formal copperplate with swash capitals. |
| `--font-serif` | **Cormorant Garamond** (300–600, italic) | Body copy + italic flourishes. |
| `--font-sans` | **Inter** | UI + all kerned uppercase labels. |
| `--font-sanskrit` | **Tiro Devanagari Hindi** | Sanskrit (e.g. प्रेम, ॐ श्री गणेशाय नमः). |

All fonts loaded via `next/font/google` with `display: "swap"` and strong fallback cascades.

**Rejected fonts** (don't re-introduce without user approval): Playfair Display, DM Serif Display, Bodoni Moda ("outdated"), Fraunces ("too SaaS").

## Design language

- **Colours** — indigo + cream dominant, gold for highlights, saffron very sparing. **No pink/rose-heavy.**
- **Spiritual framing** — Ganesh invocation, Sanskrit shlokas are fair game as **inspiration**. The previous Shiva/Parvati Ardhanarishwara section was removed; if reviving spiritual content, frame as "an inspiration, never a comparison."
- **Name order** — always **Akash & Falguni** (groom first).
- **Hashtags** — `#AkashFindsHisFalguni`, `#AkashAndFalguni2027`, `#OmNamahShivaya`.
- **Animation philosophy** — cinematic / advanced / tech-forward but editorial. Prefer "dramatic + restrained" over "busy + cute." User has explicitly rejected gold-heavy day mode multiple times; the original gold-rich palette is preferred (don't darken text-gold globally for "readability").

## What the user has rejected (keep it out)

- Day-mode darkening of `text-gold` ("revert, earlier one is best") — keep gold as `#D4A84B` in both themes
- 3D heritage box replacement for the envelope ("earlier envelope one is best")
- Per-card nazar stickers in Whispers section ("just put on cursor / touch")
- Standalone Whispers section ("just add the sentences somewhere in the site")
- Standalone OurStory chapter section
- The Ardhanarishwara spiritual interlude
- Decade / "10 years in the making" framing — site is now a normal wedding invitation
- Snapchat-filter and rotated-EXIF photos in the gallery
- "Coin" terminology on the scratch card (use "stretch / scratch")
- Locking native scroll (use `fa-tour-hold` event for AutoTour only)
- Floating UI clutter: CustomCursor, SpotlightCursor, MarigoldPetals, ActIndicator, Marquee, etc.
- Maps direction link on family-home rows (Haldi, Mehndi) — private address, text-only

## Environment variables

Full list lives in `.env.local.example`. Runtime-consumed:

| Var | Used by | Required? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | RSVP persistence + presence counter. Missing → RSVPForm shows a graceful "not configured" error in en/hi/mr. |
| `NEXT_PUBLIC_SITE_URL` | `src/app/sitemap.ts`, OG image fallback | Used as the canonical URL in the sitemap. Falls back to the vercel.app default. |

## Venues (data model)

Two places hold venue data:
- `couple.venue` (`src/lib/couple.ts`) — the headline wedding venue + `lat`/`lng` for `VenueGlobe`. Currently **Kalash Banquet Hall**, Aligarh (`lat 27.9262251, lng 78.1280495`, resolved from the client's maps link). Also carries `mapsUrl: "https://maps.app.goo.gl/VgmymXTFwREtyjRB9"` — the exact short link used directly for the "Get directions" action (and the globe-pin tap) so guests land on the precise pin; `Venue.tsx` prefers `mapsUrl` and falls back to the `mapsQuery`-based search URL when absent.
- `events[*].venue` (`src/lib/events.ts`) — per-ceremony venue. Three constants used: `VARSHNEY_HOME` (Nirmala House, New Bank Colony, Surendra Nagar, Aligarh — Haldi + Mehndi), `KALASH_BANQUET_HALL` (Wedding), `TENTATIVE_GUEST_HOUSE` (Sangeet & Reception, flagged `tentative: true`).

Tentative venues get a gold "Tentative" badge + an italic "being finalised" note. Family-home rows (Haldi/Mehndi) deliberately have **no** Maps directions link.

## Image assets

- `/public/favicon.svg` — gold AF monogram on ink, 64×64. Also declared as apple-touch via `/public/images/ganesh.png`.
- `/public/images/ganesh.png` — used on Family section + as apple-touch icon.
- `/public/images/hero-bg.jpg` + `/public/images/hero-bg-2.jpg` — Hero diptych (both real couple photos; `hero-bg.jpg` = `IMG_0244.JPG.jpeg`, `hero-bg-2.jpg` = `IMG_0256.JPG.jpeg`).
- `/public/images/IMG-20251222-WA0065.jpg.jpeg` — Family section background.
- `/public/images/<11 photos>` — Gallery reel; manifest in `src/lib/gallery.ts`. The user **curates** what's in `public/images/`; never delete user-curated photos.
- `/public/audio/background.mp3` — present; `MusicPlayer` plays it (persistent loop from `fa-tour-start`).
- `/public/audio/intoduction.mp3` — present; `CinematicIntro` plays it (loud, ~0.85 vol) from the start, spanning the full ~8.6 s fast-mode intro. Filename spelled `intoduction` (as uploaded) — reference it exactly.
- Reference screenshots like `image.png` live in the project root and are **gitignored**. Use them as design references only; do NOT embed them into the site.
- `next.config.mjs` locks `images.remotePatterns` to `*.supabase.co`, `*.supabase.in`, `lh3.googleusercontent.com`. Add hostnames here before referencing new remote domains; don't re-open the wildcard.

## Notes for Claude

- The user is Ayush Varshney. He prefers cinematic / dramatic animated UI over minimal quiet-luxury for consumer/creative sites.
- The user **iterates rapidly** on visual details (font, cipher offset, timing, color, spacing). Make small targeted edits rather than large refactors. Run `npx tsc --noEmit` after each batch — keep the typecheck clean.
- Avoid `npm run build` while a dev server is running on the same machine — the build's `rm -rf .next` step corrupts the dev server's manifest and triggers a Windows EPERM file lock (OneDrive sync). Use typecheck for verification.
- The dev server runs on the Windows side of WSL; `curl localhost:3000` from WSL won't reach it. Rely on typecheck + structural correctness for verification, and let the user eyeball the render. A typical fix-cycle when the dev server gets corrupted: `taskkill /PID …`, `rm -rf .next`, `npm run dev`.
- Turbopack + React strict mode → timers in effects run twice on dev. `CinematicIntro` clears timers in the cleanup function; don't add `hasRun` refs (they block the second run after cleanup).
- When a section needs the AutoTour to pause for an interaction, dispatch `fa-tour-hold` (and `fa-tour-release` on cleanup). Don't lock body overflow or `Lenis.stop()` — the user wants native scroll preserved.
- The cursor nazar (`EvilEyeCursor`) handles both desktop and touch — don't reintroduce per-element nazar markers (rejected by the user).
- Photos in `/public/images/` are **user-curated**. Don't delete them or rearrange without checking. Many have orientation issues (rotated / Snapchat filters); if unsure, view them with the Read tool before adding to `gallery.ts`.

## Recent iteration log

- **Intro fast mode + loud music** — `CinematicIntro` total runtime cut ~18 s → **~8.6 s** (stage holds + per-card entrance/exit choreography tightened proportionally; all four cards kept, none cut mid-entrance). Intro music now plays from `currentTime 0` at **~0.85 volume** (was ~0.2), 0.3 s fade-in, spans the full 8.6 s with a 1.1 s fade-out (was a 5 s clip).
- **Gallery → interactive lightbox** — kept the scroll-pinned cinematic reel, layered on a full-screen lightbox (tap photo / caption pill to open; prev/next via buttons, arrow keys, swipe; close via button/ESC/backdrop) + made the dot rail clickable navigation. Full a11y (dialog role, focus trap, reduced-motion fade). New i18n keys `gallery.open_hint/close/prev/next/viewer/go_to` (en/hi/mr).
- **Venue → Kalash Banquet Hall** — main wedding venue changed from Raghunath Farm. `events.ts` constant `RAGHUNATH_FARM` renamed `KALASH_BANQUET_HALL`; `couple.venue` updated to lat `27.9262251` / lng `78.1280495` (resolved from the client's maps short link) + a `mapsUrl` field wired to "Get directions" / globe-pin tap.
- **RSVP delivery via mailto** — submit now opens the guest's mail app pre-filled to `couple.contact.rsvpEmail` (akashvarshney117@gmail.com); Supabase insert is best-effort; confirmation heading changed to **"Thank you!"** and the "reply box isn't ready" error path removed. (User chose mailto over Resend/Web3Forms.)
- **Content pass** — Events heading "Four days." → **"Four ceremonies."**; ceremony name **"Vivah" → "Wedding"**; RSVP email → akashvarshney117@gmail.com (footer + error copy); deleted the dead `ardha.*` i18n block (rescued the two presence strings to `presence.*`); removed the stale "placeholder family info" comment.
- **Dev server on WSL** — Turbopack file-watching does NOT work for `/mnt/c/` files (no HMR; `WATCHPACK_POLLING` is webpack-only and Turbopack ignores it). Run dev as `WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true npx next dev --webpack` so edits hot-reload. Otherwise every change needs a manual restart.
- **Heritage 3D box experiment** — built a full R3F memory-box scene to replace EnvelopeGate; user reverted to the wax envelope ("earlier one is best"). `HeritageBox.tsx` deleted; envelope restored from git.
- **Wax seal recentred + refined** — moved seal from `top-[34%]` to flex-centred at `top-1/2`; address relocated to `top: 82%`. Wax body deepened to a richer burgundy gradient with a `0.5 px` gold inner rim, layered drop-shadow stack, and stronger embossed effect on the AF monogram inside. Splatter drip dots removed.
- **Day-mode gold revert** — multiple attempts to dim/replace gold for cream-surface readability were all reverted; the user prefers the original gold-rich palette (`#D4A84B`) in both modes.
- **Whispers distributed** — abandoned standalone Whispers section; the four personal phrases now sit inside Story (2) and Family (1 per side), all using the shared `QUOTE_REVEAL` motion preset.
- **Family photo background + zigzag surnames** — Ganesh + family columns now sit on a full-bleed photo with a theme-aware cream/ink veil. Surname headlines split per character with alternating up/down displacement + counter-rotated tilt.
- **Countdown scratch card + fireworks** — replaced drag-to-reveal with a foil scratch canvas. Single stroke triggers reveal; canvas-confetti rockets + Shockwave + Starburst fire on reveal. Auto-tour pauses via `fa-tour-hold` while card is in view.
- **Gallery scroll-driven reel** — replaced masonry+lightbox grid with a sticky-pinned full-bleed reel. 11 curated photos × 8 unique transition effects.
- **Gallery reels snap + auto-tour pacing** — gallery now uses `lenis/snap` (mandatory) gated to the section via IntersectionObserver, one marker per photo, so a scroll settles on one image like Instagram Reels (input-only, escapable at the ends). `VH_PER_PHOTO` dropped 175 → 100 for clean 100vh snap spacing + realigned crossfade peaks (`progress = i/(N-1)`). `AutoTour` pace slowed (`VH_PER_SECOND` 0.2 → 0.12) so passive scroll reads calmly; the scratch card gets a bounded ~6.5 s `HOLD_PAUSE_MS` beat instead of hanging.
- **EvilEyeCursor touch support** — boncuk bead now appears under the finger on `touchstart`, follows `touchmove`, fades 900 ms after `touchend`.
- **AutoTour hold/release** — new `fa-tour-hold` / `fa-tour-release` events let sections pause the auto-scroll without locking native user scroll.
- **Hero monogram + buttons + photo crossfade** — reintroduced the animated AF Monogram as the hero centerpiece (with a gentle gold halo behind it). Hero RSVP / Calendar / Share buttons normalised to a consistent cream-on-transparent treatment (was visually mismatched). Mobile shows a single full-bleed photo with a 6 s crossfade between two photos (Ken Burns on each).
- **Cleanup pass** — deleted 17 orphan components (Ardhanarishwara, OurStory, Whispers, EndCredits, FindYourself, HerVsHim, HeroScene3D, Kailash3D, LiveGuestWall, MagneticButton, MusicPlaylist, NebulaBackground, PolaroidGallery, QuoteInterlude, RevealText, ScrambleHeading, SpiritualInterlude, SpiritualInvocation). Removed 5 dead i18n keys (`hero.tagline`, `story.honour`, `gallery.placeholder`, `gallery.cta_explore`, `venue.tap_for_directions`).
- **Decade framing removed** — earlier "10 years in the making / since 2017" copy stripped from the entire site (couple tagline, intro card, story narrative, OG metadata, hero share text). Site is now a normal wedding invitation.
- **`/ring-ceremony` route deleted** — the secondary teaser page was removed; `RingCeremonyTeaser` component deleted; `NEXT_PUBLIC_RING_CEREMONY_CODE` env var no longer used.
