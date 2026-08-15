# MapNoteHK official website

Static bilingual website (繁體中文 / English) for **mapnotehk.com** — the official home of the released MapNoteHK app. The homepage announces the launch and showcases the features (five note types, planning map, media, AI/voice, PDF brochures, plans). Also hosts the Apple / Google account-deletion form at `/account-deletion/`.

## Pages

| Path | Purpose |
|------|---------|
| `/` | Official homepage — launch announcement, five note types, feature showcase, Free/Premium, download CTAs |
| `/services/` | Feature details / benefits / pricing note |
| `/about/` | Story, team placeholders, trust signals |
| `/contact/` | Phone/email/address, map embed, message form |
| `/privacy/` | Privacy summary + link to deletion form |
| `/account-deletion/` | Self-serve account deletion request form |

## Local preview

From this folder:

```bash
npx --yes serve .
```

Open `http://localhost:3000/account-deletion/` to verify the deletion deep link.

## Configuration

Edit `js/site-config.js`:

- `storeLinks.ios` / `storeLinks.android` — live App Store / Google Play URLs; while empty, the homepage shows text CTAs and hides the download band
- `contact.email` / `contact.phone` / address strings
- `contact.mapEmbedUrl` (replace HK overview with office pin)
- `forms.contactEndpoint` / `forms.accountDeletionEndpoint` (Formspree or API)

Language preference is stored in `localStorage` key `mapnotehk_lang`.

## Placeholders (fill when ready)

- App Store / Google Play URLs (`storeLinks` in `js/site-config.js`)
- Hong Kong phone number
- Office / shop address + map pin
- Team names and photos
- Awards / memberships
- Detailed pricing (currently Free/Premium + request a quote)
- Dedicated Formspree form for account deletion (optional; currently shares contact endpoint)

## Deploy

Point **mapnotehk.com** document root at this folder (e.g. Vercel / static host). Ensure `/account-deletion` serves `account-deletion/index.html` with no intermediate FAQ redirect.

## Git

Standalone repo following Git Flow: `main` (release) + `develop` (integration); work happens on `features/<name>` branches cut from `develop`.
