/**
 * Shared header/footer injection for static multi-page site.
 * Approach: each page sets window.MapNotePage = { base: '../' | './', active: 'home'|... }.
 */

/**
 * Resolves a site-relative path using the page base prefix.
 * @param {string} base - './' or '../'
 * @param {string} path - path without leading slash
 * @returns {string}
 */
function siteHref(base, path) {
  return `${base}${path}`;
}

/**
 * Renders header and footer into placeholder elements.
 * @returns {void}
 */
function renderChrome() {
  const page = window.MapNotePage || { base: './', active: 'home' };
  const base = page.base || './';
  const active = page.active || '';
  const cfg = window.MapNoteSiteConfig;

  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (!header || !footer) return;

  header.innerHTML = `
    <header class="site-header">
      <div class="container header-row">
        <a class="brand" href="${siteHref(base, '')}" aria-label="MapNoteHK">
          <img
            class="brand-logo"
            src="${siteHref(base, 'assets/FullLogo_Transparent_NoBuffer.png')}"
            width="79"
            height="64"
            alt="地圖筆記 MapNoteHK"
            decoding="async"
          />
        </a>
        <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" data-i18n="nav.menu">Menu</button>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          <a href="${siteHref(base, '')}" data-nav="home" data-i18n="nav.home">Home</a>
          <a href="${siteHref(base, 'services/')}" data-nav="services" data-i18n="nav.services">Services</a>
          <a href="${siteHref(base, 'about/')}" data-nav="about" data-i18n="nav.about">About</a>
          <a href="${siteHref(base, 'contact/')}" data-nav="contact" data-i18n="nav.contact">Contact</a>
          <a href="${siteHref(base, 'privacy/')}" data-nav="privacy" data-i18n="nav.privacy">Privacy</a>
        </nav>
        <div class="header-actions">
          <div class="lang-toggle" role="group" aria-label="Language">
            <button type="button" class="lang-btn" data-set-lang="zh-Hant" data-i18n="nav.langZh">繁</button>
            <button type="button" class="lang-btn" data-set-lang="en" data-i18n="nav.langEn">EN</button>
          </div>
          <a class="btn btn-primary header-cta" href="${siteHref(base, 'contact/')}" data-i18n="nav.cta">Contact Us</a>
        </div>
      </div>
    </header>
  `;

  // TODO(launch): the Delete account footer link is hidden for now (founder request).
  // Restore <a href="account-deletion/" data-i18n="footer.deleteAccount"> in footer-links
  // at store launch — the /account-deletion/ page itself stays live because the stores
  // require that stable URL.
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <p class="footer-brand">${cfg.brandName}</p>
          <p class="footer-tagline" data-i18n="footer.tagline"></p>
        </div>
        <div class="footer-links">
          <a href="${siteHref(base, 'services/')}" data-i18n="nav.services"></a>
          <a href="${siteHref(base, 'about/')}" data-i18n="nav.about"></a>
          <a href="${siteHref(base, 'contact/')}" data-i18n="nav.contact"></a>
          <a href="${siteHref(base, 'privacy/')}" data-i18n="nav.privacy"></a>
          <a href="${siteHref(base, 'terms/')}" data-i18n="nav.terms"></a>
        </div>
        <p class="footer-copy" data-i18n="footer.rights"></p>
      </div>
    </footer>
  `;

  header.querySelectorAll('[data-nav]').forEach((el) => {
    if (el.getAttribute('data-nav') === active) {
      el.setAttribute('aria-current', 'page');
      el.classList.add('is-active');
    }
  });

  const toggle = header.querySelector('#nav-toggle');
  const nav = header.querySelector('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
}

window.MapNoteChrome = { renderChrome, siteHref };
