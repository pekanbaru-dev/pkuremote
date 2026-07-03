## 1. Add shadcn Card to `ui/`

- [x] 1.1 Run `pnpm dlx shadcn-svelte@latest add card --yes --overwrite` → installs `src/lib/components/ui/card/` (card.svelte + card-header/card-title/card-description/card-content/card-footer/card-action + index.ts). Confirm `components.json` already exists (no re-init).
- [x] 1.2 Restyle `ui/card/card.svelte` base to M3 tokens: replace `bg-card text-card-foreground` → `bg-surface-container-low text-ink`; replace `rounded-xl` → `rounded-card`. Keep the composite subcomponent structure, `group/card`, and `data-slot` hooks untouched.
- [x] 1.3 Verify `pnpm exec eslint src/lib/components/ui/card` + `pnpm exec prettier --check src/lib/components/ui/card` → clean. Run `pnpm check` → no NEW errors in `ui/card/`.

## 2. Rewrite `src/routes/+page.svelte` — imports + structure

- [x] 2.1 Copy the full markup structure from `oage.bc.svelte` into `+page.svelte` (hero, events, bento, CTA, footer — unchanged markup). Keep the `<svelte:head>`, scroll handler, `EventCard`/`getUpcomingEvents` imports.
- [x] 2.2 Swap the component imports: `import { Button, Badge, Input } from "$lib/components/primitives";` + `import { Card } from "$lib/components/ui/card";` + `import { cn } from "$lib/utils";`. Remove the old `$lib/components/ui/{button,card,badge,input}` imports.

## 3. Rewrite call sites — Button (7 instances, Strategy A)

- [x] 3.1 Header login button (line ~89): `<Button class="h-auto text-base font-normal bg-primary text-white/75 px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95">Login/Register</Button>`
- [x] 3.2 Hero buttons (line ~119-120): `<Button class="h-auto text-base font-normal bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-headline-md shadow-sm hover:shadow-md transition-all active:scale-95">Explore Events</Button>` + the `hero-outline` class string for "Learn History".
- [x] 3.3 View-all button (line ~137): `<Button class="h-auto text-base font-normal text-primary font-label-lg flex items-center gap-xs hover:underline">View All Events <span class="material-symbols-outlined">arrow_forward</span></Button>` (verify the material-symbols icon sizes correctly — may need an explicit size class on the span).
- [x] 3.4 CTA buttons (line ~268-269): `become-partner` + `sponsorship-kit` class strings.
- [x] 3.5 Footer join button (line ~443): `join` class string (`<Button type="submit" class="h-auto text-base font-normal bg-primary text-white/75 px-4 py-2 hover:opacity-90">Join</Button>`).
- [x] 3.6 Decide `focus-visible:ring-0` per button: add `focus-visible:ring-0` to each button's class string OR keep the primitive's focus ring for a11y (default: keep, unless a specific button's design is broken by the ring).

## 4. Rewrite call sites — Badge (1 instance, Strategy A)

- [x] 4.1 Hero pill badge (line ~109): `<Badge class="h-auto text-base font-normal border-0 inline-block bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1 mb-md">Pekanbaru Heritage &amp; Culture</Badge>` (keep the existing `mb-md` spacing class).

## 5. Rewrite call sites — Input (2 instances, Strategy A + ring-0 defeat)

- [x] 5.1 Header search input (line ~83): `<Input class="border-none bg-transparent rounded-none p-0 h-auto w-40 text-label-md focus-visible:ring-0 focus-visible:border-transparent outline-none ring-0" placeholder="Search community..." type="text" />` (NOTE: add `ring-0` to defeat the primitive's `ring-1 ring-inset` — the existing `border-none` does NOT defeat ring).
- [x] 5.2 Footer email input (line ~438): same pattern — bare class string + `ring-0` + `w-full` + `px-4 py-2`.

## 6. Rewrite call sites — Card (5 instances, Strategy A)

- [x] 6.1 Bento large feature (line ~157): `<Card class={cn("bg-surface-container-lowest rounded-xl talam-shadow ring-0", "md:col-span-2 md:row-span-2 p-lg flex flex-col justify-between group cursor-pointer relative overflow-hidden")}>` (merge the bento color string + the existing layout classes via `cn`).
- [x] 6.2 Bento small story 1 (line ~191): `bento` color string + `md:col-span-2 p-md flex gap-md items-center group cursor-pointer` layout.
- [x] 6.3 Bento small story 2 (line ~215): `bento` color string + `md:col-span-1 p-md flex flex-col justify-between group cursor-pointer` layout.
- [x] 6.4 Bento-primary CTA card (line ~237): `bento-primary` color string (`bg-primary text-on-primary rounded-xl ring-0`) + the existing `cn([...])` layout/text classes (`text-white/80 md:col-span-1 p-md flex flex-col justify-center items-center text-center`, `group cursor-pointer hover:bg-primary/90 transition-colors`).
- [x] 6.5 Stats card (line ~273): `stats` color string (`bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`) + `p-lg` layout.

## 7. Cleanup + verify

- [x] 7.1 Delete `src/routes/oage.bc.svelte` (the backup/reference, superseded by the rebuilt `+page.svelte`).
- [x] 7.2 Run `pnpm check` → the 6 pre-existing `Cannot find module '$lib/components/ui/{button,card,badge,input}'` + `no exported member 'Button'/'Input'` errors for the LANDING page clear (other routes' errors remain — out of scope).
- [ ] 7.3 Run `pnpm dev` → visually diff the rebuilt `+page.svelte` against the `ui-cp` rendering (compare hero, bento grid, CTA, footer). Fix any leaks/defeats observed (e.g., a ring still showing → add the defeat). _(DEFERRED to manual: agent can't run a browser. Typecheck + eslint clean; user to run `pnpm dev` and confirm visuals — check the 3 design.md open questions: focus-ring on buttons, `material-symbols` icon size on view-all, `talam-shadow` utility renders.)_
- [x] 7.4 Run `pnpm exec eslint src/routes/+page.svelte src/lib/components/ui/card` + `pnpm exec prettier --check` on both → clean.
- [x] 7.5 Run `rtk openspec status --change "rebuild-landing-with-primitives"` → all tasks complete; ready for `/opsx-archive` review.
