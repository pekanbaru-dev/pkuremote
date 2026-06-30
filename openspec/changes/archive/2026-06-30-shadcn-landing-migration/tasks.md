## 1. Setup — install Badge

- [x] 1.1 Run `pnpm dlx shadcn-svelte@latest add badge --yes --overwrite` to create `src/lib/components/ui/badge/` (the directory currently exists but is empty).
- [x] 1.2 Verify `src/lib/components/ui/badge/badge.svelte` and `index.ts` now exist (stock shadcn badge with `default`/`secondary`/`destructive`/`outline`/`ghost`/`link` variants).

## 2. Customize Button — add 7 project variants

- [x] 2.1 In `src/lib/components/ui/button/button.svelte`, extend the existing `buttonVariants` `tv()` config: add a `variant` entry for each of `login`, `hero-primary`, `hero-outline`, `view-all`, `become-partner`, `sponsorship-kit`, `join` with the exact class strings from the design (each prefixed with `h-auto`). Retain all stock variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes. _(Implementation note: each variant also includes `text-base font-normal` to defeat the stock base `text-sm font-medium` bleed — the current raw buttons render at inherited 16px/400, and without this defeat the base would force 14px/500, breaking pixel-equivalence.)_
- [x] 2.2 Update the `ButtonVariant` type export if needed so the new variants are typed (the existing `VariantProps<typeof buttonVariants>["variant"]` should pick them up automatically — verify with `pnpm check`).
- [x] 2.3 Run `pnpm check` to confirm the extended `buttonVariants` compiles with no type errors. _(0 errors, 10 pre-existing footer a11y warnings.)_

## 3. Customize Card — migrate to tv with bento variants

- [x] 3.1 In `src/lib/components/ui/card/card.svelte`, replace the plain `cn("...stock string...", className)` with a `cardVariants` `tv()` config. Define `variant`: `default` (the current stock string), `bento` (`bg-surface-container-lowest rounded-xl talam-shadow ring-0`), `bento-primary` (`bg-primary text-on-primary rounded-xl ring-0`), `stats` (`bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`). _(Implementation note: all stock-specific classes — `text-sm`, `gap-4`, `flex flex-col`, `text-card-foreground`, `group/card`, the `data-[size=sm]:_`and`_:[img]`selectors — live in the`default`variant, NOT in`base`, so bento/stats variants don't inherit them. The `base` is empty. This avoids bleed that would corrupt bento layouts.)_
- [x] 3.2 Add a `variant` prop to `card.svelte`'s `$props()` (default `"default"`), and update the `class` binding to `cn(cardVariants({ variant }), className)`. The `size` prop + `data-size` attribute are retained for `default`-variant backward compat.
- [x] 3.3 Export `cardVariants` and the `CardVariant` type from `card/index.ts` (and `card.svelte` module script) so callers can type-check variant usage.
- [x] 3.4 Run `pnpm check` to confirm the Card refactor compiles with no type errors.

## 4. Overwrite Badge — tv config with pill variant

- [x] 4.1 Add a `pill` variant to `badge.svelte`'s `badgeVariants` `tv()` config (retaining all stock variants): `h-auto text-base font-normal border-0 inline-block bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1`. _(The `h-auto text-base font-normal border-0 inline-block` prefix defeats the stock base `h-5 text-xs font-medium border inline-flex` bleed — same pixel-equivalence concern as Button.)_
- [x] 4.2 Ensure the `badge/index.ts` re-exports `Badge` (and `badgeVariants`/`BadgeVariant`) so `import { Badge } from "$lib/components/ui/badge"` works. _(Already correct from the CLI install.)_
- [x] 4.3 Run `pnpm check` to confirm the overwritten Badge compiles with no type errors.

## 5. Migrate +page.svelte — replace raw elements with components

- [x] 5.1 Add imports to `+page.svelte` script block: `Button`, `Card`, `Badge`, `Input`.
- [x] 5.2 Replace the 7 raw `<button>` elements with `<Button variant="...">`: login, hero-primary, hero-outline, view-all, become-partner, sponsorship-kit, join. Removed the `eslint-disable-next-line svelte/no-restricted-html-elements` comments.
- [x] 5.3 Replace the 5 card-like `<div>` containers with `<Card variant="..." class="...layout...">`: 3× `bento`, 1× `bento-primary`, 1× `stats`. Grid placement + internal flex layout passed via `class`.
- [x] 5.4 Replace the hero `<span>` pill with `<Badge variant="pill" class="mb-md">`.
- [x] 5.5 Replace the 2 raw `<input>` elements with `<Input class="...heavy override...">`: search (w-40) and email (w-full). Removed the eslint-disable comments. Accepted the Input wrapper `<div>`.
- [x] 5.6 Confirmed no raw `<button>` or `<input>` remains in `+page.svelte`. Scroll-aware header logic, hero bg layers, headings, partner logos, progress bar, footer nav `<a>`s, social links, and copyright are untouched.

## 6. Verification

- [x] 6.1 Run `rtk pnpm check` — 0 errors, 10 pre-existing `a11y_invalid_attribute` warnings on footer `href="#"` links (unrelated to this change).
- [x] 6.2 Run `rtk pnpm prettier --write` + `--check` + `rtk pnpm eslint` on all 5 touched files — all pass (tabs, single quotes, no trailing commas).
- [x] 6.3 Run `rtk pnpm test:unit -- --run` — 9 files, 34 tests passed (no regressions).
- [ ] 6.4 Manual visual diff in `pnpm dev`: compare the migrated landing page against the pre-migration visual. Verify all 7 buttons (hover/active states), 5 cards (ring absent, talam-shadow present), hero pill badge, and 2 inputs (search pill layout, footer form layout) render pixel-equivalent. Check mobile viewport (360px) and anchor-link navigation (`#events`, `#blog`, `#partnership` still land with `scroll-mt-20` offset).
