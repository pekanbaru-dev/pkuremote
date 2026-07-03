# Partner Logos

The four logos in this directory (`logo-1.svg` … `logo-4.svg`) are **Stitch third-party brand logos** shipped with the `stitch-100pct-landing` change. They are inline SVG re-renders of the logos used in the source Stitch design (`projects/15775088065885956423`):

1. `logo-1.svg` — Pekanbaru City
2. `logo-2.svg` — Bank Riau Kepri Syariah
3. `logo-3.svg` — Visit Riau
4. `logo-4.svg` — Wonderful Indonesia

## Trademark Notice

These logos are trademarks of their respective owners. The change ships them as a byte-equivalent translation of the Stitch HTML for visual fidelity, but **the operator is responsible for confirming the trademark licensing is acceptable for production use** before going live. A future change can replace any of these with permission-confirmed alternatives.

## Attribution

Add an attribution line in the footer (e.g., "Logos used with permission from Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia") before the production rollout.

## `currentColor`

All four SVGs use `fill="currentColor"`. The four logo tiles are wrapped in a `grayscale opacity-40 hover:grayscale-0 hover:opacity-100` container; the container's text color (`text-primary`) is inherited by the SVG via `currentColor`, and the grayscale filter is applied to the rendered SVG. This is the only way the grayscale hover effect works correctly; if you replace a logo with one that has hard-coded brand colors, the hover effect will not work as designed.
