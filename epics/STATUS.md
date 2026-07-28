# Статус проекта — tracker

**Обновлено:** 2026-07-28  
**Метод:** сверка `epics/` с кодом.

| Фаза | Название | Прогресс | Следующий шаг |
|------|----------|----------|---------------|
| 1 | Фундамент | **85%** | refresh JWT / Reviews API / VPS backup |
| 2 | Каталог | **100%** | ✅ Закрыта |
| 3 | Конверсия | **100%** | ✅ Закрыта |
| 4 | MVP (ЛК) | **95%** | ✅ MVP код; ключи Bitrix/SMS/GA на проде |
| 5 | Расширенный | **85%** | ✅ E7/E8/E10; E9 out of scope |
| 6 | Релиз | **55%** | baseline без ключей; VPS/UAT — later |

**Текущая позиция:** фазы 2–5 в коде ✅; **фаза 6 baseline** (SEO/security/docs/smoke) без боевых доступов.  
**Язык:** English only — E14 RU+EN cancelled.

---

## Легенда

| Символ | Значение |
|--------|----------|
| ✅ | Готово в коде |
| 🟡 | Частично |
| ⬜ | Не начато |
| ❌ | Отменено / out of scope |
| 🔒 | Заблокировано / ждёт решения заказчика |

---

## Фаза 1 — Фундамент (85%)

### E0 — Инфраструктура (85%)
| ID | Статус | Примечание |
|----|--------|------------|
| E0.1.* | ✅ | Kickoff → `docs/kickoff/` |
| E0.2.* | ✅ | Monorepo, Docker, Husky |
| E0.3.1 | ✅ | CI build + lint + test + audit |
| E0.3.2 | 🟡 | GH Pages = demo/staging; VPS prod — позже |
| E0.3.3 | 🟡 | HTTPS через GitHub Pages |
| E0.3.4 | ⬜ | Autobackup MySQL — ждёт VPS |

### E1 — Дизайн (40%)
| ID | Статус | Примечание |
|----|--------|------------|
| E1.1.* | 🔒 | Figma/wireframes — нет в репо |
| E1.2.* | 🟡 | UI-kit в `globals.css` + компоненты |
| E1.3.* | 🔒 | Hi-fi макеты — не требуются для demo |

### E2 — Backend (75%)
| ID | Статус | Примечание |
|----|--------|------------|
| E2.1.* | ✅ | Prisma schema (+ Configuration, QuoteRequest, TTL) |
| E2.2.1 | 🟡 | Auth JWT (без refresh); SMS verify + forgot password ✅ |
| E2.2.2 | ✅ | Cars API + filters + Redis facets |
| E2.2.3 | ✅ | Bookings + Configurations + Quotes API |
| E2.2.4 | 🟡 | Blog/FAQ public API ✅; Reviews API — нет (E9 out of scope) |
| E2.2.5 | ✅ | Swagger `/api/docs` |
| E2.3.* | ✅ | → **[E19 Admin CMS](./phase-04-account-integrations/E19-admin-cms/)** закрыт (v1) |

### E19 — Admin CMS (**100%** v1) — фаза 4

**Решение:** кастомная Admin API + UI (`/admin`). Bitrix24 — только CRM.

| ID | Статус | Содержание |
|----|--------|------------|
| E19.1–E19.8 | ✅ | Shell, API, media, cars, content, ops, roles, dashboard |

Smoke: `node scripts/e19-admin-smoke.mjs` ✅.  
Аккаунты: `admin@suzuki.local` / `Admin1234`, `content@suzuki.local` / `Content1234`, `dealer@suzuki.local` / `Dealer1234`.

→ [E19 README](./phase-04-account-integrations/E19-admin-cms/README.md)

---

## Фаза 2 — Каталог (100%)

### E3 — Shell ✅
| E3.1–E3.3 | ✅ | Layout, routes, shared UI |

### E4 — Каталог ✅
| E4.1–E4.3 | ✅ | New/used/offers, filters, Redis facets |

### E13 start — Главная ✅
| E13.1 | ✅ | Hero + models (polish → фаза 6) |

---

## Фаза 3 — Конверсия (100%) ✅

