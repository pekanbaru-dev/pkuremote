## Why

The landing page renders as desktop-first on mobile devices — content is squished by fixed 80px side margins (`px-margin-desktop` applied everywhere), the hero section is locked at 870px height, primary navigation links vanish below 768px with no fallback, headline font sizes don't scale, section paddings are oversized on small screens, and the 4-tile bento blog grid collapses to a single awkward column. The page needs a mobile-first responsive pass so visitors on phones can read content, navigate the site, and consume the same information hierarchy as desktop visitors.

## What Changes

- Replace all `px-margin-desktop` (80px fixed) usages with mobile-first `px-margin-mobile` base + `tablet:px-margin-desktop` override, so narrow viewports get 16px side margin and 768px+ gets 80px.
- Hero section drops fixed `h-[870px]` → fluid `min-h-[870px] h-auto` on mobile, restores desktop fixed height at `tablet:h-[870px]`. Hero headline scales from `text-headline-lg` (32px) base to `tablet:text-headline-xl` (48px). Subtitle / button font sizes follow the same pattern.
- **New: mobile navigation.** Add a hamburger `<Button>` (visible below `tablet`) that opens a sheet/drawer menu (`bits-ui` Dialog or shadcn Sheet component) containing the same nav links as the desktop bar. The desktop nav remains `hidden tablet:flex`, unchanged.
- Section headings (h2s: "Upcoming Community Gatherings", "Latest News & Stories", "Empower Your Business Through Community", "Trusted by Local & Global Partners") scale from `text-headline-md` (24px) base to `tablet:text-headline-lg` (32px).
- Internal section paddings (`py-xl` → `py-md tablet:py-xl`), margins (`mb-xl` → `mb-md tablet:mb-xl`), and the CTA section's `p-xl` reduce at mobile.
- Bento blog grid changes from `tablet:grid-cols-4 grid-rows-2` 4-tile mosaic to a mobile-friendly layout: 1-column stack below `mobile`, 2-column at `mobile` (partner-logos grid pattern applied), 4-column mosaic at `tablet`. Each bento card gets explicit mobile height instead of inheriting from `tablet:h-[600px]`.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `landing-page`: The "Layout is responsive without breakpoint-specific markup" requirement SHALL be replaced with a "Layout is responsive with semantic breakpoint prefixes" requirement that documents the mobile-first responsive pattern using `mobile:`/`tablet:`/`desktop:` prefixes. New requirements SHALL be added for: (1) side-margin responsive override (`px-margin-mobile` / `tablet:px-margin-desktop`), (2) mobile hamburger navigation with sheet drawer, (3) hero / heading / section-padded fluid font + padding scaling, (4) bento-grid mobile layout.
- `landing-stitch`: Spec-level behavior changes — the "Layout is responsive" and section-mosaic requirements reflect the new mobile/tablet responsive behavior.

## Impact

- **Affected code**: `src/routes/+page.svelte` (hero, nav, events header, bento, CTA, partners, footer — ~20 class-string edits + new hamburger button + sheet/menu drawer JSX) and likely a new landing-only `MobileNav.svelte` component under `src/lib/features/landing/` or directly inside the route file. No changes to primitives, shadcn ui, or other routes.
- **New shadcn component**: `Sheet` from `shadcn-svelte` (for the mobile menu drawer). One `pnpm dlx shadcn-svelte add sheet --yes --overwrite` invocation.
- **Affected specs**: `openspec/specs/landing-page/spec.md` and `openspec/specs/landing-stitch/spec.md` — requirement text updated to reflect mobile-first responsive contract.
- **No changes to**: `@theme` tokens (all breakpoint/margin tokens already exist), other pages (`login`, `myprofile`, `events/[slug]`), design tokens (OKLCH values untouched), `layout.css` (already has `--spacing-margin-mobile`, `--spacing-margin-desktop`, `mobile`/`tablet`/`desktop` breakpoints).
- **Risk**: moderate — mobile nav drawer is new interactive behavior (accessibility: focus trap, escape-to-close, aria-labels). shadcn `Sheet` handles this out of the box.
- **Non-goals of this change**: no new content, no visual redesign at desktop viewport, no dark-mode changes, no events/[slug] responsive pass.
