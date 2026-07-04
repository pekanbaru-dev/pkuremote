## 1. Install

- [ ] 1.1 Confirm `bits-ui` is installed (backs dialog + select); if missing it will be pulled by the add step
- [ ] 1.2 Run `pnpm dlx shadcn-svelte@latest add table dialog select --yes --overwrite`

## 2. Breakpoint + convention audit

- [ ] 2.1 Grep `src/lib/components/ui/{table,dialog,select}/` for `sm:`/`md:`/`lg:`/`xl:`/`2xl:` and convert each to `mobile:`/`tablet:`/`desktop:`
- [ ] 2.2 Ensure the table renders inside a horizontally scrollable container on small viewports
- [ ] 2.3 Verify imports resolve `$lib/utils.js` and the components pick up the OKLCH theme tokens

## 3. Barrel + smoke test

- [ ] 3.1 Export table, dialog, and select from `src/lib/components/ui/index.ts` matching the existing pattern
- [ ] 3.2 Smoke-mount each in a scratch route or test: table renders rows, dialog opens/closes (focus trap + Escape), select opens a listbox and reflects the chosen value
- [ ] 3.3 Run `pnpm check` → `pnpm lint` → `pnpm test`
