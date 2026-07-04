## 1. Configuration

- [ ] 1.1 Add `ADMIN_EMAILS` to `.env.example` with a comment describing the comma-separated format and that it lists administrator emails
- [ ] 1.2 Set `ADMIN_EMAILS` in the local `.env` (a known Google account email) for development testing

## 2. Admin helper (the single seam)

- [ ] 2.1 Create `src/lib/server/auth/admin.ts` that reads `ADMIN_EMAILS` from `$env/dynamic/private`, parses it into a `Set<string>` of trimmed, lowercased, non-empty entries (parsed once/memoized)
- [ ] 2.2 Export `isAdmin(locals)` returning `true` iff `locals.user?.email` (lowercased) is in the admin set, `false` when the user is null or not listed
- [ ] 2.3 Export `requireAdmin(locals)` that returns normally when `isAdmin(locals)` is true and throws SvelteKit `redirect(303, "/")` otherwise
- [ ] 2.4 Add a unit test (`admin.test.ts`) covering: single email, multiple emails with whitespace, case-insensitivity, non-listed user, unset var (fail-closed), blank/separator-only var (fail-closed)

## 3. Authentication guard (hooks)

- [ ] 3.1 Extend `GUARDED_PREFIXES` in `src/hooks.server.ts` to include `/admin` alongside `/myprofile`
- [ ] 3.2 Verify the existing redirect logic produces `/login?redirect=%2Fadmin` for an unauthenticated `/admin` request (preserving path + search); add/extend a test if hooks are tested

## 4. Authorization layer + placeholder route

- [ ] 4.1 Create `src/routes/admin/+layout.server.ts` whose `load` calls `requireAdmin(locals)`
- [ ] 4.2 Create the placeholder `src/routes/admin/+page.svelte` rendering minimal admin-only content (a heading identifying the admin area)
- [ ] 4.3 Confirm no admin/role check leaks into any `.svelte` file — the decision lives only in `hooks.server.ts`, `+layout.server.ts`, and `$lib/server/auth/admin.ts`

## 5. Verify end-to-end

- [ ] 5.1 Unauthenticated → `/admin` redirects to `/login?redirect=/admin`; after sign-in as an admin, lands on `/admin`
- [ ] 5.2 Authenticated non-admin → `/admin` redirects to `/`
- [ ] 5.3 Authenticated admin → `/admin` renders the placeholder
- [ ] 5.4 Run `pnpm check` → `pnpm lint` → `pnpm test` and confirm the server helper is absent from the client build output
