## Why

The project already configures three agent-tool MCP servers (Serena, codebase-memory, Context7) across four config files (opencode.json, .agents/mcp.json, .claude/.mcp.json, .codex/config.toml) but the convention is implicit — there is no spec, no AGENTS.md section, and no documented per-platform syntax for environment-variable substitution. Google Stitch (a design-to-code MCP server) was registered in the four config files manually without capturing the pattern, which means the next developer adding a server (Figma, GitHub, Sentry, etc.) will have to re-derive the per-platform header syntax and risk leaking the API key by hardcoding it.

## What Changes

- Add a new `mcp-config` capability spec that defines the cross-tool convention: secrets live in `.env` (gitignored) and `.env.example` (tracked), every MCP server with auth is registered in all four config files within the same commit, and headers use the platform-appropriate env-var reference syntax (`{env:VAR}` for opencode, `${VAR}` for Claude Code, `env_http_headers` table for Codex).
- Add a new `stitch-mcp` capability spec that defines the contract for the Google Stitch server: env var name (`STITCH_API_KEY`), header name (`X-Goog-Api-Key`), URL (`https://stitch.googleapis.com/mcp`), and the four consumer config files.
- Add an `MCP server configuration` section to `AGENTS.md` that points new developers at `.env.example` and the two new specs, and lists the four config files in a table with their per-platform syntax.
- Document `STITCH_API_KEY` in `.env.example` (the value lives only in `.env`).

## Capabilities

### New Capabilities

- `mcp-config`: The cross-tool convention for registering MCP servers across the project's four agent-tool config files. Covers the secret-management rule (env var, never hardcoded), the per-platform header syntax, the four-file sync rule, and the AGENTS.md onboarding step.
- `stitch-mcp`: The contract for connecting the Google Stitch MCP server (https://stitch.googleapis.com/mcp) to the project's agent tools. Covers the env var name, header name, URL, and the list of consumer config files.

### Modified Capabilities

<!-- None. No existing spec's requirements are changing. -->

## Impact

- **Code:** `opencode.json`, `.agents/mcp.json`, `.claude/.mcp.json`, `.codex/config.toml` (add `stitch` entry to each), `.env.example` (document `STITCH_API_KEY`), `AGENTS.md` (add MCP section).
- **Secrets:** `STITCH_API_KEY` value lives only in `.env` (gitignored) and the user's `~/.zshenv` (out of repo). The four MCP configs reference it via env-var substitution; the literal value never appears in any tracked file.
- **Out of repo:** `~/.zshenv` exports `STITCH_API_KEY` so agent tools that spawn non-interactive zsh inherit it. Not a repo change; documented in `design.md` as an operator step.
- **Specs:** Introduces two new capabilities (`mcp-config`, `stitch-mcp`); no existing capability modified.
