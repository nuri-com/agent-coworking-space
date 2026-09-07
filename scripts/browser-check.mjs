import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { localDate } from '../booking.mjs';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:18769';
const artifacts = new URL('../artifacts/', import.meta.url);
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const cases = [
  ['4k', { viewport: { width: 3840, height: 2160 }, deviceScaleFactor: 1 }],
  ['desktop', { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 }],
  ['mobile', { ...devices['iPhone 13'] }],
  ['small-mobile', { ...devices['iPhone SE'] }],
];

try {
  for (const [name, options] of cases) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    const badResponses = [];
    const outbound = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) badResponses.push([response.status(), response.url()]); });
    page.on('request', (request) => {
      if (request.url().startsWith('http') && new URL(request.url()).origin !== new URL(base).origin) outbound.push(request.url());
    });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    assert.match((await page.locator('h1').innerText()).replace(/\s+/g, ' '), /Coworking\. With free AI credits\./i);
    assert.doesNotMatch(await page.locator('h1').innerText(), /wi.?fi/i);
    assert.match(await page.locator('body').innerText(), /Launch preview/i);
    assert.equal(await page.locator('html').getAttribute('data-design'), 'ai-first-v2');
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
    assert.equal(await page.locator('form').evaluateAll((forms) => forms.every((f) => f.method === 'dialog')), true);
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      images: [...document.images].map((image) => ({ loaded: image.complete && image.naturalWidth > 0, alt: image.alt })),
      unlabeled: [...document.querySelectorAll('input,select,textarea')].filter((field) => !field.labels?.length && !field.getAttribute('aria-label')).map((field) => field.name),
      badAnchors: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((href) => href.length > 1 && !document.getElementById(href.slice(1))),
    }));
    assert.ok(metrics.scrollWidth <= metrics.viewport, `${name}: horizontal overflow ${JSON.stringify(metrics)}`);
    assert.ok(metrics.images.every((image) => image.loaded && image.alt), `${name}: image loading/alt`);
    assert.deepEqual(metrics.unlabeled, []);
    assert.deepEqual(metrics.badAnchors, []);
    await page.screenshot({ path: new URL(`${name}.png`, artifacts).pathname, fullPage: name !== '4k' });
    if (name === 'mobile') await page.screenshot({ path: new URL('mobile-hero.png', artifacts).pathname });

    await page.locator('[data-book]').first().click();
    const dialog = page.locator('#booking-dialog');
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.locator('input[type="checkbox"]:checked').count(), 0);
    await dialog.locator('[name="city"]').selectOption('dubai');
    assert.equal(await dialog.locator('[name="currency"]').inputValue(), 'USD');
    assert.equal(await dialog.locator('[name="date"]').getAttribute('min'), localDate('dubai'));
    assert.equal(await page.locator('#booking-price').innerText(), '$29');
    await dialog.locator('[name="date"]').fill(localDate('dubai'));
    await dialog.locator('[name="name"]').fill('Browser Test');
    await dialog.locator('[name="email"]').fill('browser@example.com');
    await dialog.locator('button[type="submit"]').click();
    const email = page.locator('#booking-email');
    await email.waitFor({ state: 'visible' });
    const href = await email.getAttribute('href');
    const draft = new URL(href);
    assert.equal(draft.pathname, 'emin@nuri.com');
    assert.match(draft.searchParams.get('body'), /LAUNCH PREVIEW ENQUIRY/);
    assert.match(draft.searchParams.get('body'), /introductions requested: No/);
    assert.match(draft.searchParams.get('body'), /information requested: No/);
    assert.match(await page.locator('#booking-status').innerText(), /Nothing has been sent/);
    await dialog.locator('[name="researchInterest"]').check();
    assert.equal(await page.locator('#booking-result').isVisible(), false, 'Editing invalidates stale draft');
    await dialog.locator('button[type="submit"]').click();
    assert.match(decodeURIComponent(await email.getAttribute('href')), /send information only/);
    assert.match(decodeURIComponent(await email.getAttribute('href')), /Neither preference authorizes training/);
    assert.equal(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth), true, `${name}: dialog overflow`);
    if (name === 'mobile') await page.screenshot({ path: new URL('mobile-booking.png', artifacts).pathname });
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(), false);

    await page.locator('[data-sponsor]').first().click();
    const sponsor = page.locator('#sponsor-dialog');
    await sponsor.waitFor({ state: 'visible' });
    await sponsor.locator('[name="name"]').fill('Sponsor Test');
    await sponsor.locator('[name="email"]').fill('sponsor@example.com');
    await sponsor.locator('[name="company"]').fill('Example Research');
    await sponsor.locator('[name="message"]').fill('I would like to discuss the proposed sponsorship programme.');
    await sponsor.locator('button[type="submit"]').click();
    const sponsorLink = page.locator('#sponsor-email');
    await sponsorLink.waitFor({ state: 'visible' });
    assert.match(decodeURIComponent(await sponsorLink.getAttribute('href')), /does not create a sponsorship agreement/);
    await sponsor.locator('[data-close]').click();
    assert.equal(await sponsor.isVisible(), false);
    assert.equal(await page.evaluate(() => document.getAnimations().some((a) => a.playState === 'running')), true);
    const motion = page.locator('#motion-toggle');
    await motion.click();
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
    assert.equal(await motion.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => document.getAnimations().every((a) => a.playState !== 'running')), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length), 0);
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    assert.equal((await context.cookies()).length, 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(badResponses, []);
    assert.deepEqual(outbound, []);
    results.push({ profile: name, ...metrics, booking: 'passed', sponsorship: 'passed', consoleErrors: errors.length, unexpectedNetworkRequests: outbound.length });
    await context.close();
  }
  await writeFile(new URL('browser-results.json', artifacts), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.length, results }, null, 2));
} finally {
  await browser.close();
}
