# Verification: peanut-style fun skin (v3)

## Executed local checks

- `npm test`: 16 passed, zero failures (added per-city default-currency test).
- `npm run test:browser`: passed at 3840 x 2160, 1440 x 1000, iPhone 13 (390 CSS px) and iPhone SE (320 CSS px).
- Each profile exercises both enquiry dialogs, venue-local date/currency defaults (Berlin EUR, Arusha TZS, Dubai AED), optional consents, draft invalidation, email-draft construction and dialog closure.
- Browser gate asserts the hero `free AI credits` text carries a computed underline, and scrolls all images into view before the loaded/alt check (lazy strip images otherwise read as unloaded).
- All four profiles: no horizontal overflow, unlabeled form fields, broken anchors (new external venue links are `https` with `noopener`, not `#`), unloaded images, JavaScript exceptions or unexpected external requests. No cookies or local/session storage entries.
- Computed price labels: EUR `€29`, AED `AED 105`, TZS `TZS 75,000` (non-breaking spaces from `Intl`). Rejection of USD is tested.
- Inspected current full-desktop render and fresh mobile hero viewport: underlined hero credits, tagline `AI credits are the new free Wi-Fi.`, tri-currency price, real loft photos, venue links, no overlap.
- Links verified live: `https://apeunit.com/` (title `Ape Unit`, software studio + venture builder) and `https://mylinkspacetz.com/` (title `Link Space – Arusha – Tanzania`), both HTTP 200.

## Scope

Public static design preview, not operational booking. No venue inventory, sponsor contract, payment, unlimited allocation or physical-presence enforcement is verified. Both named spaces are labelled collaborators pending confirmation. Forms only prepare an email draft and never transmit it automatically. Production domains remain outside this change.

## Changelog

- 2026-09-08 (v3): Peanut-style brutalist skin, shorter punchier copy, per-city pass prices in city cards, unlimited-AI fun claim kept as visibly qualified proposal. Design token v3. (Input: Emin, peanut.me reference.)
- 2026-09-08 (v4): Pink full-bleed centered hero with bubble type + sticker photo, 17px minimum font everywhere (audited), 6 cities — Berlin/Ape Unit EUR 29, Arusha/Link Space TZS 75,000, Dubai/The Block AED 105, Istanbul/Workinton TRY 1,400 (live FX 48.46), Palo Alto/Startup Embassy USD 29, Zanzibar/Fumba Town TZS 75,000 — all venues verified live, all unconfirmed. (Input: Emin.)
- 2026-09-08: Real collaborator photos replace AI concepts; hero underlines `free AI credits`; slogan kept as supporting tagline under the AI-first headline; EUR/AED/TZS pricing per city; Berlin=Ape Unit and Arusha=Link Space named as unconfirmed collaborators with links. (Input: Emin's photo/price/space request and executed checks.)
- 2026-09-07: AI-first redesign, motion controls, contrast measurements, Pages publication (see git history).
