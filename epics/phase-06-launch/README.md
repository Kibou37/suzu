# Фаза 6: Качество и релиз

**Прогресс:** **~55%** (без боевых ключей / VPS / контента дилера)

## Эпики

| Эпик | Статус |
|------|--------|
| E14 — i18n | ❌ cancelled — **English only** |
| E15 — SEO / perf / a11y | ✅ baseline (OG, JSON-LD, robots, sitemap) |
| E16 — QA / deploy | 🟡 headers, rate limit, smoke, runbook; VPS/Sentry — later |
| E17 — Контент | 🟡 seed FAQ×20 + blog×6; реальный контент дилера — later |
| E18 — Документация | ✅ runbook, test plan, support plan, admin guide |

## Что сделано без ключей

- EN-only зафиксирован (kickoff + E14 cancelled)
- SEO: metadataBase, OG/Twitter, Organization/Car/Article JSON-LD, `robots.ts`, `sitemap.ts`
- Security: response headers, API rate limit, stricter ValidationPipe
- QA: `docs/test-plan.md`, `scripts/phase6-smoke.mjs`, CI `pnpm audit`
- Docs: `docs/runbook.md`, `docs/support-plan.md`

## Ждёт доступов

- Prod VPS / DNS / HTTPS
- Bitrix / SMS / GA / OpenAI / mail keys
- UAT с заказчиком, реальный контент, Sentry/uptime
