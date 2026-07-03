## 1. Install shadcn Sheet component (mobile nav dependency)

- [x] 1.1 Run `pnpm dlx shadcn-svelte@latest add sheet --yes --overwrite` to install the shadcn Sheet component at `$lib/components/ui/sheet/`. Confirm `sheet/index.ts` exports `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, etc.
- [x] 1.2 Add the Sheet barrel import alias to `src/lib/components/ui/sheet/index.ts` if missing, and verify the new component compiles without svelte-check errors via `pnpm check`.

## 2. Side margin mobile-first override (all 7 sections)

- [x] 2.1 In `src/routes/+page.svelte`, replace every `px-margin-desktop` class string occurrence (≈7 occurrences across header, hero wrapper, events, blog, CTA, partners, footer sections) with `px-margin-mobile tablet:px-margin-desktop`. Verify `rg 'px-margin-desktop' src/routes/+page.svelte` returns only lines that also contain `px-margin-mobile tablet:px-margin-desktop`.

## 3. Hero responsive height + type scaling

- [x] 3.1 In the hero `<section>` (line 131), change `h-[870px]` to `h-auto min-h-[870px] tablet:h-[870px]` so the hero is fluid on mobile and locks to 870px at tablet+.
- [x] 3.2 In the hero h1 (line 154), replace `font-headline-xl text-headline-xl` with `font-headline-lg tablet:font-headline-xl text-headline-lg tablet:text-headline-xl` so the headline scales from 32px → 48px.
- [x] 3.3 In the hero body paragraph (line 158), replace `font-body-lg text-body-lg` with `font-body-md tablet:font-body-lg text-body-md tablet:text-body-lg` so the body scales from 16px → 18px.

## 4. Section headings + internal paddings scale at tablet

- [x] 4.1 Replace every section `h2` with `font-headline-lg text-headline-lg text-primary` (4 occurrences at lines 181, 206, 317, 374) with `font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary`.
- [x] 4.2 Reduce section wrappers' vertical rhythm: replace `py-xl` on sections `#events`, `#blog`, `#partnership`, and `footer` with `py-md tablet:py-xl`. Replace `mb-xl` between section heading and grid/canvas with `mb-md tablet:mb-xl`.
- [x] 4.3 Reduce the Empower CTA card's internal padding: replace `p-xl` on the CTA `div.max-w-[1280px]` container (line 313) with `p-md tablet:p-xl`. Replace `mb-xl` on the CTA description paragraph with `mb-md tablet:mb-xl`.

## 5. Bento blog grid mobile stacking

- [x] 5.1 On the bento grid container (line 209–210), ensure the class string reads `grid grid-cols-1 h-auto tablet:grid-cols-4 grid-rows-2 gap-gutter tablet:h-[600px]` — this ensures mobile renders as a fluid single-column stack and tablet restores the 4-col mosaic with 600px height.
- [x] 5.2 Spot-check that each bento `<Card>` uses `tablet:col-span-*` / `tablet:row-span-*` rather than bare `col-span-*` / `row-span-*`. Existing code already uses the `tablet:` prefix on these — confirm, do not edit if already correct.

## 6. Mobile hamburger navigation

- [x] 6.1 In `src/routes/+page.svelte`, import the shadcn `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle` from `$lib/components/ui/sheet`. Add a Svelte 5 `$state(false)` reactive variable `mobileMenuOpen` that tracks the sheet open state, and bind it to `<Sheet bind:open={mobileMenuOpen}>`.
- [x] 6.2 Inside the header's `<div class="flex items-center gap-md">` wrapper (currently containing the search bar + Login/Register button), prepend a `<SheetTrigger asChild>` containing a `<Button>` with the Material Symbols `menu` icon (`<span class="material-symbols-outlined">menu</span>`), styled `tablet:hidden w-10 h-10 p-0`, and an `aria-label="Menu navigasi"`.
- [x] 6.3 Inside the `<Sheet>`, render a `<SheetContent side="right" class="w-72 bg-canvas p-lg flex flex-col gap-lg z-[60]">` containing a `<SheetHeader>` with a `<SheetTitle>` "Menu" (styled `font-headline-md text-on-surface`), an `<a aria-label="Tutup menu">` close-button row with the `close` Material Symbols icon that sets `mobileMenuOpen = false` on click, and an `<nav>` with 5 stacked `<a>` rows: Home (href="/"), Events (href="#events"), Blog (href="#blog"), Partnership (href="#partnership"), Login/Register (href="/login" — styled like the header's Login button).
- [x] 6.4 Make each in-page anchor link inside the drawer close the sheet on click (bind each `onclick` handler to `mobileMenuOpen = false`), so tapping "Events" scrolls to #events and dismisses the sheet in one gesture. Ensure the `Sheet` is closed by default (`mobileMenuOpen = false`) on page load so the drawer does not obstruct page rendering.
- [x] 6.5 Verify the Sheet's overlay backdrop uses `z-[60]` or equivalent so it sits above the fixed header at `z-50`. If the backdrop appears below the header, add `class="bg-ink/40 z-[60]"` to `<SheetOverlay>` (the render is accessible via the default `SheetContent` export).

## 7. Verify

- [x] 7.1 Run `pnpm check` and confirm no new svelte-check errors are introduced by these edits (pre-existing errors in primitives/card/oage.bc.svelte are out of scope).
- [x] 7.2 Run `pnpm format` scoped to `src/routes/+page.svelte` and any new files to confirm Prettier compliance.
- [x] 7.3 Visually verify in `pnpm dev`: at 360px mobile viewport, every section has 16px side margins, the hero height fits its content (no forced 870px), the hamburger button is visible and the desktop nav links are hidden, each section heading is 24px, the CTA card padding is reduced, and the bento blog tiles render as a 1-column vertical stack.
- [x] 7.4 Visually verify in `pnpm dev`: at 768px tablet viewport, the hero is 870px fixed, headline scales to 48px, section headings scale to 32px, section padding restores to `xl`, bento forms a 4-column mosaic, and the hamburger button is hidden while the desktop nav links are visible.
- [x] 7.5 Visually verify in `pnpm dev`: at 1280px desktop viewport, the page is pixel-equivalent to the Stitch design at `tmp/index.html` (side margins 80px, hero headline 48px, bento mosaic, footer 4 columns).
- [x] 7.6 Additional mobile-specific fixes: Latest News title left-aligned on mobile, View All Events button moved below cards on mobile, Community Impact card padding reduced (p-3 on mobile), Partners section full-width layout.
- [x] 7.7 Additional mobile polish: Badge top offset (pt-20 tablet:pt-0), mobile menu padding reduced (p-4), burger menu wrapped in `<Button>` with cursor-pointer, close button uses `<Button>` variant="text" with material-symbols close icon (no hover).
- [x] 7.8 Mobile menu spacing tightened: nav gap reduced to `gap-2 mt-4`, link padding to `py-2`, Login/Register button to `px-md py-sm`.
- [x] 7.9 Community Impact card gap reduced to `gap-sm tablet:gap-lg` to match Become a Partner button spacing.
- [x] 7.10 Hero badge top spacing reduced by 55%: `pt-20 tablet:pt-0` → `pt-9 tablet:pt-0` (36px mobile, 0px tablet+).
- [x] 7.11 Burger button type error fix: `size="icon"` (not supported in primitives Button) changed to `size="sm"` with `p-2` padding override.
- [x] 7.12 Keyboard-verify the mobile sheet: open it, press Escape → sheet closes; open it, Tab through anchor rows → focus ring is visible on each link; open it, press an anchor link → focus returns to the hamburger trigger after sheet closes.
