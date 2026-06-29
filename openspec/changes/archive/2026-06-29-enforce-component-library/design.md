## Context

The project has 39 brand-aligned Svelte 5 components at `src/lib/components/ui/` (per the archived `port-react-components` and `add-datepicker` changes), but ESLint today has no rule enforcing that routes use these components instead of raw HTML. Two routes already bypass the library:

- `src/routes/login/+page.svelte`: 1 raw `<input type="hidden" name="redirect" ...>` + 1 raw `<button type="submit">` for a `<form use:enhance>` block.
- `src/routes/myprofile/+page.svelte`: 1 raw `<button type="submit">` for a sign-out form.

Without enforcement, every new route is a regression risk. A React/JSX reference project at `~/{...}/corpora8e-fe/eslint.config.mjs` solves this with two rules: `no-restricted-imports` (path-blocking, e.g. block `**/Button` except `src/v2/...`) and `no-restricted-syntax` with `JSXOpeningElement` selectors. We need a Svelte 5 equivalent that does not require a JSX parser.

Stakeholders:

- Anyone adding a new SvelteKit route under `src/routes/`. They will hit the rule immediately and have to learn the library.
- Future contributors who might be tempted to add a "small helper" component next to the library. The `no-restricted-imports` rule blocks accidental imports from non-canonical paths.
- Code reviewers — fewer "did you mean to use the library?" review comments, because the linter catches them at commit time.

## Goals / Non-Goals

**Goals:**

- Add `svelte/no-restricted-html-elements` to the project ESLint config so `<input>`, `<textarea>`, `<button>`, `<table>`, and `<select>` in `src/routes/**` are errors with messages that point to the canonical `$lib/components/ui/{Input,Textarea,Button,Table,Autocomplete}`.
- Exempt `src/lib/components/ui/**` from that rule so primitive implementations can keep using raw HTML.
- Add `no-restricted-imports` patterns that block imports of any `Button/Input/Textarea/Table/Dialog/Checkbox/Radio/CurrencyInput` module outside `$lib/components/ui/{name}`. This is a defensive rule with no current violations.
- Convert the 3 existing raw HTML elements in `src/routes/login/+page.svelte` and `src/routes/myprofile/+page.svelte` to the canonical library components so the new rule starts from a green state.
- Add a Vitest unit test that runs ESLint on a fixture snippet and asserts the rule fires on `<input>` and exempts files under `src/lib/components/ui/`.

**Non-Goals:**

- A codemod that auto-rewrites `<input>` → `<Input />`. The error message is the only signal; manual conversion is fine for a one-time cleanup.
- A rule that blocks raw `<a>` (anchors) — they are valid for navigation; the project's `<Link>` is for SPA links, not all anchors.
- A rule that blocks raw `<form>` — SvelteKit's `use:enhance` is the canonical pattern, and forms are valid.
- A rule that blocks raw `<img>` — low ROI; consumers can use `<Avatar>` for avatar-shaped images but plain images in marketing content are common.
- A rule for `<dialog>` — `src/lib/components/ui/dialog/index.ts` exists; raw `<dialog>` outside the library is rare and ad-hoc.
- Per-component granular exemption (e.g. exempt only the specific file `input.svelte`). The broad `src/lib/components/ui/**` exemption is intentional — it lets any primitive file (current or future) use raw HTML, and composite components that wrap primitives (e.g. `autocomplete.svelte` building on `combobox`) can still get away with using bits-ui's `Popover.Trigger` as a `<button>` internally.

## Decisions

### D1. Use `svelte/no-restricted-html-elements`, not `no-restricted-syntax`

The reference React project uses `no-restricted-syntax` with `JSXOpeningElement[name.name="input"]` selectors. Svelte 5 has no JSX. The equivalent selector would be a verbose `SvelteElement[html.tag="input"]` AST match. The official `eslint-plugin-svelte` ships a dedicated `svelte/no-restricted-html-elements` rule that does exactly this with a clean schema. **Alternative considered**: `no-restricted-syntax` with the Svelte selector, mirroring the source 1:1. **Rejected**: more verbose, no functional benefit, and not the idiomatic Svelte rule.

### D2. Block `<input>`, `<textarea>`, `<button>`, `<table>`, and `<select>`

