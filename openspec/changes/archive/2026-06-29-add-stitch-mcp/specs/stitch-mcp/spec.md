# stitch-mcp Specification (delta)

## Purpose

Defines the contract for connecting the Google Stitch MCP server (https://stitch.googleapis.com/mcp) to the project's agent tools — the env var name, the auth header, the URL, and the four consumer config files.

## ADDED Requirements

### Requirement: Stitch MCP is registered in all four config files

The Stitch MCP server SHALL be registered in `opencode.json`, `.agents/mcp.json`, `.claude/.mcp.json`, and `.codex/config.toml` with the URL `https://stitch.googleapis.com/mcp`. Each entry SHALL be enabled by default.

#### Scenario: A developer verifies stitch is wired into all four configs

- **WHEN** a developer opens each of the four MCP config files
- **THEN** each file contains a `stitch` entry pointing at `https://stitch.googleapis.com/mcp`.

#### Scenario: A new agent tool is onboarded

- **WHEN** a future agent tool is added to the project (a fifth config file)
- **THEN** the stitch entry SHALL be added to that file too, using the new tool's native header syntax.

### Requirement: Stitch auth uses STITCH_API_KEY via X-Goog-Api-Key

The Stitch MCP server SHALL be authenticated by sending the `X-Goog-Api-Key` header populated from the `STITCH_API_KEY` environment variable. The literal value of `STITCH_API_KEY` SHALL NOT appear in any tracked config file.

#### Scenario: An agent tool starts up with the env var set

- **WHEN** opencode / Claude Code / Codex launches and the parent shell has exported `STITCH_API_KEY`
- **THEN** the agent tool substitutes the env var into the `X-Goog-Api-Key` header and the Stitch server accepts the request.

#### Scenario: An agent tool starts up without the env var

- **WHEN** opencode / Claude Code / Codex launches and `STITCH_API_KEY` is unset or empty
- **THEN** the Stitch MCP server rejects requests with a 401/403, and the agent tool surfaces an authentication error to the user (rather than silently failing).

### Requirement: STITCH_API_KEY is documented in .env.example

`.env.example` SHALL contain a `STITCH_API_KEY=YOUR_GOOGLE_STITCH_API_KEY` line, grouped under a `# --- Google Stitch MCP ---` section header that lists the four config files that consume it.

#### Scenario: A developer looks up the env var name

- **WHEN** a developer needs to know which env var powers the Stitch MCP server
- **THEN** they open `.env.example`, find the Stitch section, and see the var name, the value placeholder, and the list of config files that read it.

### Requirement: Disabling Stitch uses enabled: false

To temporarily disable the Stitch MCP server without losing the registration, a developer SHALL set `enabled: false` in the opencode and `.agents/mcp.json` entries (and equivalent in the Claude/Codex configs), per the `mcp-config` spec.

#### Scenario: A developer disables stitch for a debugging session

- **WHEN** a developer wants to test agent behavior without the Stitch server
- **THEN** they flip `enabled: false` in all four configs; the entry (URL, headers, env-var reference) stays in place so re-enabling is a one-line revert.
