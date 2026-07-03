## MODIFIED Requirements

### Requirement: Components are rebrand to brand tokens

Components SHALL use the existing OKLCH brand tokens defined in `src/routes/layout.css` (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-primary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-hairline`, plus shadcn-mapped names like `--color-background`, `--color-foreground`, `--color-border`, `--color-destructive`, `--color-ring`). Components SHALL ALSO use the status-color tokens defined in `@theme` for functional status feedback: `--color-danger`, `--color-success`, `--color-warning`, `--color-info`, plus their `on-*`, `*-container`, and `on-*-container` role companions. These four status-color families SHALL follow the Material-3 role pattern (exactly 4 tokens per family: base, on-base, container, on-container) and SHALL be expressed in OKLCH. Components SHALL NOT introduce 50–900 shade-scale tokens (`primary-50..900`, `success-50..900`, `danger-50..900`, `gray-50..900`) into `@theme`. Raw Tailwind palette utilities (`bg-emerald-500`, `text-red-600`, `text-gray-900`) SHALL NOT be used in TV configs.

#### Scenario: A reader audits a component for token compliance

- **WHEN** a component is reviewed for brand consistency
- **THEN** every color class in the TV config is either a Tailwind utility that maps to an `@theme` token (e.g., `bg-primary`, `text-ink`, `border-hairline`, `text-destructive`, `bg-success`, `text-on-danger-container`) or a kept-as-is non-color utility (e.g., spacing, radius, typography, transition utilities).

#### Scenario: Status-color families follow the M3 role pattern

- **WHEN** the `@theme` block is audited for the four status-color families
- **THEN** each of `danger`, `success`, `warning`, `info` has exactly 4 tokens: `--color-<family>`, `--color-on-<family>`, `--color-<family>-container`, `--color-on-<family>-container`, all expressed in OKLCH.

#### Scenario: No 50–900 ramp tokens leak into the theme

- **WHEN** the project is audited for `@theme` token growth after this change
- **THEN** no token matching the pattern `--color-<family>-<number>` (e.g., `--color-primary-500`, `--color-success-100`, `--color-danger-900`) exists in `src/routes/layout.css`.

#### Scenario: Status colors are scoped to functional feedback

- **WHEN** a component uses a status color (`bg-danger`, `bg-success`, `bg-warning`, `bg-info`) in its TV config or inline class list
- **THEN** the component's purpose is functional status feedback (form validation, action outcomes, alerts, toasts), not decorative accent.

#### Scenario: Danger and destructive alias share the same literal

- **WHEN** the `@theme` block is audited for the `danger` and `destructive` tokens
- **THEN** `--color-danger` and `--color-destructive` carry the same literal OKLCH value (literal duplication, no `var()` reference), and `--color-on-danger` and `--color-destructive-foreground` also share the same literal.

### Requirement: Success, warning, and info intents collapse to the brand accent

The One Voice Rule (DESIGN.md) preserves ochre as the sole decorative accent. Functional status feedback colors (`danger`, `success`, `warning`, `info`) are an explicit, scoped exception: components that convey status (form validation, action outcomes, alerts, toasts) SHALL retain distinct visual treatments using the corresponding `@theme` status-color tokens. Decorative use of status colors (e.g., as accent fills on landing-page hero sections, non-functional splashes of color) remains governed by the One Voice Rule and SHALL collapse to the brand ochre (`bg-primary`).

#### Scenario: A success button uses the success color

- **WHEN** a button with a "success" semantic is rendered (e.g., a "Save" confirmation)
- **THEN** it uses `bg-success` and `text-on-success`, visually distinct from a "primary" intent button.

#### Scenario: A destructive button retains its distinct treatment

- **WHEN** a button with a "destructive" semantic is rendered
- **THEN** it uses `bg-danger` (or the alias `bg-destructive`) and `text-on-danger` (or `text-destructive-foreground`), visually distinct from the primary ochre.

#### Scenario: A decorative accent collapses to ochre

- **WHEN** a status color is used as a decorative accent (e.g., a hero-section fill, a non-functional splash of green or blue)
- **THEN** the One Voice Rule applies and the accent SHALL use `bg-primary` (ochre), not `bg-success` or any other status color.

#### Scenario: Status feedback on a form input uses the status token

- **WHEN** an input is rendered with `aria-invalid="true"` (functional error feedback)
- **THEN** the input's border and ring use `border-danger` / `ring-danger`, not the brand ochre.
