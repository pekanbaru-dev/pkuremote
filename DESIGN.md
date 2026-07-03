<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->

---

name: PKUBersua
description: Warm, editorial event site for the lintas-profesi Pekanbaru community — find and book the next meetup, workshop, or talk.

---

# Design System: PKUBersua

## 1. Overview

**Creative North Star: "The Warm Bulletin"**

A warm, reading-first event surface for a lintas-profesi Pekanbaru community. The site behaves like a well-edited community notice board: upcoming and past events lead; chrome recedes. Whitespace and type hierarchy carry the layout — not boxes, borders, or decoration. A single restrained golden accent marks what's timely (the next event, a live link); the rest of the surface lives on a warm cream canvas so the accent reads as deliberate warmth, not as ambient noise.

The system rejects the generic community/club website — crowded sidebars, event-countdown widgets, stock illustrations, WordPress-theme chrome — and it rejects the SaaS-landing gradient hero. Energy comes from the content's timeliness, not from the UI. Motion is responsive: state changes and feedback are animated, but there is no scroll-driven choreography or orchestrated entrances.

**Key Characteristics:**

- Reading-first: editorial sans display, generous measure, generous whitespace.
- Warm, restrained color: cream canvas, one golden accent used sparingly.
- Responsive motion: hover/focus/transition only; no entrance choreography.
- Flat by default; depth conveyed by tonal layering, not shadows.
- Warm, calm, focused — the site itself is evidence the community cares about craft.

## 2. Colors: The Stitch Material-3 Golden Palette

A warm cream canvas with a single restrained golden accent. The accent marks timeliness — the next event, a primary action — and is used on ≤10% of any screen. The canvas is intentionally warm (chroma ≈ 0.03, hue 100) so the golden accent reads as warm but deliberate, not as a default off-white.

**The One Voice Rule.** The golden accent is used on ≤10% of any given screen. Its rarity is the point. It marks what's timely; it is never decorative.

### Primary

- **Goldenrod Amber** (`#765a05`, oklch 0.483 0.097 87): The single accent. Used for event dates, primary links, primary button fills, and the status badge for upcoming events. Saturated enough to read as intentional; never pale or pastel.
- **Goldenrod Container** (`#e9c46a`, oklch 0.834 0.117 87): Soft golden fill for highlighted cards, the focus-ring tint, and "promo" callouts. Sits behind primary; carries the accent into surfaces without competing with it.

### Neutral

- **Canvas** (`#fefae0`, oklch 0.981 0.034 100): Page background. Warm cream.
- **Surface** (`#fefae0`, oklch 0.981 0.034 100): One tonal step up from canvas for sections; same value, used where structure needs a faint lift.
- **Surface Container** (`#f2efd5`, oklch 0.948 0.034 102): Tonal lift for cards.
- **Ink** (`#1d1c0d`, oklch 0.223 0.027 105): Body text and headings. Near-black with a faint green-warm lean. ≥7:1 against the canvas.
- **Muted Ink** (`#4d4638`, oklch 0.397 0.024 85): Secondary text, dates, meta. ≥4.5:1 against the canvas.
- **Hairline** (`#d0c5b2`, oklch 0.827 0.029 81): 1px dividers and borders. Warm low-contrast.

### Secondary & Tertiary

- **Secondary** (`#6b5e0d`, oklch 0.480 0.095 99): Olive-gold for secondary actions and meta accents.
- **Tertiary** (`#825424`, oklch 0.488 0.088 64): Warm amber-brown for tertiary callouts (e.g., "limited slots").
- **Outline** (`#7f7666`, oklch 0.569 0.026 82): Warm gray for input borders and form outlines.

### Error

- **Error** (`#ba1a1a`, oklch 0.506 0.193 28): Reserved for destructive states only (e.g., "Kuota penuh" badge, form errors). The success / warning / info intents collapse to the brand ochre per the component-library spec.

## 3. Typography

**Display & Body Font:** Hanken Grotesk (weights 400, 600, 800). Loaded from Google Fonts with `display=swap`.
**Label Font:** Manrope (weights 500, 600). Used for the small label role (meta rows, status badges, button labels).

