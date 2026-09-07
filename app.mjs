import { CITIES, getCity, localDate, priceLabel, buildBookingEnquiry, buildSponsorEnquiry } from './booking.mjs';

const bookingDialog = document.querySelector('#booking-dialog');
const bookingForm = document.querySelector('#booking-form');
const sponsorDialog = document.querySelector('#sponsor-dialog');
const sponsorForm = document.querySelector('#sponsor-form');

function clearResult(type) {
  document.querySelector(`#${type}-result`).hidden = true;
  document.querySelector(`#${type}-status`).textContent = '';
  document.querySelector(`#${type}-email`).removeAttribute('href');
}

function updateBooking() {
  const city = bookingForm.elements.city.value;
  const date = bookingForm.elements.date;
  date.min = localDate(city);
  if (!date.value || date.value < date.min) date.value = date.min;
  document.querySelector('#booking-price').textContent = priceLabel(bookingForm.elements.currency.value);
}

for (const field of document.querySelectorAll('input[name="name"]')) field.maxLength = 120;
for (const field of document.querySelectorAll('input[name="email"]')) field.maxLength = 254;
for (const field of document.querySelectorAll('input[name="company"]')) field.maxLength = 160;
for (const field of document.querySelectorAll('textarea')) field.maxLength = 1500;

for (const button of document.querySelectorAll('[data-book]')) {
  button.addEventListener('click', () => {
    const city = Object.hasOwn(CITIES, button.dataset.city) ? button.dataset.city : 'berlin';
    bookingForm.reset();
    bookingForm.elements.city.value = city;
    bookingForm.elements.currency.value = getCity(city).currency;
    updateBooking();
    clearResult('booking');
    bookingDialog.showModal();
  });
}

for (const button of document.querySelectorAll('[data-sponsor]')) {
  button.addEventListener('click', () => {
    sponsorForm.reset();
    clearResult('sponsor');
    sponsorDialog.showModal();
  });
}

for (const dialog of [bookingDialog, sponsorDialog]) {
  for (const button of dialog.querySelectorAll('[data-close]')) button.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
}

bookingForm.elements.city.addEventListener('change', () => {
  bookingForm.elements.currency.value = getCity(bookingForm.elements.city.value).currency;
  updateBooking();
});
bookingForm.elements.currency.addEventListener('change', updateBooking);

function connectForm(form, type, build) {
  form.addEventListener('input', () => clearResult(type));
  form.addEventListener('change', () => clearResult(type));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearResult(type);
    if (!form.reportValidity()) return;
    try {
      const input = Object.fromEntries(new FormData(form));
      input.contactConsent = form.elements.contactConsent?.checked === true;
      input.researchInterest = form.elements.researchInterest?.checked === true;
      const draft = build(input);
      document.querySelector(`#${type}-email`).href = draft.href;
      document.querySelector(`#${type}-result`).hidden = false;
      document.querySelector(`#${type}-status`).textContent = 'Your email draft is ready. Nothing has been sent.';
      document.querySelector(`#${type}-email`).focus();
    } catch (error) {
      document.querySelector(`#${type}-status`).textContent = error.message;
    }
  });
}
connectForm(bookingForm, 'booking', buildBookingEnquiry);
connectForm(sponsorForm, 'sponsor', buildSponsorEnquiry);
updateBooking();
