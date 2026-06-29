# opencode.md

> Project-specific instructions for the OpenCode AI assistant. This file is a project-local companion to `AGENTS.md` (the canonical, cross-tool agent rules). When in doubt, `AGENTS.md` wins.

## Relationship to AGENTS.md

- `AGENTS.md` is the source of truth for repo conventions (rtk, MCP servers, commands, stack quirks, design system, OpenSpec, etc.).
- This file only adds OpenCode-specific clarifications and pointers. **Do not duplicate rules** — if a topic lives in `AGENTS.md`, reference it there.
- Both files are loaded together on session start; OpenCode merges instructions.

## Read AGENTS.md first

Before doing any non-trivial work in this repo, read `AGENTS.md` in full. It covers:

- **rtk** — always prefix shell commands with `rtk` (e.g. `rtk pnpm check`, `rtk git status`).
- **MCP servers** — `serena` (symbolic code nav + editing), `codebase-memory-mcp` (code graph), `context7` (library docs). Use them per the tool-selection order in `AGENTS.md`.
- **Commands** — `pnpm` is the package manager. Verify order after edits: `pnpm check` → `pnpm lint` (or `pnpm format`) → `pnpm test`.
- **Stack quirks** — Svelte 5 runes mode, Tailwind v4 `@theme` (literal OKLCH only), shadcn-svelte, Playwright.
- **Design system** — read `PRODUCT.md` + `DESIGN.md` before any UI work; the "Quiet Bulletin" rules in DESIGN.md are non-negotiable.
- **OpenSpec workflow** — use the `/opsx:*` skills, don't edit `openspec/` files by hand.
- **impeccable skill** — lives at `~/.agents/skills/impeccable/`; run with the absolute path.

## OpenCode-specific notes

- **Model identity**: this session runs on `opencode-go/minimax-m3`. Treat its recall as a snapshot — prefer `context7` for any external library API question.
- **Tool selection**: OpenCode exposes `serena_*`, `codebase_memory_mcp_*`, `context7_*`, plus `Grep`/`Read`/`Edit`/`Write`/`Bash`/`Glob`. Follow the priority order in `AGENTS.md` § "Tool-selection order for code work" — graph → serena → Grep/Read/Edit → context7.
- **MCP config**: this repo's OpenCode MCP config is `opencode.json` at the project root (`mcp` key, `type: "local"`). The same servers also live in `.agents/mcp.json` (generic) and `.claude/.mcp.json` (Claude Code format) and `.codex/config.toml` (Codex). Do not edit the other formats from this tool — change the canonical `opencode.json` and let the others stay as documentation.
- **Project name for `codebase-memory-mcp`**: `Users-adryanev-Code-pekanbaru-dev-pkuremote`. If a call returns "not indexed", run `index_repository` with `mode: "moderate"` first.
- **Serena onboarding**: on a fresh clone, `check_onboarding_performed` may return false — run `onboarding` before editing.
- **Output style**: keep responses concise. The user prefers short, direct answers (<4 lines unless detail is requested). No preambles, no postambles, no emojis unless asked.
- **Code style**: when editing, mimic existing patterns. Tabs (Prettier `useTabs: true`), single quotes, no trailing commas, 100-char width. **Never add comments unless explicitly asked.**

## What NOT to do (recap of AGENTS.md hard rules)

- Do not skip the `rtk` prefix on shell commands.
- Do not use legacy Svelte reactivity (`export let`); use runes (`$props`, `$state`, `$derived`).
- Do not create a `tailwind.config.js` — Tailwind v4 lives in `@theme` blocks.
- Do not wrap plain `href` in `resolve()` from `$app/paths` (lint rule is disabled on purpose).
- Do not edit `src/routes/demo/` — it's a future-removal target.
- Do not commit secrets, do not change git config, do not push without being asked.
- Do not "fix" the `npm run` in `playwright.config.ts` to `pnpm run` — it's intentional.
- Do not use the shadcn `NavigationMenu` on the landing page (background-fill conflicts with the hairline-underline nav aesthetic).

## When this file and AGENTS.md conflict

`AGENTS.md` wins. Open `AGENTS.md`, update it there, and re-derive the OpenCode-specific line here if needed.
