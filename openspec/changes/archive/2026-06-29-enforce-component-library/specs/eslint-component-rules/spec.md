## ADDED Requirements

### Requirement: Raw HTML form elements are blocked outside the component library

The project SHALL use the `svelte/no-restricted-html-elements` rule from `eslint-plugin-svelte` to block `<input>`, `<textarea>`, `<button>`, `<table>`, and `<select>` in any Svelte file outside `src/lib/components/ui/**`. The rule's error message for each blocked element SHALL name the canonical `$lib/components/ui` component that should be used instead. The blocking scope SHALL cover `.svelte`, `.svelte.ts`, and `.svelte.js` files; it SHALL NOT cover `.ts`/`.js` files (TypeScript helpers may freely use `document.querySelector('input')` and similar without triggering the rule).

#### Scenario: Developer writes a raw `<input>` in a route

- **WHEN** a developer adds `<input type="text" />` to `src/routes/whatever/+page.svelte` and runs `pnpm lint`
- **THEN** the lint output reports an error referencing `svelte/no-restricted-html-elements` and tells them to use `<Input />` from `$lib/components/ui`

#### Scenario: Primitive component file uses raw `<input>` internally

- **WHEN** `src/lib/components/ui/input/input.svelte` contains `<input>` (the underlying `<input>` HTML element the `Input` Svelte component wraps) and `pnpm lint` runs
- **THEN** no error is reported because `src/lib/components/ui/**` is exempted

#### Scenario: `<button>` inside a composite component

- **WHEN** a composite like `src/lib/components/ui/autocomplete/autocomplete.svelte` (which composes `bits-ui` `Combobox`) renders a `<button>` as a child of the combobox trigger and `pnpm lint` runs
- **THEN** no error is reported because `src/lib/components/ui/**` is exempted

#### Scenario: A route uses `<form>` and `<a>`

- **WHEN** `src/routes/whatever/+page.svelte` contains a native `<form use:enhance>` and a native `<a href="...">` and `pnpm lint` runs
- **THEN** no error is reported because `<form>` and `<a>` are not in the blocklist

### Requirement: Imports of non-canonical Button/Input/Textarea/Table/Dialog/Checkbox/Radio/CurrencyInput modules are blocked

The project SHALL use the `no-restricted-imports` ESLint rule with `patterns` to block imports of any `Button/Input/Textarea/Table/Dialog/Checkbox/Radio/CurrencyInput` module whose path does NOT match `$lib/components/ui/{name}`. Each pattern SHALL include a message telling the developer to use the canonical `$lib/components/ui/{name}` instead. The rule SHALL cover `.ts`, `.js`, `.svelte`, `.svelte.ts`, and `.svelte.js` files; it SHALL NOT cover test files under `tests/` (tests may import from any path to verify the rule itself).

#### Scenario: Developer imports from a stray component folder

- **WHEN** a developer adds `import { Button } from '$lib/components/old/button';` to a `.svelte` file (an accidental non-canonical path) and runs `pnpm lint`
- **THEN** the lint output reports an error from `no-restricted-imports` and tells them to use `$lib/components/ui/button`

#### Scenario: Developer imports from the canonical path

- **WHEN** a developer adds `import { Button } from '$lib/components/ui/button';` to a `.svelte` file and runs `pnpm lint`
- **THEN** no error is reported because the canonical path is excluded by the pattern's `!$lib/components/ui/button` negation

### Requirement: Existing route violations are converted to library components

The current raw HTML elements in `src/routes/login/+page.svelte` (1 hidden `<input>` and 1 `<button>`) and `src/routes/myprofile/+page.svelte` (1 `<button>`) SHALL be replaced with the corresponding `$lib/components/ui` components (`Input` and `Button`) so the project starts from a green lint state when the new rules are enabled.

#### Scenario: Login page uses canonical Input and Button

- **WHEN** `src/routes/login/+page.svelte` is reviewed
- **THEN** the `<input type="hidden" name="redirect" value={...}>` is `<Input type="hidden" name="redirect" value={...}>` and the `<button type="submit">` is `<Button type="submit">`, both imported from `$lib/components/ui`

#### Scenario: Myprofile page uses canonical Button

- **WHEN** `src/routes/myprofile/+page.svelte` is reviewed
- **THEN** the `<button type="submit">` is `<Button type="submit">`, imported from `$lib/components/ui`

#### Scenario: All routes pass `pnpm lint` with the new rules enabled

- **WHEN** the new rules are enabled and `pnpm lint` is run on the entire repo
- **THEN** the command exits with zero new errors and zero new warnings (the project's 1 pre-existing error in `src/lib/server/auth/oauth-callback.test.ts` is unrelated and remains)

### Requirement: The rule is verified by a Vitest integration test

A Vitest test at `tests/eslint/eslint-component-rules.test.ts` SHALL load the project's `eslint.config.js` via the ESLint Node API and lint an inline fixture string under two synthetic file paths: one under `src/routes/whatever/+page.svelte` and one under `src/lib/components/ui/whatever.svelte`. The test SHALL assert that the rule fires on the route path and does NOT fire on the component path. The test SHALL also assert the rule's message includes the canonical `$lib/components/ui` reference.

#### Scenario: Vitest test verifies rule fires on a route

- **WHEN** `pnpm test:unit -- --run` runs
- **THEN** the new test at `tests/eslint/eslint-component-rules.test.ts` passes, confirming that the rule fires on raw `<input>` in a `src/routes/` fixture

#### Scenario: Vitest test verifies rule exempts component path

- **WHEN** the same test runs
- **THEN** it also passes, confirming that the same raw `<input>` in a `src/lib/components/ui/` fixture does NOT trigger the rule
