import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, CONTACT, getCity, localDate, priceLabel, buildBookingEnquiry, buildSponsorEnquiry } from '../booking.mjs';

const now = new Date('2026-09-07T10:00:00Z');
const valid = { city: 'berlin', date: '2026-09-08', currency: 'EUR', name: 'Test Builder', email: 'builder@example.com', message: '' };
const draft = (changes = {}) => buildBookingEnquiry({ ...valid, ...changes }, now);

test('the three requested cities have explicit local timezones', () => {
  assert.deepEqual(Object.keys(CITIES), ['berlin', 'arusha', 'dubai', 'istanbul', 'paloalto', 'zanzibar']);
  assert.equal(getCity('arusha').timeZone, 'Africa/Dar_es_Salaam');
});
test('unknown and prototype-property cities are rejected', () => {
  for (const city of ['london', '__proto__', 'constructor', '']) assert.throws(() => draft({ city }), /Choose/);
});
test('proposed day-pass prices come in EUR, AED and TZS', () => {
  assert.equal(priceLabel('EUR'), '€29');
  assert.equal(priceLabel('AED'), 'AED\u00a0105');
  assert.equal(priceLabel('TZS'), 'TZS\u00a075,000');
  assert.equal(priceLabel('TRY'), 'TRY\u00a01,400');
  assert.equal(priceLabel('USD'), '$29');
  assert.throws(() => priceLabel('GBP'), /Choose/);
});
test('each city defaults to its local proposed currency', () => {
  assert.equal(getCity('berlin').currency, 'EUR');
  assert.equal(getCity('arusha').currency, 'TZS');
  assert.equal(getCity('dubai').currency, 'AED');
  assert.equal(getCity('istanbul').currency, 'TRY');
  assert.equal(getCity('paloalto').currency, 'USD');
  assert.equal(getCity('zanzibar').currency, 'TZS');
});
test('dates follow the venue timezone rather than visitor or UTC date', () => {
  const boundary = new Date('2026-09-07T20:30:00Z');
  assert.equal(localDate('berlin', boundary), '2026-09-07');
  assert.equal(localDate('arusha', boundary), '2026-09-07');
  assert.equal(localDate('dubai', boundary), '2026-09-08');
  assert.throws(() => buildBookingEnquiry({ ...valid, city: 'dubai', date: '2026-09-07' }, boundary), /future date/);
});
test('Berlin winter date handles daylight-saving change', () => {
  assert.equal(localDate('berlin', new Date('2026-12-01T22:30:00Z')), '2026-12-01');
  assert.equal(localDate('berlin', new Date('2026-12-01T23:30:00Z')), '2026-12-02');
});
test('past dates are rejected but today is permitted for an enquiry', () => {
  assert.throws(() => draft({ date: '2026-09-06' }), /future date/);
  assert.match(draft({ date: '2026-09-07' }).body, /Requested date: 2026-09-07/);
});
test('invalid and non-ISO calendar dates are rejected', () => {
  for (const date of ['2027-02-30', '2027-13-01', 'tomorrow', '', '2026-9-8', '2026-09-08T00:00:00Z']) {
    assert.throws(() => draft({ date }), /valid/);
  }
});
test('email draft never claims a reservation, payment or API-key success', () => {
  const result = draft();
  assert.match(result.body, /LAUNCH PREVIEW ENQUIRY/);
  assert.match(result.body, /not a confirmed booking/);
  assert.match(result.body, /10:00-20:00 \(Europe\/Berlin\)/);
  assert.match(result.body, /no desk is reserved and no API key is issued/);
});
test('privacy preferences default to no, independently', () => {
  const result = draft();
  assert.match(result.body, /introductions requested: No\./);
  assert.match(result.body, /information requested: No\./);
  assert.match(draft({ contactConsent: true }).body, /introductions requested: Yes/);
  assert.match(draft({ contactConsent: true }).body, /information requested: No/);
  assert.match(draft({ researchInterest: true }).body, /introductions requested: No/);
});
test('research interest does not confer training rights', () => {
  const result = draft({ contactConsent: true, researchInterest: true });
  assert.match(result.body, /send information only/);
  assert.match(result.body, /Neither preference authorizes training/);
  assert.match(result.body, /separate informed agreement/);
});
test('mailto recipient is fixed and special characters stay in the body', () => {
  const result = draft({ message: 'Hello &bcc=attacker@example.com # ? <script>not executed</script>' });
  const url = new URL(result.href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, CONTACT);
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.match(url.searchParams.get('body'), /&bcc=attacker@example.com/);
});
test('line breaks cannot be injected into identity fields', () => {
  for (const name of ['Bad\r\nBcc: other@example.com', '\u0000test']) assert.throws(() => draft({ name }), /control characters/);
  assert.throws(() => draft({ email: 'a@example.com\nBcc:test@example.com' }), /control characters/);
});
test('invalid identities and oversized messages are rejected', () => {
  for (const email of ['', 'builder', 'a@@example.com', 'a b@example.com']) assert.throws(() => draft({ email }));
  assert.throws(() => draft({ name: ' ' }));
  assert.throws(() => draft({ message: 'a'.repeat(1501) }));
});
test('international names and multiline messages remain usable', () => {
  const result = draft({ name: 'İpek Müller', message: 'Research question\nSecond line' });
  assert.match(result.body, /İpek Müller/);
  assert.match(result.body, /Research question\nSecond line/);
});
test('sponsor enquiry requires a real input message and grants no visitor rights', () => {
  const input = { name: 'Test Sponsor', company: 'Example AI', email: 'sponsor@example.com', message: 'We would like to discuss a pilot.' };
  const result = buildSponsorEnquiry(input);
  assert.match(result.body, /does not create a sponsorship agreement/);
  assert.match(result.body, /Introductions require visitor opt-in/);
  assert.throws(() => buildSponsorEnquiry({ ...input, company: '' }));
  assert.throws(() => buildSponsorEnquiry({ ...input, message: '' }));
});
