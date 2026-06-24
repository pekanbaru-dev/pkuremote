# PKU Remote

The public site for the Pekanbaru remote-worker community — a quiet, editorial bulletin for events, announcements, and blog posts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Build status](https://img.shields.io/badge/build-passing-brightgreen)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5-ff3e00)

## Getting started

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Commands

| Command          | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `pnpm dev`       | Dev server on `http://localhost:5173`                                  |
| `pnpm build`     | Production build (SvelteKit + Vite)                                    |
| `pnpm check`     | `svelte-kit sync` then `svelte-check` (typecheck + Svelte diagnostics) |
| `pnpm lint`      | `prettier --check . && eslint .`                                       |
| `pnpm format`    | `prettier --write .`                                                   |
| `pnpm test:unit` | Vitest (unit + component). Add `-- --run` for a single run.            |
| `pnpm test:e2e`  | Playwright (installs browsers first)                                   |
| `pnpm test`      | Unit then e2e, in that order                                           |

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

## Contributing

We welcome contributions. Please read:

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, code style, commit convention, PR process
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community standards
- [SECURITY.md](SECURITY.md) — vulnerability reporting

## Tooling

### rtk (token-optimized CLI proxy)

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

Changes are proposed, implemented, and archived via OpenSpec. The OpenSpec CLI must be installed globally (see [CONTRIBUTING.md](CONTRIBUTING.md) for install steps); in agent sessions, trigger the OpenSpec skills by name:

- `openspec-propose` — scaffold a new change (proposal, design, specs, tasks) from a short description.
- `openspec-explore` — think through an idea or investigate a problem before or during a change.
- `openspec-apply-change` — implement tasks from an existing change.
- `openspec-sync-specs` — sync delta specs into canonical specs without archiving.
- `openspec-archive-change` — finalize and archive a completed change.

Active changes live at `openspec/changes/<name>/`; archived changes at `openspec/changes/archive/YYYY-MM-DD-<name>/`; canonical specs at `openspec/specs/<capability>/spec.md`.
