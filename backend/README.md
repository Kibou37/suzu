# Backend — Suzuki Dealer API

NestJS 11 + Prisma + MySQL.

Полная документация по запуску, Docker и командам — в [корневом README](../README.md).

## Быстрый старт

Из корня монорепозитория (нужны MySQL и Redis):

```powershell
pnpm install
docker compose up -d mysql redis
pnpm db:migrate
pnpm db:seed
pnpm dev:backend
```

API: http://localhost:4000/api  
Health: http://localhost:4000/api/health

## Модули

```
auth/       — регистрация, вход, JWT
account/    — профиль, бронирования пользователя
bookings/   — test drive, service
cars/       — каталог автомобилей
mail/       — отправка email
recaptcha/  — проверка reCAPTCHA
prisma/     — ORM-схема и seed
```

## Переменные окружения

Скопируйте `.env.example` из корня репозитория. Ключевые:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Секрет для JWT (обязателен в production) |
| `CORS_ORIGIN` | Разрешённые origins (через запятую) |

## Команды

```powershell
pnpm dev              # watch-режим (из backend/)
pnpm build            # prisma generate + nest build
pnpm prisma:migrate   # миграции БД
pnpm prisma:seed      # тестовые данные
pnpm test             # unit-тесты
```

Из корня: `pnpm dev:backend`, `pnpm db:migrate`, `pnpm db:seed`.
