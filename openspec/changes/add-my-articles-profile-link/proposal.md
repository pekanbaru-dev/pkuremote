## Why

Authenticated users can access their profile and registrations from `/myprofile`, but there is no equally visible entry point to their articles. Adding an “Artikel Saya” link beside “Registrasi Saya” makes the existing article area easier to discover from the user’s account hub.

## What Changes

- Add an “Artikel Saya” link beside “Registrasi Saya” on `/myprofile`.
- Point the new link to `/my-articles` and preserve the existing registration link and authentication behavior.
- Keep the navigation accessible and consistent with the existing profile page layout.

## Capabilities

### New Capabilities

- `profile-navigation`: Provides authenticated profile-page navigation to the user’s registrations and articles.

### Modified Capabilities

None.

## Impact

- Affects the profile page UI at `src/routes/myprofile/+page.svelte`.
- Requires a focused component/page test for the new link destination and label.
- No API, database, or dependency changes; `/my-articles` already exists.
