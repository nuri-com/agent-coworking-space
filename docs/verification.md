# Verification

## Local checks

- `npm test`: 15 tests passed; no failures.
- `npm run test:browser`: passed at 3840 x 2160, 1440 x 1000, emulated iPhone 13 (390 CSS px) and iPhone SE (320 CSS px).
- Each browser profile exercised booking enquiry, city-specific currency/date defaults, separate optional choices, draft invalidation after changes, sponsor enquiry and dialog close behavior.
- All profiles: no horizontal overflow, unlabeled form fields, broken internal anchors, missing images, browser exceptions or unexpected external HTTP requests. No cookies, localStorage or sessionStorage entries created.
- Primary coral CTA contrast corrected through the shared accent token: forest text `#243d32` on `#e58b6a` measures approximately 4.60:1. This is a targeted check, not a claim of a complete accessibility audit.
- Desktop, 4K, mobile hero, full mobile page and booking-dialog screenshots inspected. Evidence files are generated under ignored `artifacts/` and uploaded by CI.

## Independent review

Read-only reviewer reported no blocking findings in `booking.mjs`, `app.mjs`, `tests/booking.test.mjs` and the HTML. The reviewer additionally exercised sponsor query/header injection, leap dates and host-timezone independence. Parent browser tests independently verified the UI behavior. The subsequent color-token change does not alter the reviewed form/data logic.

## What this does not prove

No venue, desk availability, sponsor contract, payment service, operational API key or physical-presence enforcement was verified. The launch preview neither reserves a desk nor sends an email automatically. Production domains and deployments are not configured.

## Changelog

- 2026-09-07: Recorded executed local checks, independent review scope, screenshot inspection and the targeted contrast correction. *(Input: tool execution and reviewer findings.)*
