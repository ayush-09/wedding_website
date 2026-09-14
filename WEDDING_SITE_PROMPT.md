# Wedding Invitation Website — Build Prompt

Copy this entire document into an AI coding assistant (Claude Code, Cursor, etc.). Fill in the **CUSTOMIZE THESE** block at the top with the couple's details, then let the assistant build the site from scratch. The rest of the document is fixed: it describes the exact stack, architecture, design system, features, and implementation specifics that produced the reference site.

---

## 🎨 CUSTOMIZE THESE (replace every value in this block)

```
GROOM_FIRST_NAME         = "Akash"
GROOM_LAST_NAME          = "Varshney"
GROOM_INITIAL            = "A"
GROOM_FATHER             = "Shri Ramesh Varshney"
GROOM_MOTHER             = "Smt. Suman Varshney"
GROOM_WITH_CHILDREN      = "along with their daughter Priya"
GROOM_BLESSED_BY         = "with the blessings of Late Shri Suresh Chand Varshney & Smt. Kamla Devi"

BRIDE_FIRST_NAME         = "Falguni"
BRIDE_LAST_NAME          = "Kaushik"
BRIDE_INITIAL            = "F"
BRIDE_FATHER             = "Shri Rajesh Kaushik"
BRIDE_MOTHER             = "Smt. Priya Kaushik"
BRIDE_WITH_CHILDREN      = "along with their son Karan"
BRIDE_BLESSED_BY         = "with the blessings of Late Shri Kishore Lal Kaushik & Smt. Radha Devi"

MONOGRAM_CIPHER          = "AF"      // the two initials for the logo
MONOGRAM_CIPHER_X_OFFSET = -20       // optical centring for F's swash; tune per letter-pair

WEDDING_DATE             = "2027-01-23T11:00:00+05:30"   // ISO with IST offset
WEDDING_DATE_DISPLAY     = "Twenty-Third of January, Two Thousand Twenty-Seven"
WEDDING_DATE_SHORT       = "23 · 01 · 2027"
WEDDING_DATE_DEVANAGARI  = "२३ · ०१ · २०२७"

ENGAGEMENT_DATE          = "2026-11-21T19:00:00+05:30"
ENGAGEMENT_DATE_DISPLAY  = "Twenty-First of November, Two Thousand Twenty-Six"

DATING_SINCE_YEAR        = 2017
TAGLINE                  = "Ten years in the making"

VENUE_NAME               = "Raghunath Farm"
VENUE_CITY               = "Aligarh, Uttar Pradesh"
VENUE_MAPS_QUERY         = "Raghunath Farm, Aligarh, Uttar Pradesh"
VENUE_LAT                = 27.8974
VENUE_LNG                = 78.0880

CONTACT_EMAIL            = "rsvp@falguni-akash.com"
HASHTAGS                 = ["#AkashFindsHisFalguni", "#TenYearsOfAF", "#AkashAndFalguni2027"]

CEREMONIES (ordered):
  1. Haldi             — 2027-01-21  10:00 IST–12:30 IST   dress: "Mustard & Marigold"   anthem: "Mehndi Laga Ke Rakhna" (DDLJ, 1995)
  2. Mehndi            — 2027-01-22  16:00 IST–19:00 IST   dress: "Forest Green & Fuchsia"  anthem: "Mehndi Hai Rachnewali" (Zubeidaa, 2001)
  3. Vivah (Wedding)   — 2027-01-23  11:00 IST–14:30 IST   dress: "Regal Reds & Ivory"      anthem: "Tujhe Dekha Toh Yeh Jaana Sanam" (DDLJ, 1995)
  4. Sangeet+Reception — 2027-01-23  19:30 IST–23:30 IST   dress: "Black Tie Bollywood"     anthem: "Kala Chashma" (Baar Baar Dekho, 2016)

STORY (short narrative — "Ten years, briefly"):
  """
  We met in a crowded hallway in Delhi in 2017. Somewhere between coffee that
  became dinner and a trip to Goa that shouldn't have ended, we became the loudest
  quiet thing in each other's lives. Ten years later — one rooftop in Udaipur, one
  borrowed ring, and a hundred arguments about rugs later — we are finally,
  properly, getting married.
  """

GALLERY_FRAMES (year, location, gradient-tint):
  - 2017, Delhi,         indigo
  - 2019, Connaught Place, wine
  - 2021, Goa,           saffron
  - 2023, Gurgaon,       gold
  - 2024, Florence,      indigo
  - 2025, Udaipur,       gold

GANESH_EMBLEM_IMAGE      = "/public/images/ganesh.png"    // gold-foil PNG with transparent bg
BACKGROUND_AUDIO         = "/public/audio/background.mp3" // optional
```

