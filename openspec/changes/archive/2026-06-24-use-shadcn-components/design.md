## Context

The landing page (`src/routes/+page.svelte`) currently renders its interactive primitives via hand-rolled CSS classes in `layout.css`: `.btn-primary` (the ochre pill button), `.link-quiet` (hairline-underline link), and 1px `border-t border-hairline` dividers between sections. The design tokens (OKLCH colors, Spectral/Source Sans 3 fonts, radii) live in a Tailwind v4 `@theme` block in `layout.css`. shadcn-svelte is not yet initialized — an earlier `shadcn-svelte init` attempt prompted interactively and did not complete, so there is no `components.json` and no `src/lib/components/ui/` tree.

PRODUCT.md and DESIGN.md define the brand ("The Quiet Bulletin" — calm, minimal, focused, restrained ochre accent ≤10%, flat-by-default, no ghost cards, no gradient text). The previous change (`add-landing-page`, archived) shipped the first page against that direction. This change introduces shadcn-svelte as the component layer and migrates the landing page onto it without altering the visual direction.

Constraints:
- Tailwind v4 is installed (4.3.1); shadcn-svelte must work with the v4 `@theme` token setup, not a v3 `tailwind.config.js`.
- The OKLCH tokens in `layout.css @theme` are the single source of truth for colors. shadcn's CSS variables must reference those tokens, not redefine them.
- Svelte 5 runes mode is the project default; shadcn-svelte v1.3.0+ supports Svelte 5.
- `pnpm` is the package manager. shadcn-svelte CLI invocations use `pnpm dlx`.

## Goals / Non-Goals

**Goals:**
- Initialize shadcn-svelte: `components.json`, CSS variable bridge, `$lib/components/ui/` directory.
- Install the shadcn primitives that map to the landing page's current elements: `button`, `separator`, and `navigation-menu` (or a simpler nav primitive if `navigation-menu` is overkill for a 3-link header).
- Map shadcn's CSS variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--border`, `--muted`, `--muted-foreground`, `--ring`) to the OKLCH tokens in `@theme` so generated components inherit the brand palette.
- Rewrite `+page.svelte` to use the shadcn Button, Separator, and nav primitive. Keep the section structure, dummy content, semantic landmarks, `aria-labelledby`, and responsive behavior from the previous change.
- Remove `.btn-primary` from `layout.css`; keep `.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet` as hand-rolled utilities (shadcn ships no equivalents).

**Non-Goals:**
- Adding shadcn components the landing page does not need (Card, Dialog, Dropdown, Input, Select, etc.). Those land when a future surface requires them.
- Replacing `.link-quiet` or `.label-meta` with shadcn primitives — shadcn has no link or meta-label component.
- Changing the visual direction. The ochre accent, flat-by-default elevation, hairline dividers, and Spectral/Source Sans 3 typography all stay. shadcn components are styled to match what is already shipping.
- Introducing a dark mode. shadcn ships a dark variant by default; we do not enable it.
- Adding a `tailwind.config.js`. The project uses Tailwind v4 `@theme`; shadcn must work with that.

## Decisions

### D1: Map shadcn CSS variables to the OKLCH `@theme` tokens, not the other way around

**Choice:** shadcn-svelte emits CSS variables (`--background`, `--foreground`, `--primary`, etc.) typically in a `@layer base` block. We set each to `var(--color-canvas)`, `var(--color-ink)`, `var(--color-primary)`, etc., referencing the tokens already defined in `@theme`.

**Why over alternatives:** The `@theme` tokens are the canonical palette (PRODUCT.md/DESIGN.md reference them; future pages reuse them). If shadcn's variables held the raw OKLCH values, the project would have two sources of truth for the same color. Referencing `var(--color-primary)` from `--primary` keeps one definition and lets a future token change propagate to all shadcn components automatically. Alternatives considered: (a) redefine OKLCH in shadcn variables and drop `@theme` — loses Tailwind utility generation (`bg-canvas`, `text-ink`). (b) Duplicate values in both places — silent drift risk.

### D2: Install Button, Separator, NavigationMenu — not more

**Choice:** Add exactly three shadcn primitives: `button` (replaces `.btn-primary`), `separator` (replaces `border-t border-hairline`), `navigation-menu` (replaces the header/footer `<nav>` markup). Skip Card, Input, Dialog, etc.

