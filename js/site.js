/**
 * Bootstraps language, chrome, and page-specific contact placeholders.
 * Approach: apply i18n after chrome render; sync <html lang> and document title keys.
 */

/**
 * Reads saved language or defaults to Traditional Chinese.
 * @returns {'en' | 'zh-Hant'}
 */
function getLang() {
  const saved = localStorage.getItem(window.MapNoteI18n.storageKey);
  if (saved === 'en' || saved === 'zh-Hant') return saved;
  return window.MapNoteI18n.defaultLang;
}

/**
 * Looks up a translation string.
 * @param {string} key
 * @param {'en' | 'zh-Hant'} lang
 * @returns {string}
 */
function t(key, lang) {
  const table = window.MapNoteI18n.strings[lang] || {};
  return table[key] || window.MapNoteI18n.strings.en[key] || key;
}

/**
 * Applies data-i18n / data-i18n-placeholder / data-i18n-title across the document.
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function applyI18n(lang) {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key, lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && 'placeholder' in el) el.placeholder = t(key, lang);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', t(key, lang));
  });

  const titleKey = document.body.getAttribute('data-title-key');
  if (titleKey) {
    document.title = t(titleKey, lang);
  }
  const descKey = document.body.getAttribute('data-desc-key');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (descKey && metaDesc) {
    metaDesc.setAttribute('content', t(descKey, lang));
  }

  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    const code = btn.getAttribute('data-set-lang');
    btn.classList.toggle('is-active', code === lang);
  });

  fillContactPlaceholders(lang);
}

/**
 * Fills contact phone/address from config (Coming soon when null).
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function fillContactPlaceholders(lang) {
  const cfg = window.MapNoteSiteConfig.contact;
  const phoneEl = document.getElementById('contact-phone');
  const addressEl = document.getElementById('contact-address');
  const emailEl = document.getElementById('contact-email');
  const mapFrame = document.getElementById('contact-map');

  if (emailEl) {
    emailEl.textContent = cfg.email;
    emailEl.setAttribute('href', `mailto:${cfg.email}`);
  }
  if (phoneEl) {
    if (cfg.phone) {
      phoneEl.textContent = cfg.phone;
      phoneEl.setAttribute('href', `tel:${cfg.phone.replace(/\s+/g, '')}`);
    } else {
      phoneEl.removeAttribute('href');
      phoneEl.textContent = lang === 'en' ? cfg.phoneDisplayEn : cfg.phoneDisplayZh;
    }
  }
  if (addressEl) {
    addressEl.textContent = lang === 'en' ? cfg.addressEn : cfg.addressZh;
  }
  if (mapFrame && cfg.mapEmbedUrl) {
    mapFrame.setAttribute('src', cfg.mapEmbedUrl);
  }
}

/**
 * Persists language and re-applies strings.
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function setLang(lang) {
  localStorage.setItem(window.MapNoteI18n.storageKey, lang);
  applyI18n(lang);
}

/**
 * Wires language buttons after chrome is in the DOM.
 * @returns {void}
 */
function bindLangButtons() {
  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-set-lang');
      if (lang === 'en' || lang === 'zh-Hant') setLang(lang);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.MapNoteChrome.renderChrome();
  bindLangButtons();
  applyI18n(getLang());
  if (typeof window.MapNoteFormsInit === 'function') {
    window.MapNoteFormsInit();
  }
});

window.MapNoteSite = { getLang, setLang, applyI18n, t };
