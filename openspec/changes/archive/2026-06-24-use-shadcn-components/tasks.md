## 1. Initialize shadcn-svelte

- [x] 1.1 Run `pnpm dlx shadcn-svelte@latest init` non-interactively with flags: `--base-color neutral --css src/routes/layout.css --lib-alias '$lib' --components-alias '$lib/components' --utils-alias '$lib/utils' --hooks-alias '$lib/hooks' --ui-alias '$lib/components/ui' --skip-preflight`
- [x] 1.2 Verify `components.json` exists at the repo root with the correct aliases and CSS path
- [x] 1.3 If the CLI emitted a `tailwind.config.js`, delete it — the project uses Tailwind v4 `@theme` in `layout.css`, not a v3 config
- [x] 1.4 Run `pnpm check` and `pnpm build` to confirm the init did not break the existing Tailwind v4 setup

## 2. Bridge shadcn CSS variables to the OKLCH theme tokens

- [x] 2.1 In `src/routes/layout.css`, add a `@layer base` block (or extend the existing one) defining `--background: var(--color-canvas)`, `--foreground: var(--color-ink)`, `--primary: var(--color-primary)`, `--primary-foreground: var(--color-canvas)`, `--border: var(--color-hairline)`, `--muted: var(--color-surface)`, `--muted-foreground: var(--color-muted)`, `--ring: var(--color-primary)`
- [x] 2.2 Verify the `@theme` OKLCH tokens remain the only place raw color values are defined; shadcn variables only reference them via `var()`
- [x] 2.3 Run `pnpm check` to confirm no type or build errors from the CSS changes

## 3. Install shadcn components

- [x] 3.1 Run `pnpm dlx shadcn-svelte@latest add button` and verify `$lib/components/ui/button/` is created
- [x] 3.2 Run `pnpm dlx shadcn-svelte@latest add separator` and verify `$lib/components/ui/separator/` is created
- [x] 3.3 Run `pnpm dlx shadcn-svelte@latest add navigation-menu` and verify `$lib/components/ui/navigation-menu/` is created
- [x] 3.4 Verify `tailwind-merge`, `clsx`, and `tailwind-variants` are now in `package.json` (installed by the CLI)
- [x] 3.5 Run `pnpm install` to ensure all new deps are resolved

## 4. Configure the Button variant to match the previous `.btn-primary`

- [x] 4.1 In `$lib/components/ui/button/`, edit the variant config to expose one `primary` variant: `bg-primary text-primary-foreground rounded-full px-6 py-3 hover:bg-[var(--color-primary-hover)] active:translate-y-px transition-colors duration-200`
- [x] 4.2 Remove any `default`, `ghost`, `outline`, `secondary`, `destructive` variants from the button config (do not ship unused variants in this change)
- [x] 4.3 Verify the Button renders with ochre fill, white text, pill radius, and hover darken by rendering it in isolation

## 5. Migrate the landing page to shadcn components

- [x] 5.1 In `src/routes/+page.svelte`, import the shadcn Button, Separator, and NavigationMenu components
- [x] 5.2 Replace the hero's `<a href="#events" class="btn-primary">See next event</a>` with the shadcn Button component (as an `<a>` or `<button>` depending on shadcn's API, with `href="#events"`)
- [x] 5.3 Replace every `border-t border-hairline` section divider with the shadcn `<Separator orientation="horizontal" />`
- [x] 5.4 Replace the header `<nav>` and footer `<nav>` markup with the shadcn NavigationMenu component, keeping the same links (Events, Announcements, Posts, About in footer) and the same hover/focus treatment (ochre underline on hover, focus ring in primary)
- [x] 5.5 Keep the `<details>` disclosure for the mobile nav below 640px — shadcn NavigationMenu does not provide a mobile disclosure, so wrap or augment it
- [x] 5.6 Remove the `.btn-primary` class definition from `src/routes/layout.css` (its role is now filled by the shadcn Button)
- [x] 5.7 Keep `.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet` in `layout.css` unchanged

## 6. Verify

- [x] 6.1 Run `pnpm check` — 0 errors, 0 warnings
- [x] 6.2 Run `pnpm lint` on source files — prettier + eslint pass
- [x] 6.3 Run `pnpm format` on `src/routes/+page.svelte`, `src/routes/layout.css`, and any new `$lib/components/ui/` files if needed
- [x] 6.4 Run `pnpm dev` and screenshot the page at 360px, 768px, and 1280px
- [x] 6.5 Inspect: button still renders ochre pill with white text, separators still render 1px hairlines, nav still shows ochre hover/focus, no visual regression from the previous landing-page build
- [x] 6.6 Verify the shadcn Button hover darkens to `--primary-hover`, not to a default shadcn hover color
- [x] 6.7 Verify changing `--color-primary` in `@theme` propagates to the shadcn Button, Separator, and NavigationMenu (edit the token, observe the change, revert)
- [x] 6.8 Re-screenshot after any fixes and confirm the page meets the brief before marking the change complete