**Why:** These are the only shadcn primitives the landing page actually uses. Installing a Card or Dialog would pull in dependencies and styles for nothing. `navigation-menu` is the right shadcn primitive for a multi-link nav with consistent hover/focus treatment; it is heavier than a bare `<nav>` but gives the project a reusable nav pattern for future pages (event detail, about) without a second nav implementation. Alternatives considered: (a) skip `navigation-menu`, keep the nav as hand-rolled `<nav>` — fine for one page, but the user asked for shadcn components and the nav is one of the three interactive elements on the page. (b) Use shadcn `menubar` instead — `menubar` is for application menu bars (File/Edit/View), not site navigation; wrong primitive.

### D3: Keep `.link-quiet` and `.label-meta` as hand-rolled classes

**Choice:** Do not replace `.link-quiet` or `.label-meta` with shadcn components. They stay in `@layer components` in `layout.css`.

**Why:** shadcn-svelte does not ship a "link" or "meta label" primitive. Inventing a custom shadcn component for a hairline-underline link would be more code than the 8-line CSS class it replaces. `.label-meta` is a typographic utility (small, muted, tabular-nums), not a component with state — it belongs in CSS. This keeps the shadcn layer to genuine interactive primitives and avoids pseudo-components.

### D4: Button variant mapping — one primary variant, no ghost/outline yet

**Choice:** Configure the shadcn Button with one custom variant matching `.btn-primary` (ochre fill, canvas/white text, pill radius, hover darken, active 1px dip). Do not ship `ghost`, `outline`, `secondary`, or `destructive` variants in this change.

**Why:** The landing page uses one button. Future pages can add variants when they need them; shipping an unused variant surface now is premature. The variant is defined in the shadcn Button's variant config (typically via `tailwind-variants`), referencing the same `--primary` / `--primary-foreground` variables.

### D5: Run `shadcn-svelte init` non-interactively with explicit flags

**Choice:** Invoke `shadcn-svelte init` with all aliases and the CSS path passed via flags so it does not prompt. Use `--base-color neutral` (closest to the true-neutral canvas), `--css src/routes/layout.css`, `--lib-alias $lib`, `--components-alias $lib/components`, `--utils-alias $lib/utils`, `--hooks-alias $lib/hooks`, `--ui-alias $lib/components/ui`, `--skip-preflight` (the project already has Tailwind v4 and SvelteKit configured).

**Why over alternatives:** The CLI's interactive prompt blocked the earlier attempt. Passing all flags explicitly makes the step reproducible in CI and in the apply phase of this change. `--base-color neutral` is the closest shadcn preset to the project's true-neutral canvas; the ochre accent comes from our `--primary` mapping, not from the base color.

## Risks / Trade-offs

- **[Risk] shadcn-svelte may not fully support Tailwind v4's `@theme` token setup.** → Mitigation: shadcn-svelte v1.3.0+ targets Tailwind v4. The CSS variable bridge in D1 is the standard integration path; if the CLI emits a `tailwind.config.js`, we delete it and keep the `@theme` block. Verify after init that `pnpm check` and `pnpm build` still pass before migrating the page.
- **[Risk] The shadcn Button's default styling may drift from the established `.btn-primary` look (radius, padding, hover).** → Mitigation: Configure the variant explicitly via the Button's variant config to match the current `.btn-primary` exactly (pill radius, 0.75rem 1.5rem padding, ochre fill, white text, 0.18s transitions). Screenshot before and after the migration at the same viewport and diff the button visually.
- **[Risk] `navigation-menu` may be heavier than the 3-link header needs.** → Mitigation: If the primitive adds too much DOM or CSS for a 3-link nav, fall back to keeping the `<nav>` hand-rolled and only migrate Button + Separator. The proposal's goal is shadcn primitives where they fit, not a forced migration of every element.
- **[Trade-off] Adding `tailwind-merge`, `clsx`, `tailwind-variants` as dependencies.** → These are shadcn-svelte's standard runtime deps. They are small, well-maintained, and required for the component variant system. Acceptable cost for a component library the project will grow into.
- **[Trade-off] The component layer splits across `$lib/components/ui/` files instead of one `layout.css`.** → This is the point of shadcn — each component owns its file. It adds files but makes future component reuse (on the about page, event detail page) explicit. Acceptable.