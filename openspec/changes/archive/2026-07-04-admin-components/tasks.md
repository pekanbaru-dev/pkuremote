## 1. Install

- [x] 1.1 Confirm `bits-ui` is installed (backs dialog + select) — present (`^2.18.1`)
- [x] 1.2 Run `pnpm dlx shadcn-svelte@latest add table dialog select --yes --overwrite` (also pulled `separator`, a `select` dependency; reverted the cosmetic-only `button` re-write)

## 2. Breakpoint + convention audit

- [x] 2.1 Convert default Tailwind breakpoints to semantic ones — `dialog-content` `sm:max-w-sm`→`mobile:max-w-sm`, `dialog-footer` `sm:flex-row sm:justify-end`→`mobile:...`; grep confirms none remain in table/dialog/select/separator
- [x] 2.2 Table renders inside a horizontally scrollable container (`table-container` uses `w-full overflow-x-auto`)
- [x] 2.3 Imports resolve `$lib/utils.js` and pick up the OKLCH theme tokens (verified via `pnpm check` + build)

## 3. Barrel + smoke test

- [x] 3.1 Components exported via their per-subfolder barrels (`$lib/components/ui/{table,dialog,select}`) with aliased names (`Table…`/`Dialog…`/`Select…`) — matches the existing convention (central `ui/index.ts` stays empty; a central `export *` would collide on `Root`/`Trigger`)
- [x] 3.2 Smoke: all three compile and SSR (build), and their barrels expose the expected named exports; interactive behavior (focus trap/Escape/listbox) is provided by the underlying `bits-ui` primitives
- [x] 3.3 Run `pnpm check` (0 errors) → `pnpm lint` (clean) → `pnpm test` (96 passed)
