# Test plan (E16.2.1)

Критические сценарии для UAT / smoke. Автоматизация: `scripts/phase6-smoke.mjs` (+ phase3/e19 scripts).

## Public site

| # | Module | Steps | Pass |
|---|--------|-------|------|
| 1 | Home | Open `/`, hero + models render | |
| 2 | Catalog | `/catalog` → filter → open car card | |
| 3 | Used / offers | `/catalog/used`, `/catalog/offers` | |
| 4 | Configurator | 4 steps, price updates, save (auth) | |
| 5 | Test drive | Submit form (reCAPTCHA off in local) | |
| 6 | Service | Book slot | |
| 7 | Finance | Quote USD monthly payment | |
| 8 | Dealers / maps | `/dealers` map + list | |
| 9 | FAQ / blog | Search FAQ; open blog post | |
| 10 | Chat agent | Ask inventory / finance / escalate | |
| 11 | Contacts | Submit contact form | |
| 12 | SEO | `/robots.txt`, `/sitemap.xml` return 200 | |

## Account

| # | Steps | Pass |
|---|-------|------|
| 1 | Register / login | |
| 2 | Forgot password (mail stub OK) | |
| 3 | Dashboard bookings + cancel TD | |
| 4 | Saved configurations | |
| 5 | Profile edit | |

## Admin (`/admin`)

| # | Steps | Pass |
|---|-------|------|
| 1 | Login admin / content / dealer roles | |
| 2 | Cars CRUD + media upload | |
| 3 | FAQ / blog / promotions | |
| 4 | Bookings / quotes status | |
| 5 | Service slots | |
| Smoke | `node scripts/e19-admin-smoke.mjs` | |

## Out of scope without keys

- Live Bitrix lead create
- Real SMS delivery
- GA4 realtime hits
- OpenAI tool loop (local agent still works)