---

## 🎯 BUILD INSTRUCTIONS

Build a **single-page cinematic wedding invitation website** using the CUSTOMIZE THESE variables above. Do not ask questions — follow the specs below exactly.

### 1. Project Setup

- **Framework**: Next.js 16.2 (App Router, Turbopack enabled).
- **Runtime**: React 19.
- **Language**: TypeScript 5.7, `strict: true`.
- **Styling**: Tailwind CSS 3.4 with the custom colour palette below.
- **Scripts**: `dev` (`next dev`), `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`).

Install these dependencies:

```
framer-motion@^11.18
lenis@^1.1
react-parallax-tilt@^1.7
canvas-confetti@^1.9
@tsparticles/react @tsparticles/slim
@supabase/supabase-js@^2.103
@react-three/fiber@^9 @react-three/drei@^10 three@^0.184
cobe@^2.0
clsx tailwind-merge
```

Google fonts via `next/font/google`: **Italiana**, **Allura**, **Pinyon Script**, **Cormorant Garamond**, **Inter**, **Tiro Devanagari Hindi**. Bind each to CSS variables (`--font-display`, `--font-script`, `--font-cipher`, `--font-serif`, `--font-sans`, `--font-sanskrit`). Use `display: "swap"` everywhere.

### 2. Design System

**Palette** (add as Tailwind theme colours):

```
ink        #0F0F26   deepest indigo
wine       #1B1B3A   royal indigo (accents)
indigo     #1B1B3A   semantic alias
cream      #F5E6C9   temple cream (base light)
bone       #ECD8A8   deeper cream
ash        #F3EADA   bhasma text
gold       #D4A84B   primary accent
goldsoft   #E4D4A8
saffron    #E85A2F   sacred fire (sparing)
rose       #B9A7D1   muted lavender
neel       #2D4263   temple blue
royal      #2A1B5E   deep blue
twilight   #281C50
```

**Gradient utility classes** in `globals.css`:

- `.bg-paper` — radial indigo halo (top-left) + gold halo (bottom-right) + saffron centre tint, over a cream→bone linear vertical gradient.
- `.bg-cinema` — indigo cosmic backdrop with a top-glow.
- `.bg-sepia` — warm gold + indigo halos on a bone gradient.
- `.bg-twilight` — gold halo top + saffron bottom over an indigo→royal gradient.
- `.bg-divine` — cream canvas with a soft indigo crown.
- `.bg-temple` — warm bhasma with gold accents.
- `.bg-fire` — indigo + gold burn for accent sections.

**Motion vocabulary**:
- Primary easing: `[0.22, 1, 0.36, 1]` (quart-out). Use on major entrances.
- Breath cadence: 4–4.5 s pulse period for every "sacred halo" so the site breathes in unison.
- Spring defaults for micro-interactions: `stiffness: 260–320, damping: 22–26`.

### 3. Typography Rules

- `.kerning` class: `letter-spacing: 0.32em; text-transform: uppercase;` — used for small tracked labels.
- `.hairline` class: thin 1-px line with 20–80% alpha fade at the ends (use `linear-gradient(90deg, transparent, currentColor 20%, currentColor 80%, transparent)`).
- `.sanskrit` class: `font-family: var(--font-sanskrit), 'Noto Serif Devanagari', serif;`
- When language is `hi` or `mr`, swap `font-display italic` → `font-sanskrit`, `font-serif italic` → `font-sanskrit not-italic`, `kerning` → `font-sanskrit tracking-wide`. Latin letter-spacing butchers Devanagari conjuncts.

### 4. Internationalization (i18n)

Three languages: **English / हिन्दी / मराठी**.

