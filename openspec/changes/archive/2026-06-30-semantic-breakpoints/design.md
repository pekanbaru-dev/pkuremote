## Context

The project uses Tailwind v4 (configured via `@import "tailwindcss"` and `@theme { ... }` in `src/routes/layout.css`). There is no `tailwind.config.js`. Tailwind v4 generates responsive variant prefixes (`sm:`, `md:`, `lg:`, etc.) from `--breakpoint-*` tokens in the `@theme` block. The defaults (`sm` = 40rem, `md` = 48rem, `lg` = 64rem, `xl` = 80rem, `2xl` = 96rem) are currently in effect because no `--breakpoint-*` overrides are defined.

The codebase has 18 responsive-prefix usages across 2 route files. The `src/lib/components/` (primitives + shadcn ui) directories have zero responsive-prefix usages — the `sm`/`md`/`lg` strings in `.style.ts` files are `tailwind-variants` size-variant keys, not breakpoint prefixes.

## Goals / Non-Goals

**Goals:**

- Replace abstract breakpoint names (`sm`/`md`/`lg`) with semantic device-tier names (`mobile`/`tablet`/`desktop`) so responsive intent is self-documenting in markup.
- Remove the default `sm`/`md`/`lg`/`xl`/`2xl` breakpoints so only the semantic names are valid — no dual naming.
- Update all spec text that references old prefix names to use the new names.

**Non-Goals:**

- Changing breakpoint pixel values. The mapping is 1:1: `mobile` = 40rem (was `sm`), `tablet` = 48rem (was `md`), `desktop` = 64rem (was `lg`). No new tiers, no value changes.
- Adding `mobile-first` or `max-*` breakpoint variants. This is a pure rename + default removal.
- Changing the `tailwind-variants` size keys (`sm`/`md`/`lg`/`xl`) in `.style.ts` files. Those are component size variant names, not responsive prefixes, and are unaffected by `--breakpoint-*` tokens.
- Changing any visual output. The pixel values are identical; only the prefix names change.

## Decisions

**Decision 1: Direct 1:1 rename, no new tiers.**

```
  OLD (default)              NEW (semantic)
  ─────────────              ──────────────
  sm:  40rem (640px)   →     mobile:   40rem (640px)
  md:  48rem (768px)   →     tablet:   48rem (768px)
  lg:  64rem (1024px)  →     desktop:  64rem (1024px)
  xl:  80rem (1280px)  →     (removed — not used)
  2xl: 96rem (1536px)  →     (removed — not used)
```

- **Why not add a `mobile` tier at 30rem (480px)?** The codebase doesn't use a 480px breakpoint. Adding one introduces a tier that nobody needs, and the semantic tension ("mobile: applies at ≥480px, which is also tablet and desktop") is worse at 480px than at 640px. Keep it simple: 3 names, 3 values, direct mapping.
- **Why not drop `mobile:` and use base = mobile?** Most Tailwind-idiomatic, but the user explicitly wants `mobile:` as a prefix for readability. `mobile:grid-cols-2` is clearer than `sm:grid-cols-2` even if the semantics are "≥640px".

**Decision 2: Remove defaults via `--breakpoint-*: initial`.**

In Tailwind v4, setting a `--breakpoint-*` token to `initial` in `@theme` removes it from the generated utility set. This is the documented way to clear defaults.

```css
@theme {
	/* Remove Tailwind v4 default breakpoints */
	--breakpoint-sm: initial;
	--breakpoint-md: initial;
	--breakpoint-lg: initial;
	--breakpoint-xl: initial;
	--breakpoint-2xl: initial;

	/* Semantic device-tier breakpoints */
	--breakpoint-mobile: 40rem; /* 640px — large phones / small tablets */
	--breakpoint-tablet: 48rem; /* 768px — tablets */
	--breakpoint-desktop: 64rem; /* 1024px — desktops */
}
```

- **Why remove rather than keep both?** Dual naming (`sm:` and `mobile:` both valid) creates ambiguity — a contributor wouldn't know which to use. Removing defaults forces consistency. The audit confirmed zero shadcn/primitive components use responsive prefixes, so removal is safe.
- **Risk**: Future `pnpm dlx shadcn-svelte add <component>` might bring in a component that uses `sm:`/`md:` internally. Mitigation: check each new shadcn addition for responsive prefixes and replace them. Document this in `AGENTS.md`.

**Decision 3: Spec text uses `mobile:`/`tablet:`/`desktop:` in all class-string examples.**

Where spec requirement bodies and scenarios reference specific Tailwind class strings (e.g., `md:grid-cols-3`, `md:col-span-2`, `lg` breakpoint), the text SHALL be updated to use the new names. This keeps specs as a reliable reference for what the code should contain.

## Risks / Trade-offs

- **[Future shadcn additions use old prefixes]** → A future `shadcn-svelte add` could bring in a component with `sm:`/`md:` classes that silently produce no styles. Mitigation: `AGENTS.md` note + check each new addition. The current shadcn components (Card, Button, Separator, NavigationMenu) are clean.
- **[Semantic tension: `mobile:` applies at ≥640px, not only mobile]** → In Tailwind's min-width model, `mobile:grid-cols-2` applies at ≥640px, which includes tablet and desktop. This is inherent to mobile-first CSS and cannot be avoided without switching to max-width (which breaks the mobile-first convention). The name is still clearer than `sm:` because it communicates the device tier the breakpoint targets, even if styles cascade upward.
- **[Spec text in 4 capabilities]** → Updating spec text is straightforward but touches multiple files. Each MODIFIED requirement block is copied fully and has `md:`/`lg:`/`sm:` replaced with `tablet:`/`desktop:`/`mobile:`.
