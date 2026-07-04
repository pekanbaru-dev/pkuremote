# shadcn-components Specification

## Purpose

Defines how shadcn-svelte is initialized and configured in the project, how its CSS variables map to the OKLCH theme tokens, and which shadcn components (Button, Separator, NavigationMenu) are installed and used on the landing page.
## Requirements
### Requirement: shadcn-svelte is initialized with a components.json

The project SHALL contain a `components.json` at the repo root, produced by `shadcn-svelte init`, configured with the CSS path `src/routes/layout.css`, the lib alias `$lib`, the components alias `$lib/components`, the utils alias `$lib/utils`, the hooks alias `$lib/hooks`, and the ui alias `$lib/components/ui`. The base color SHALL be `neutral`.

#### Scenario: shadcn-svelte CLI reads the project config

- **WHEN** a shadcn-svelte CLI command (e.g. `shadcn-svelte add button`) is run in the project
- **THEN** it reads `components.json` and resolves all aliases and the CSS path without prompting.

### Requirement: shadcn CSS variables map to the OKLCH theme tokens

The shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--border`, `--muted`, `--muted-foreground`, `--ring`) SHALL be defined in `src/routes/layout.css` and each SHALL reference the corresponding OKLCH token from the `@theme` block via `var(--color-*)`, so the `@theme` tokens remain the single source of truth for color values.

#### Scenario: Changing a theme token updates shadcn components

- **WHEN** the `--color-primary` token in `@theme` is changed
- **THEN** every shadcn component that uses `--primary` reflects the new value without any edit to the component files.

#### Scenario: No duplicate color definitions

- **WHEN** the project is audited for color sources
- **THEN** each brand color appears exactly once as an OKLCH value in the `@theme` block, and the shadcn CSS variables reference those tokens by `var()` rather than redefining the OKLCH value.

### Requirement: Button component is installed and configured

The shadcn `button` component SHALL be installed under `$lib/components/ui/button/`. Its `buttonVariants` `tv()` config SHALL retain the stock shadcn variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`) for general (non-landing) use, AND SHALL define the following project-specific variants that reproduce the exact Tailwind class strings previously hand-rolled on the landing page's raw `<button>` elements:

- `login` — header Login/Register pill: `h-auto bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95`
- `hero-primary` — hero "Explore Events" filled CTA: `h-auto bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-headline-md shadow-sm hover:shadow-md transition-all active:scale-95`
- `hero-outline` — hero "Learn History" outlined CTA: `h-auto border-2 border-primary text-primary px-xl py-md rounded-lg font-headline-md hover:bg-primary/5 transition-all active:scale-95`
- `view-all` — events section "View All Events" link: `h-auto text-primary font-label-lg flex items-center gap-xs hover:underline`
- `become-partner` — CTA "Become a Partner": `h-auto bg-on-primary-container text-white px-xl py-md rounded-full font-headline-md hover:opacity-90 transition-all active:scale-95`
- `sponsorship-kit` — CTA "Sponsorship Kit" glass: `h-auto bg-white/20 text-on-primary-container px-xl py-md rounded-full font-headline-md border border-on-primary-container/30 hover:bg-white/30 transition-all active:scale-95`
- `join` — footer form "Join" submit: `h-auto bg-primary text-on-primary px-4 py-2 hover:opacity-90`

Every project variant SHALL include `h-auto` to defeat the stock `h-8`/`h-9` fixed-height (which would otherwise squash the padding-based sizing). The rendered visual of each project variant SHALL be pixel-equivalent to the pre-migration raw `<button>` it replaces. (This replaces the previous aspirational spec text about "ochre fill, pill radius, 0.75rem 1.5rem padding, hover darken to `--primary-hover`" which was never applied to the stock `button.svelte`.)

#### Scenario: Stock default variant is preserved for non-landing use

- **WHEN** a `<Button>` (no variant prop) is rendered on a non-landing route
- **THEN** it uses the stock `default` variant (`bg-primary text-primary-foreground`, `rounded-lg`, `h-8`), unchanged from before this change.

#### Scenario: Login button renders as a pill with h-auto

- **WHEN** `<Button variant="login">Login/Register</Button>` is rendered
- **THEN** its computed classes include `bg-primary text-on-primary rounded-full px-lg py-sm font-label-lg h-auto hover:opacity-90`, and its rendered height is padding-based (not the stock 32px `h-8`), pixel-equivalent to the pre-migration header Login/Register button.