- Create `src/lib/i18n.ts` with a typed `translations` object: `{ [key]: { en: string; hi: string; mr: string } }`.
- Export `translate(key, lang, vars?)` with `{placeholder}` interpolation. Missing-key fallback returns English.
- Create `src/components/LanguageProvider.tsx` — React context with `lang`, `setLang`, `t(key, vars?)`. Persist to `localStorage` as `af-lang`. Sync `<html lang>` on change.
- Create `src/components/LanguageToggle.tsx` — a horizontal pill with `English · हिन्दी · मराठी`, active one in gold, inactives in `text-ink/55`.
- **Proper nouns stay Latin** in all three languages (names, surnames, place names, film titles, song titles).
- **Numerals**: use Devanagari digits in hi/mr localized strings for dates (e.g. `२३ · ०१ · २०२७`).
- **Translation keys required** (full list to include in the dictionary):
  - Hero: `together`, `tagline`, `scroll`, `date`
  - Family: `blessings`, `our_families`, `joined`, `request`, `groom_family`, `bride_family`, `surname_template`
  - Story: `eyebrow`, `heading`, `narrative`, `honour`
  - Ardhanarishwara: `eyebrow`, `heading_a`, `heading_b`, `subheading`, `parvati_name`, `parvati_desc`, `parvati_line`, `shiva_name`, `shiva_desc`, `shiva_line`, `vow`, `disclaimer`
  - Countdown: `eyebrow`, `heading_lead`, `heading_highlight`, `days`, `hours`, `minutes`, `seconds`, `happening`
  - Events (shared): `eyebrow`, `heading_a`, `heading_b`, `label.time`, `label.dressCode`, `label.anthem`, `label.passport`
  - Events (per-ceremony, i18nKey = haldi/mehendi/wedding/sangeetReception): `subtitle`, `description`, `dressCode`, `time`, `date`, `shortDate`
  - Venue: `eyebrow`, `heading`, `directions`, `tbd_heading`, `tbd_body`, `tap_for_directions`, `opening_directions`
  - Gallery: `eyebrow`, `heading`, `placeholder`
  - Ring: `eyebrow`, `heading_a`, `heading_b`, `subheading`, `admitTwo`, `ticketNo`, `name`, `tagline`, `label.*`, `value.*`, `cta`, `ctaHint`, `footer`
  - RSVP: `eyebrow`, `heading_a`, `heading_b`, `stage.*`, `continue`, `done.received`, `done.yesMsg`, `done.yesMsgSingular`, `done.noMsg`
  - Footer: `blessing`, `questions`, `replay`, `backRsvp`, `with_love`
  - Calendar: `add`, `add_short`, `google`, `outlook`, `apple_ics`, `all_ceremonies_hint`, `main_wedding_hint`, `event_title`, `event_description_main`, `venue_tbd`

### 5. Theming (Light + Dark)

- Create `src/components/ThemeProvider.tsx` — context with `theme: "light" | "dark"`, `setTheme`, `toggle`. Persist as `af-theme`. First-visit default: honour `prefers-color-scheme`.
- Toggle `.dark` class on `<html>`, not `<body>`.
- Dark-mode implementation: **CSS selector overrides** in `globals.css`, not Tailwind `dark:` variants. Examples:
  - `html.dark .bg-paper { background: <dark gradient>; }` repaint all section gradients.
  - `html.dark .text-ink` → cream, `text-ink/55` etc. with matching alphas.
  - `html.dark .text-indigo` → `#E4D4A8` (goldsoft) — headings stay luxurious.
  - `html.dark .text-wine` → cream, plus opacity variants. **Essential**: without this the Countdown "I do" accent and Ring Ceremony ticket copy go invisible.
  - `html.dark .bg-gradient-to-b.from-wine.to-ink` → `linear-gradient(gold → goldsoft)` so countdown digits remain visible.
  - `html.dark ::selection` → `rgba(245, 230, 201, 0.28)` background, cream text.
- **Devanagari opacity boost** (applies theme-agnostically, not just dark):
  - `.font-sanskrit, .sanskrit { text-shadow: 0 0 0.4px currentColor; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; letter-spacing: 0.01em; }`
  - Boost `text-cream/*` and `text-ash/*` opacities by ~15–25% when the element carries a sanskrit class. Devanagari renders thinner than Latin serifs at the same weight.
- **Transition on `<html>`**: `background-color 0.4s ease, color 0.4s ease` so theme toggle cross-fades the whole page.

### 6. Component Architecture

Implement these components with the exact behaviours described:

#### 6.1 `Monogram.tsx`