### E5 — Конфигуратор ✅
| ID | Статус | Примечание |
|----|--------|------------|
| E5.1 | ✅ | 4 шага + 360° exterior/interior |
| E5.2 | ✅ | Client pricing + exclusive options |
| E5.3 | ✅ | Auto-save, session upsert, resume modal, TTL 5 дней, delete |
| Quote | ✅ | Модалка заявки на цену → `POST /api/quotes` (+ mail + CRM) |
| Share / PDF | ❌ | Out of scope — не было в ТЗ |

### E6 — Бронирование ✅
| ID | Статус | Примечание |
|----|--------|------------|
| E6.1 | ✅ | ServiceSlot, seed, admin slots API |
| E6.2 | ✅ | Test-drive / service forms + reCAPTCHA |
| E6.3 | ✅ | Email ✅; SMS.ru env-ready; cron 24h → позже |
| Cancel TD | ✅ | Отмена тест-драйва из ЛК |

---

## Фаза 4 — MVP (**95%**) ✅ код

### E19 — Admin CMS (**100%** v1) ✅

### E11 — Личный кабинет (90%)
| ID | Статус | Примечание |
|----|--------|------------|
| E11.1 | ✅ | Login/register; SMS OTP (SMS.ru); forgot/reset password |
| E11.2.1 | ✅ | Заявки ТД/сервис + статусы |
| E11.2.2 | ✅ | Сохранённые конфигурации |
| E11.2.3 | ⬜ | История обслуживания из CRM (нужен sync Bitrix) |
| E11.2.4 | ✅ | Редактирование профиля |

### E12 — Интеграции (70%)
| ID | Статус | Примечание |
|----|--------|------------|
| E12.1 CRM | ✅ | Bitrix `crm.lead.add` env-ready (`BITRIX24_WEBHOOK_URL`); keys on prod |
| E12.2 Maps | ✅ | `/dealers` |
| E12.3 Payments | ⬜ | Post-MVP |
| E12.4 Email | 🟡 | Transactional booking/quote/contact/reset; рассылки — нет |
| E12.5 Analytics | ✅ | GA4 loader + events; `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

### E13 — Контент (75%)
| ID | Статус | Примечание |
|----|--------|------------|
| About | ✅ | `/about` из dealer placeholders |
| Contacts | ✅ | `/contacts` + форма → mail/CRM |
| FAQ | ✅ | Accordion + search + FAQPage JSON-LD |
| Blog | ✅ | `/blog` + slug |
| Service акции / прайс | ⬜ | Nice-to-have |

Env guide: [docs/integrations-env.md](../docs/integrations-env.md)

---

## Фаза 5 — Расширенный (**85%**)

| E7 | ✅ | Калькулятор `/finance` + виджет на карточке; ставки `FINANCE_*` |
| E8 | ✅ | Слот 360° на `/about` — дилер заполняет `showroom-tour.json` |
| E9 | ❌ | Отзывы — **нет в ТЗ**, out of scope |
| E10 | ✅ | AI agent (tools: cars/FAQ/finance/dealer/CRM); OpenAI optional |

---

## Фаза 6 — Релиз (**55%** baseline без ключей)

| E14 | ❌ | i18n RU+EN **cancelled** — сайт **English only** |
| E15 | ✅/🟡 | SEO baseline (OG, JSON-LD, robots, sitemap); Lighthouse prod — later |
| E16 | 🟡 | Security headers + rate limit; test plan + `phase6-smoke`; VPS — later |
| E17 | 🟡 | Seed FAQ×20 + blog×6; dealer content / handover keys — later |
| E18 | ✅ | Runbook, support plan, admin guide, Swagger |

Артефакты: [docs/runbook.md](../docs/runbook.md), [docs/test-plan.md](../docs/test-plan.md), [docs/support-plan.md](../docs/support-plan.md)

---

## Порядок закрытия (актуальный)

1. ~~Фаза 2~~ ✅
2. ~~Фаза 3~~ ✅
3. ~~**E19 Admin CMS**~~ ✅
4. ~~**Фаза 4 MVP**~~ ✅
5. ~~**Фаза 5**~~ ✅ (E9 out of scope)
6. **Фаза 6 baseline** ✅ (без ключей/VPS); полный prod — когда появятся доступы

См. также [README.md](./README.md) — исходный план.