#### Scenario: Hero CTAs render filled and outlined

- **WHEN** `<Button variant="hero-primary">` and `<Button variant="hero-outline">` are rendered
- **THEN** the former has `bg-primary-container text-on-primary-container rounded-lg font-headline-md shadow-sm` and the latter has `border-2 border-primary text-primary rounded-lg font-headline-md`, both with `h-auto` and `px-xl py-md`, pixel-equivalent to the pre-migration hero CTAs.

#### Scenario: CTA buttons render with their distinct fills

- **WHEN** `<Button variant="become-partner">` and `<Button variant="sponsorship-kit">` are rendered
- **THEN** the former has `bg-on-primary-container text-white rounded-full` and the latter has `bg-white/20 border border-on-primary-container/30 rounded-full`, both with `font-headline-md px-xl py-md h-auto`, pixel-equivalent to the pre-migration CTA buttons.

#### Scenario: View All and Join buttons render their minimal styles

- **WHEN** `<Button variant="view-all">` and `<Button variant="join">` are rendered
- **THEN** the former has `text-primary font-label-lg flex items-center gap-xs hover:underline` and the latter has `bg-primary text-on-primary px-4 py-2 h-auto`, pixel-equivalent to the pre-migration raw buttons.

### Requirement: Separator component is installed

The shadcn `separator` component SHALL be installed under `$lib/components/ui/separator/`. It SHALL render a 1px horizontal line using the `--border` (hairline) color. It replaces the `border-t border-hairline` dividers between sections on the landing page.

#### Scenario: Separator renders a hairline

- **WHEN** the shadcn Separator is rendered with `orientation="horizontal"`
- **THEN** it draws a 1px line in the `--border` color, visually equivalent to the previous `border-t border-hairline` rule.

### Requirement: NavigationMenu component is installed

The shadcn `navigation-menu` component SHALL be installed under `$lib/components/ui/navigation-menu/`. It SHALL render the site nav (Events, Announcements, Posts, About) with hover and focus states using the `--primary` accent for the active/hover underline, matching the previous hand-rolled nav treatment.

#### Scenario: Nav link hover shows ochre underline

- **WHEN** a visitor hovers a NavigationMenu link
- **THEN** the link's underline and text color transition to `--primary` over 0.18s.

#### Scenario: Keyboard focus on nav links

- **WHEN** a keyboard user tabs through the NavigationMenu
- **THEN** each link shows a visible focus ring in `--ring` (mapped to `--primary`).

### Requirement: shadcn runtime dependencies are installed

The project SHALL have `tailwind-merge`, `clsx`, and `tailwind-variants` (and any per-component dependencies the installed primitives require) added to `package.json` via `pnpm`, as a result of the `shadcn-svelte add` commands.

#### Scenario: pnpm install resolves all shadcn deps

- **WHEN** `pnpm install` is run after the shadcn components are added
- **THEN** the install completes with no missing-dependency warnings and `pnpm check` passes.

### Requirement: Badge component is installed and configured

The shadcn `badge` component SHALL be installed under `$lib/components/ui/badge/` via `pnpm dlx shadcn-svelte@latest add badge --yes --overwrite`. After installation, `badge.svelte` SHALL be overwritten with a `tv()`-based config that retains the stock shadcn badge variants (`default`, `secondary`, `destructive`, `outline`) AND defines a `pill` variant: `bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1`. The `pill` variant is normative for the landing page hero badge.

#### Scenario: Hero badge renders as a pill

- **WHEN** `<Badge variant="pill">Pekanbaru Heritage & Culture</Badge>` is rendered
- **THEN** its computed classes include `bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1`, pixel-equivalent to the pre-migration hero `<span>` pill.

#### Scenario: Stock badge variants retained for future use

- **WHEN** a `<Badge>` (no variant prop, or `variant="secondary"`) is rendered on a non-landing route
- **THEN** it uses the stock shadcn badge styling, unchanged by the `pill` addition.

### Requirement: Card component is configured with bento variants