Custom SVG logo of the couple's initials (use `MONOGRAM_CIPHER`):
- **Wreath**: 14 sprigs around a circle (R=95 around CX=160, CY=170). Alternating silver-dollar eucalyptus, rosebud, eucalyptus spear, open rosebud. Skip within ±18° of 12 and 6 o'clock for the crown and heart.
- **Crown**: heraldic three-peak with a tiny heart above, at 12 o'clock.
- **Cipher**: the initials in Pinyon Script at `fontSize: 94`, letter-spacing `-0.05em`, positioned at `x={CX + MONOGRAM_CIPHER_X_OFFSET}` to optically centre despite swash geometry.
- **Heart + ribbon**: at 6 o'clock.
- **Names + date** (tracked caps): `· {Groom Firstname} & {Bride Firstname} ·` on the outer ring, `WEDDING_DATE_SHORT` below (optional via `showDate` prop).
- **`animate={true}` prop**: 1.95 s entrance — sprigs bloom from bottom up with per-sprig delay derived from angular distance from 6 o'clock, crown drops from y=-50 at 0.9 s, cipher fades-scales at 1.25 s, heart bounces in at 1.4 s then runs a continuous `[1, 1.18, 1, 1.1, 1]` heartbeat every 1.5 s. Names + date fade in at 2.55 s.

#### 6.2 `CinematicIntro.tsx`

16.5 s five-card film on a cosmic Shiva backdrop (indigo + saffron halo + neelkanth glow + starfield + drifting petals + letterbox bars + film grain):

| Card | Time | Content |
|---|---|---|
| 0 | 0–1.6 s | Gold fleuron ❦ + kerned "A Love Story" + hairline + "presents" |
| 1 | 1.6–3.8 s | Kerned "SINCE" + giant `DATING_SINCE_YEAR` (clamp 4.5rem → 8.5rem) + hairline + "a decade in the making" — digits spring-drop |
| 2 | 3.8–8.0 s | Kerned "The Wedding Of" + animated Monogram + hairline |
| 3 | 8.0–13.3 s | "Together Forever" label + `GROOM_FIRST_NAME` + luminous gold **&** (Cormorant italic) + `BRIDE_FIRST_NAME` + Sanskrit प्रेम · "Prema · Love" |
| 4 | 13.3–16.5 s | "Save the Date" + "23rd · January" + hairline + huge **2027** (spring drop) |

At 16.5 s, dispatch `fa-intro-complete` event and `setShow(false)` *simultaneously* (not 800 ms later — otherwise the homepage flashes through between intro exit and envelope entrance). Skip button fires the same event immediately. Use a `completedRef` to prevent double-dispatch (t5 timer vs skip click).

#### 6.3 `EnvelopeGate.tsx`

Three-phase state machine: `hidden → bridge → envelope`.

- **Bridge slide (~1.4 s)**: kerned "an invitation arrives" (letter-spacing animates 0.2em → 0.42em), hairline, AF Monogram with gold drop-shadow glow, italic "for you, only you."
- **Envelope**: 540×~348 px (aspect 1.55:1). Cream gradient body with noise texture overlay, double inset borders, **kadai zardozi gold embroidery frame** (paisley + bead motifs on repeat along all four edges via inline SVG backgrounds), corner flourishes, and diagonal lines hinting the fold. Top flap is a 100×50 SVG triangle with a gold-stroke outline that rotates `rotateX: -172deg` on open.
- **Wax seal** (centred at 34% top): dark red radial gradient (`c8313f → 7a1f2b → 3b0d14`) with a gloss highlight, rotating dashed gold ring around the rim (60s per revolution), **AF Monogram stamped inside** (static, gold, with a drop-shadow glow so it reads as pressed foil). Wax drip shapes off-centre.
- **Periodic shake**: use *two nested motion.divs* — outer handles state transforms (scale/rotate/opacity/y for open/hover), inner runs a pure keyframe shake loop: `rotate: [0, -9, 9, -7, 7, -4, 4, -2, 2, 0]` over 0.8 s with 1.8 s repeatDelay, Infinity. Splitting is required because Framer drops the keyframe loop if you mix scalar + array on the same prop.
- **Handwritten script names** above envelope: `{GROOM_FIRST_NAME}` + italic "&" + `{BRIDE_FIRST_NAME}` in Allura.
- **Rotating CTA quotes** (cycle every 5 s):
  - "The seal is stirring — a gentle tap opens it."
  - "Ten years pressed into wax. Tap the seal to break it."
  - "This letter has waited a long time. Tap the seal."
  - "Some letters tremble to reach you. This is one."
