/**
 * Legal document renderer (Terms & Conditions / Privacy Policy).
 *
 * Approach: the long-form copy lives in legal-content.js as structured data;
 * this module renders it into #legal-root as hero + table of contents +
 * numbered sections + contact block. Short UI labels come from i18n.js via
 * MapNoteSite.t(); the body copy re-renders when the site language flips
 * (observed via the <html lang> attribute that site.js maintains).
 *
 * Input: <div id="legal-root" data-legal-kind="terms|privacy"> on the page.
 * Output: fully rendered document inside that node; void otherwise.
 */
window.MapNoteLegal = (function () {
  'use strict';

  /**
   * Creates an element with an optional class and text content.
   * @param {string} tag - HTML tag name
   * @param {string} [className] - CSS class(es)
   * @param {string} [text] - text content (never HTML — copy is trusted but
   *   textContent keeps anchors/emails safe by construction)
   * @returns {HTMLElement}
   */
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  /**
   * Builds the table-of-contents card linking to each section anchor.
   * @param {{h: string}[]} sections - document sections
   * @param {string} tocTitle - localized "On this page" label
   * @returns {HTMLElement}
   */
  function buildToc(sections, tocTitle) {
    const nav = node('nav', 'legal-toc');
    nav.setAttribute('aria-label', tocTitle);
    nav.appendChild(node('p', 'legal-toc-title', tocTitle));
    const list = node('ol', 'legal-toc-list');
    sections.forEach((section, index) => {
      const li = node('li');
      const link = node('a', null, section.h);
      link.href = `#legal-s${index + 1}`;
      li.appendChild(link);
      list.appendChild(li);
    });
    nav.appendChild(list);
    return nav;
  }

  /**
   * Builds one numbered section: heading, paragraphs, optional bullets.
   * @param {{h: string, p: string[], b: string[]}} section
   * @param {number} index - zero-based; drives the stable anchor id
   * @returns {HTMLElement}
   */
  function buildSection(section, index) {
    const block = node('section', 'legal-section');
    block.id = `legal-s${index + 1}`;
    block.appendChild(node('h2', null, section.h));
    (section.p || []).forEach((text) => block.appendChild(node('p', null, text)));
    if (section.b && section.b.length > 0) {
      const ul = node('ul');
      section.b.forEach((text) => ul.appendChild(node('li', null, text)));
      block.appendChild(ul);
    }
    return block;
  }

  /**
   * Builds the closing contact block with a mailto button.
   * Email address comes from site-config.js so it stays in one place.
   * @param {(key: string) => string} t - localized label lookup
   * @returns {HTMLElement}
   */
  function buildContact(t) {
    const email =
      (window.MapNoteSiteConfig && window.MapNoteSiteConfig.contact.email) ||
      'support@mapnotehk.com';
    const block = node('section', 'legal-contact');
    block.appendChild(node('h2', null, t('legal.contactTitle')));
    block.appendChild(node('p', null, t('legal.contactBody')));
    const link = node('a', 'btn btn-primary', email);
    link.href = `mailto:${email}`;
    block.appendChild(link);
    return block;
  }

  /**
   * Renders the document for the current site language into #legal-root.
   * @param {HTMLElement} root - container with data-legal-kind
   * @returns {void}
   */
  function render(root) {
    const kind = root.getAttribute('data-legal-kind');
    const docs = window.MapNoteLegalContent && window.MapNoteLegalContent[kind];
    if (!docs || !window.MapNoteSite) return;

    const lang = window.MapNoteSite.getLang();
    const doc = docs[lang] || docs.en;
    const t = (key) => window.MapNoteSite.t(key, lang);

    root.textContent = '';

    // Hero: title chip + H1 + last-updated + intro (mirrors the app's hero header).
    const hero = node('header', 'legal-hero');
    hero.appendChild(node('h1', null, doc.title));
    hero.appendChild(
      node('p', 'legal-updated', `${t('legal.updatedLabel')}: ${docs.updated[lang] || docs.updated.en}`)
    );
    if (doc.intro) hero.appendChild(node('p', 'legal-intro', doc.intro));
    root.appendChild(hero);

    root.appendChild(buildToc(doc.sections, t('legal.tocTitle')));

    // Body reuses .privacy-prose so h2/p pick up the existing site styles.
    const body = node('div', 'privacy-prose legal-doc');
    doc.sections.forEach((section, index) => body.appendChild(buildSection(section, index)));
    root.appendChild(body);

    root.appendChild(buildContact(t));
  }

  /**
   * Initial render + re-render whenever site.js flips <html lang>.
   * @returns {void}
   */
  function init() {
    const root = document.getElementById('legal-root');
    if (!root) return;
    render(root);
    new MutationObserver(() => render(root)).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { render: init };
})();
