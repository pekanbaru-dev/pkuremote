## Context

The project already configures three MCP servers (Serena, codebase-memory, Context7) across four agent-tool config files. The convention is implicit: each file happens to use the right syntax for its tool, but there is no spec, no AGENTS.md section, and no onboarding step. Adding a fourth server (Google Stitch) was done manually and exposed the gap — the per-platform header syntaxes are not obvious from the config files alone, and the secret-management convention (`.env` holds values, configs reference by name) is documented only by example.

The four config files differ in both format and syntax:

- `opencode.json` and `.agents/mcp.json` use the opencode JSON schema; header values use `"{env:VAR_NAME}"` placeholder syntax (opencode resolves these at startup).
- `.claude/.mcp.json` uses Claude Code's `mcpServers` schema; header values use `"${VAR_NAME}"` shell-style substitution, and HTTP servers use `type: "http"` (not `"remote"`).
- `.codex/config.toml` uses TOML; HTTP servers cannot use the `[env]` table, so auth headers go under `[mcp_servers.<name>.env_http_headers]` where the value is the env var name as a plain string (Codex resolves via `std::env::var()`).

The Stitch API key is a 53-character Google API token (`AQ.Ab8RN6...`). It must never enter a tracked file.

## Goals / Non-Goals

**Goals:**

- Establish a single cross-tool convention for registering MCP servers (the `mcp-config` spec).
- Document the Google Stitch integration as the first per-server contract (the `stitch-mcp` spec).
- Wire Stitch into all four config files using the platform's native env-var substitution syntax.
- Capture the secret-management rule (`.env` for values, `.env.example` for documentation) so future developers don't hardcode keys.
- Surface the convention in `AGENTS.md` so onboarding does not require reading four config files.

**Non-Goals:**

- Migrating the existing three servers (Serena, codebase-memory, Context7) to the new convention. They already work; the new convention applies to _new_ servers. (We may add a follow-up change to formalize their configs, but it is out of scope here.)
- Implementing Stitch-specific design-to-code tooling on the SvelteKit side. This change only wires the MCP server; using Stitch to generate components is a separate concern.
- Rotating the existing `STITCH_API_KEY` or adding CI to validate env-var presence. Out of scope; this change documents the convention, not the lifecycle.
- Adding a fifth config file for any new agent tool. The four-file rule covers current consumers; a future tool would be a new change.

## Decisions

### Decision 1: env-var substitution, not hardcoded values

**Choice:** Every auth header references an env var; the literal value lives only in `.env` (gitignored) and the operator's shell startup file (out of repo).

**Rationale:** The repo is public-or-shareable; even private repos risk accidental push to a fork. env-var substitution is the only way to keep the literal value out of git history. opencode and Codex explicitly support this pattern; Claude Code's `${VAR}` syntax is the equivalent for HTTP servers.

**Alternatives considered:**

- _Hardcode the key in `opencode.json` only (the snippet the user originally gave)_ — rejected: the same key would have to live in three more config files, multiplying the leak surface; also conflicts with the existing context7 entry that already uses env-var reference.
- _Use a `.env.local` per developer_ — rejected: Vite already loads `.env`, and SvelteKit's runtime only needs one file. Adding a second file is more config without more safety.
- _Use a secrets manager (1Password CLI, Doppler, etc.)_ — deferred: not currently used in the project; would be a separate change if adopted.

### Decision 2: Four config files, no single source of truth

**Choice:** Keep all four config files; do not introduce a generator or a "single canonical config that expands to four."

**Rationale:** Each agent tool reads its own native format; none of them accepts a foreign format. A generator adds a build step, a tool, and a maintenance surface for what is currently a copy-paste change of ~6 lines. The four-file rule is enforceable by `git diff` (a reviewer can see all four change in one commit) and by the `mcp-config` spec's "registered in all four" requirement.

**Alternatives considered:**

- _JSON Schema + generator that emits all four files_ — rejected: overkill for ~6 lines per server; would also need to handle TOML emission for Codex.
- _Drop the `.agents/mcp.json` file_ — rejected: AGENTS.md explicitly calls it out as a "generic/cross-tool reference" alongside `opencode.json`. Removing it would break that contract.

### Decision 3: Per-platform syntax, no normalization

**Choice:** Each config file uses its tool's native syntax. The `mcp-config` spec documents the four syntaxes in a table; agents that copy-paste between files must rewrite the syntax.

**Rationale:** The tools are opinionated about their config formats; trying to normalize (e.g., always use `${VAR}` and have a preprocessor expand) would require running that preprocessor at the right moment in each tool's startup, which is fragile. Native syntax is what the tools document and test.

**Alternatives considered:**

- _Use only `${VAR}` everywhere and write a small preprocessor_ — rejected: opencode's docs explicitly call out that it does not support `${VAR}` ("not shell-style `${VAR}`").
- _Use only `{env:VAR}` everywhere_ — rejected: Claude Code and Codex do not recognize this syntax.

