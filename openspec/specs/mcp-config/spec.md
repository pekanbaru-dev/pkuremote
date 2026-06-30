# mcp-config Specification

## Purpose

TBD - created by archiving change add-stitch-mcp. Update Purpose after archive.

## Requirements

### Requirement: MCP server auth uses env-var reference, not hardcoded

MCP server auth headers SHALL reference an environment variable name; the literal value SHALL NOT appear in any tracked config file. The env var SHALL be defined in `.env` (gitignored) and documented (name and purpose) in `.env.example` (tracked).

#### Scenario: A reader inspects a config file for a secret leak

- **WHEN** a reviewer greps all four MCP config files for the prefix of any API key (`AQ.`, `sk-`, `ghp_`, etc.)
- **THEN** zero matches appear in any tracked file; the literal value exists only in `.env` (gitignored) and the operator's shell startup file (out of repo).

#### Scenario: A developer adds a new MCP server with auth

- **WHEN** a developer needs to register a new MCP server that requires auth
- **THEN** they (a) add the env var to `.env` with the real value, (b) document the env var in `.env.example` with `=YOUR_<SERVICE>_API_KEY`, and (c) reference the env var in each of the four config files using the platform's syntax.

### Requirement: Each MCP server is registered in all four config files

The project SHALL maintain MCP server registrations in four config files: `opencode.json`, `.agents/mcp.json`, `.claude/.mcp.json`, and `.codex/config.toml`. A new server SHALL appear in all four within the same commit; disabling a server SHALL remove or set `enabled: false` in all four.

#### Scenario: A new MCP server is registered

- **WHEN** a developer opens each of the four config files after a registration commit
- **THEN** each file contains a matching entry for the new server pointing at the same URL with consistent auth.

#### Scenario: A new MCP server is registered without auth

- **WHEN** a developer registers a server that does not require auth (e.g., a public read-only API)
- **THEN** the four config files still contain the server entry, but no `headers` / `env` / `env_http_headers` block is required.

### Requirement: Per-platform header syntax

Each config file uses a distinct syntax for env-var substitution in HTTP headers. The substitution SHALL be written using the syntax native to that tool; shell-style `${VAR}` is NOT used in opencode config, and `{env:VAR}` is NOT used in Claude Code or Codex config.

| Platform                          | Syntax                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| opencode (`opencode.json`)        | `"{env:VAR_NAME}"`                                                                                |
| generic (`.agents/mcp.json`)      | `"{env:VAR_NAME}"`                                                                                |
| Claude Code (`.claude/.mcp.json`) | `"${VAR_NAME}"` (type: `http`)                                                                    |
| Codex (`.codex/config.toml`)      | `[mcp_servers.<name>.env_http_headers]` table; header value is the env var name as a plain string |

#### Scenario: A developer copies a header value between config files

- **WHEN** a developer copies the stitch header from `opencode.json` to `.claude/.mcp.json` verbatim
- **THEN** the Claude entry fails to load (because Claude uses `${VAR}`, not `{env:VAR}`); the developer rewrites the value with the platform's native syntax.

### Requirement: AGENTS.md documents the MCP server convention

`AGENTS.md` SHALL contain a `MCP server configuration` section that names the four config files, links to `.env.example` for the secret-management convention, and links to the `mcp-config` and per-server specs (e.g., `stitch-mcp`).

#### Scenario: A new developer reads AGENTS.md to onboard

- **WHEN** a developer who has never touched the project opens `AGENTS.md` and looks for "MCP" or "agent tools"
- **THEN** they find a section that lists the four config files in a table, points at `.env.example` for env var names, and links to the OpenSpec specs for the convention details.

### Requirement: Disabling an MCP server uses `enabled: false`

In opencode and `.agents/mcp.json`, a server SHALL be disabled by setting `enabled: false`, not by removing the entry. The rationale is to preserve the env-var reference and make re-enabling a one-line change.

#### Scenario: A developer temporarily disables a server

- **WHEN** a developer needs to disable stitch for debugging
- **THEN** they set `"enabled": false` in both `opencode.json` and `.agents/mcp.json` (and equivalent in the Claude/Codex configs), keeping the URL, headers, and env-var references intact.
