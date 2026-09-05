## 1. Profile Navigation

- [ ] 1.1 Update `src/routes/myprofile/+page.svelte` so the existing account-links group lays out links side by side with wrapping and add an accessible “Artikel Saya” link targeting `/my-articles`; verify both “Registrasi Saya” and “Artikel Saya” are present with their expected destinations.
- [ ] 1.2 Add focused page/component coverage for the profile account links, including the new label, `/my-articles` destination, and preservation of the `/myregistrations` link; verify the test passes.

## 2. Verification

- [ ] 2.1 Run the Svelte typecheck and unit test suite, then inspect `/myprofile` in the browser at desktop and narrow widths to verify the links remain adjacent or wrap cleanly without changing authentication behavior.
