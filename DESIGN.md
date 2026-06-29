<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->

---

name: PKU Remote
description: Calm, editorial site for the Pekanbaru remote-worker community — events, announcements, and blog posts.

---

# Design System: PKU Remote

## 1. Overview

**Creative North Star: "The Quiet Bulletin"**

A calm, reading-first publication surface for the Pekanbaru remote-worker community. The site behaves like a well-edited bulletin board: events, announcements, and posts lead; chrome recedes. Whitespace and type hierarchy carry the layout — not boxes, borders, or decoration. One restrained ochre accent marks what's timely (the next event, a fresh post); everything else lives on a true neutral canvas so the content does the talking.

The system rejects the generic community/club website — crowded sidebars, event-countdown widgets, stock illustrations, WordPress-theme chrome — and it rejects the SaaS-landing gradient hero. Energy comes from the content's timeliness, not from the UI. Motion is responsive: state changes and feedback are animated, but there is no scroll-driven choreography or orchestrated entrances.

**Key Characteristics:**

- Reading-first: editorial serif display, generous measure, generous whitespace.
- Restrained color: true neutral canvas, one ochre accent used sparingly.
- Responsive motion: hover/focus/transition only; no entrance choreography.
- Flat by default; depth conveyed by tonal layering, not shadows.
- Calm, minimal, focused — the site itself is evidence the community cares about craft.

## 2. Colors: The Quiet Bulletin Palette

A single restrained accent against a true neutral canvas. The accent marks timeliness — the next event, a new post, a live link — and is used on ≤10% of any screen. The canvas stays true-neutral (no cream/sand tint) so the ochre reads as deliberate, not as ambient warmth.

**The One Voice Rule.** The ochre accent is used on ≤10% of any given screen. Its rarity is the point. It marks what's timely; it is never decorative.

**The True Neutral Rule.** Body backgrounds are true-neutral (chroma ≈ 0), not warm cream, sand, or parchment. Warmth is carried by the accent and the typography, not by the canvas.

### Primary

- **Goldenrod Ochre** `[to be resolved during implementation]`: The single accent. Used for event dates, "new" markers, primary links, and primary button fills. Saturated enough to read as intentional; never pale or pastel.

### Neutral

- **Ink** `[to be resolved during implementation]`: Body text and headings. Near-black with a faint warm lean.
- **Muted Ink** `[to be resolved during implementation]`: Secondary text, dates, meta. Stays ≥4.5:1 against the canvas — never the "light gray for elegance" trap.
- **Canvas** `[to be resolved during implementation]`: Page background. True neutral, chroma toward 0.
- **Surface** `[to be resolved during implementation]`: Subtle tonal lift for cards/sections (one step up from canvas).
- **Hairline** `[to be resolved during implementation]`: 1px dividers and borders. A hair of ink at low opacity.

## 3. Typography

**Display Font:** A contemporary editorial serif (e.g. Fraunces, Source Serif 4) `[font pairing to be chosen at implementation]`
**Body Font:** A humanist sans (e.g. Inter, Source Sans 3) `[font pairing to be chosen at implementation]`

**Character:** Serif display gives the site its editorial, Substack-adjacent reading feel; the humanist sans body keeps posts and UI legible at small sizes. The pairing reads as quiet and credible, not decorative.

### Hierarchy

- **Display** (serif, weight 400–500, `clamp(2.5rem, 6vw, 4rem)`, line-height 1.05, letter-spacing ≥ -0.03em): Hero/post titles only. `text-wrap: balance`.
- **Headline** (serif, weight 500, ~2rem, line-height 1.15): Section and event titles. `text-wrap: balance`.
- **Title** (sans, weight 600, ~1.25rem, line-height 1.3): Card titles, subsection headings.
- **Body** (sans, weight 400, 1rem, line-height 1.6, max-width 65–75ch): Post body, descriptions, announcements. `text-wrap: pretty`.
- **Label** (sans, weight 500, 0.8125rem, letter-spacing 0.02em, normal case): Dates, meta, tags, button labels. No wide-tracked uppercase eyebrows.

**The Eyebrow Ban Rule.** No tiny uppercase tracked eyebrows above every section. A kicker may appear once as a deliberate brand system element; an eyebrow on every section is an AI grammar tell and is prohibited.

**The Display Tracking Rule.** Display letter-spacing never goes below -0.04em. Tighter than that the letters touch and it reads as cramped, not designed.

## 4. Elevation

Flat by default. Depth is conveyed by tonal layering (Surface vs Canvas) and 1px hairlines, not drop shadows. Shadows may appear only as a subtle response to state (a hovered event card lifts one step with a small, tight shadow); at rest, everything is flat.

**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow may appear only as a response to state (hover, focus, elevation), and when it does, blur stays ≤8px. No ghost cards (1px border + wide soft shadow together).

## 5. Components

No components exist yet. Canonical primitives (button, card, input, navigation, chip) will be synthesized from these tokens during implementation, following the Flat-By-Default and One Voice rules. Re-run `$impeccable document` once components are built.

## 6. Do's and Don'ts

### Do:

- **Do** use the ochre accent only for what's timely — the next event, a new post, a primary action — and keep it ≤10% of any screen (One Voice Rule).
- **Do** keep the body canvas true-neutral (chroma ≈ 0); carry warmth through the accent and typography, not the background (True Neutral Rule).
- **Do** use an editorial serif for display/headlines and a humanist sans for body; cap body measure at 65–75ch.
- **Do** keep display letter-spacing ≥ -0.04em and apply `text-wrap: balance` to headings.
- **Do** keep depth tonal (Surface vs Canvas + 1px hairlines); reserve shadow for state changes only, with blur ≤8px.
- **Do** ship a `prefers-reduced-motion: reduce` alternative for every animation (crossfade or instant).
- **Do** pair color with text or icon — never signal state by color alone (color-blind safe).

### Don't:

- **Don't** use a warm cream/sand/parchment body background. The whole warm-neutral band reads as the saturated AI default of 2026 and is prohibited here.
- **Don't** put a tiny uppercase tracked eyebrow above every section. It's the saturated AI scaffold and a 2023-era kicker tell (Eyebrow Ban Rule).
- **Don't** add a `border-left` / `border-right` colored stripe greater than 1px on cards, list items, callouts, or alerts.
- **Don't** use gradient text (`background-clip: text` + gradient). Emphasize with weight or size, not gradients.
- **Don't** pair a 1px border with a wide soft shadow (the ghost-card pattern). Pick one.
- **Don't** use `border-radius` ≥ 24px on cards/sections/inputs. Cards top out at 12–16px.
- **Don't** build a "generic community/club website": crowded sidebars, event-countdown widgets, stock illustrations, WordPress-theme chrome, identical feature-card grids, or the hero-metric template (big number + small label + gradient accent).
- **Don't** animate CSS layout properties; don't use bounce/elastic easing; don't gate content visibility on a class-triggered reveal (it never fires on hidden tabs).
- **Don't** let muted body text fall below 4.5:1 contrast against its background. Bump muted text toward Ink; "light gray for elegance" is the biggest reason AI designs feel hard to read.