**Character:** The single-family display/body pairing (Hanken Grotesk) keeps the site readable at all sizes; Manrope's slight geometric character (in label only) provides a quiet counterpoint. The pairing reads as warm, modern, and accessible, not editorial-decorative. Note: this is a deliberate move away from the previous Spectral + Source Sans 3 editorial pairing — see the brand-pkubersua spec for rationale.

### Hierarchy

- **Display** (Hanken Grotesk 800, `clamp(2.5rem, 6vw, 4rem)`, line-height 1.05, letter-spacing -0.02em): Hero only. `text-wrap: balance`.
- **Headline** (Hanken Grotesk 600, `clamp(1.75rem, 3.5vw, 2.25rem)`, line-height 1.15): Section and event titles. `text-wrap: balance`.
- **Title** (Hanken Grotesk 600, 1.25rem, line-height 1.3): Card titles, subsection headings.
- **Body** (Hanken Grotesk 400, 1rem, line-height 1.6, max-width 65–75ch): Post body, descriptions, announcements. `text-wrap: pretty`.
- **Label** (Manrope 500, 0.8125rem, letter-spacing 0.01em, normal case): Dates, meta, tags, button labels. No wide-tracked uppercase eyebrows.

**The Eyebrow Ban Rule.** No tiny uppercase tracked eyebrows above every section. A kicker may appear once as a deliberate brand system element; an eyebrow on every section is an AI grammar tell and is prohibited.

**The Display Tracking Rule.** Display letter-spacing never goes below -0.04em. Tighter than that the letters touch and it reads as cramped, not designed.

## 4. Elevation

Flat by default. Depth is conveyed by tonal layering (Surface vs Canvas) and 1px hairlines, not drop shadows. Shadows may appear only as a subtle response to state (a hovered event card lifts one step with a small, tight shadow); at rest, everything is flat.

**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow may appear only as a response to state (hover, focus, elevation), and when it does, blur stays ≤8px. No ghost cards (1px border + wide soft shadow together).

## 5. Components

Canonical primitives live in `src/lib/components/ui/` and follow the Flat-By-Default and One Voice rules. The full set (button, card, input, navigation, status-badge, empty-state, currency-display, panel-card, separator, dialog, drawer, sheet, skeleton, aspect-ratio, plus the per-event feature components in `src/lib/features/events/components/`) is built from these tokens. Re-run `$impeccable document` once per quarter to capture drift.

## 6. Do's and Don'ts

### Do:

- **Do** use the golden accent only for what's timely — the next event, a primary action — and keep it ≤10% of any screen (One Voice Rule).
- **Do** let the cream canvas carry the warmth; pair the golden accent with it intentionally rather than fighting it.
- **Do** cap body measure at 65–75ch; use the editorial display font only for the hero `<h1>` and section `<h2>`s.
- **Do** keep display letter-spacing ≥ -0.04em and apply `text-wrap: balance` to headings.
- **Do** keep depth tonal (Surface vs Canvas + 1px hairlines); reserve shadow for state changes only, with blur ≤8px.
- **Do** ship a `prefers-reduced-motion: reduce` alternative for every animation (crossfade or instant).
- **Do** pair color with text or icon — never signal state by color alone (color-blind safe).

### Don't:

- **Don't** go back to a true-neutral canvas. The cream is now part of the brand; switching to pure white would read as a regression.
- **Don't** put a tiny uppercase tracked eyebrow above every section. It's the saturated AI scaffold and a 2023-era kicker tell (Eyebrow Ban Rule).
- **Don't** add a `border-left` / `border-right` colored stripe greater than 1px on cards, list items, callouts, or alerts.
- **Don't** use gradient text (`background-clip: text` + gradient). Emphasize with weight or size, not gradients.
- **Don't** pair a 1px border with a wide soft shadow (the ghost-card pattern). Pick one.
- **Don't** use `border-radius` ≥ 24px on cards/sections/inputs. Cards top out at 12–16px.
- **Don't** build a "generic community/club website": crowded sidebars, event-countdown widgets, stock illustrations, WordPress-theme chrome, identical feature-card grids, or the hero-metric template (big number + small label + gradient accent).
- **Don't** animate CSS layout properties; don't use bounce/elastic easing; don't gate content visibility on a class-triggered reveal (it never fires on hidden tabs).
- **Don't** let muted body text fall below 4.5:1 contrast against its background. Bump muted text toward Ink; "light gray for elegance" is the biggest reason AI designs feel hard to read.
