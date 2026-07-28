# Support plan (E18.2)

Черновик до появления боевого хостинга и SLA с заказчиком.

## Channels (заполнить при handover)

| Channel | Value |
|---------|-------|
| Primary email | _TBD_ |
| Escalation phone | _TBD_ |
| Admin access | `/admin` — see seed accounts in STATUS / admin guide |
| Repo | this monorepo |

## Severity

| Level | Example | Response target |
|-------|---------|-----------------|
| S1 | Site/API down | 4h |
| S2 | Booking/auth broken | 1 business day |
| S3 | Content/UI defect | 3 business days |
| S4 | Enhancement | backlog |

## Routine

- Monitor `/api/health` (uptime tool — when Sentry/uptime configured)
- Weekly `pnpm audit` on main
- Rotate `JWT_SECRET` and integration keys on staff change

## Docs map

- [Admin user guide](./admin-user-guide.md)
- [Integrations env](./integrations-env.md)
- [Runbook](./runbook.md)
- [Test plan](./test-plan.md)
- Swagger UI: `/api/docs`
