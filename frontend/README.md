# Frontend — Suzuki Dealer

Next.js 16 (App Router) + React 19 + Tailwind CSS 4.

Полная документация по запуску, Docker и командам — в [корневом README](../README.md).

## Быстрый старт

Из корня монорепозитория:

```powershell
pnpm install
pnpm dev:frontend
```

Приложение: http://localhost:3000

## Структура `src/`

```
app/           — страницы (App Router)
components/    — UI-компоненты (layout, catalog, conversion, account)
context/       — React-контексты (AuthProvider)
lib/           — API-клиент, auth, bookings, configurator
data/          — demo-данные, каталог цветов, raw JSON
```

## Ключевые режимы

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend API (по умолчанию `http://localhost:4000`) |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `true` — работа без backend (localStorage) |
| `NEXT_PUBLIC_BASE_PATH` | Base path для GitHub Pages |

## Команды

```powershell
pnpm dev          # dev-сервер (из frontend/)
pnpm build        # production-сборка
pnpm lint         # ESLint
```

Из корня: `pnpm dev:frontend`, `pnpm build`, `pnpm lint`.
