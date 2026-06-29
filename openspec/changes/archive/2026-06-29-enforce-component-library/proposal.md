## Why

The component library at `src/lib/components/ui/` (39 components, all native Svelte 5, brand-aligned) is undermined by raw HTML elements in routes — `<input>`, `<textarea>`, `<button>`, `<table>`, `<select>` — which silently bypass the library and re-introduce styling drift. ESLint today has no rule enforcing "use the library" for Svelte 5 files; the existing `eslint.config.js` only catches `svelte/no-navigation-without-resolve` (disabled) and prettier formatting. Inspired by a React/JSX project (`/Users/baimwong/Me/Program/ReactJs/corpora8e-fe/eslint.config.mjs`) that uses `no-restricted-imports` + `no-restricted-syntax` with `JSXOpeningElement` selectors, we need a Svelte 5 equivalent: block raw HTML elements in routes while exempting the component primitives themselves.

## What Changes

- Add `svelte/no-restricted-html-elements` rule to `eslint.config.js` that blocks `<input>`, `<textarea>`, `<button>`, `<table>`, and `<select>` in route files, with messages pointing to the canonical `$lib/components/ui/{Input,Textarea,Button,Table,Autocomplete}`.
- Exempt `src/lib/components/ui/**` from the rule so primitive implementations can use raw HTML internally.
- Add `no-restricted-imports` patterns that block imports of any `Button/Input/Textarea/Table/Dialog/Checkbox/Radio/CurrencyInput` module outside `$lib/components/ui/{name}`, preventing future "stray" component folders (defensive, no current violations).
- Convert existing raw HTML in `src/routes/login/+page.svelte` (1 hidden `<input>` + 1 `<button>`) and `src/routes/myprofile/+page.svelte` (1 `<button>`) to the canonical library components.
- Add a small Vitest unit test that loads `eslint.config.js` via `ESLint.lintText` on a fixture `.svelte`-shaped snippet (or skips if the test environment can't parse Svelte AST directly) — verifies the rule fires on raw elements and exempts files under `src/lib/components/ui/`.

## Capabilities

### New Capabilities

- `eslint-component-rules`: ESLint rules that block raw `<input>`, `<textarea>`, `<button>`, `<table>`, and `<select>` outside `src/lib/components/ui/**` and block imports of non-canonical `Button/Input/Textarea/Table/Dialog/Checkbox/Radio/CurrencyInput` modules, so the project surface enforces single-source-of-truth usage of the `$lib/components/ui` component library.

### Modified Capabilities

- (none)

## Impact

- **Modified files**: `eslint.config.js` (added 1 Svelte rule + 1 ESLint core rule), `src/routes/login/+page.svelte` (1 raw `<input>` + 1 raw `<button>` replaced with `<Input type="hidden">` and `<Button>`), `src/routes/myprofile/+page.svelte` (1 raw `<button>` replaced with `<Button>`).
- **New files**: a small Vitest test (e.g., `tests/eslint/eslint-component-rules.test.ts`) that lints an inline fixture snippet and asserts the rule fires.
- **Dependencies**: none. `eslint-plugin-svelte` already in `devDependencies` ships `no-restricted-html-elements`.
- **Tooling**: `pnpm lint` will now fail on raw HTML in routes. `pnpm check` and `pnpm test:unit` are unaffected.
- **Risk**: developers adding new routes must remember to import from `$lib/components/ui`. The rule's error message is the only signal — there is no IDE auto-fix for "swap `<input>` for `<Input />`". Future change could add a codemod, but is out of scope.
