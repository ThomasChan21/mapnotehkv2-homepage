/**
 * MapNoteHK public site configuration.
 * Approach: one place for contact placeholders, form endpoints, and paths.
 * Fill real phone/address/team later; Formspree can be swapped per form.
 */
window.MapNoteSiteConfig = {
  /** Brand name shown in header/footer */
  brandName: 'MapNoteHK',

  /**
   * Public contact details.
   * TODO: replace address when ready (currently Coming soon).
   */
  contact: {
    email: 'support@mapnotehk.com',
    addressZh: '地址即將公佈（香港）',
    addressEn: 'Address coming soon (Hong Kong)',
    /**
     * Contact page map: Lands Department CSDI vector tiles (see js/map.js).
     * Centre is a Hong Kong overview until the office address is public —
     * then drop the centre onto the office and raise zoom to ~15.
     */
    map: {
      center: [114.1694, 22.3193],
      zoom: 10.5,
    },
  },

  /**
   * App store download links shown on the homepage.
   * TODO: paste the live App Store / Google Play URLs.
   * Empty string → that badge stays hidden; hero falls back to text CTAs
   * and the download band is not rendered.
   */
  storeLinks: {
    ios: '',
    android: '',
  },

  /**
   * Formspree (or other) endpoints.
   * Empty string → show success UI only and log payload (dev stub).
   */
  forms: {
    contactEndpoint: 'https://formspree.io/f/xykrjqlk',
    /** Prefer a dedicated Formspree form for account deletion when available */
    accountDeletionEndpoint: 'https://formspree.io/f/xykrjqlk',
  },

  /** Absolute path used in App Store / privacy policy (must stay stable). */
  accountDeletionPath: '/account-deletion/',
};
