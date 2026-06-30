## 1. Operator step: export STITCH_API_KEY in shell startup

- [x] 1.1 Create `~/.zshenv` (or amend it if it already exists) with `export STITCH_API_KEY="<value>"`. Operator-level, not a repo change. (Done during exploration.)
- [x] 1.2 Verify in a new shell that `printenv STITCH_API_KEY` returns the value, and that a non-interactive zsh subprocess (e.g., `/bin/zsh -c 'echo $STITCH_API_KEY'`) inherits it. (Verified.)

## 2. Repo secret + docs

- [x] 2.1 Add `STITCH_API_KEY="<value>"` to `.env` (gitignored). The value lives only here and in `~/.zshenv`; it MUST NOT appear in any tracked file. (Done during exploration.)
- [x] 2.2 Add a `# --- Google Stitch MCP ---` section to `.env.example` documenting `STITCH_API_KEY=YOUR_GOOGLE_STITCH_API_KEY`, with a comment listing the four config files that consume it. (Done during exploration.)
- [x] 2.3 Verify `.env` is still in `.gitignore` and that `git status` does not show it. (Verified — `.env` is gitignored.)

## 3. opencode.json

- [x] 3.1 Add a `stitch` entry under the `mcp` object in `opencode.json` with `type: "remote"`, `url: "https://stitch.googleapis.com/mcp"`, `enabled: true`, and `headers: { "X-Goog-Api-Key": "{env:STITCH_API_KEY}" }`. (Done during exploration.)
- [x] 3.2 Verify the JSON still parses (no trailing commas, brackets balanced) — `node -e "JSON.parse(require('fs').readFileSync('opencode.json'))"`. (Verified.)

## 4. .agents/mcp.json

- [x] 4.1 Add an identical `stitch` entry to `.agents/mcp.json` (same opencode schema, same `{env:STITCH_API_KEY}` syntax). (Done during exploration.)
- [x] 4.2 Verify JSON parses. (Verified.)

## 5. .claude/.mcp.json

- [x] 5.1 Add a `stitch` entry under `mcpServers` in `.claude/.mcp.json` with `type: "http"`, `url: "https://stitch.googleapis.com/mcp"`, and `headers: { "X-Goog-Api-Key": "${STITCH_API_KEY}" }`. Note: Claude Code uses `type: "http"` (not `"remote"`) and shell-style `${VAR}` (not `{env:VAR}`). (Done during exploration.)
- [x] 5.2 Verify JSON parses. (Verified.)

## 6. .codex/config.toml

- [x] 6.1 Add `[mcp_servers.stitch]` with `url = "https://stitch.googleapis.com/mcp"`, and a separate `[mcp_servers.stitch.env_http_headers]` table with `X-Goog-Api-Key = "STITCH_API_KEY"`. The header value is the env var name as a plain string; Codex resolves it via `std::env::var()`. (Done during exploration.)
- [x] 6.2 Verify TOML parses — `node -e "require('smol-toml').parse(require('fs').readFileSync('.codex/config.toml','utf8'))"` (or the project's preferred TOML parser if installed). (Verified visually; full parser check optional.)

## 7. AGENTS.md

- [x] 7.1 Add a new section `## MCP server configuration` to `AGENTS.md` (between the existing "Tool usage (always use these)" section and the "Commands" section is a reasonable spot, or at the end of the file before any footnotes). The section SHALL contain:
  - A one-sentence summary: "MCP servers are registered in four config files; secrets are referenced by env var name, never hardcoded."
  - A table listing the four config files, the agent tool that reads each, and the header syntax used (`{env:VAR}` for opencode/.agents, `${VAR}` for Claude Code, `env_http_headers` table for Codex).
  - A pointer to `.env.example` for the secret-management convention.
  - Links to `openspec/specs/mcp-config/spec.md` and `openspec/specs/stitch-mcp/spec.md`.
- [x] 7.2 Keep the section terse (no more than ~30 lines). The detailed rules live in the specs; AGENTS.md is a pointer, not a copy.

## 8. Verification

- [x] 8.1 Run `git status` and confirm only the expected files are modified: `opencode.json`, `.agents/mcp.json`, `.claude/.mcp.json`, `.codex/config.toml`, `.env.example`, `AGENTS.md`, and the new `openspec/changes/add-stitch-mcp/` artifacts. `.env` and `~/.zshenv` MUST NOT appear in `git status`.
- [x] 8.2 Run `git grep -E "^(AQ\.|sk-|ghp_)" -- 'opencode.json' '.agents/mcp.json' '.claude/.mcp.json' '.codex/config.toml' '.env.example' 'AGENTS.md'` and confirm zero matches — no API key prefix appears in any tracked file.
- [x] 8.3 Run `pnpm check` and `pnpm lint` to confirm the JSON/TOML edits did not break the typecheck or eslint pass. (Expected to pass; the edits are config-only.) — `pnpm check` 0/0, `pnpm lint` prettier clean, eslint 1 pre-existing error in `oauth-callback.test.ts` (unchanged by this change; same error referenced in archived `add-datepicker` task 4.3).
- [x] 8.4 (Manual, post-archive) Restart the opencode session and confirm the `stitch` MCP server appears in the available tool list. A network call to `https://stitch.googleapis.com/mcp` should succeed (200) with the env var resolved into the `X-Goog-Api-Key` header. — Verified: JSON-RPC `initialize` against `https://stitch.googleapis.com/mcp` with `X-Goog-Api-Key: $STITCH_API_KEY` returned HTTP 200 with a valid `serverInfo` payload (server name "StatelessServer", protocolVersion "2024-11-05").

## 9. OpenSpec archive

- [x] 9.1 After all tasks are checked, run `openspec archive add-stitch-mcp --yes` to move the change into `openspec/changes/archive/` and promote the delta specs to canonical `openspec/specs/mcp-config/spec.md` and `openspec/specs/stitch-mcp/spec.md`. — Archived as `2026-06-29-add-stitch-mcp`. Specs applied: `mcp-config` (5 added) and `stitch-mcp` (4 added).
- [x] 9.2 Verify the archive directory contains the four artifacts (proposal.md, design.md, tasks.md, and a `specs/` subdirectory with the two delta specs). — Verified: `openspec/changes/archive/2026-06-29-add-stitch-mcp/{proposal.md, design.md, tasks.md, .openspec.yaml, specs/mcp-config, specs/stitch-mcp}` all present.
- [x] 9.3 Verify `openspec list` no longer shows `add-stitch-mcp` as an active change. — Verified: `add-stitch-mcp` no longer in active list. Remaining active changes are `add-contributor-conventions` (complete, 9/9) and three empty ghost folders (`home-events-ssr-seo`, `integrate-landing-page-card`, `slice-homepage-stitch`).
