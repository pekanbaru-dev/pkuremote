# PKU Remote

The public site for the Pekanbaru remote-worker community — a quiet, editorial bulletin for events, announcements, and blog posts.

## Stack

- **SvelteKit** (Svelte 5 runes mode) + TypeScript
- **Tailwind CSS v4** (tokens via `@theme` in `src/routes/layout.css`)
- **shadcn-svelte** components (`src/lib/components/ui/`)
- **Vitest** + **Playwright** for tests
- **pnpm** as the package manager

## Getting started

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## rtk (token-optimized CLI proxy)

[rtk](https://github.com/cyber-rico/rtk) is a CLI proxy that filters and summarizes command output before it reaches AI agents, saving 60–90% of tokens on common commands. It is optional for humans but recommended when using AI coding agents in this repo.

Install:

```sh
brew install rtk   # or see https://github.com/cyber-rico/rtk
```

Then prefix shell commands with `rtk`:

```sh
rtk git status
rtk pnpm install
rtk pnpm check
```

Meta commands (use bare): `rtk gain` (token savings analytics), `rtk discover` (find what rtk can optimize), `rtk proxy <cmd>` (run raw command without filtering).

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server on `http://localhost:5173` |
| `pnpm build` | Production build (SvelteKit + Vite) |
| `pnpm check` | `svelte-kit sync` then `svelte-check` (typecheck + Svelte diagnostics) |
| `pnpm lint` | `prettier --check . && eslint .` |
| `pnpm format` | `prettier --write .` |
| `pnpm test:unit` | Vitest (unit + component). Add `-- --run` for a single run. |
| `pnpm test:e2e` | Playwright (installs browsers first) |
| `pnpm test` | Unit then e2e, in that order |

Verify after edits: `pnpm check` → `pnpm lint` → `pnpm test`.

## Project structure

```
src/
├── app.html              # HTML shell (Google Fonts preconnect + stylesheet)
├── lib/
│   ├── components/ui/    # shadcn-svelte primitives (button, separator, navigation-menu)
│   └── utils.ts          # cn() + WithElementRef types (shadcn utility)
└── routes/
    ├── +layout.svelte    # Imports layout.css, renders favicon
    ├── +page.svelte      # Landing page (header, hero, event, announcements, posts, about, footer)
    └── layout.css        # Tailwind v4 @theme tokens + base + component classes
```

## Design system

- **PRODUCT.md** — register, users, purpose, brand personality, anti-references.
- **DESIGN.md** — the "Quiet Bulletin" visual spec: OKLCH palette, Spectral (display) + Source Sans 3 (body) typography, flat-by-default elevation, the One Voice Rule (ochre accent ≤10% of any screen).

Read both before any UI work.

## Agent setup (optional)

This repo is configured for AI coding agents (OpenCode, Claude Code, Codex). Three MCP servers are wired up:

- **serena** — symbolic code navigation and editing
- **codebase-memory-mcp** — code graph queries
- **context7** — up-to-date library docs

Install `serena` and `codebase-memory-mcp` on `PATH`:

```sh
pipx install serena
pipx install codebase-memory-mcp
```

`context7` runs via `npx` (no install needed). MCP config files live at `opencode.json`, `.agents/mcp.json`, `.claude/.mcp.json`, and `.codex/config.toml`. See `AGENTS.md` for usage rules.

## OpenSpec workflow

Changes are proposed, implemented, and archived via OpenSpec. Install the CLI globally first:

```sh
npm install -g @fission-ai/openspec   # or: pnpm add -g @fission-ai/openspec
openspec --version                    # verify (1.4.0 or later)
```

Then use it to manage changes:

```sh
openspec new change "<name>"          # scaffold a change
openspec status --change "<name>"    # check artifact status
```

Active changes live at `openspec/changes/<name>/`; archived changes at `openspec/changes/archive/YYYY-MM-DD-<name>/`; canonical specs at `openspec/specs/<capability>/spec.md`.