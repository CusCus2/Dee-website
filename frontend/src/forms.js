import { showToast } from './components/toast.js';

function setFormBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = busy;
  button.dataset.originalText ||= button.textContent;
  button.textContent = busy ? 'Sending…' : button.dataset.originalText;
}

async function submitFormspree(form) {
  setFormBusy(form, true);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message = payload?.errors?.map((item) => item.message).join(' • ');
      throw new Error(message || 'Your message could not be sent. Please try again.');
    }

    form.reset();
    showToast(form.dataset.successMessage || 'Thanks! Your message has been sent.');
  } catch (error) {
    showToast(error.message || 'Your message could not be sent.', 'error');
  } finally {
    setFormBusy(form, false);
  }
}

export function initExternalForms() {
  document.querySelectorAll('[data-formspree-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitFormspree(form);
    });
  });
}
