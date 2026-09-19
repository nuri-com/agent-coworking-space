# Agent Coworking Space

**Physical coworking. With free AI credits.**

A public landing-page project for a physical coworking community for tech founders, builders, researchers and PhD students.

Intended domains: `agentcoworkingspace.com` and `aicoworkingspace.com`. Domain registration and DNS are not part of this repository setup.

## Product brief

- Proposed day pass by city: EUR 29 (Berlin), TZS 75,000 (Arusha, Zanzibar), AED 105 (Dubai), TRY 1,400 (Istanbul), USD 29 (Palo Alto), with workspace, coffee, Wi-Fi and on-site AI API access.
- Proposed hours: 10:00-20:00 in each location's local timezone. Website booking and walk-ins subject to actual capacity.
- Cities in the launch brief: Berlin (Ape Unit), Arusha (Link Space), Dubai (The Block), Istanbul (Workinton), Palo Alto (Startup Embassy), Zanzibar (Fumba Town). All named collaborators are unconfirmed; venue and participation need explicit publication approval.
- Main sponsor: Nuri.com, confirmed by Emin. No other sponsor endorsement is claimed.
- Sponsorship can include events, consensual introductions, recruiting, accelerator/VC connections and separately consented research contributions. No automatic contact exports or blanket training rights.

## Publication status

This is a **launch/design preview**, not evidence of operational venues, available desks or active model allocations. Nuri's main sponsorship is confirmed by Emin; no other sponsor endorsement is claimed. Opening dates, street addresses, capacity and a live model roster have not been verified. The rendered space photos are user-supplied images, not proof of venue participation.

The booking flow must identify itself as a preview and must not take payment, issue API keys, or display fabricated reservation confirmations. It may prepare a request for the visitor to send through their own email application. No visitor data is stored or transmitted automatically.

Before real booking goes live, confirm venue operators and addresses, capacity and booking backend, payment/tax terms, sponsor permissions, model budgets/usage terms, privacy controller and legal notices. A scheduled key expiry does not prove physical presence.

## Architecture

Static HTML, CSS and native JavaScript. No production framework or runtime dependencies. Accessible native dialogs, keyboard navigation and responsive layouts including 3840 x 2160. Hero and space photos are real collaborator-space photos stored locally in `assets/space-*.webp`. Skin v3 (`data-design="ai-first-v3"`) is a playful brutalist look: sticker badges, hard shadows, short copy.

## Run and verify

```sh
npm ci
npm test
npm start
```

Open `http://127.0.0.1:18769`. In a second terminal:

```sh
npx playwright install chromium
npm run test:browser
```

Browser checks cover 4K, desktop and emulated iPhone 13/iPhone SE, booking and sponsor enquiries, optional privacy choices, asset loading, console errors, external requests and horizontal overflow. Screenshots and JSON evidence go to the ignored `artifacts/` directory. No framework build is required.

## Coordination

Issues describe work packages; pull requests hold reviewable implementations. Production deployment is a separate approval and proof step. The existing `nuri-com/nuri-expo` application and the Nuri website article are not modified.

## V2 design

The hero explicitly leads with physical coworking and free AI credits. Locally hosted Manrope, lime/lilac accents, human-focused concept photography and optional CSS animation replace the original serif editorial design. The footer motion control and reduced-motion system preference both stop animation. No animation library or production dependency was added.

GitHub Pages can publish the repository root directly using `.nojekyll`; all front-end asset paths are relative for a project-page URL. Publishing a design preview does not enable real booking or connect the intended domains.

## Current pitch

Main sponsor: **Nuri.com**, confirmed by Emin. The website now has three routes: physical coworking, the AI accelerator for startups and studios, and funding discussions with capital partners / LPs. The copy and page map are in [docs/accelerator-pitch.md](docs/accelerator-pitch.md).

The proposed accelerator lasts 12–24 weeks. Teams choose models available through the router, with allocations growing with traction up to 150k in AI credits. The credit denomination and valuation remain undecided; this preview introduces no dollar amount. Credits actually consumed are proposed consideration for an uncapped SAFE. A desk enquiry alone has no equity terms.

All three forms create local email drafts only. No emails, applications, reservations, investments or SAFEs are submitted automatically. This iteration is local for review; the existing GitHub Pages version is unchanged. YC login/setup is deferred at the user's request.

## Changelog

Append dated entries to this section when product scope or publication status changes.

- 2026-09-13: Added Nuri sponsorship and separate coworking, accelerator startup/studio and capital-partner paths. Added local application drafts and documented the credit/SAFE pitch. Kept this iteration local for review. *(Input: Emin — website and pitch focus.)*
- 2026-09-07: Rebuilt the landing page around free AI credits as the coworking benefit, added accessible motion and prepared native GitHub Pages publication. (Input: Emin, AI-first visual redesign.)
- 2026-09-07: Created the standalone public project brief and separated launch concepts from verified operations. *(Input: Emin, coworking landing-page brief.)*
