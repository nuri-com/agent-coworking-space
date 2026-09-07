# Agent Coworking Space

**Physical coworking. With free AI credits.**

A public landing-page project for a physical coworking community for tech founders, builders, researchers and PhD students.

Intended domains: `agentcoworkingspace.com` and `aicoworkingspace.com`. Domain registration and DNS are not part of this repository setup.

## Product brief

- Proposed day pass: EUR 29 or USD 29, with workspace, coffee, Wi-Fi and on-site AI API access.
- Proposed hours: 10:00-20:00 in each location's local timezone. Website booking and walk-ins subject to actual capacity.
- Cities in the launch brief: Berlin, Arusha (Tanzania) and Dubai. Ape Unit is the named prospective Berlin collaborator; its venue and participation need explicit publication approval.
- An initiative by Nuri. Prem.ai is a partner placeholder; Ark Labs is a proposed sponsor pending confirmation. These names must not appear as confirmed endorsements.
- Sponsorship can include events, consensual introductions, recruiting, accelerator/VC connections and separately consented research contributions. No automatic contact exports or blanket training rights.

## Publication status

This is a **launch/design preview**, not evidence of operational venues, available desks or active model sponsorships. No opening dates, street addresses, capacity figures, live model roster or unlimited API allocation have been verified. Architectural images are AI-generated concepts, not venue photographs.

The booking flow must identify itself as a preview and must not take payment, issue API keys, or display fabricated reservation confirmations. It may prepare a request for the visitor to send through their own email application. No visitor data is stored or transmitted automatically.

Before real booking goes live, confirm venue operators and addresses, capacity and booking backend, payment/tax terms, sponsor permissions, model budgets/usage terms, privacy controller and legal notices. A scheduled key expiry does not prove physical presence.

## Architecture

Static HTML, CSS and native JavaScript. No production framework or runtime dependencies. Accessible native dialogs, keyboard navigation and responsive layouts including 3840 x 2160.

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

## Changelog

Append dated entries to this section when product scope or publication status changes.

- 2026-09-07: Rebuilt the landing page around free AI credits as the coworking benefit, added accessible motion and prepared native GitHub Pages publication. (Input: Emin, AI-first visual redesign.)
- 2026-09-07: Created the standalone public project brief and separated launch concepts from verified operations. *(Input: Emin, coworking landing-page brief.)*
