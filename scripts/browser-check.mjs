import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { localDate } from '../booking.mjs';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:18769';
const artifacts = new URL('../artifacts/', import.meta.url);
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
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
    await page.evaluate(async () => {
      for (const img of document.images) {
        img.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 150));
        if (!img.complete || img.naturalWidth === 0) {
          img.loading = 'eager';
          img.scrollIntoView({ block: 'center' });
          await img.decode().catch(() => {});
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('h1').count(), 1);
    assert.match((await page.locator('h1').innerText()).replace(/\s+/g, ' '), /Cowork & free AI credits/i);
    assert.match(await page.locator('meta[name="theme-color"]').getAttribute('content'), /^#[0-9a-f]{6}$/i);
    assert.equal(await page.locator('.hero').evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(232, 137, 61)');
    assert.match((await page.locator('.hero .eyebrow').innerText()).replace(/\s+/g, ' '), /AI \+ WIFI \+ COFFEE/);
    assert.equal(await page.locator('.hero .eyebrow s').count(), 0);
    assert.equal(await page.locator('.hero-actions .button').first().getAttribute('data-book'), '');
    assert.match(await page.locator('.hero-description').innerText(), /credits used in exchange for an uncapped SAFE/);
    assert.match(await page.locator('.program-facts').innerText(), /12–24/);
    assert.match(await page.locator('.program-copy').innerText(), /issuing company are agreed/);
    assert.match(await page.locator('body').innerText(), /Launch preview/i);
    assert.equal(await page.locator('html').getAttribute('data-design'), 'nuri-accelerator-v5');
    assert.equal(await page.locator('form').count(), 3);
    assert.match(await page.locator('.sponsor-bar').innerText(), /Main sponsor.*Nuri.com/is);
    assert.match(await page.locator('#accelerator').innerText(), /12–24 weeks/);
    assert.match(await page.locator('#accelerator').innerText(), /up to 150k/);
    assert.match(await page.locator('#accelerator .program-copy').innerText(), /Credits you actually use convert into an uncapped SAFE/);
    assert.match(await page.locator('#sponsors').innerText(), /LPs & CAPITAL PARTNERS/);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
    assert.equal(await page.locator('form').evaluateAll((forms) => forms.every((f) => f.method === 'dialog')), true);
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      ticketVisible: !!document.querySelector('.api-ticket')?.checkVisibility(),
      scrollWidth: document.documentElement.scrollWidth,
      images: [...document.images].map((image) => ({ loaded: image.complete && image.naturalWidth > 0, alt: image.alt })),
      unlabeled: [...document.querySelectorAll('input,select,textarea')].filter((field) => !field.labels?.length && !field.getAttribute('aria-label')).map((field) => field.name),
      badAnchors: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((href) => href.length > 1 && !document.getElementById(href.slice(1))),
    }));
    assert.equal(metrics.viewport, options.viewport.width, `${name}: layout viewport expanded beyond the emulated device`);
    assert.equal(metrics.clientWidth, options.viewport.width);
    assert.equal(metrics.ticketVisible, true, `${name}: hero API ticket hidden`);
    const contrasts = await page.locator('.button, .city-button, .text-link, .sponsor-bar a').evaluateAll((controls) => {
      const rgb = (color) => color.match(/[\d.]+/g).map(Number);
      const luminance = (channels) => channels.slice(0, 3).map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      return controls.filter((el) => el.checkVisibility()).map((el) => {
        let node = el;
        let background;
        while (node) {
          background = rgb(getComputedStyle(node).backgroundColor);
          if (background.length === 3 || background[3] === 1) break;
          node = node.parentElement;
        }
        const a = luminance(rgb(getComputedStyle(el).color));
        const b = luminance(background);
        return { text: el.innerText, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
      });
    });
    assert.ok(contrasts.every((entry) => entry.ratio >= 4.5), `${name}: CTA contrast ${JSON.stringify(contrasts)}`);
    metrics.minimumCtaContrast = Math.min(...contrasts.map((entry) => entry.ratio));
    assert.ok(metrics.scrollWidth <= options.viewport.width, `${name}: horizontal overflow ${JSON.stringify(metrics)}`);
    assert.ok(metrics.images.every((image) => image.loaded && image.alt), `${name}: image loading/alt ${JSON.stringify(metrics.images.filter((image) => !(image.loaded && image.alt)))}`);
    assert.deepEqual(metrics.unlabeled, []);
    assert.deepEqual(metrics.badAnchors, []);
    await page.screenshot({ path: new URL(`${name}.png`, artifacts).pathname, fullPage: name !== '4k' });
    if (name === 'mobile' || name === 'desktop') {
      await page.screenshot({ path: new URL(`${name}-hero.png`, artifacts).pathname });
      await page.locator('#accelerator').screenshot({ path: new URL(`${name}-accelerator.png`, artifacts).pathname });
      await page.locator('#sponsors').screenshot({ path: new URL(`${name}-capital.png`, artifacts).pathname });
    }

    await page.locator('[data-book]').first().click();
    const dialog = page.locator('#booking-dialog');
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.locator('input[type="checkbox"]:checked').count(), 0);
    const underline = await page.locator('h1 .credit-underline').evaluate((el) => getComputedStyle(el).textDecorationLine);
    assert.match(underline, /underline/);
    await dialog.locator('[name="city"]').selectOption('dubai');
    assert.equal(await dialog.locator('[name="currency"]').inputValue(), 'AED');
    assert.equal(await dialog.locator('[name="date"]').getAttribute('min'), localDate('dubai'));
    assert.equal(await page.locator('#booking-price').innerText(), 'AED\u00a0105');
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

    for (const teamType of ['startup', 'studio']) {
      await page.locator(`[data-accelerator="${teamType}"]`).first().click();
      const application = page.locator('#accelerator-dialog');
      await application.waitFor({ state: 'visible' });
      const privacy = application.locator('.privacy-line');
      assert.equal(await privacy.count(), 2);
      assert.match(await privacy.nth(1).innerText(), /for application review/);
      assert.equal(await application.locator('[name="teamType"]').inputValue(), teamType);
      await application.locator('[name="company"]').fill('Example Team');
      await application.locator('[name="name"]').fill('Test Builder');
      await application.locator('[name="email"]').fill('team@example.com');
      await application.locator('[name="message"]').fill('Working prototype and early users.');
      await application.locator('button[type="submit"]').click();
      const applicationEmail = page.locator('#accelerator-email');
      await applicationEmail.waitFor({ state: 'visible' });
      const applicationDraft = new URL(await applicationEmail.getAttribute('href'));
      assert.equal(applicationDraft.pathname, 'emin@nuri.com');
      assert.match(applicationDraft.searchParams.get('subject'), new RegExp(`AI accelerator ${teamType} enquiry`));
      assert.match(applicationDraft.searchParams.get('body'), /not acceptance of a SAFE/);
      assert.match(await page.locator('#accelerator-status').innerText(), /Nothing has been sent/);
      assert.equal(await application.evaluate((el) => el.scrollWidth <= el.clientWidth), true);
      await application.locator('[name="message"]').fill('Updated traction.');
      assert.equal(await page.locator('#accelerator-result').isVisible(), false);
      await page.keyboard.press('Escape');
      assert.equal(await application.isVisible(), false);
    }

    await page.locator('[data-sponsor]').first().click();
    const sponsor = page.locator('#sponsor-dialog');
    await sponsor.waitFor({ state: 'visible' });
    assert.equal(await sponsor.locator('[name="role"]').inputValue(), 'capital');
    await sponsor.locator('[name="name"]').fill('Sponsor Test');
    await sponsor.locator('[name="email"]').fill('sponsor@example.com');
    await sponsor.locator('[name="company"]').fill('Example Research');
    await sponsor.locator('[name="message"]').fill('I would like to discuss the proposed sponsorship programme.');
    await sponsor.locator('button[type="submit"]').click();
    const sponsorLink = page.locator('#sponsor-email');
    await sponsorLink.waitFor({ state: 'visible' });
    assert.match(decodeURIComponent(await sponsorLink.getAttribute('href')), /Capital partner enquiry/);
    assert.match(decodeURIComponent(await sponsorLink.getAttribute('href')), /does not create a sponsorship agreement/);
    await sponsor.locator('[data-close]').click();
    assert.equal(await sponsor.isVisible(), false);
    await page.locator('[data-partner-kind="sponsor"]').click();
    assert.equal(await sponsor.locator('[name="role"]').inputValue(), 'sponsor');
    await page.keyboard.press('Escape');
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
    const smallText = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => {
      if (!el.checkVisibility() || el.getAttribute('aria-hidden') === 'true') return false;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      return hasText && parseFloat(getComputedStyle(el).fontSize) < 17;
    }).map((el) => ({ text: el.textContent, font: getComputedStyle(el).fontSize })));
    assert.deepEqual(smallText, [], `${name}: visible text below 17px`);
    results.push({ profile: name, ...metrics, booking: 'passed', startup: 'passed', studio: 'passed', capitalPartner: 'passed', sponsorship: 'passed', smallText, consoleErrors: errors.length, unexpectedNetworkRequests: outbound.length });
    await context.close();
  }
  await writeFile(new URL('browser-results.json', artifacts), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.length, results }, null, 2));
} finally {
  await browser.close();
}
