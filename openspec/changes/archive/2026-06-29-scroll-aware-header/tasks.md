## 1. Script block — scroll state and handler

- [x] 1.1 In `src/routes/+page.svelte`, add `let scrolled = $state(false);` to the `<script lang="ts">` block.
- [x] 1.2 Add an rAF-throttled `onScroll` function: set a `ticking` flag, schedule `requestAnimationFrame(() => { scrolled = window.scrollY > 30; ticking = false; })`, early-return while ticking.
- [x] 1.3 Add `<svelte:window onscroll={onScroll} />` to the component template (above the `<header>`).

## 2. Header class binding — conditional two-state overlay

- [x] 2.1 On the `<header>` element in `src/routes/+page.svelte`, replace the static `class="..."` string with a conditional `class` binding that always includes `top-0 inset-x-0 fixed z-50 backdrop-blur` (overlay, out of flow so the hero bleeds to `y=0`) and appends `bg-canvas/80 border-b border-hairline` only when `scrolled` is true (template-literal ternary). _(Reworked from `sticky` → `fixed` after the user spotted the hero-push-down bug.)_
- [x] 2.2 Remove the now-unused classes from the header: `bg-surface`, `dark:bg-surface-dim`, `border-secondary-fixed`, `dark:border-outline-variant`, `shadow-sm`, and the undefined `docked full-width` (replaced by `inset-x-0` for explicit full-viewport width under `fixed`). Confirm `shadow-sm` is gone from both states (flat-by-default per DESIGN.md).
- [x] 2.4 Add `scroll-mt-20` (80px = header height `h-20`) to the three in-page anchor sections (`#events`, `#blog`, `#partnership`) so anchor-link navigation does not hide their headings behind the fixed header.
- [ ] 2.3 Visually verify in `pnpm dev` that: at `scrollY = 0` the hero photo fills from `y=0` with the transparent header overlaying it; scrolling past ~30px applies `bg-canvas/80` + hairline border + `backdrop-blur`; scrolling back to 0 restores transparent.

## 3. Transition + reduced-motion compliance

- [x] 3.1 Add a ~200ms ease-out transition on `background-color` and `border-color` for the `<header>` (Tailwind v4 `motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out`, so the transition is automatically suppressed under `prefers-reduced-motion: reduce`). Do not transition `backdrop-filter`.
- [ ] 3.2 Verify under browser devtools "Reduce motion" emulation that the transparent↔frosted change is effectively instant (no 200ms fade), while the JS class toggle still fires.

## 4. Verification

- [x] 4.1 Run `rtk pnpm check` — confirm no Svelte/TS diagnostics in `+page.svelte`. _(0 errors, 10 pre-existing `a11y_invalid_attribute` warnings on footer `href="#"` links at lines 405–443, unrelated to the header.)_
- [x] 4.2 Run `rtk pnpm lint` — confirm prettier + eslint pass (tabs, single quotes, no trailing commas). _(Edited file passes prettier + eslint cleanly. Repo-wide `pnpm lint` fails on pre-existing drift in `openspec/specs/stitch-100pct/spec.md` and `src/app.html`, both unrelated to this change.)_
- [x] 4.3 Run `rtk pnpm test:unit -- --run` — confirm existing unit/component tests still pass. _(9 files, 34 tests passed.)_
- [ ] 4.4 Manual smoke test in `pnpm dev`: scroll up/down, anchor-link load (`/#events`), mobile viewport (360px), and `prefers-reduced-motion` emulation.
