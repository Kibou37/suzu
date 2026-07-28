# E4 — Каталог автомобилей и фильтрация

**Приоритет:** P0 | **Фаза:** 2 | **Прогресс:** **100%**

## Задачи

| ID | Задача | Файл | Статус |
|----|--------|------|--------|
| E4.1 | Каталог: новые модели | [E4.1-new-cars-catalog.md](./E4.1-new-cars-catalog.md) | ✅ |
| E4.2 | Расширенные фильтры | [E4.2-filters.md](./E4.2-filters.md) | ✅ |
| E4.3 | Б/у и спецпредложения | [E4.3-used-and-offers.md](./E4.3-used-and-offers.md) | ✅ |

## DoD

- [x] Фильтры: цена, год, пробег, кузов, двигатель, КПП, комплектация
- [x] Shareable URL с query-параметрами
- [x] Redis-кэш списка и facets (`RedisService` + `/api/cars/facets`)
- [x] Grid + list view
- [x] Бейджи Pre-owned / Special offer / Trade-in
- [x] Gallery на карточке модели