- **Inner card**: appears on seal tap, slides up with spring. Contains: Ganesh emblem image (`/images/ganesh.png`) + `ॐ गं गणपतये नमः` + hairline + kerned "You are invited" + `{groom} & {bride}` + `WEDDING_DATE_SHORT`.
- **Tap seal flow**: flap rotates open → ripple radiates → card slides up → stays visible indefinitely → user taps "Enter the invitation →" below to dispatch `fa-tour-start` and dismiss. Second tap on envelope also dismisses.
- **Skip ("Enter directly →")**: top-right, serif-italic (not utility-kerned), held back 3.5 s so the reveal lands first.
- **Fallback timer**: 19 s after mount — triggers the sequence in case `fa-intro-complete` never fires. Must be *after* intro's 17.3 s runtime; earlier fallback timers leave the envelope mounting invisibly behind the intro overlay.
- **No `hasRun` ref** — React StrictMode would block the second effect run and leave the envelope forever invisible.

#### 6.4 Home page (`app/page.tsx`)

Composition order inside `<ClientOnly>`:

```
<Hero />
<Family />
<Story />
<Ardhanarishwara />
<Countdown />
<Events />
<Venue />
<Gallery />
<RingCeremonyTeaser />
<RSVPForm />
<Footer />
```

#### 6.5 `Hero.tsx`

Monogram with animation, kerned "Together since {DATING_SINCE_YEAR} · Forever from 2027", couple names in Italiana italic (clamp 2.75rem → 8rem), gold **&** separator, italic `TAGLINE`, kerned `WEDDING_DATE_SHORT`, HeroActions (RSVP + AddToCalendar + Share), animated scroll cue.

#### 6.6 `Family.tsx`

- Big Ganesh emblem (PNG, 116 px mobile / 144 px desktop) with pulsing gold halo (4.5 s cycle) + drop-shadow glow.
- `ॐ श्री गणेशाय नमः` + transliteration.
- Italic "With the blessings of the Divine and our elders".
- "Our families / Joined in celebration" heading.
- Two columns (grid md:grid-cols-2) split by a vertical gold gradient seam: groom's family LEFT, bride's family RIGHT. Each column: kerned label + `The {surname} Family` in gold + father name + italic "&" + mother name + `{withChildren}` + hairline + `{blessedBy}`.
- Closing "request the honour of your presence at the wedding of their children".

#### 6.7 `Story.tsx`

Kerned eyebrow + Italiana italic heading "Ten years, briefly." + hairline + serif narrative paragraph (from `STORY` template) on a cream gradient section.

#### 6.8 `Ardhanarishwara.tsx`

Dark twilight section. **Shiv-Parvati combined sigil** at top (trishul + crescent moon + lotus composite, 76/100 px) with pulsing gold halo (4.5 s, same cadence as Family Ganesh). Eyebrow "An older story", heading "Not a mirror. A compass." (last word in gold), subheading. Two-column grid split by a vertical gold seam with an "&" orb in the middle: **Parvati** (left) with Lotus SVG + पार्वती + description + "Patience, chosen as practice." / **Shiva** (right) with Trishul SVG + शिव + description + "Stillness, chosen as home." Closing: "We take our vows in the shadow of this story." + muted "An inspiration. Never a comparison."

#### 6.9 `Countdown.tsx`

- Kerned eyebrow + display-italic "until we say 'I do'" (quoted word in gold).
- Grid of 4 cells: Days / Hours / Minutes / Seconds — giant Italiana digits with a `from-wine to-ink bg-clip-text` gradient (override to gold gradient in dark mode).
- Each digit wrapped in `AnimatePresence mode="popLayout"` so digit changes rotate-flip in.
- `setInterval(1000)` ticks, **gated by `document.visibilityState`** — pause when tab hidden, resume on visible.
- `diff.isNow`: show "It's happening. Welcome." serif italic line.

#### 6.10 `Events.tsx`

Section heading "Four days. One beginning." Grid of 4 ceremony cards. Each card:

