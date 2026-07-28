# ER-диаграмма (краткая)

Схема Prisma: `backend/prisma/schema.prisma`

## Основные сущности

```
User ──┬── Booking
       ├── Configuration ── CarVariant ── Car
       └── Review ── Car

Car ── CarVariant ── CarVariantOption ── Option
Color (standalone, referenced by Configuration IDs)

ServiceSlot (расписание слотов)
BlogPost, FAQ, Promotion (контент)
```

## Связи

| Модель | Связи |
|--------|--------|
| **User** | bookings, configurations, reviews |
| **Car** | variants, bookings, reviews |
| **CarVariant** | car, options (M:N), configurations |
| **Configuration** | user?, variant, bodyColorId, interiorColorId, selectedOptions JSON |
| **Booking** | user?, car?, type (TEST_DRIVE/SERVICE), status, scheduledAt |

Полная схема с индексами и enum — в `schema.prisma`.
