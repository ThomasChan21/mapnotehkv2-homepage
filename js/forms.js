/**
 * Contact + account-deletion form submit helpers.
 * Approach: POST JSON to Formspree when configured; otherwise stub success for local preview.
 */

/**
 * Posts form fields as JSON to an endpoint, or stubs when endpoint is empty.
 * @param {string} endpoint
 * @param {Record<string, string>} payload
 * @returns {Promise<void>}
 */
async function postForm(endpoint, payload) {
  if (!endpoint) {
    console.info('[MapNoteHK form stub]', payload);
    return;
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Form submit failed: ${res.status}`);
  }
}

/**
 * Shows success/error text on a status element.
 * @param {HTMLElement | null} el
 * @param {string} message
 * @param {'ok' | 'err'} kind
 * @returns {void}
 */
function setStatus(el, message, kind) {
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
  el.classList.toggle('is-ok', kind === 'ok');
  el.classList.toggle('is-err', kind === 'err');
}

/**
 * Binds contact and account-deletion forms if present on the page.
 * @returns {void}
 */
function MapNoteFormsInit() {
  const cfg = window.MapNoteSiteConfig.forms;
  const langOf = () => window.MapNoteSite.getLang();

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = document.getElementById('contact-form-status');
      const fd = new FormData(contactForm);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const message = String(fd.get('message') || '').trim();

      /* Block empty/invalid submissions — the form uses novalidate, so this
         manual check is the only gate before anything is sent. Focus the
         first invalid field so keyboard/screen-reader users land on it. */
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !message) {
        setStatus(status, window.MapNoteSite.t('contact.invalid', langOf()), 'err');
        const firstInvalid = !name
          ? contactForm.elements.name
          : !emailOk
            ? contactForm.elements.email
            : contactForm.elements.message;
        if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return;
      }

      const payload = { form: 'contact', name, email, message };
      try {
        await postForm(cfg.contactEndpoint, payload);
        setStatus(status, window.MapNoteSite.t('contact.success', langOf()), 'ok');
        contactForm.reset();
      } catch (err) {
        console.warn('[MapNoteHK contact]', err);
        setStatus(status, window.MapNoteSite.t('contact.error', langOf()), 'err');
      }
    });
  }

  const deleteForm = document.getElementById('account-deletion-form');
  if (deleteForm) {
    deleteForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = document.getElementById('delete-form-status');
      const fd = new FormData(deleteForm);
      const reason = String(fd.get('reason') || '');
      if (!reason) {
        setStatus(status, window.MapNoteSite.t('delete.error', langOf()), 'err');
        return;
      }
      const payload = {
        form: 'account-deletion',
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        reason,
        detail: String(fd.get('detail') || ''),
        submittedAt: new Date().toISOString(),
      };
      try {
        await postForm(cfg.accountDeletionEndpoint, payload);
        setStatus(status, window.MapNoteSite.t('delete.success', langOf()), 'ok');
        deleteForm.reset();
      } catch (err) {
        console.warn('[MapNoteHK account-deletion]', err);
        setStatus(status, window.MapNoteSite.t('delete.error', langOf()), 'err');
      }
    });
  }
}

window.MapNoteFormsInit = MapNoteFormsInit;
