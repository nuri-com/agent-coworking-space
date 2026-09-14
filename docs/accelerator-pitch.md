# Agent Coworking Space: pitch and page map

Local review draft for issue #7, based on the existing warm orange site. This is a copy and conversion-flow iteration, not a new visual identity or a live-operations announcement.

## The pitch

Agent Coworking Space brings people into physical workspaces with AI access included. Nuri.com is the main sponsor. Startups and studios can apply to a 12–24-week accelerator with model access through our router and credit allocations that grow with traction. Credits actually consumed are exchanged for an uncapped SAFE. We are looking for capital partners to finance those allocations, teams to build with us, and people to work in the spaces.

## Three audiences, three reasons to act

1. Coworkers: a physical desk, included on-site AI access, Wi-Fi and coffee. Action: request a desk. Attendance alone does not sign a SAFE or enroll anyone in the accelerator.
2. Startups and studios: build without an upfront AI bill. Choose available models through one router. The proposed allocation grows with traction, up to 150k in AI credits across 12–24 weeks. Action: apply to the accelerator. Used credits, not the headline maximum, are the proposed SAFE consideration.
3. Capital partners / LPs: fund the AI-credit program. Discuss allocation criteria, usage reporting and the legal investment structure. Action: talk about funding. No fund commitment, return, ownership percentage or legal structure is promised by this page.

## Page map and exact core copy

```text
+------------------------------------------------------------------+
| MAIN SPONSOR: NURI.COM                                            |
| Coworking             Accelerator             LPs & partners      |
+------------------------------------------------------------------+
| COWORK &                         IMG-01: assets/space-hero.webp    |
| FREE AI CREDITS                  Existing user-supplied photo     |
|                                                                  |
| A physical workspace. An AI accelerator.                          |
| For people, startups and studios that want to build.              |
|                                                                  |
| [Join the accelerator] [Find a desk] [Fund the program]             |
+------------------------------------------------------------------+
| Work in the space  | Join the accelerator | Back the program       |
| Desk + AI + coffee | Startups and studios | Capital partners / LPs |
+------------------------------------------------------------------+
| AI ACCELERATOR                                                   |
| Build your company. We'll cover the AI.                           |
| 12–24 weeks  |  Up to 150k AI credits  |  Credits used -> SAFE      |
| Choose any model available through our router.                    |
| Your allocation grows with your traction.                         |
| Credits you consume are exchanged for an uncapped SAFE.           |
| [Apply as a startup] [Apply as a studio]                           |
+------------------------------------------------------------------+
| PHYSICAL COWORKING                                                |
| Existing space-clean / space-people / space-loft / space-studio    |
| photos. Existing city enquiries.                                  |
| We confirm your venue, date and included credits before you book. |
+------------------------------------------------------------------+
| FOR LPs & CAPITAL PARTNERS                                        |
| Fund the AI. Back the teams.                                      |
| Finance credit allocations for startups and studios.              |
| [Talk about funding] [Sponsor the space]                          |
+------------------------------------------------------------------+
```

## Copy contract

Use short English copy, readable type of at least 17 CSS px, warm orange and existing photos. Keep the existing headline and underline. Capital-partner funding, in-person coworking and startup participation must each have a distinct call to action and enquiry subject.

Do not call the accelerator equity-free or financially free: there is no upfront AI bill, but the consumed credits are proposed consideration for future equity. Do not equate unlimited model choice with unlimited funded spend. The 150k figure is retained as an AI-credit allocation without introducing a dollar symbol: its denomination, valuation and billing basis still need agreement. No rates or conversions are invented.

## Preserve and remove

Preserve existing native form validation, local venue dates, separate privacy choices, motion controls, existing linked venues, assets and optional sponsorship enquiries. Remove the generic provider-only hero of the partner section and unconfirmed Prem.ai / Ark Labs sponsor placeholders. Add no provider logos or claimed cohorts.

## Release boundaries

Forms prepare explicitly labeled email drafts. Nothing is sent automatically, no seat is reserved, no investor commits capital and no SAFE is created. Real booking operations remain blocked on confirmed venue inventory/backend under issue #6. This local review does not modify GitHub Pages.

## Open decisions before operational publication

1. Denomination and accounting basis of the 150k allocation; router cost versus credit face value; applicable usage limits.
2. Approved venue dates, addresses, desk inventory, booking backend and model availability.
3. The entity receiving capital and holding startup SAFEs, LP rights, and the separately agreed credit-for-equity contract terms. No standard template is assumed to fit automatically.

## Verification

- `npm test`: 19 tests passed, including startup/studio input validation, header-injection rejection and separate capital-partner/sponsor subjects.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' PREVIEW_URL=http://127.0.0.1:58172 npm run test:browser`: passed at 3840, 1440, 390 and 320 CSS px.
- `python3 scripts/export-preview.py`: generated `artifacts/agent-coworking-accelerator-preview.html` with inline scripts, styles, fonts and real photographs. The same browser suite passed on that exact `file://` artifact.
- All audience enquiry paths exercised without sending an email. No horizontal overflow, unlabeled fields, broken internal anchors, console errors or unexpected network requests. Visible type at least 17px; measured CTA contrast at least 6.63924627001919:1; hero copy does not overlap the photo.
- Fixed a mobile-footer overflow that expanded a 320px emulated viewport to 324px. The test now asserts the requested viewport width, not merely `scrollWidth === innerWidth`.
- Existing links preserved. Source and live Pages were identical at baseline `5a1d0f8fef1da776fa1d72086625231d909e034a`; no publish, push or merge was performed.
- Desktop/mobile and section screenshots are in `artifacts/`. Automated image review was blocked by its provider credit limit; cloud rendering also failed. Do not treat the numeric browser checks as visual design sign-off. Independent source review found no functional blocker. Its content findings were checked against the source and addressed: day-pass-only free-AI framing, visible proposed-program/credit-value terms, explicit legal-entity agreement, a narrower introductions request without sharing permission, and visible application-review/no-training wording. The revised v2 offline artifact passed the same 19 logic tests and four exact-width browser profiles.

## Review decisions

The main hero now promotes physical coworking first: day-pass benefits and a Find a desk CTA. Accelerator access remains prominent but explicitly involves an uncapped SAFE for credits consumed. The program facts are a proposal, with denomination, budget and legal entities agreed in the offer. No issuer or LP structure was invented.

The introductions checkbox asks for contact, not permission to share PII. Sharing details with a sponsor needs a separate approval; both the visible form and email draft say so. Accelerator applicants grant no sharing or training rights over submitted material.

Latest downloadable artifact: `artifacts/agent-coworking-accelerator-preview-v2.html`. It is a local review copy, not a deployment. Visual design sign-off and operational publication remain outstanding.

## Changelog

- 2026-09-13: Reframed the pitch around coworkers, accelerator startups/studios and capital partners, with Nuri as main sponsor; deferred YC CLI work. *(Input: Emin — website/pitch focus correction.)*
- 2026-09-13: Addressed independently reviewed copy/privacy findings and reverified the exact v2 offline preview. *(Input: read-only review, parent source checks and executed tests.)*
