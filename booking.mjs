export const CITIES = Object.freeze({
  berlin: Object.freeze({ name: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', currency: 'EUR' }),
  arusha: Object.freeze({ name: 'Arusha', country: 'Tanzania', timeZone: 'Africa/Dar_es_Salaam', currency: 'USD' }),
  dubai: Object.freeze({ name: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', currency: 'USD' }),
});
export const CONTACT = 'emin@nuri.com';

export function getCity(id) {
  if (!Object.hasOwn(CITIES, id)) throw new Error('Choose Berlin, Arusha or Dubai.');
  return CITIES[id];
}

export function localDate(cityId, now = new Date()) {
  const city = getCity(cityId);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: city.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type) => parts.find((entry) => entry.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function priceLabel(currency) {
  if (!['EUR', 'USD'].includes(currency)) throw new Error('Choose EUR or USD.');
  return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(29);
}

function text(value, label, limit, multiline = false) {
  if (typeof value !== 'string') throw new Error(`Enter ${label}.`);
  const clean = value.trim();
  if (!clean || clean.length > limit) throw new Error(`${label} must contain 1-${limit} characters.`);
  if ((multiline ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/ : /[\x00-\x1F\x7F]/).test(clean)) {
    throw new Error(`Remove control characters from ${label}.`);
  }
  return clean;
}

function email(value) {
  const clean = text(value, 'your email address', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error('Enter a valid email address.');
  return clean;
}

function emailDraft(subject, lines) {
  const body = lines.join('\n');
  return { subject, body, href: `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

export function buildBookingEnquiry(input, now = new Date()) {
  const city = getCity(input.city);
  const price = priceLabel(input.currency);
  const name = text(input.name, 'your name', 120);
  const address = email(input.email);
  const date = input.date;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Choose a valid date.');
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Choose a valid calendar date.');
  if (date < localDate(input.city, now)) throw new Error('Choose today or a future date in your selected city.');
  const message = input.message?.trim() ? text(input.message, 'your message', 1500, true) : '(none)';
  return emailDraft(`Coworking enquiry: ${city.name} / ${date}`, [
    'LAUNCH PREVIEW ENQUIRY. This is not a confirmed booking or a request to charge payment.',
    '', `Name: ${name}`, `Email: ${address}`, `City: ${city.name}, ${city.country}`,
    `Requested date: ${date}`, `Proposed hours: 10:00-20:00 (${city.timeZone})`,
    `Proposed day-pass price: ${price} (${input.currency}). Final terms and availability require confirmation.`,
    '', 'Please confirm whether this venue, date and offer will be available.',
    'I understand that no desk is reserved and no API key is issued by this preview.',
    '', `Optional sponsor introductions requested: ${input.contactConsent === true ? 'Yes, please contact me to discuss introductions.' : 'No.'}`,
    `Optional research programme information requested: ${input.researchInterest === true ? 'Yes, send information only.' : 'No.'}`,
    'Neither preference authorizes training on, collection of, or sharing of my prompts, code or API sessions.',
    'Any research contribution needs a separate informed agreement.',
    '', `Message: ${message}`,
  ]);
}

export function buildSponsorEnquiry(input) {
  const name = text(input.name, 'your name', 120);
  const company = text(input.company, 'your company', 160);
  const address = email(input.email);
  const message = text(input.message, 'your message', 1500, true);
  return emailDraft(`Coworking sponsorship enquiry: ${company}`, [
    'I would like to discuss the Agent Coworking Space launch concept.',
    '', `Name: ${name}`, `Company: ${company}`, `Email: ${address}`, '', message,
    '', 'This enquiry does not create a sponsorship agreement or any rights to visitor data.',
    'Introductions require visitor opt-in. Research/training participation requires a separate informed agreement.',
  ]);
}
