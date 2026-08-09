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
   * TODO: replace phone/address when ready (currently Coming soon).
   */
  contact: {
    email: 'support@mapnotehk.com',
    phone: null,
    phoneDisplayZh: '即將公佈',
    phoneDisplayEn: 'Coming soon',
    addressZh: '地址即將公佈（香港）',
    addressEn: 'Address coming soon (Hong Kong)',
    /** OpenStreetMap embed centred on Hong Kong (replace with office pin later) */
    mapEmbedUrl:
      'https://www.openstreetmap.org/export/embed.html?bbox=114.05%2C22.25%2C114.25%2C22.35&layer=mapnik&marker=22.3027%2C114.1772',
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
