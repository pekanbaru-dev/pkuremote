## Context

`src/lib/components/ui/` holds shadcn-svelte components managed via `components.json` (root). The CLAUDE.md quirks are load-bearing here: (1) shadcn-svelte `init` is interactive and must NOT be re-run — `add` works directly against the existing `components.json`; (2) the project removed the default Tailwind breakpoints (`sm:`/`md:`/`lg:`/`xl:`/`2xl:` emit no CSS) in favor of `mobile:`/`tablet:`/`desktop:`, so any shadcn output using the defaults must be converted; (3) shadcn components import from `$lib/utils.js` (note the `.js`).

## Goals / Non-Goals

**Goals:**
- Add `table`, `dialog`, `select` to `ui/`, configured to the project's conventions.
- Ensure they work with the semantic breakpoints and OKLCH tokens.

**Non-Goals:**
- No admin screens or domain wiring (that's `admin-event-management`).
- No hand-rolled variants; these are headless/complex and belong in `ui/` (shadcn), not `primitives/`.

## Decisions

### Install via `shadcn-svelte add`, then breakpoint-audit the output
Run `pnpm dlx shadcn-svelte@latest add table dialog select --yes --overwrite`, then grep the generated files for `sm:`/`md:`/`lg:`/`xl:`/`2xl:` and rewrite to `mobile:`/`tablet:`/`desktop:`.

- **Why:** `add` is the supported, non-interactive path with `components.json` already present. The breakpoint audit is required because the defaults are disabled in this project — an unconverted `md:` silently emits nothing.
- **Alternatives considered:** Hand-rolling these in `primitives/` — rejected: dialog and select need headless behavior (focus trap, listbox semantics) that `bits-ui` already provides; CLAUDE.md places such components in `ui/`.

### Barrel-export consistent with existing `ui/` components
Add exports for the three components to `src/lib/components/ui/index.ts` matching the existing style.

- **Why:** Consumers import from the barrel; keeps the surface uniform.

## Risks / Trade-offs

- **Generated components ship default breakpoints that silently no-op.** → Mitigation: the breakpoint audit task is mandatory and grep-verifiable.
- **`--overwrite` could clobber a divergent local edit.** → None of these three exist yet, so there's nothing to clobber; safe for this change.
- **shadcn output may use `sm:`-based responsive tables.** → Convert to `mobile:`/`tablet:`; verify the table scrolls horizontally within an `overflow-x-auto` container on small viewports rather than relying on a disabled breakpoint.
