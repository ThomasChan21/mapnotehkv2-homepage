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
 * Looks up a translation string and expands dynamic tokens.
 * Supported tokens: {year} → current calendar year (e.g. footer copyright).
 * @param {string} key
 * @param {'en' | 'zh-Hant'} lang
 * @returns {string}
 */
function t(key, lang) {
  const table = window.MapNoteI18n.strings[lang] || {};
  const raw = table[key] || window.MapNoteI18n.strings.en[key] || key;
  return raw.replace('{year}', String(new Date().getFullYear()));
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
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    if (key) el.setAttribute('alt', t(key, lang));
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
  renderStoreBadges(lang);
}

/**
 * Fills contact email + partnership mailto links from config.
 * Input: active language (for CTA subject line).
 * Output: updated href/text on #contact-email, #contact-coop-email, #contact-coop-cta.
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function fillContactPlaceholders(lang) {
  const cfg = window.MapNoteSiteConfig.contact;
  const email = cfg.email;
  const emailEl = document.getElementById('contact-email');
  const coopEmailEl = document.getElementById('contact-coop-email');
  const coopCtaEl = document.getElementById('contact-coop-cta');

  if (emailEl) {
    emailEl.textContent = email;
    emailEl.setAttribute('href', `mailto:${email}`);
  }
  if (coopEmailEl) {
    coopEmailEl.textContent = email;
    coopEmailEl.setAttribute('href', `mailto:${email}`);
  }
  if (coopCtaEl) {
    /* Localized subject so mail clients open with a clear partnership intent */
    const subject = t('contact.coopMailSubject', lang);
    coopCtaEl.setAttribute(
      'href',
      `mailto:${email}?subject=${encodeURIComponent(subject)}`
    );
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

/** SVG icons for the store badges (Apple / Google Play), monochrome to match tokens. */
const STORE_ICONS = {
  ios: '<svg viewBox="0 0 384 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.9-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 139.9 0 195.8 0 278.3c0 27.5 5.1 55.9 15.2 85.2 13.5 39.5 62.2 136.2 113.1 134.8 26.6-.7 45.6-19 85.6-19 39.4 0 57.2 19 85.9 19 52.3-.9 97.4-89.6 110.3-129.1-69.4-32.9-91.4-62.5-91.4-99.5zM262.1 104.5c27.6-33.5 27.1-80.5 26.9-104.5-26.8 1.6-58.2 18.1-77.1 41.1-20.4 24.7-37.8 63.8-31 101.4 29.9 2.3 59.8-9.4 81.2-38z"/></svg>',
  android:
    '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>',
};

/**
 * Builds one store badge link.
 * @param {'ios' | 'android'} store - which store icon/label to use
 * @param {string} url - live store URL from site-config.js
 * @param {'en' | 'zh-Hant'} lang - active language for labels
 * @returns {HTMLAnchorElement}
 */
function buildStoreBadge(store, url, lang) {
  const badge = document.createElement('a');
  badge.className = 'store-btn';
  badge.href = url;
  badge.target = '_blank';
  badge.rel = 'noopener';
  badge.setAttribute(
    'aria-label',
    t(store === 'ios' ? 'home.storeIosAria' : 'home.storeAndroidAria', lang)
  );
  const name = t(store === 'ios' ? 'home.storeIos' : 'home.storeAndroid', lang);
  badge.innerHTML = `${STORE_ICONS[store]}<span><small>${t('home.storeSmall', lang)}</small><strong>${name}</strong></span>`;
  return badge;
}

/**
 * Renders store badges wherever store links are configured.
 * Hero: replaces the text CTAs with badges; download band: unhidden and filled.
 * When no links are set, the static text CTAs stay, the download band stays
 * hidden, and the launch-notify band shows instead (pre-launch capture).
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function renderStoreBadges(lang) {
  const links = (window.MapNoteSiteConfig && window.MapNoteSiteConfig.storeLinks) || {};
  const configured = [
    ['ios', links.ios],
    ['android', links.android],
  ].filter((entry) => typeof entry[1] === 'string' && entry[1].length > 0);

  const heroActions = document.getElementById('hero-actions');
  const downloadSection = document.getElementById('download-section');
  const downloadBadges = document.getElementById('download-badges');
  const notifySection = document.getElementById('notify-section');

  if (heroActions && configured.length > 0) {
    heroActions.innerHTML = '';
    heroActions.classList.add('store-badges');
    configured.forEach(([store, url]) => heroActions.appendChild(buildStoreBadge(store, url, lang)));
  }

  if (downloadSection && downloadBadges) {
    downloadBadges.innerHTML = '';
    if (configured.length > 0) {
      configured.forEach(([store, url]) => downloadBadges.appendChild(buildStoreBadge(store, url, lang)));
      downloadSection.hidden = false;
    } else {
      downloadSection.hidden = true;
    }
  }

  /* Notify band is the pre-launch stand-in for the download band: once store
     badges exist there is nothing left to capture, so it hides for good. */
  if (notifySection) {
    notifySection.hidden = configured.length > 0;
  }
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

/**
 * Wires the feature showcase tab switcher on the homepage.
 * Clicking (or arrow-keying to) a feature tab reveals its full screenshot
 * panel; follows the WAI-ARIA tabs pattern with roving tabindex.
 * Input: none (reads #feature-showcase from the DOM). Output: void.
 * @returns {void}
 */
function initFeatureShowcase() {
  const root = document.getElementById('feature-showcase');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

  /** Activates one tab by id and shows its matching panel. */
  const activate = (id) => {
    tabs.forEach((tab) => {
      const on = tab.id === id;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      const on = panel.getAttribute('aria-labelledby') === id;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
  };

  /* Delegate clicks at the root: a single listener keeps working even if a
     tab node is re-rendered, and lets us confirm wiring via the marker below. */
  root.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab && root.contains(tab)) activate(tab.id);
  });
  root.dataset.showcaseInit = 'true';

  root.addEventListener('keydown', (event) => {
    const next = ['ArrowDown', 'ArrowRight'];
    const prev = ['ArrowUp', 'ArrowLeft'];
    if (!next.includes(event.key) && !prev.includes(event.key)) return;
    const current = tabs.findIndex((tab) => tab.classList.contains('is-active'));
    const offset = next.includes(event.key) ? 1 : -1;
    const target = tabs[(current + offset + tabs.length) % tabs.length];
    target.focus();
    activate(target.id);
    event.preventDefault();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.MapNoteChrome.renderChrome();
  bindLangButtons();
  applyI18n(getLang());
  initFeatureShowcase();
  if (typeof window.MapNoteFormsInit === 'function') {
    window.MapNoteFormsInit();
  }
});

window.MapNoteSite = { getLang, setLang, applyI18n, t };
