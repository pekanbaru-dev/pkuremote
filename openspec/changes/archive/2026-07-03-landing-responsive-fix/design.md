## Context

The landing page (`src/routes/+page.svelte`) was originally built as a desktop-first Stitch-to-Tailwind port. The `@theme` block already defines the responsive infrastructure we need — `--spacing-margin-mobile: 16px` / `--spacing-margin-desktop: 80px` margin tokens, the semantic `mobile:` (640px) / `tablet:` (768px) / `desktop:` (1024px) breakpoints — but the page itself applies only the desktop values (`px-margin-desktop` on every section) and locks the hero at `h-[870px]` unconditionally. Desktop viewport rendering is correct; mobile is broken.

Constraints:

- The Stitch design at `tmp/index.html` is the authoritative desktop composition. Any mobile adaptation must preserve pixel-equivalence at ≥ 768px; only sub-tablet behavior can deviate.
- The landing page is a single `+page.svelte` file (~522 lines) — splitting into subcomponents is out of scope for this change; all edits live in this file plus a small `MobileNav` extraction (details in Decisions below).
- The `@theme` token system already has a `--font-headline-lg-mobile` family defined but unused in the codebase. The change should use the existing Stitch font-size tokens (headline-xl 48px, headline-lg 32px, headline-md 24px, body-lg 18px, body-md 16px) rather than inventing new ones.

## Goals / Non-Goals

**Goals:**

- Make every section of the landing page (header, hero, events, blog, CTA, partners, footer) render cleanly at 360px mobile, 768px tablet, and 1280px desktop viewports.
- Preserve the Stitch pixel-equivalence at tablet+ viewports — the mobile behavior is additive, not a redesign.
- Add a mobile hamburger navigation that provides the same four destination links (Home / Events / Blog / Partnership) + Login/Register as the desktop nav, via a sheet drawer.
- Use only the existing `@theme` tokens and semantic breakpoint prefixes — no new design tokens, no new breakpoints.

**Non-Goals:**

- Responsive fix for `events/[slug]`, `login`, or `myprofile` routes (out of scope — this change is landing-page only).
- Dark-mode behavior changes.
- Hero content restructuring (we keep all text + dual CTAs; just scale fonts and make hero fluid on mobile).
- New bento content or tile reordering — tile order remains document-order.

## Decisions

**D1. `px-margin-mobile` base + `tablet:px-margin-desktop` override for all 7 sections.**

All seven sections currently use `px-margin-desktop` (80px). The fix is a uniform find-and-replace:

```
- px-margin-desktop
+ px-margin-mobile tablet:px-margin-desktop
```

- Why not introduce a `.section-pad` utility class? The project convention is Tailwind-only, not custom `@layer components` for layout rhythm; adding a utility diverges from pattern.
- Why not use a `clamp()` padding (already used in `.container-page`)? The existing margin tokens (`--spacing-margin-mobile` and `--spacing-margin-desktop`) are Stitch-specified values; we preserve them exactly.

**D2. Hero: `h-auto min-h-[870px] tablet:h-[870px]`.**

Current: `h-[870px]` hardcoded. Mobile fix:

```
- h-[870px]
+ h-auto min-h-[870px] tablet:h-[870px]
```

- Why not use `min-h-full` or `min-h-screen`? The hero is content-sized, and its 870px height at tablet is a Stitch design constant that must be preserved pixel-exactly.
- Why keep `min-h-[870px]` as a floor on mobile? Prevents the hero from shrinking below the design intent when content is shorter than expected (e.g. no text wrap); on mobile, headline wraps and the min acts as a floor.

**D3. Headline scaling: `text-headline-lg tablet:text-headline-xl` for hero h1, `text-headline-md tablet:text-headline-lg` for section h2s.**

Current hero h1: `font-headline-xl text-headline-xl` (48px unconditionally). Section h2s: `font-headline-lg text-headline-lg` (32px unconditionally). Fix:

```
hero h1:   font-headline-lg tablet:font-headline-xl text-headline-lg tablet:text-headline-xl
section h2: font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg
```

- Why not use `clamp()` font sizes? Stitch font-size tokens are discrete steps (24/32/48px), not fluid. The project's convention is Stitch font tokens, not fluid type.
- Why step down only one level (xl→lg, lg→md), not two? Stepping down two would be visually jarring at tablet, where the mobile size would carry through past the tablet threshold.

**D4. Hamburger menu via shadcn `Sheet` from the right edge, inline in `+page.svelte`.**

