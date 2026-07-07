# Contributing

Thank you for considering contributing to PKU Remote. This guide will help you get from cloning the repository to opening your first pull request.

## Prerequisites

- **Node.js** — version 20 or later (check with `node --version`)
- **pnpm** — install with `npm install -g pnpm` or `brew install pnpm`

## Setup

```sh
git clone https://github.com/pekanbaru-dev/pkuremote.git
cd pkuremote
pnpm install
pnpm dev
```

Open `http://localhost:5175` in your browser.

## Available commands

| Command          | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `pnpm dev`       | Dev server on `http://localhost:5175`                                  |
| `pnpm build`     | Production build (SvelteKit + Vite)                                    |
| `pnpm check`     | `svelte-kit sync` then `svelte-check` (typecheck + Svelte diagnostics) |
| `pnpm lint`      | `prettier --check . && eslint .`                                       |
| `pnpm format`    | `prettier --write .`                                                   |
| `pnpm test:unit` | Vitest (unit + component). Add `-- --run` for a single run.            |
| `pnpm test:e2e`  | Playwright (installs browsers first)                                   |
| `pnpm test`      | Unit then e2e, in that order                                           |

## Code style

- **Svelte 5 runes mode** is enforced for all files. Use `$props`, `$state`, `$derived`, etc. Do not use legacy `export let` reactivity. See [AGENTS.md](./AGENTS.md) for details.
- **Tailwind CSS v4** with `@theme` tokens defined in `src/routes/layout.css`. There is no `tailwind.config.js`. See [DESIGN.md](./DESIGN.md) for the full token palette.
- **Prettier** uses tabs, single quotes, no trailing commas, 100-char print width. Run `pnpm format` before committing.
- **shadcn-svelte** components live under `$lib/components/ui/`. Add new ones with `pnpm dlx shadcn-svelte@latest add <component> --yes --overwrite`.

## Branch naming

Use `type/short-description` where `type` matches conventional commit types:

```
feat/add-login
fix/nav-overflow
chore/update-deps
docs/api-readme
refactor/extract-utils
test/button-spec
```

## Commit convention

Use [conventional commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

<optional body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Pull request process

1. Create a feature branch from `main`.
2. Make your changes. Keep them focused on a single concern.
3. Run `pnpm check` and `pnpm lint` to verify no regressions.
4. Open a pull request using the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
5. A maintainer will review your changes. See [MAINTAINERS.md](./MAINTAINERS.md) for the core team.

## OpenSpec workflow

This project uses [OpenSpec](https://github.com/fission-ai/openspec) to manage changes. Features and fixes are proposed, designed, and implemented through structured change artifacts.

Install the CLI:

```sh
npm install -g @fission-ai/openspec
```

Active changes live at `openspec/changes/<name>/` and include a proposal, design, specs, and task list. Before starting work, check if a change already exists for what you plan to do.

## Design conventions

This project has a calm, editorial brand personality. Before making UI changes, read:

- [PRODUCT.md](./PRODUCT.md) — brand, users, purpose, design principles
- [DESIGN.md](./DESIGN.md) — visual spec: OKLCH palette, typography, the One Voice Rule, absolute bans

## Code of conduct

All contributors must follow our [Code of Conduct](./CODE_OF_CONDUCT.md). Be respectful, constructive, and kind.

## Security

If you find a security vulnerability, do not open a public issue. Follow the instructions in [SECURITY.md](./SECURITY.md) to report it privately.
