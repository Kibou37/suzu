# E16 — Безопасность, тестирование, деплой

**Приоритет:** P0 | **Фаза:** 6 | **Статус:** 🟡

## Задачи

| ID | Задача | Статус |
|----|--------|--------|
| E16.1 | Security | ✅ headers + API rate limit + ValidationPipe whitelist |
| E16.2 | QA | 🟡 test plan + phase6 smoke; Playwright matrix — later |
| E16.3 | Production deploy | 🟡 runbook готов; VPS/DNS/Sentry — ждёт доступов |

## Артефакты

- `docs/runbook.md`
- `docs/test-plan.md`
- `scripts/phase6-smoke.mjs`
- CI: `pnpm audit --prod` (informational)
