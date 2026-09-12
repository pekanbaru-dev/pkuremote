## 1. Data model and category services

- [x] 1.1 Add the persisted `scope` field to the categories schema with a safe `both` default and allowed-value constraint; generate the Drizzle migration.
- [x] 1.2 Extend category read/write services with scope validation, scoped reads for article/event contexts, and admin-facing scope data.
- [x] 1.3 Update category service tests for defaults, valid/invalid scope values, and preserving existing relationships during scope changes.

## 2. Admin category UX

- [x] 2.1 Add the three scope choices to the create form and edit dialog, defaulting new categories to `Artikel & Event`.
- [x] 2.2 Show the current scope in the categories table and explain that narrowing a scope does not alter existing content assignments.

## 3. Article and event consumers

- [x] 3.1 Load only article-capable categories in article create/edit/preview flows and reject out-of-scope submitted category IDs server-side.
- [x] 3.2 Load only event-capable categories in event create/edit flows while leaving the fixed primary event-type selector unchanged.
- [x] 3.3 Add scoped category navigation and safe query-parameter filtering to the blog and events public listings.

## 4. Verification

- [x] 4.1 Add/update route, service, and component tests for admin scope editing, selectors, filters, defaults, and data preservation.
- [x] 4.2 Run `pnpm check`, `pnpm lint`, and the relevant unit/component tests; verify the local `/admin/categories`, `/blog`, and `/events` flows.
