# Production runbook (Phase 6 / E16.3)

Максимум без боевых ключей и VPS-доступов. Когда появятся hosting / DNS / secrets — дописать реальные URL.

## Local / Docker demo

```bash
pnpm docker:up
# API:  http://localhost:4000/api
# Web:  http://localhost:3000
# Docs: http://localhost:4000/api/docs
```

```bash
pnpm db:seed          # demo cars, FAQ×20, blog×6, admin users
node scripts/phase6-smoke.mjs
```

## Required secrets (prod — заполнить позже)

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | **обязателен всегда** — API не стартует без него (нет insecure fallback) |
| `DATABASE_URL` | MySQL |
| `REDIS_URL` | Redis cache |
| `CORS_ORIGIN` | Frontend origin(s), comma-separated |
| `NEXT_PUBLIC_SITE_URL` | Canonical / OG / sitemap base |
| `TRUST_PROXY` | `true` только если за доверенным reverse-proxy/LB (иначе rate-limit по IP легко обходится через X-Forwarded-For) |
| `SWAGGER_ENABLED` | `true`, чтобы явно открыть `/api/docs` в `NODE_ENV=production` (по умолчанию выключено в проде) |
| `SEED_ALLOW_PROD` | `true`, чтобы разрешить `pnpm db:seed` при `NODE_ENV=production` (сид создаёт учётки с публично известными паролями — по умолчанию запрещено) |
| `BITRIX24_WEBHOOK_URL` | CRM leads |
| `SMSRU_API_KEY` | OTP SMS |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 |
| `OPENAI_API_KEY` | optional AI chat LLM |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | transactional mail (Gmail SMTP) |

См. `.env.example` и [integrations-env.md](./integrations-env.md).

## Deploy checklist (когда будет VPS)

1. Set secrets in host env / secret manager (не коммитить).
2. `docker compose up -d --build` (или CI image + migrate).
3. Run migrations: `pnpm --filter @suzuki/backend exec prisma migrate deploy`
4. Optional seed **только** на пустой БД.
5. Smoke: `API_URL=https://api.example.com node scripts/phase6-smoke.mjs`
6. Open `/robots.txt`, `/sitemap.xml`, `/api/health`, `/api/docs`

## Rollback

1. Re-deploy previous image tag / compose revision.
2. If migration broke schema — restore MySQL backup (E0.3.4 autobackup — ещё не внедрён; до прода настроить dump cron).
3. Verify health + homepage.

## Rate limits & brute-force protection

- Global API: `API_RATE_LIMIT_PER_MIN` (default 120), per IP (see `TRUST_PROXY` above)
- Chat: `CHAT_RATE_LIMIT_PER_MIN` (default 30), per IP
- Login (`/auth/login`, `/admin/auth/login`): locked for 15 min after 8 failed attempts per login identifier
- SMS OTP verify: locked for 10 min after 5 failed attempts per phone number

## Language

Site is **English only**. No locale prefixes.
