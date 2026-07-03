## 1. Configure semantic breakpoints in `@theme`

- [x] 1.1 In `src/routes/layout.css`, inside the existing `@theme { ... }` block, add three semantic breakpoint tokens: `--breakpoint-mobile: 40rem;` (640px), `--breakpoint-tablet: 48rem;` (768px), `--breakpoint-desktop: 64rem;` (1024px). Place them in a logical spot (e.g. after the spacing/radius tokens, before the closing `}` of `@theme`).
- [x] 1.2 In the same `@theme` block, add five lines to remove the default Tailwind v4 breakpoints by setting each to `initial`: `--breakpoint-sm: initial;`, `--breakpoint-md: initial;`, `--breakpoint-lg: initial;`, `--breakpoint-xl: initial;`, `--breakpoint-2xl: initial;`. Place them immediately before the new semantic tokens so the removal-then-add pattern reads top-to-bottom.

## 2. Replace responsive prefixes in source files

- [x] 2.1 In `src/routes/+page.svelte`, replace all `md:` prefixes with `tablet:` in class strings (14 occurrences across lines 90, 195, 209, 212, 247, 272, 294, 311, 314, 333, 379, 380, 441, 442). Each `md:` → `tablet:` is a direct text replacement within the class string.
- [x] 2.2 In `src/routes/+page.svelte`, replace the single `sm:` prefix with `mobile:` (line 380: `sm:grid-cols-4` → `mobile:grid-cols-4`).
- [x] 2.3 In `src/routes/+page.svelte`, replace the single `lg:` prefix with `desktop:` (line 110: `hidden lg:flex` → `hidden desktop:flex`).
- [x] 2.4 In `src/routes/events/[slug]/+page.svelte`, replace all `lg:` prefixes with `desktop:` (3 occurrences on lines 56, 57, 65: `lg:grid-cols-3` → `desktop:grid-cols-3`, `lg:col-span-2` → `desktop:col-span-2`, `lg:sticky lg:top-24 lg:self-start` → `desktop:sticky desktop:top-24 desktop:self-start`).

## 3. Update AGENTS.md

- [x] 3.1 In `AGENTS.md`, under the "Stack quirks" section, add a "Breakpoints" bullet documenting: the project uses semantic breakpoint names (`mobile:` 40rem, `tablet:` 48rem, `desktop:` 64rem) defined in `@theme` in `src/routes/layout.css`; the default Tailwind v4 breakpoints (`sm`/`md`/`lg`/`xl`/`2xl`) are removed (`--breakpoint-*: initial`); project code SHALL use only `mobile:`/`tablet:`/`desktop:`; future shadcn-svelte additions should be checked for `sm:`/`md:`/`lg:` usage and converted.

## 4. Verify

- [x] 4.1 Run `pnpm check` and confirm no new diagnostics are introduced by the class-string edits (pre-existing errors in other files are out of scope).
- [x] 4.2 Run `pnpm format` scoped to the edited files (`src/routes/layout.css`, `src/routes/+page.svelte`, `src/routes/events/[slug]/+page.svelte`, `AGENTS.md`) to ensure formatting matches the repo's Prettier config.
- [x] 4.3 Visually verify in `pnpm dev`: the landing page renders identically at desktop (1280px), tablet (768px), and mobile (360px) viewports — the breakpoint rename is a 1:1 value mapping, so no visual change should occur.
- [x] 4.4 Verify in `pnpm dev`: the events detail page (`/events/[slug]`) renders the 3-column grid layout at desktop width and the sidebar sticks correctly — the `lg:` → `desktop:` rename should produce identical behavior.
- [x] 4.5 Confirm that `sm:`/`md:`/`lg:` no longer generate CSS by inspecting the dev server's generated stylesheet (search for `@media (min-width: 40rem)` to confirm `mobile:` is generated, and confirm no `@media (min-width: 40rem)` with `sm` naming exists).
