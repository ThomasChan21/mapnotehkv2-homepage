/**
 * MapNoteHK public site configuration.
 * Approach: one place for contact placeholders, form endpoints, and paths.
 * Fill Formspree endpoints per form; contact is email + partnership CTA (no street address).
 */
window.MapNoteSiteConfig = {
  /** Brand name shown in header/footer */
  brandName: 'MapNoteHK',

  /**
   * Public contact details.
   * Approach: email-only support (no street address). Partnership CTA
   * reuses the same inbox with a localized mailto subject.
   */
  contact: {
    email: 'support@mapnotehk.com',
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
    /** Launch-notify capture on the homepage; shares the contact inbox until a dedicated form exists */
    notifyEndpoint: 'https://formspree.io/f/xykrjqlk',
  },

  /** Absolute path used in App Store / privacy policy (must stay stable). */
  accountDeletionPath: '/account-deletion/',
};