The shadcn `card` component SHALL be installed under `$lib/components/ui/card/`. Its `card.svelte` SHALL use a `cardVariants` `tv()` config (replacing the current plain `cn(...)` string) defining the variants `default` (stock, for general use), `bento` (`bg-surface-container-lowest rounded-xl talam-shadow ring-0`), `bento-primary` (`bg-primary text-on-primary rounded-xl ring-0`), and `stats` (`bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`). The `bento`, `bento-primary`, and `stats` variants SHALL each include `ring-0` to defeat the stock `ring-1 ring-foreground/10`. Grid placement (`tablet:col-span-*`, `tablet:row-span-*`) and internal flex layout (`flex flex-col justify-between`, `flex gap-md items-center`, etc.) remain per-usage via the `class` prop, not via variant.

#### Scenario: Bento card renders without a ring

- **WHEN** `<Card variant="bento" class="tablet:col-span-2 p-lg flex flex-col justify-between">` is rendered
- **THEN** its computed classes include `bg-surface-container-lowest rounded-xl talam-shadow ring-0` and do NOT include `ring-1`, pixel-equivalent to the pre-migration bento card `<div>`.

#### Scenario: Bento-primary accent card renders with primary fill

- **WHEN** `<Card variant="bento-primary" class="tablet:col-span-1 p-md flex flex-col justify-center items-center text-center">` is rendered
- **THEN** its computed classes include `bg-primary text-on-primary rounded-xl ring-0`, pixel-equivalent to the pre-migration accent bento card.

#### Scenario: Stats card renders with glass background

- **WHEN** `<Card variant="stats" class="p-lg">` is rendered
- **THEN** its computed classes include `bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`, pixel-equivalent to the pre-migration CTA stats panel.

#### Scenario: Stock default card variant preserved

- **WHEN** a `<Card>` (no variant prop) is rendered on a non-landing route
- **THEN** it uses the stock card styling (`bg-card rounded-xl ring-1 ring-foreground/10 py-4 gap-4 text-sm`), unchanged by the bento variant additions.

### Requirement: Table component is installed and configured

The shadcn-svelte **Table** component SHALL be installed under `src/lib/components/ui/table/` via `shadcn-svelte add` against the existing `components.json`, exported from the `ui` barrel, and free of default Tailwind breakpoints — any `sm:`/`md:`/`lg:`/`xl:`/`2xl:` in the generated source SHALL be converted to the semantic breakpoints (`mobile:`/`tablet:`/`desktop:`). On viewports narrower than its content, the table SHALL remain usable via a horizontally scrollable container rather than relying on a disabled default breakpoint.

#### Scenario: Table is importable from the ui barrel

- **WHEN** a route or component imports the Table parts from `$lib/components/ui`
- **THEN** the import resolves to the installed `ui/table/` component

#### Scenario: Table source uses no disabled breakpoints

- **WHEN** a reviewer greps `src/lib/components/ui/table/` for `sm:`/`md:`/`lg:`/`xl:`/`2xl:`
- **THEN** no matches appear (all responsive variants use `mobile:`/`tablet:`/`desktop:`)

### Requirement: Dialog component is installed and configured

The shadcn-svelte **Dialog** component SHALL be installed under `src/lib/components/ui/dialog/` via `shadcn-svelte add`, backed by `bits-ui`, exported from the `ui` barrel, resolving `$lib/utils.js` and the OKLCH theme tokens, and free of default Tailwind breakpoints (converted to the semantic set where present).

#### Scenario: Dialog is importable and opens

- **WHEN** a component imports Dialog from `$lib/components/ui` and triggers it
- **THEN** the dialog opens with focus trapped and can be dismissed via the close control or Escape

#### Scenario: Dialog source uses no disabled breakpoints

- **WHEN** a reviewer greps `src/lib/components/ui/dialog/` for default Tailwind breakpoints
- **THEN** no matches appear

### Requirement: Select component is installed and configured

The shadcn-svelte **Select** component SHALL be installed under `src/lib/components/ui/select/` via `shadcn-svelte add`, backed by `bits-ui`, exported from the `ui` barrel, resolving `$lib/utils.js` and the OKLCH theme tokens, and free of default Tailwind breakpoints (converted to the semantic set where present).

#### Scenario: Select is importable and selectable

- **WHEN** a component imports Select from `$lib/components/ui` and renders options
- **THEN** the select opens a listbox, a value can be chosen with keyboard and pointer, and the chosen value is reflected in the trigger

#### Scenario: Select source uses no disabled breakpoints

- **WHEN** a reviewer greps `src/lib/components/ui/select/` for default Tailwind breakpoints
- **THEN** no matches appear