- Use `bits-ui` Dialog-based `Sheet` from `shadcn-svelte`. One `pnpm dlx shadcn-svelte add sheet --yes --overwrite`.
- Sheet opens from the right (`side="right"`), full-height, ~320px wide on mobile.
- Trigger: `<Button>` with `menu` Material Symbols icon, `tablet:hidden`, placed next to the Login/Register button inside the existing `flex items-center gap-md` wrapper.
- Content: `<SheetContent>` containing a `<SheetHeader>` with "Menu" and an `<nav>` with 5 stacked `<a>` rows (Home, Events, Blog, Partnership, Login/Register).
- On link tap: `<Sheet>` state toggles off via a bound `open` prop (Svelte 5 `$state`). The anchor navigates normally.

Why NOT other options:

- `<details>`/`<summary>` disclosure: simpler and no-JS, but does not support full-screen drawer or focus trapping. Also not what a mobile user expects for navigation.
- Custom slide-out `<div>`: reinvents focus trap, aria, keyboard behavior. shadcn's `Sheet` delegates to `bits-ui` which handles all of this.
- Separate `MobileNav.svelte` component: overkill for a single-use trigger + drawer; keep inline to minimize new surface. (Open question — see Open Questions.)

**D5. Bento grid: `grid-cols-1 h-auto tablet:grid-cols-4 grid-rows-2 tablet:h-[600px]`.**

Replace `grid grid-cols-1 tablet:grid-cols-4 grid-rows-2 gap-gutter h-auto tablet:h-[600px]` (already partly there). The key is that on mobile, the grid's `h-auto` base wins and each `<Card>` sizes to its content. The `tablet:col-span-*` / `tablet:row-span-*` placements already work because they only activate at tablet.

- Why not render 2 columns on mobile? Tile order in document is "feature → guide → sponsorship → volunteer" — at 2 columns mobile the guide card (which is wide) would pair awkwardly with sponsorship. Single-column is cleaner and matches the existing 1-column event-grid pattern.

**D6. Section padding reduction: `py-md mb-md tablet:py-xl tablet:mb-xl` for section wrappers, `p-md tablet:p-xl` for the CTA card.**

Reduces mobile vertical rhythm from 64px (`xl`) to 24px (`md`); desktop value restores at tablet. Why these values? The Stitch spacing scale includes `md: 24px` and `xl: 64px`; these are already in `@theme`.

## Risks / Trade-offs

**[Sheet z-index conflict with sticky header]** → The header is `fixed z-50`; the Sheet backdrop needs `z-[60]` or equivalent to appear above it. shadcn's default Sheet `SheetOverlay` uses `z-50`; we may need to apply `class="z-[60]"` to override. Verify visually before committing.

**[Focus trap on sheet may conflict with in-page anchor navigation]** → In-page anchor links (Events, Blog, Partnership sections on the same page) navigate within the same page while the sheet tries to trap focus. shadcn Sheet's default close-on-outside-click will trigger on the anchor tap because the click is inside the Sheet. Verify: tapping a link row should dispatch focus back to the body, close the sheet, and navigate. If focus-trap interferes, the `Sheet`'s `closeOnOutsideClick` prop may need adjustment.

**[Hero `min-h-[870px]` may create excess whitespace at < 360px]** → On very small viewports (e.g. 320px iPhone SE), the hero may render with visible bottom whitespace because the content wraps to 4+ lines and the 870px floor dominates. Acceptable trade-off — preserves the 870px design intent on tablet+ while allowing mobile content to breathe. Out of scope.

**[Bento tile on mobile renders very tall]** → The bento hero tile (Songket background, large text) may stretch to ~500px on mobile when stacked alone. Acceptable — mobile readers scroll vertically, and the tile remains fully scrollable.

**[Open question: should the hamburger be a separate `MobileNav.svelte`?]** → Keeping it inline in `+page.svelte` keeps the file as the single source of truth for landing layout. Extracting to `src/lib/features/landing/components/MobileNav.svelte` would be architecturally cleaner (barrel, no inline JSX bloat) but adds a new feature folder just for one component. **Decision**: inline for now; revisit if another mobile nav needs it.

## Open Questions

- Whether to install `shadcn-svelte` Sheet via `pnpm dlx` during implementation, OR check if another bits-ui Dialog is already installed under `ui/dialog/` and reuse that. Verify with `openspec/changes/landing-responsive-fix` implementer at task 1.
