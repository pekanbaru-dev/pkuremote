## Purpose

Provides a clear account-level navigation point for authenticated users to move between their event registrations and their authored articles.

## ADDED Requirements

### Requirement: The profile page exposes navigation to the user's articles

The authenticated `/myprofile` page SHALL display an account-links group containing the existing "Registrasi Saya" link and an adjacent "Artikel Saya" link. The "Artikel Saya" link SHALL navigate to `/my-articles` and SHALL use a normal accessible link target.

#### Scenario: An authenticated user sees the article link

- **WHEN** an authenticated user visits `/myprofile`
- **THEN** the account-links group displays "Artikel Saya" beside "Registrasi Saya"
- **AND** the "Artikel Saya" link has an `href` of `/my-articles`

#### Scenario: The existing registrations link remains available

- **WHEN** an authenticated user visits `/myprofile` after the article link is added
- **THEN** "Registrasi Saya" remains visible and links to `/myregistrations`

#### Scenario: An unauthenticated visitor requests the profile page

- **WHEN** an unauthenticated visitor requests `/myprofile`
- **THEN** the existing authentication guard redirects the visitor to the login flow and the account-links group is not exposed
