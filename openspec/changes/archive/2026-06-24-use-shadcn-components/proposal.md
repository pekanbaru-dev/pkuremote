## Why

The landing page currently ships with hand-rolled component classes (`.btn-primary`, `.link-quiet`, `.label-meta`) defined in `layout.css`. The user requested shadcn-svelte for the component layer — a Svelte port of shadcn that gives each component its own file under `$lib/components/ui/`, with styles driven by CSS variables that map to the project's design tokens. shadcn-svelte was never actually initialized (an earlier attempt prompted interactively and didn't complete), so this change does the init and then migrates the landing page's interactive elements onto shadcn primitives while preserving the established "Quiet Bulletin" visual direction (OKLCH tokens, Spectral/Source Sans 3, flat-by-default, ochre accent ≤10%).

## What Changes

- Initialize shadcn-svelte in the project: run `shadcn-svelte init`, create `components.json`, register the OKLCH tokens from `layout.css` as shadcn CSS variables so generated components inherit the brand palette.
- Add shadcn-svelte components that map to the landing page's current primitives: `button` (replaces `.btn-primary`), `navigation-menu` or a minimal nav primitive (replaces the header/footer nav markup), and `separator` (replaces the 1px hairline `border-t border-hairline` dividers). `link-quiet` and `label-meta` stay as hand-rolled utility classes because shadcn does not ship a "link" or "meta label" primitive.
- Rewrite `src/routes/+page.svelte` to import and use the shadcn components for button, nav, and separator; keep the section structure, dummy content, semantic landmarks, and responsive behavior from the previous change.
- Remove the now-redundant `.btn-primary` class from `layout.css` (its role moves to the shadcn Button component). Keep `.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet` as hand-rolled utilities.
- Keep the OKLCH token definitions in `layout.css`'s `@theme` as the single source of truth; shadcn's CSS variables reference those tokens so the brand palette stays canonical.

## Capabilities

### New Capabilities

- `shadcn-components`: The project's shadcn-svelte setup — `components.json`, the CSS variable bridge between shadcn and the OKLCH `@theme` tokens, and the set of installed shadcn primitives (Button, NavigationMenu, Separator). Covers the init contract and the token-mapping rules that keep generated components on-brand.

### Modified Capabilities

- `landing-page`: The landing page's interactive primitives (primary button, navigation, section dividers) now render via shadcn components instead of hand-rolled classes. The visual requirements (One Voice accent budget, flat-by-default, hairline dividers, focus ring in primary) carry over unchanged; the implementation surface changes.

## Impact

- **Code:** `src/routes/+page.svelte` (rewrite to use shadcn imports), `src/routes/layout.css` (remove `.btn-primary`, add shadcn CSS variable mappings under `:root` or `@theme`), `components.json` (new), `src/lib/components/ui/` (new directory tree for button, navigation-menu, separator).
- **Dependencies:** `shadcn-svelte` CLI pulls in its dependencies (typically `tailwind-merge`, `clsx`, `tailwind-variants`, and any per-component deps like `@internationalized/date` for calendars — only what the chosen components require). Installed via `pnpm dlx shadcn-svelte add ...`.
- **Design system:** The OKLCH tokens in `layout.css @theme` remain canonical. shadcn's CSS variables (`--background`, `--foreground`, `--primary`, `--border`, etc.) are mapped to those tokens so generated components inherit the brand palette without a second source of truth.
- **Specs:** Introduces the `shadcn-components` capability spec; modifies the `landing-page` spec's "Reusable component classes" and "Primary button text color" requirements to reference the shadcn Button instead of `.btn-primary`.
