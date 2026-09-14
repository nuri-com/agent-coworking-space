import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT, buildAcceleratorEnquiry, buildSponsorEnquiry } from '../booking.mjs';

const valid = { teamType: 'startup', name: 'İpek Müller', company: 'Test Studio', email: 'builder@example.com', message: 'Building a research tool.\nProduct: https://example.com/?a=1&bcc=other@example.com' };

test('startup and studio enquiries preserve identity and do not accept SAFE terms', () => {
  for (const teamType of ['startup', 'studio']) {
    const result = buildAcceleratorEnquiry({ ...valid, teamType });
    const url = new URL(result.href);
    assert.equal(url.pathname, CONTACT);
    assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
    assert.match(result.subject, new RegExp(`AI accelerator ${teamType} enquiry`));
    assert.match(url.searchParams.get('body'), /İpek Müller/);
    assert.match(result.body, /not acceptance of a SAFE/);
    assert.match(result.body, /No credits or place in the program are granted/);
    assert.match(result.body, /no training rights/);
    assert.match(result.body, /for application review/);
    assert.match(result.body, /no training rights or permission to share/);
  }
});

test('accelerator rejects invalid teams, missing fields and header injection', () => {
  for (const teamType of [undefined, '', '__proto__', 'investor', false]) assert.throws(() => buildAcceleratorEnquiry({ ...valid, teamType }));
  for (const field of ['name', 'company', 'email', 'message']) assert.throws(() => buildAcceleratorEnquiry({ ...valid, [field]: '' }));
  for (const field of ['name', 'company', 'email']) assert.throws(() => buildAcceleratorEnquiry({ ...valid, [field]: 'x\r\nBcc: bad@example.com' }));
  assert.throws(() => buildAcceleratorEnquiry({ ...valid, email: 'not-an-email' }));
  assert.throws(() => buildAcceleratorEnquiry({ ...valid, message: 'x'.repeat(1501) }));
});

test('capital partners and sponsors have distinct enquiry subjects without commitments', () => {
  const capital = buildSponsorEnquiry({ ...valid, role: 'capital' });
  const sponsor = buildSponsorEnquiry({ ...valid, role: 'sponsor' });
  assert.match(capital.subject, /^Capital partner enquiry:/);
  assert.match(capital.body, /Capital partner \/ LP/);
  assert.match(sponsor.subject, /^Coworking sponsorship enquiry:/);
  assert.match(capital.body, /does not create a sponsorship agreement, an investment commitment/);
  for (const role of ['', '__proto__', 'startup', false]) assert.throws(() => buildSponsorEnquiry({ ...valid, role }));
});
