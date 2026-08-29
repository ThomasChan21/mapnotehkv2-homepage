# MapNoteHK official website

Static bilingual website (繁體中文 / English) for **mapnotehk.com** — the official home of the released MapNoteHK app. The homepage announces the launch and showcases the features (five note types, planning map, media, AI/voice, PDF brochures, plans). Also hosts the Apple / Google account-deletion form at `/account-deletion/`.

## Pages

| Path | Purpose |
|------|---------|
| `/` | Official homepage — launch announcement, five note types, feature showcase, Free/Premium, download CTAs |
| `/services/` | Feature details / benefits / pricing note |
| `/about/` | Story, mission, values, how we build, contact CTA |
| `/contact/` | Email, response time, partnership card, message form |
| `/privacy/` | Full Privacy Policy (rendered from `js/legal-content.js`) |
| `/terms/` | Full Terms & Conditions (rendered from `js/legal-content.js`) |
| `/account-deletion/` | Self-serve account deletion request form |

## Legal content (single source of truth)

`js/legal-content.js` is a **generated file — do not edit by hand**. The
Terms & Conditions and Privacy Policy copy lives in the mobile repo at
`vctsmobile/tool/legal/legal_content.json`; regenerate with
`python3 vctsmobile/tool/legal/sync_legal_content.py` (run from the
`vctsmobile` root) and commit the result here. See
`vctsmobile/tool/legal/README.md` for the full workflow.

## Local preview

From this folder:

```bash
npx --yes serve .
```

Open `http://localhost:3000/account-deletion/` to verify the deletion deep link.

## Configuration

Edit `js/site-config.js`:

- `storeLinks.ios` / `storeLinks.android` — live App Store / Google Play URLs; while empty, the homepage shows text CTAs and hides the download band
- `contact.email` — support inbox shown on the contact page and partnership CTA
- `forms.contactEndpoint` / `forms.accountDeletionEndpoint` (Formspree or API)

Language preference is stored in `localStorage` key `mapnotehk_lang`.

## Placeholders (fill when ready)

- App Store / Google Play URLs (`storeLinks` in `js/site-config.js`)
- Detailed pricing (currently Free/Premium + request a quote)
- Dedicated Formspree form for account deletion (optional; currently shares contact endpoint)

## Deploy

Point **mapnotehk.com** document root at this folder (e.g. Vercel / static host). Ensure `/account-deletion` serves `account-deletion/index.html` with no intermediate FAQ redirect.

## Git

Standalone repo following Git Flow: `main` (release) + `develop` (integration); work happens on `features/<name>` branches cut from `develop`.
