## ADDED Requirements

### Requirement: Landing page sources components from primitives and ui

The landing page (`src/routes/+page.svelte`) SHALL source simple interactive components (`Button`, `Badge`, `Input`) from `$lib/components/primitives` and composite/headless components (`Card`, etc.) from `$lib/components/ui` (shadcn-svelte). The landing page SHALL NOT import these components from `$lib/components/ui-cp` (the backup) or from the empty `$lib/components/ui/<simple-name>` paths. Landing-specific visual treatments that do not map to the canonical primitive variant contract (`intent`/`variant`/`size`/`rounded`/...) SHALL be applied via the `class` prop at the call site — Strategy A: `cn(<name>Variants({...}), className)` emits the primitive's default classes first and the call-site `className` last, so `tailwind-merge` resolves conflicts in favor of the call-site class. Where the primitive's base classes do not conflict but leak undesirably (e.g., the primitive `Input`'s `ring-1 ring-inset` on a bare embedded input, or the primitive `Button`'s `focus-visible:ring-2` on a landing variant that originally had no focus ring), the call-site `class` SHALL include an explicit defeat (`ring-0`, `focus-visible:ring-0`, etc.).

#### Scenario: Landing page imports simple primitives from primitives

- **WHEN** the landing page renders a `Button`, `Badge`, or `Input`
- **THEN** the component is imported from `$lib/components/primitives` (the barrel or per-component path), not from `$lib/components/ui` or `$lib/components/ui-cp`.

#### Scenario: Landing page imports Card from ui

- **WHEN** the landing page renders a `Card`
- **THEN** the component is imported from `$lib/components/ui/card` (shadcn-svelte), not from `primitives/` (Card is composite/headless-delegating, so it lives in `ui/`).

#### Scenario: Landing-specific visuals use the class prop, not component-internal variants

- **WHEN** the landing page needs a visual that does not map to the canonical primitive variant contract (e.g., `hero-primary`, `bento`, `stats`, `pill`)
- **THEN** the visual is applied by passing the exact CSS class string as the `class` prop on the primitive (or shadcn `Card`), and the component definition in `primitives/` (or `ui/`) contains no landing-specific variant key for it.

#### Scenario: Leaked primitive base classes are defeated explicitly

- **WHEN** a primitive's non-conflicting base class would leak onto a landing element (e.g., the bare embedded `Input` would show the primitive's `ring-1` border)
- **THEN** the call-site `class` includes an explicit defeat (e.g., `ring-0`) so the rendered result matches the intended landing design.
