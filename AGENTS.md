# AGENTS.md

## rtk (token-optimized CLI proxy)

**Always prefix shell commands with `rtk`** (e.g. `rtk git status`, `rtk pnpm install`, `rtk pnpm check`). RTK is a CLI proxy that filters and summarizes command output before it reaches the agent context, saving 60–90% of tokens on common commands.

- Prefix all shell commands with `rtk` (e.g. `rtk git status`, `rtk pnpm install`, `rtk pnpm check`).
- Meta commands (use bare, no prefix): `rtk gain` (token savings analytics), `rtk discover` (find what rtk can optimize), `rtk proxy <cmd>` (run raw command without filtering).
- If `rtk` is not on `PATH`, install it (Homebrew: `brew install rtk`, or see the [rtk repo](https://github.com/cyber-rico/rtk)) and re-run. If a command fails under `rtk`, fall back to `rtk proxy <cmd>` to run it raw.

## Tool usage (always use these)

Three MCP servers are configured for this repo and MUST be used for the workflows below. Do not fall back to manual `grep`/`cat`/`Read` for what they cover.

**MCP config locations** (same servers, each tool's native format):

- `opencode.json` (project root) — OpenCode (`mcp` key, `type: "local"`)
- `.agents/mcp.json` — generic/cross-tool reference (same schema as `opencode.json`)
- `.claude/.mcp.json` — Claude Code (`mcpServers` key, `type: "stdio"`)
- `.codex/config.toml` — Codex (`[mcp_servers.*]` sections)

Servers: `serena` (symbolic code nav + editing), `codebase-memory-mcp` (code graph queries), `context7` (library docs). All three are enabled and should auto-load on session start.

**Prerequisites:** `serena` and `codebase-memory-mcp` must be on `PATH`. Install with `pipx install serena` and `pipx install codebase-memory-mcp` (or any equivalent). `context7` runs via `npx` (no install needed) or as a remote server. If a server reports "not found" on session start, run the install command and restart the session.

### Serena — symbolic code navigation and editing

Use Serena for **both reading and writing code**, not just navigation. Prefer it over whole-file reads and line-range edits.

- Discover: `get_symbols_overview` (file-level map), `find_symbol` (pass `include_body=False` until needed), `find_referencing_symbols`.
- Read: `find_symbol` with `include_body=True` to read one symbol's body, not the whole file.
- Edit/Write: `replace_symbol_body` (replace a whole function/class body), `insert_before_symbol` / `insert_after_symbol` (add new symbols), `rename_symbol` (rename across repo), `safe_delete_symbol`.
- Bulk text edits inside a file: `replace_content` (regex or literal, supports multiline).
- Scope searches: `search_for_pattern` with `relative_path`.
- On new projects, run `check_onboarding_performed`; if false, run `onboarding` before editing.

### Codebase Memory MCP — code graph queries

Use for **code exploration**. Prefer graph tools over Grep/Read when searching for symbols, call paths, dependencies, or impact analysis.

- `search_graph` — find functions, classes, routes, variables (BM25 + structural boost). Use `name_pattern` for exact regex, `semantic_query` for vector cosine search, `query` for natural-language.
- `trace_path` — call chains (`calls` mode), data flow (`data_flow`), or cross-service (`cross_service`). Use for "who calls X" / "what does X call" / impact analysis.
- `get_code_snippet` — read source for a specific qualified_name (get the name from `search_graph` first).
- `query_graph` — raw Cypher for complex multi-hop patterns.
- `get_architecture` — high-level packages/services/dependencies at a glance.
- Project name for every call: `Users-adryanev-Code-pekanbaru-dev-pkuremote`. If a call returns "not indexed", run `index_repository` with `mode: "moderate"` first.
- Fall back to Grep/Read only for text content, configs, non-code files, or when the graph misses something.

### Context7 — up-to-date library docs

Use for **external library/framework documentation** instead of guessing APIs or relying on training-data recall.

- `resolve-library-id` first (e.g. libraryName: "SvelteKit"), then `query-docs` with the returned `libraryId` and a specific question.
- Use for SvelteKit, shadcn-svelte, Tailwind v4, Vitest, Playwright, bits-ui — anything where the exact API matters.
- Do not call more than 3 times per question. If the API key is invalid, state that and proceed from local knowledge.

### Tool-selection order for code work

1. `codebase-memory-mcp` → find symbols and call graphs.
2. `serena` → read **and edit** specific symbol bodies (prefer over `Read`/`Edit`).
3. `Grep` / `Read` / `Edit` → only when the above don't fit (line-precise tweaks inside a body, non-code files, string-literal hunts).
4. `context7` → when an external library API is in question.

## Commands

Package manager is **pnpm** (not npm/yarn). The `test` script chains `test:unit` then `test:e2e`.

- `pnpm dev` — dev server on `http://localhost:5173`
- `pnpm build` — production build (SvelteKit + Vite)
- `pnpm check` — `svelte-kit sync` then `svelte-check` (typecheck + Svelte diagnostics). Run this after any `.svelte` or `.ts` edit.
- `pnpm lint` — `prettier --check . && eslint .`
- `pnpm format` — `prettier --write .` (use on touched files; running it across the repo will also reformat `.agents/`, `.claude/`, `.codex/`, `.github/` skill markdown which are not source code — scope it to `src/` + `*.config.*` when you only want your changes)
- `pnpm test:unit` — Vitest (unit + component). `pnpm test:unit -- --run` runs once (no watch).
- `pnpm test:e2e` — runs `playwright install` first, then `playwright test`. E2E uses `npm run build && npm run preview` on port 4173 (note: the playwright config calls `npm run`, not `pnpm run` — leave it).
- `pnpm test` — unit then e2e, in that order.

Verify order after edits: `pnpm check` → `pnpm lint` (or `pnpm format` first if needed) → `pnpm test`.

## Stack quirks

- **Svelte 5 runes mode is forced** in `vite.config.ts` for all files except those under `node_modules`. Use `$props` / `$state` / `$derived` etc.; do not use legacy `export let` reactivity.
- **Tailwind v4, not v3.** Tokens live in `@theme { ... }` in `src/routes/layout.css`. There is no `tailwind.config.js` — do not create one. Tailwind v4 `@theme` blocks accept **literal values only** (no `var()` references); if you need a token alias, define it with the literal OKLCH value, not via `var(--other-token)`.
- **Two token naming families coexist in `@theme`:** brand names (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-muted`, `--color-hairline`) and shadcn names (`--color-background`, `--color-foreground`, `--color-primary-foreground`, `--color-border`, `--color-ring`, `--color-muted-foreground`, etc.). Where they map to the same color, the literal OKLCH value is duplicated across both names — this is intentional so Tailwind generates both `bg-canvas` and `bg-background` utilities. Do not try to deduplicate with `var()`.
- **`svelte/no-navigation-without-resolve` is disabled** in `eslint.config.js`. Plain `href="#events"` and `href={someVar}` are fine; do not wrap in `$app/paths`'s `resolve()` unless you have a typed route literal.
- **`@lucide/svelte`** is the icon library (installed, not yet used on the page). Use it for any future icons; do not add another set.
- **Playwright browsers must be installed** before E2E or screenshots: `pnpm exec playwright install chromium webkit`. The first `pnpm test:e2e` run will do this automatically.

## Design system (read before any UI work)

- `PRODUCT.md` — register (`brand`), users, purpose, brand personality (calm, minimal, focused), anti-references (no generic community/club website, no SaaS gradient hero), design principles.
- `DESIGN.md` — the "Quiet Bulletin" visual spec: OKLCH palette, Spectral (display) + Source Sans 3 (body) typography, flat-by-default elevation, the One Voice Rule (ochre accent ≤10% of any screen), the Eyebrow Ban, the Display Tracking floor (≥ -0.04em). Treat the absolute-bans list in DESIGN.md as non-negotiable.
- Both files are referenced by the `impeccable` skill; editing UI without reading them produces off-brand output.

## shadcn-svelte

- `components.json` is at the repo root. Aliases: `$lib` / `$lib/components` / `$lib/components/ui` / `$lib/utils` / `$lib/hooks`.
- **shadcn-svelte `init` is interactive and will block on a "preset" prompt.** To add components without re-running init, just use `pnpm dlx shadcn-svelte@latest add <component> --yes --overwrite` — `components.json` already exists.
- The shadcn **NavigationMenu** is installed at `$lib/components/ui/navigation-menu/` but **not used on the landing page**. Its default `hover:bg-muted` background-fill treatment conflicts with the editorial hairline-underline nav aesthetic. Use it only on surfaces where background-fill-on-hover is the intended affordance.
- The landing page uses shadcn **Button** (primary CTA) and **Separator** (section dividers); everything else is hand-rolled CSS classes (`.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`) in `src/routes/layout.css`. shadcn has no link or meta-label primitive — keep these as CSS.

## OpenSpec workflow

- `openspec/` contains change proposals under `changes/<name>/` (proposal.md, design.md, specs/, tasks.md) and canonical specs under `specs/<capability>/spec.md`.
- Commands: `openspec new change "<name>"`, `openspec status --change "<name>" --json`, `openspec instructions <artifact> --change "<name>" --json`.
- The skills `/opsx:propose`, `/opsx:apply`, `/opsx:archive` drive this flow. Run them rather than editing `openspec/` files by hand.
- Archived changes live at `openspec/changes/archive/YYYY-MM-DD-<name>/`.
- Before archiving a change that adds/modifies a capability, sync its delta spec to `openspec/specs/<capability>/spec.md`.

## impeccable skill

- Lives at `~/.agents/skills/impeccable/` (symlinked from `~/.config/opencode/skills/impeccable/`). Project-relative `.agents/skills/impeccable/` does not exist; run scripts with the absolute path: `node /Users/adryanev/.agents/skills/impeccable/scripts/<script>.mjs`.
- `context.mjs` reports `NO_PRODUCT_MD` if PRODUCT.md is missing and forces the `init` flow. PRODUCT.md and DESIGN.md already exist here, so it prints their content as a markdown block — read it before any UI work.
- Live-mode config is at `.impeccable/live/config.json` (configured for SvelteKit: `files: ["src/app.html"]`, `insertBefore: "</body>"`, `commentSyntax: "html"`).

## Conventions that differ from defaults

- **Prettier uses tabs** (`.prettierrc` `useTabs: true`), single quotes, no trailing commas, 100-char print width. Match this; do not reformat with spaces.
- **`$lib` is the only path alias.** No `@/` or `@components/`. shadcn components import from `$lib/utils.js` (note the `.js` extension even though the source is `utils.ts` — SvelteKit/Vite resolves it).
- Demo routes under `src/routes/demo/` are SvelteKit scaffold leftovers (Vitest + Playwright examples). Do not edit them; a future change can remove them.
- The `playwright.config.ts` uses `npm run build && npm run preview` (not pnpm) for the E2E web server. This is intentional — do not "fix" it to pnpm.
