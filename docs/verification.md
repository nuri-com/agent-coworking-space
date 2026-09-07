# Verification: AI-first redesign

## Executed local checks

- `npm test`: 15 passed, zero failures. The existing booking validation module is unchanged.
- `npm run test:browser`: passed at 3840 x 2160, 1440 x 1000, iPhone 13 (390 CSS px) and iPhone SE (320 CSS px).
- Each profile exercises both enquiry dialogs, venue-local date/currency defaults, optional consents, draft invalidation, email-draft construction and dialog closure.
- All four profiles: no horizontal overflow, unlabeled form fields, broken anchors, unloaded images, JavaScript exceptions or unexpected external requests. No cookies or local/session storage entries.
- The rendered headline names coworking with free AI credits and contains no Wi-Fi messaging. Native `method="dialog"`, `noindex,nofollow`, no-JavaScript contact fallback and concept-image captions are retained.
- Active CSS animation was detected in every profile. The pause button stops animation; reduced-motion preference suppresses it. Both behaviors are asserted by browser tests.
- Computed primary dark, lime, navigation and motion-control foreground/background colors all exceed the 4.5:1 normal-text contrast threshold. This is a targeted check, not a complete accessibility audit.
- Inspected current 4K, full-desktop and mobile-hero screenshots. Evidence is generated in ignored `artifacts/` and uploaded by CI.

## Scope

Public static design preview, not operational booking. No venue inventory, sponsor contract, payment, unlimited allocation or physical-presence enforcement is verified. Forms only prepare an email draft and never transmit it automatically. Production domains remain outside this change.

The native GitHub Pages source can be the root of `feat/landing-preview`; `.nojekyll` preserves the plain static files. Public URL, deployed commit and remote asset checks are verified separately during publication.

## Changelog

- 2026-09-07: Replaced the Wi-Fi analogy and serif editorial look with an AI-first physical-coworking design. Recorded four viewport checks, motion controls, contrast measurements and image-resolution provenance. The earlier V1 coral palette is retired. (Input: Emin's redesign request and executed checks.)
