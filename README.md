# MapNoteHK public homepage

Static bilingual website (繁體中文 / English) for **mapnotehk.com**, including the Apple / Google account-deletion form at `/account-deletion/`.

## Pages

| Path | Purpose |
|------|---------|
| `/` | Homepage — brand, value, quick links, Contact CTA |
| `/services/` | Products / benefits / pricing note |
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

- `contact.email` / `contact.phone` / address strings
- `contact.mapEmbedUrl` (replace HK overview with office pin)
- `forms.contactEndpoint` / `forms.accountDeletionEndpoint` (Formspree or API)

Language preference is stored in `localStorage` key `mapnotehk_lang`.

## Placeholders (fill when ready)

- Hong Kong phone number
- Office / shop address + map pin
- Team names and photos
- Awards / memberships
- Detailed pricing (currently Free/Premium + request a quote)
- Dedicated Formspree form for account deletion (optional; currently shares contact endpoint)

## Deploy

Point **mapnotehk.com** document root at this folder (e.g. Vercel / static host). Ensure `/account-deletion` serves `account-deletion/index.html` with no intermediate FAQ redirect.

## Git

This folder is the former `landingpage` repo (`mapnotehkv2-landingpage`). Branch for this rebuild: `features/homepage-rebuild`.
