# Admin CMS — user guide (E19)

Quick reference for staff using `/admin`.

## Accounts (seed)

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@suzuki.local` | `Admin1234` |
| Content manager | `content@suzuki.local` | `Content1234` |
| Dealer manager | `dealer@suzuki.local` | `Dealer1234` |

## What each role can do

| Area | Admin | Content | Dealer |
|------|-------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Catalog (models) | full | read | read |
| Content (banners, media, blog, FAQ, promotions) | full | full | read |
| Operations (bookings, quotes, appointments) | full | — | full |
| Staff users | ✅ | — | — |

## Typical flows

### Edit homepage banner
1. Sign in as admin or content manager  
2. **Homepage banners** → Edit slide  
3. Upload desktop / mobile images (or **From library**)  
4. Save → check `/`

### Publish a blog post
1. **News & blog** → create / edit  
2. Set cover via upload or library  
3. Publish → appears on `/blog`

### Process a booking
1. Sign in as admin or dealer manager  
2. **Bookings** or **Service appointments**  
3. Confirm → Complete / Cancel

### Media library
1. **Media library** → upload to a folder (`banners`, `cars`, `blog`, `promotions`)  
2. In any form, use **From library** to reuse files

## Smoke check

```bash
node scripts/e19-admin-smoke.mjs
```

Covers login, CRUD, role denials, dashboard widgets.
