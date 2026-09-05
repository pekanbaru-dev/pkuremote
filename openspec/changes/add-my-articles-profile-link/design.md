## Context

See `proposal.md` for the motivation. The profile page already has an account-links navigation with a single link to `/myregistrations`; the existing `/my-articles` route is available and requires no new data or server behavior.

## Goals / Non-Goals

**Goals:**

- Add a discoverable, adjacent `/my-articles` link to the profile account navigation.
- Preserve the current registration link, authentication guard, and visual language.
- Keep the change limited to profile navigation and its focused test coverage.

**Non-Goals:**

- Changing the `/my-articles` page, article permissions, or article data loading.
- Adding a new API, database field, or authentication flow.

## Decisions

- **Extend the existing account-links navigation.** Add the new anchor beside the current registration anchor instead of creating a second navigation area, so both personal-content destinations remain grouped and easy to scan.
- **Use the existing link styling and native anchor semantics.** Reuse the profile page's `link-quiet`/label styling and a standard `href` to `/my-articles`; this avoids introducing a new component or client-side navigation abstraction.
- **Make the list horizontal with wrapping.** Update the account-links list to use a flex layout with a small gap so the links are adjacent on wider screens while remaining usable on narrow screens.
- **Add a stable test hook for the new link.** Use a `data-testid` following the existing `profile-myregistrations-link` naming pattern, allowing the destination and label to be asserted without relying on layout selectors.

## Risks / Trade-offs

- [Risk] The added link may wrap on very narrow viewports. → [Mitigation] Use a wrapping flex list and retain readable label sizing.
- [Risk] A styling change to the existing list could affect profile spacing. → [Mitigation] Keep the current navigation container, typography, and spacing; change only the list direction and gap.

## Migration Plan

No data migration is required. Deploy the profile-page markup and its test together; rollback is limited to removing the new link and restoring the original list layout.