### Decision 4: `.env.example` is the single documentation surface for env var names

**Choice:** When a new env var is added (e.g., `STITCH_API_KEY`), it is documented in `.env.example` with a section header, a comment listing the consumer config files, and a `=YOUR_<SERVICE>_API_KEY` placeholder. `.env.example` is the only tracked file that names the variable.

**Rationale:** `.env.example` is already the convention in this repo (PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, etc. are all there). Adding `STITCH_API_KEY` to the same file follows the established pattern and gives a developer one place to look for "what env vars does this project use?".

**Alternatives considered:**

- _Document env vars in AGENTS.md_ — rejected: AGENTS.md is for agent guidance, not environment configuration. Two sources of truth would drift.
- _Document env vars in a dedicated `docs/env.md`_ — rejected: not needed; `.env.example` already exists and is the conventional place.

### Decision 5: Operator step (not a repo change) for `~/.zshenv`

**Choice:** Exporting `STITCH_API_KEY` in the operator's shell startup file is documented in `design.md` and mentioned in `tasks.md` as an operator step, but is NOT a task that produces a repo file.

**Rationale:** `~/.zshenv` is a user-level file on macOS. Tracking it in the repo would either (a) commit a secret, or (b) commit a template that every developer would have to copy to their home directory, which is fragile. The convention is "set it once, locally, and the agent tools inherit it". We document the step so a new developer can reproduce it.

**Alternatives considered:**

- _Add a script `scripts/setup-mcp-env.sh` that writes `~/.zshenv`_ — rejected: scripts that touch `~` are too invasive; developer should run the export manually after reading the spec.
- _Skip the operator step entirely (assume the agent tool reads `.env` directly)_ — rejected: opencode, Claude Code, and Codex each read their config at startup, and none of them automatically loads `.env` from the project root. The env var must be in the parent process environment.

## Risks / Trade-offs

- **[Risk] Operator forgets to set `STITCH_API_KEY` in `~/.zshenv`** → The Stitch MCP server silently fails with a 401/403. _Mitigation:_ the `stitch-mcp` spec's "agent tool starts up without the env var" scenario documents the failure mode; AGENTS.md points new developers at the section. A future change could add a startup check (e.g., a `pnpm doctor` script) that validates required env vars before agent launch.
- **[Risk] One of the four config files drifts out of sync** (someone updates three but forgets the fourth) → _Mitigation:_ the `mcp-config` spec's "registered in all four" requirement makes this a reviewable contract; a `git grep` for the server name across the four files is the audit. A future change could add a CI check.
- **[Risk] A future agent tool is added and the convention is not extended to it** → _Mitigation:_ the `mcp-config` spec's "registered in all four" requirement uses the present tense for the current four files; a future change can amend the spec to add a fifth. AGENTS.md's table is the on-ramp.
- **[Risk] The `STITCH_API_KEY` value is leaked via `git log` (someone reverts, edits, then commits again)** → _Mitigation:_ the literal value never enters any tracked file. If a leak happens, it would be from a developer's local `.env` (out of repo) or from `~/.zshenv` (out of repo), neither of which is in git history. The key can be rotated in the Google Cloud console if needed.
- **[Trade-off] The convention is currently not enforced by tooling** (no pre-commit hook, no CI check) → _Accepted:_ adding enforcement is a separate change; this one captures the convention so future enforcement has something to enforce.
- **[Trade-off] The three pre-existing servers (Serena, codebase-memory, Context7) do not follow the full convention** (no `.env` entry for their env vars, no `enabled: false` rule observed) → _Accepted:_ migrating them is out of scope; their configs work as-is. The convention applies to _new_ servers going forward.

## Migration Plan

No data migration. The change is purely additive: a new MCP server is wired in, two new specs are introduced, and AGENTS.md gains a section. Rollback is a single commit revert.

If a developer needs to roll back locally:

1. `git revert <merge-commit>` of the change.
2. Delete or comment out the `stitch` entries in the four config files (if the revert did not catch them).
3. `unset STITCH_API_KEY` in the current shell (optional — only affects this session).

## Open Questions

- _Should the next change migrate the three pre-existing MCP servers (Serena, codebase-memory, Context7) to the new convention?_ — not blocking; can be a follow-up. Serena and codebase-memory don't have API keys (they are local processes), so the migration is mostly cosmetic. Context7 already references an env var in `.codex/config.toml` but not in the other three files — that one is a real drift.
- _Should we add a CI check that greps for hardcoded `AQ.` / `sk-` / `ghp_` prefixes in the four config files?\_ — out of scope for this change; a future "developer-tooling" change could add it.
- _Should `STITCH_API_KEY` ever move into a CI secret store (GitHub Actions, etc.)?_ — no, the Stitch MCP server is consumed by local agent tools, not by CI. CI does not need the key.
