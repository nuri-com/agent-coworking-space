export const CITIES = Object.freeze({
  berlin: Object.freeze({ name: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', currency: 'EUR', venue: 'Ape Unit', venueUrl: 'https://apeunit.com/' }),
  arusha: Object.freeze({ name: 'Arusha', country: 'Tanzania', timeZone: 'Africa/Dar_es_Salaam', currency: 'TZS', venue: 'Link Space', venueUrl: 'https://mylinkspacetz.com/' }),
  dubai: Object.freeze({ name: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', currency: 'AED', venue: 'The Block', venueUrl: 'https://the-block.com/' }),
  istanbul: Object.freeze({ name: 'Istanbul', country: 'Türkiye', timeZone: 'Europe/Istanbul', currency: 'TRY', venue: 'Workinton', venueUrl: 'https://workinton.com/en/' }),
  paloalto: Object.freeze({ name: 'Palo Alto', country: 'United States', timeZone: 'America/Los_Angeles', currency: 'USD', venue: 'Startup Embassy', venueUrl: 'https://startupembassy.com/' }),
  zanzibar: Object.freeze({ name: 'Zanzibar', country: 'Tanzania', timeZone: 'Africa/Dar_es_Salaam', currency: 'TZS', venue: 'Fumba Town', venueUrl: 'https://fumba.town/' }),
});
export const PRICES = Object.freeze({ EUR: 29, AED: 105, TZS: 75000, TRY: 1400, USD: 29 });
export const CONTACT = 'emin@nuri.com';

export function getCity(id) {
  if (!Object.hasOwn(CITIES, id)) throw new Error('Choose Berlin, Arusha, Dubai, Istanbul, Palo Alto or Zanzibar.');
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
  if (!Object.hasOwn(PRICES, currency)) throw new Error('Choose EUR, AED, TZS, TRY or USD.');
  return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(PRICES[currency]);
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
    '', `Name: ${name}`, `Email: ${address}`, `City: ${city.name}, ${city.country}${city.venue ? ` (${city.venue})` : ''}`,
    `Requested date: ${date}`, `Proposed hours: 10:00-20:00 (${city.timeZone})`,
    `Proposed day-pass price: ${price} (${input.currency}). Final terms and availability require confirmation.`,
    '', 'Please confirm whether this venue, date and offer will be available.',
    'I understand that no desk is reserved and no API key is issued by this preview.',
    '', `Optional sponsor introductions requested: ${input.contactConsent === true ? 'Yes, please contact me to discuss introductions.' : 'No.'}`,
    `Optional research programme information requested: ${input.researchInterest === true ? 'Yes, send information only.' : 'No.'}`,
    'Neither preference authorizes training on, collection of, or sharing of my prompts, code or API sessions.',
    'Any research contribution needs a separate informed agreement.',
    'Sharing my contact details with sponsors requires my separate approval.',
    '', `Message: ${message}`,
  ]);
}

export function buildSponsorEnquiry(input) {
  const role = input.role ?? 'sponsor';
  if (!['sponsor', 'capital'].includes(role)) throw new Error('Choose capital partner or sponsor.');
  const name = text(input.name, 'your name', 120);
  const company = text(input.company, 'your company', 160);
  const address = email(input.email);
  const message = text(input.message, 'your message', 1500, true);
  return emailDraft(`${role === 'capital' ? 'Capital partner' : 'Coworking sponsorship'} enquiry: ${company}`, [
    role === 'capital' ? 'I would like to discuss funding the Agent Coworking Space AI-credit program.' : 'I would like to discuss sponsoring the Agent Coworking Space program.',
    `Interest: ${role === 'capital' ? 'Capital partner / LP' : 'Credits or space sponsorship'}`,
    '', `Name: ${name}`, `Company: ${company}`, `Email: ${address}`, '', message,
    '', 'This enquiry does not create a sponsorship agreement, an investment commitment or any rights to visitor data.',
    'Introductions require visitor opt-in. Research/training participation requires a separate informed agreement.',
  ]);
}

export function buildAcceleratorEnquiry(input) {
  if (!['startup', 'studio'].includes(input.teamType)) throw new Error('Choose startup or studio.');
  const name = text(input.name, 'your name', 120);
  const company = text(input.company, 'your company or studio', 160);
  const address = email(input.email);
  const message = text(input.message, 'your project and traction', 1500, true);
  return emailDraft(`AI accelerator ${input.teamType} enquiry: ${company}`, [
    'I would like to discuss joining the Agent Coworking Space AI accelerator.',
    '', `Team type: ${input.teamType}`, `Company or studio: ${company}`, `Name: ${name}`, `Email: ${address}`,
    '', 'Project and traction:', message,
    '', 'Please share the program eligibility, available models, credit valuation and proposed uncapped SAFE terms.',
    'I understand the proposed program lasts 12–24 weeks and exchanges credits actually consumed for an uncapped SAFE.',
    'This is an application enquiry, not acceptance of a SAFE, an investment or a commitment to spend.',
    'No credits or place in the program are granted by this form. Allocation and terms require a separate agreement.',
    'This enquiry is for application review and grants no training rights or permission to share our submitted material, prompts, code or API sessions.',
  ]);
}
