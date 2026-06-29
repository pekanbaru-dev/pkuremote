## Why

The project has a sandbox of 37 React + shadcn/ui-style components in `tmp/components/*` (a scratch directory slated for deletion) that were used as reference during the initial SvelteKit + shadcn-svelte setup. The SvelteKit app is now running, but its component surface is thin: only the seven primitives that ship with shadcn-svelte (button, card, badge, separator, skeleton, aspect-ratio, navigation-menu) are actually present, and the landing page is still mostly hand-rolled CSS in `src/routes/layout.css`. We need to convert the React reference set into native Svelte 5 components so the rest of the application (events, contrib, auth, etc.) can be built on a real, reusable component library instead of continuing to ad-hoc every UI surface.

## What Changes

- Convert all 37 React+shadcn reference components in `tmp/components/*` into native Svelte 5 components using `bits-ui` (headless behavior) and `@lucide/svelte` (icons).
- Author every component variant set with `tailwind-variants` (TV), matching the pattern already established in `src/lib/components/ui/button/button.svelte`. The existing CVA `style.ts` files in `tmp/` are translated 1:1 to TV `tv({...})` calls.
- Place all new components under `src/lib/components/ui/<name>/` (per the user-confirmed folder scheme: primitives and reusable composites share the same `ui/` root).
- Restyle each component to the project's existing OKLCH theme tokens (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-hairline`, etc., from `src/routes/layout.css`). No new shade-scale palette (`primary-50..900`, `success-*`, etc.) is added to `@theme`; class names from the React source that referenced such scales are translated to the existing brand tokens.
- Delete the `tmp/components/` reference directory after each batch lands in `src/lib/components/ui/`.
- Add a barrel `index.ts` per component folder and a top-level `src/lib/components/ui/index.ts` re-exporting the public component surface.
- Update any landing-page call sites that previously used hand-rolled CSS to consume the new component equivalents where the equivalents are atomic (e.g., `Badge` for the "EVENT" meta-label, `Separator` for section dividers, `Card` wrappers for the events grid). Hand-rolled CSS classes that have no atomic equivalent (`.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`) stay in `src/routes/layout.css` per the design system ban on adding new shadcn primitives for them.

## Capabilities

### New Capabilities

- `component-library`: The reusable component surface for the SvelteKit app. Defines the folder layout under `src/lib/components/ui/`, the TV variant authoring convention, the token-mapping rules (React class → brand token), the import surface (per-folder `index.ts` + top-level barrel), and the per-component contracts (props, variants, slots, snippets, behavior delegated to `bits-ui`).

### Modified Capabilities

- `shadcn-components`: No requirement changes. The seven primitives shipped in that change remain valid; new components live alongside, not in place of, them. No delta spec is needed.

## Impact

- **New code**: ~37 component folders under `src/lib/components/ui/`, each with `*.svelte` + `index.ts`. Estimated ~50-80 files of new Svelte 5 source.
- **Modified code**: `src/lib/components/ui/button/button.svelte` (rebrand variant set to brand tokens, extend if other components need to consume its variants), `src/lib/components/ui/card/`, `src/lib/components/ui/badge/`, `src/lib/components/ui/separator/` (same rebrand). Possibly `src/routes/+page.svelte` and other landing sections to consume the new components.
- **New dependency**: none. `tailwind-variants`, `clsx`, `tailwind-merge`, `bits-ui`, and `@lucide/svelte` are already in `package.json`. CVA is **not** added — TV is the single variants library.
- **Removed**: `tmp/components/*` directory, deleted after each phase's components land.
- **Tooling**: `pnpm check`, `pnpm lint`, `pnpm test:unit` must continue to pass after every phase. New components get a Vitest component test where the source had interactive behavior (focus traps, escape handling, etc.).
- **Design system**: stays consistent with the "Quiet Bulletin" spec in `DESIGN.md`. No new shade-scale tokens are introduced; ochre accent usage is bounded by the One Voice Rule.
