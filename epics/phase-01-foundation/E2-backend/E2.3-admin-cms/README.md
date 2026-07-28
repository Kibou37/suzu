# E2.3 — Кастомная админка сайта (CMS)

**Решение:** вариант **A** — NestJS Admin API + Next.js `/admin` UI  
**Статус:** 🟡 в работе  
**Связь:** Bitrix24 остаётся только для CRM (E12.1), не для контента.

## Подэпики

| ID | Название | Файл | Статус |
|----|----------|------|--------|
| E2.3.0 | Foundation — auth, shell, dashboard | [E2.3.0-foundation.md](./E2.3.0-foundation.md) | 🟡 |
| E2.3.1 | Контент: FAQ, Blog, Promotions | [E2.3.1-content-cms.md](./E2.3.1-content-cms.md) | 🟡 |
| E2.3.2 | Каталог авто (CRUD + цены) | [E2.3.2-cars-catalog.md](./E2.3.2-cars-catalog.md) | ⬜ |
| E2.3.3 | Медиа (upload S3/Cloudinary) | [E2.3.3-media-upload.md](./E2.3.3-media-upload.md) | ⬜ |
| E2.3.4 | Операции: слоты, заявки, quote | [E2.3.4-operations.md](./E2.3.4-operations.md) | ⬜ |
| E2.3.5 | Роли admin / content-manager | [E2.3.5-roles.md](./E2.3.5-roles.md) | ⬜ |

## DoD (полная админка)

- [ ] Вход по admin key (MVP) → позже роли
- [ ] Dashboard со сводкой
- [ ] CRUD FAQ, Blog, Promotions без деплоя
- [ ] CRUD авто (каталог)
- [ ] UI: sidebar, таблицы, формы, понятная навигация
- [ ] Публичный сайт читает опубликованный контент из API

## Технически

- Backend: `@Controller('admin')` + `AdminApiKeyGuard` (`X-Admin-Key`)
- Frontend: `/admin/*`, sessionStorage ключ, hide site header/footer
- Env: `ADMIN_API_KEY`