The reference React project blocks these five elements. We follow the same set. The library provides: `Input`, `Textarea`, `Button`, `Table`, and `Autocomplete` (the canonical replacement for native `<select>`, since the project's `Autocomplete` component composes a `bits-ui` `Combobox`). For the message that says "use `<X />` from `$lib/components/ui`", we map each element to the closest library equivalent. **Why not block `<a>`, `<form>`, `<img>`**: these are valid HTML primitives; blocking them would force developers to invent library wrappers for the sake of conformance. **Alternative considered**: also block `<dialog>`, `<select>`. We block `<select>` (the project has no standalone `<Select>` primitive, but `Autocomplete` covers the use case). We do not block `<dialog>` because consumers occasionally use it for native modal behavior; the `Dialog` component is a higher-level composition, not a 1:1 replacement.

### D3. Broad exemption for `src/lib/components/ui/**`

Primitive implementations (`input.svelte`, `button.svelte`, `textarea.svelte`, `table.svelte`, etc.) MUST use raw HTML internally. Composite components (`autocomplete.svelte` building on bits-ui `Combobox`, `dropdown-content.svelte` rendering bits-ui `DropdownMenu.Content` which renders a `<div>`) sometimes also need to use `<button>` as a primitive. The cleanest way to allow this without per-file bookkeeping is to exempt the whole `src/lib/components/ui/**` directory. **Alternative considered**: per-folder exemption (e.g. only `src/lib/components/ui/input/**`, `button/**`, etc.). **Rejected**: more rules to maintain, doesn't accommodate composite components that legitimately need a raw `<button>` inside their internal render tree. The trade-off is that someone could add a new file under `src/lib/components/ui/whatever/index.svelte` and use raw `<input>` there without triggering the rule — this is acceptable because the intent of the rule is "use the library in routes", not "use the library in itself".

### D4. Defensive `no-restricted-imports` patterns

The reference React project blocks imports of `Button/Input/...` from anywhere except the canonical path. The intent is to prevent future developers from adding a "small helper" component in another folder and importing from there. We mirror this with one block per canonical name. There are no current violations (only the canonical `src/lib/components/ui/{name}` folders exist), so this is a "zero-firing, future-proof" rule. **Alternative considered**: skip this rule. **Rejected**: cheap to add, prevents drift. The cost is rule-config maintenance only.

### D5. Convert 3 existing violations by hand

`src/routes/login/+page.svelte` has a hidden `<input>` (used as a form field for the `redirect` value) and a `<button>` for the Google sign-in submit. `src/routes/myprofile/+page.svelte` has a `<button>` for the sign-out submit. These three elements are easy to convert: hidden input → `<Input type="hidden">`, button → `<Button>` (with `intent` and `size` props from the canonical `ButtonVariants`). **Alternative considered**: write a codemod. **Rejected**: only 3 sites, not worth the codemod complexity; manual conversion is faster.

### D6. Test the rule with a Vitest integration test, not a unit test on AST

The reference React project does not test the rule. We add a Vitest test that lints an inline fixture string (`<input type="text" />` in a route-like path, `<input type="text" />` in a `src/lib/components/ui/whatever.svelte` path) and asserts that the rule fires on the former and not the latter. The test runs ESLint via the Node API (`ESLint.lintText` on a synthetic file path). **Why not a snapshot test**: the rule's message content is the part most likely to drift, and asserting on it documents the developer-facing surface. **Why not a unit test on AST**: we'd be re-implementing the rule. **Alternative considered**: skip the test, rely on existing `pnpm lint` to catch future regressions. **Rejected**: the `pnpm lint` step is run manually; a test in the unit suite runs on every commit and gates regressions.

## Risks / Trade-offs

- **Risk**: the rule has no auto-fix, so a developer who accidentally writes `<input>` will see a lint error and have to import the library component manually. → **Mitigation**: the error message names the exact component to use, including the import path (`$lib/components/ui/input`). Document this in `CONTRIBUTING.md` (out of scope for this change, deferred to a follow-up).
- **Risk**: `svelte/no-restricted-html-elements` runs only on the Svelte file parser. `.svelte.ts` and `.svelte.js` files (which can also contain JSX-ish markup) are covered by the same `files: ['**/*.svelte', ...]` block. If a future developer writes a `<input>` inside a Svelte 5 `{#snippet ...}` block, the rule still fires (it's element-name based, not AST position based). → No action needed.
- **Risk**: the broad `src/lib/components/ui/**` exemption could be too permissive — a developer could add a new file there and use raw `<input>` without anyone noticing. → **Mitigation**: code review. The exemption is intentional and aligned with the React reference project's approach.
- **Risk**: `no-restricted-imports` patterns use `**/Button` which may match too broadly (e.g. the `Autocomplete` index re-exports a `Button` via bits-ui, or some other file imports a function named `Button`). → **Mitigation**: the patterns include a `!` negation for the canonical path; the negation is exact-match. If a false positive surfaces, we'll see it in `pnpm lint` and can adjust the glob.
- **Trade-off**: developers cannot use `eslint-disable-next-line` to bypass the rule for one site. The project's existing `eslint.config.js` does not have an `eslint-disable` allowlist; the rule will fail CI if a developer adds `// eslint-disable-next-line svelte/no-restricted-html-elements` unless the CI script also enforces no-disables (deferred to a follow-up).

## Migration Plan

1. Update `eslint.config.js` to add the new rules (single file change, additive).
2. Convert the 3 existing raw HTML elements in `src/routes/login/+page.svelte` and `src/routes/myprofile/+page.svelte` to library components.
3. Add a Vitest test at `tests/eslint/eslint-component-rules.test.ts` that asserts the rule fires on a fixture string when the synthetic file path is under `src/routes/`, and does not fire when the path is under `src/lib/components/ui/`.
4. Run `pnpm check`, `pnpm test:unit -- --run`, and `pnpm lint` to confirm: zero errors, zero new warnings, the new test passes.

**Rollback**: revert the `eslint.config.js` change. The 2 route changes are also reversible, but they should land as atomic improvements to the routes regardless of the rule. The Vitest test is a regular test file and can be removed without side effects.

## Open Questions

- **Should the rule also block `<dialog>`**? Defer: it's a small change to add later if needed. No current `src/routes/**` file uses raw `<dialog>`.
- **Should we also block `<img>`**? Defer: low ROI; consumers may legitimately need raw `<img>` for marketing content, Open Graph previews, and `<Avatar>` is too specific.
- **Should we add a no-disables lint rule** that bans `// eslint-disable-next-line`? Defer to a separate "lint discipline" change if it becomes a problem.
- **Should we codemod `<input>` → `<Input />` automatically**? Defer: the 3 existing violations are easy to convert by hand; a codemod is not worth the complexity for a one-time cleanup.
