# Фаза 3: Конверсия (недели 5–6)

**Milestone:** конфигуратор + онлайн-запись на тест-драйв и ТО.

**Прогресс:** **100%** ✅ — см. [STATUS.md](../STATUS.md)

## Эпики

| Эпик | Папка | Статус |
|------|-------|--------|
| E5 — Конфигуратор | [E5-configurator](./E5-configurator/) | ✅ |
| E6 — Бронирование | [E6-booking](./E6-booking/) | ✅ |

## Критерии завершения фазы

- [x] Flow конфигуратора с расчётом цены (client-side)
- [x] Exterior/interior 360° (Vitara/Jimny)
- [x] Формы ТД и ТО + reCAPTCHA + email
- [x] Save configuration в БД (auto-save, resume, TTL, delete)
- [x] Заявка на quote из конфигуратора
- [x] SMS-подтверждение брони (stub + optional SMS.ru)
- [ ] CRM webhook (полный Bitrix24; stub есть) → **фаза 4**
- [ ] ~~Shareable link / PDF quote~~ — ❌ out of scope (не в ТЗ)

## Следующая фаза

→ [phase-04-account-integrations](../phase-04-account-integrations/)