- Palette strip at top, scales-X on mount.
- Header row: numbered badge `01/02/03/04` + kerned long-date + per-ceremony illustration SVG.
- Display-italic ceremony name, italic subtitle, hairline, `<dl>` with Time / Dress code / Anthem (song title + film), description paragraph, footer with "Passport stamp · unlocks on RSVP" + pulsing palette dots.
- **Hover**: `y: -8` lift, alternating ±0.4° rotation per card index, cursor-tracking gold spotlight (radial-gradient driven by mouse-position motion values), shimmer sweep (translate-x `-120%` → `120%`, 1.4 s), **palette aura bloom** (blurred radial gradient in `palette[0]` sitting *outside* the card), **per-card thematic particles** (14 small dots rising from the bottom with horizontal drift, colours from the card's own palette, only mounted while hovered).
- **react-parallax-tilt** wrapper for subtle 3D tilt + gold glare.

#### 6.11 `Venue.tsx` + `VenueGlobe.tsx`

- **Venue section**: cream (`bg-paper`). Eyebrow "Where it happens" + heading "The venue".
- **Left column**: venue name in gold display italic, city in serif italic, hairline, "Get directions →" link (opens `https://www.google.com/maps/search/?api=1&query={VENUE_MAPS_QUERY}`).
- **Right column (square, max-width 420 px)**: `VenueGlobe` — **cobe v2 photorealistic dotted globe** with:
  - Initial phi = `-((VENUE_LNG + 180) * π / 180)` so the venue faces the camera on first frame.
  - Theta 0.25 (north pole tilts toward camera).
  - `mapSamples: 18000`, `mapBrightness: 5.4`, warm-cream land dots `[0.72, 0.62, 0.45]`, gold atmosphere `[0.92, 0.78, 0.48]`.
  - Single marker at `[VENUE_LAT, VENUE_LNG]` with pulsing size: `0.11 + sin(t * 2.2) * 0.035`.
  - Auto-spin `0.0035 rad/frame`.
  - `requestAnimationFrame` loop with `globe.update({ phi, width, height, markers })` — cobe v2 dropped the `onRender` callback from v1 examples; you must use `update()`.
  - Wait for non-zero container dimensions before creating the globe (rAF poll) — WebGL errors on 0×0 canvases.
  - React-managed wrapper `<div>` parents the canvas; all dynamic styling flows through React state, not direct `canvas.style.*` mutations (prevents Fast Refresh `removeChild` errors).
  - **Tap detection inside the globe's pointer handlers** — track max movement between pointerdown/up; if < 6 px and within 18% of canvas min-dim from centre, fire `onPinTap`. *Do not use an overlay button* — it fights the globe's `setPointerCapture` and the browser never synthesizes the click.
  - Drag-to-orbit with inertial phi composition.
  - **Page-visibility gated** — the rAF loop skips `globe.update()` when tab is hidden (but still schedules next frame so focus-return is instant).
- **Overlay attention layers** (all `pointer-events-none`):
  - Three concentric gold sonar rings expanding outward from centre via `@keyframes venue-ping` (scale 0.4 → 2.8, opacity 0.9 → 0, 2.8 s per ring, staggered 0.9 s apart).
  - Floating "{VENUE_NAME}" kerned caption above the globe with a gold SVG arrow that bobs `y: [0, 4, 0]` with opacity pulse.
- **Tap-to-directions**: when `onPinTap` fires, `setOpening(true)` → globe container scales 1.35x with `blur(1.5px) brightness(1.1)` over 900 ms → radial gold flash blooms (scale 0.4 → 2x) → "Opening directions…" text + pulsing beacon fade in at 200 ms delay → after 900 ms, `window.open(directionsHref, "_blank")`. 1100 ms later, release state for repeat taps.
- **Lazy-load** via `next/dynamic({ ssr: false })` so the ~130 KB Three.js + cobe chunks stay out of initial bundle.

#### 6.12 `Gallery.tsx`

Eyebrow "Moments" + heading "A decade, in frames." Grid of 6 frames (grid-cols-2 sm:grid-cols-3), each `aspect-[3/4]` with a year/location caption overlay on hover gradient. Currently render as gradient placeholders; swap to real photos by dropping images into `/public/gallery/` and updating the `frames` array.

#### 6.13 `RingCeremonyTeaser.tsx`

Dark wine-gradient section. "Premiere screening" eyebrow + "A private prologue" heading + "Limited seating. Invitation-only. No press." subheading. Ticket graphic with three sections: main stub (date/time/feature/anthem) + perforated vertical dashed divider with 14 dots + seat stub (Seat AF / Row A·1 / Show 21.11.26). Physical notches on the horizontal edges. Redeem CTA linking to `/ring-ceremony` page.

#### 6.14 `RSVPForm.tsx`

Dark `bg-ink` section with a subtle paisley pattern overlay. Eyebrow "Your reply" + display-italic "Will you be there?" (last word in gold). Card container with backdrop-blur.

Four stages with `step: "name" | "attending" | "events" | "message" | "done"`:
1. **Name**: single-line input, Continue button disabled until non-empty.
2. **Attending**: two large buttons — "Yes, always" (primary) / "Regretfully no" (outline cream).
3. **Events**: multi-select ceremony list. Selected: border-gold + bg-gold/10 + text-gold.
4. **Message**: 3-row textarea, "Seal my reply →" submit.
5. **Done**: gold-ringed ✓ stamp (SVG, not "A&F" text) with spring-in animation, display-italic "Received, with love.", hairline, personalised stamp-count message.

On submit: post to Supabase (if env keys present), trigger three-burst `canvas-confetti` in the site palette for "yes" answers.

#### 6.15 `Footer.tsx`

Centred: Monogram (static), Allura-script "With all our love," signature, display-italic couple names with gold "&", kerned tagline, hairline, italic "Your presence is our blessing.", "For questions, {email}" mailto, chrome row with "↺ Replay intro" (`window.location.reload()`) + "↑ Back to RSVP".

### 7. Cross-cutting Features

#### 7.1 Auto Tour (`AutoTour.tsx`)

- Listens for `fa-tour-start` event; smoothly scrolls from current position to bottom over **90 seconds** via Lenis (`window.__lenis`).
- **Pause-on-interaction model**: wheel/touch/keydown/click pauses the tour; 4 s of stillness resumes. Resume duration scales to remaining distance so speed stays consistent.
- **`pausedRef` guard**: only *first* interaction per pause session pins Lenis — without this guard, every wheel event re-pins Lenis and the page feels unscrollable.
- `tourActiveRef` prevents random pre-envelope clicks from kicking off the tour.

#### 7.2 Romance Ambience (`RomanceAmbience.tsx`)

Fixed full-viewport overlay at z-30, `pointer-events-none`:
- **14 hearts** rising from bottom, three size tiers (10/14/18 px), alternating gold + rose, horizontal wobble with alternating phase, double-layered gold-glow drop-shadow.
- **8 rose petals** falling from above, rotating 540° (`spin = ±1`) with 6-keyframe horizontal drift, six palette colours cycling.
- **9 gold sparkles** (4-point stars) pulsing scale + 180° rotation at fixed positions.
- Skipped on `(pointer: coarse)` / `ontouchstart` devices.
- **`usePageVisible()` gated** — unmount the entire tree when tab is hidden.

#### 7.3 Evil-Eye Cursor (`EvilEyeCursor.tsx`)

Nazar cursor companion. Fixed at z-40, `pointer-events-none`:
- Almond-shape SVG (gold trim, indigo outer iris, neel inner iris, ink pupil, cream highlight).
- Follows mouse with spring physics (`stiffness: 260, damping: 22, mass: 0.6`).
- Hidden by default, fades in on first mouse move, fades out on viewport-exit.
- Blinks every ~5 s (`scaleY: [1, 1, 0.08, 1, 1]`).
- Skipped on touch / coarse-pointer.
- `mix-blend-multiply` so it blends with page tone.

#### 7.4 Floating Controls (`FloatingControls.tsx`)

Two fixed pills:
- **Top-left**: `ThemeToggle` (sun/moon AnimatePresence cross-fade).
- **Top-right**: `LanguageToggle` (English · हिन्दी · मराठी pill).

Both: `bg-cream/95` background (not `bg-paper/75` — Tailwind opacity modifiers don't work on custom gradient classes, so the pill would be transparent on dark sections and invisible). `border-ink/15`, `shadow-[0_6px_22px_rgba(15,15,38,0.22)]`. Dark-mode override: `bg-cream/95 → rgba(27, 27, 58, 0.92)` so pills flip dark.

#### 7.5 Calendar Export

`src/lib/calendar.ts` with:
- `CEREMONY_TIMES` record keyed by i18nKey with `{ startH, startM, endH, endM }` in IST.
- `dateInIST(dateStr, h, m)` returning a `Date` constructed from an ISO string with explicit `+05:30` offset.
- `makeIcsCalendar(events)` — RFC 5545 compliant `.ics` with `VERSION:2.0`, `PRODID`, escaped text (`,`, `;`, `\`, newlines).
- `googleCalendarUrl(event)` — `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=YYYYMMDDTHHMMSSZ/…`.
- `outlookLiveUrl(event)` — `https://outlook.live.com/calendar/0/deeplink/compose?...`.
- `downloadIcs(content, filename)` — blob + temporary anchor click.

`AddToCalendar.tsx` — a button that opens a 3-item menu (Google / Outlook / Apple · Other .ics). Google and Outlook prefilled with just the main Vivah; .ics download contains all 4 ceremonies. Event descriptions pulled from the current i18n locale so the calendar entries are in the guest's chosen language. Venue falls through to the translated "venue to be announced" placeholder if `couple.venue.name === "TBD"`.

#### 7.6 Smooth Scroll

`src/components/SmoothScroll.tsx`:
```ts
const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
(window as any).__lenis = lenis;
const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
requestAnimationFrame(raf);
```

#### 7.7 Page Visibility Hook

`src/lib/usePageVisible.ts` — tracks `document.visibilityState`, returns boolean. Used to gate cobe rAF, ambient particles, and the envelope quote-rotation interval.

### 8. Layout & Chrome

`src/app/layout.tsx`:

```tsx
<html lang="en" className={allFontVariables}>
  <body className="grain font-serif bg-[var(--bg)] text-[var(--fg)]">
    <ThemeProvider>
      <LanguageProvider>
        <ClientOnly>
          <ScrollToTopOnMount />
          <CinematicIntro />
          <EnvelopeGate />
          <ScrollProgress />
          <MusicPlayer />       {/* optional background audio */}
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
```

Z-index layering: page content z-10, romance ambience z-30, floating controls + evil-eye z-40, envelope overlay z-95, cinematic intro z-100.

### 9. Performance Rules

- Lazy-load the globe via `next/dynamic({ ssr: false })`.
- Use `next/image` for all bitmap assets with `priority` only on above-the-fold images.
- All fonts `display: "swap"` with fallback cascades.
- Use `contain: layout paint size` on the globe canvas.
- Cap DPR at 2 in WebGL.
- Pause rAF-driven work on `visibilitychange`.
- AnimatePresence particle trees only mount when their parent is hovered.
- Supabase env-gated: if keys absent, the client is a silent no-op.

### 10. Accessibility Rules

- Every interactive element: `aria-label`, appropriate `aria-pressed` / `aria-haspopup` / `aria-expanded`.
- `focus-visible:ring-2 focus-visible:ring-gold` on every button.
- `<html lang>` kept in sync with the language toggle.
- Touch-device fallbacks: skip the evil-eye cursor and romance ambience on coarse pointers.
- AA contrast on all text in both themes.

### 11. Content Assets to Provide

- `/public/images/ganesh.png` — gold-foil Ganesh emblem with transparent background. If a raw reference is provided, a Python script using Pillow + numpy can extract: gate pixels on `R - B > threshold`, gamma-correct alpha, tint to the site gold token, crop to tight bbox, pad to square. Final size ~800×800 px.
- `/public/audio/background.mp3` — optional ambient audio track.
- `/public/gallery/*` — real photos for the Gallery section (currently placeholders).

### 12. Optional Secondary Page

`/ring-ceremony` route — a separate page for the engagement/roka ceremony with its own design. Date + time + venue + dress code + RSVP. Linked from the home-page `RingCeremonyTeaser`.

---

## 📋 IMPLEMENTATION CHECKLIST

When generating the site, verify against this list before declaring done:

- [ ] `npx tsc --noEmit` runs clean.
- [ ] Intro plays 16.5 s and hands off to envelope without a homepage flash in between.
- [ ] Envelope seal shakes periodically and shake pauses on hover.
- [ ] Tapping seal opens card; card stays until user clicks "Enter the invitation →".
- [ ] "Enter directly" (top-right) works at any time during envelope.
- [ ] Auto-tour starts post-envelope, pauses on interaction, resumes after 4 s.
- [ ] Countdown ticks live, pauses when tab hidden.
- [ ] Venue globe renders with continents visible, venue pin pulses, drag-to-orbit works, tap opens Google Maps with zoom animation.
- [ ] Calendar menu offers Google / Outlook / Apple-.ics; all three produce valid entries.
- [ ] RSVP flow completes with confetti on "yes".
- [ ] Language toggle switches all translated strings instantly; fonts swap for Devanagari.
- [ ] Theme toggle cross-fades the whole site; `text-wine` / countdown digits stay visible in dark mode; language + theme pills stay readable on every section.
- [ ] Devanagari text reads clearly on dark sections in light mode (Family Ganesh invocation, Ardhanarishwara stanzas, RSVP copy, Ring Ceremony ticket).
- [ ] All animations pause/stop when the tab is hidden.
- [ ] Site is keyboard-navigable and AA-contrast across both themes.

---

**End of prompt.** Run through these specs in order; don't skip sections. The platform is tightly integrated — animations, theming, i18n, and page-visibility gating reference each other, so partial implementations will produce the regressions documented in the notes (homepage flashes, invisible toggles on dark sections, Devanagari legibility drops, WebGL 0×0 canvas errors, Fast Refresh DOM-removal errors, etc.).
