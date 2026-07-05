## ADDED Requirements

### Requirement: A Dex OIDC provider runs in the local dev stack only

The development Docker Compose stack (`docker-compose.yml`) SHALL include a **Dex** service exposing an OIDC provider on `http://localhost:5556`, configured by a tracked `dex-config.yaml`. Dex SHALL NOT be present in any production compose file (`docker-compose.prod.yml`, `docker-compose.deploy.yml`) — production points `OIDC_ISSUER` directly at Google. The dev stack SHALL therefore be startable offline, with no Google credentials and no internet access, for exercising the real OIDC code path locally.

#### Scenario: Dex is reachable in dev

- **WHEN** a developer runs the dev stack and requests `http://localhost:5556/.well-known/openid-configuration`
- **THEN** Dex returns a valid OIDC discovery document whose `issuer` equals the configured `OIDC_ISSUER`

#### Scenario: Dex is absent from production

- **WHEN** `docker-compose.prod.yml` and `docker-compose.deploy.yml` are inspected
- **THEN** neither defines a Dex service, and the production stack remains app + postgres + caddy

#### Scenario: The dev stack works without Google or internet

- **WHEN** the dev stack starts with no `GOOGLE_CLIENT_*` values and no outbound internet
- **THEN** Dex still serves discovery, authorization, token, and JWKS endpoints and a developer can complete a full login

### Requirement: Dex authenticates via static password accounts

`dex-config.yaml` SHALL enable the password database (`enablePasswordDB: true`) and define **two to three** `staticPasswords` entries (bcrypt-hashed): at least one admin account whose email is present in `ADMIN_EMAILS` (to exercise the admin gate) and at least one normal attendee account (to exercise booking). It SHALL define a static OIDC client matching the app's `OIDC_CLIENT_ID`/`OIDC_CLIENT_SECRET` with a redirect URI equal to the app's dev `OIDC_REDIRECT_URI` (`/auth/callback`). Dex SHALL issue id_tokens carrying the `sub`, `email`, `name`, and `email_verified` claims the callback relies on, and every static account SHALL present `email_verified: true` so it passes the app's strict verified-email gate. Because admin status is decided by matching the verified `email` claim against `ADMIN_EMAILS` (not by any Dex-side role), whether a Dex account is an admin is controlled purely by whether its email is in `ADMIN_EMAILS`.

Dex SHALL be configured to always present its login screen — it SHALL NOT auto-redirect or skip to a single connector — so a developer can choose among the 2–3 static test users on each sign-in.

#### Scenario: The login screen lets a developer pick a test user

- **WHEN** a developer starts the OIDC flow and Dex renders its login screen
- **THEN** the developer can enter the credentials of any of the configured static users (admin or attendee) rather than being auto-redirected to one identity

#### Scenario: A developer logs in as the admin test account

- **WHEN** a developer completes the OIDC flow against Dex using the admin `staticPasswords` credentials
- **THEN** the callback provisions the user, the resulting session's email is in `ADMIN_EMAILS`, and `/admin` is reachable

#### Scenario: A developer logs in as the attendee test account

- **WHEN** a developer completes the OIDC flow against Dex using the attendee `staticPasswords` credentials
- **THEN** the callback provisions the user and event booking works under that identity

#### Scenario: The static client matches the app configuration

- **WHEN** the app starts the OIDC flow with its dev `OIDC_CLIENT_ID` and `OIDC_REDIRECT_URI`
- **THEN** Dex recognizes the client and redirect URI and completes the authorization-code exchange

### Requirement: Dex is a faithful stand-in requiring no app code differences

The app SHALL treat Dex and Google identically through the generic OIDC integration; the only configuration difference between environments SHALL be the value of `OIDC_ISSUER` (and the corresponding client credentials/redirect URI). No branch in application code SHALL special-case Dex versus Google. Because the dev app runs on the host (`pnpm dev`), the browser and the app SHALL both reach Dex at the same `http://localhost:5556`, so the issuer in id_tokens matches for both parties.

#### Scenario: Switching issuer requires no code change

- **WHEN** `OIDC_ISSUER` is changed from the Dex URL to `https://accounts.google.com` (with matching client credentials)
- **THEN** the auth flow works against Google with no source-code modification

#### Scenario: The dev-login bypass still short-circuits Dex

- **WHEN** `DEV_ADMIN_EMAIL` is set under `pnpm dev`
- **THEN** the synthetic dev user is injected as before and Dex is not contacted, so most local work needs no running IdP; Dex is started only to exercise the real login path
