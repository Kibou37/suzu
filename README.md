# Suzuki Dealer — сайт автосалона

Monorepo: **Next.js** (frontend) + **NestJS** (backend) + **MySQL** + **Redis**.

## Требования

- Node.js ≥ 20
- pnpm ≥ 9
- Docker Desktop

## Запуск через Docker (рекомендуется)

Весь стек в контейнерах: `frontend`, `backend`, `mysql`, `redis`.

> **Важно:** перед запуском Docker **остановите** локальный `pnpm dev` — порты 3000 и 4000 не могут быть заняты дважды.

```powershell
cd C:\Users\vetel\Documents\dochtml\suzuki

copy .env.example .env

# Сборка и запуск ВСЕХ 4 контейнеров
docker compose up -d --build
```

| Контейнер | URL / порт |
|-----------|------------|
| **frontend** | http://localhost:3000 |
| **backend** | http://localhost:4000/api |
| Health check | http://localhost:4000/api/health |
| **mysql** | localhost:3306 |
| **redis** | localhost:6379 |

```powershell
pnpm docker:logs    # логи всех сервисов
# После изменения зависимостей в Docker:
# docker compose down && docker volume rm suzuki_root_node_modules && docker compose up -d --build
```

### Если нет frontend/backend в Docker

1. Запускали только БД: `docker compose up -d mysql redis` — так и задумано, app-контейнеры не стартуют.
2. Нужна **сборка образов**: `docker compose up -d --build` (не просто `up -d`).
3. **Порты заняты** локальным `pnpm dev` — остановите его (Ctrl+C), затем снова `docker compose up -d`.

Проверка:

```powershell
docker compose ps
# должны быть: suzuki-frontend, suzuki-backend, suzuki-mysql, suzuki-redis
```

## Локальный запуск (без Docker для frontend/backend)

```powershell
pnpm install
copy .env.example .env

# Только mysql + redis в Docker
docker compose up -d mysql redis

pnpm dev
```

## Структура

```
frontend/       — Next.js (web)
backend/        — NestJS (api)
mysql/          — init-скрипты MySQL
redis/          — конфиг Redis
packages/shared/ — общие типы
docs/           — kickoff, tech-decision
epics/          — план разработки
```

## Команды

```bash
pnpm dev              # frontend + backend локально
pnpm dev:frontend     # только frontend
pnpm dev:backend      # только backend
pnpm docker:up        # весь стек в Docker
pnpm db:migrate      # prisma db push (схема БД)
pnpm db:seed         # тестовые авто Suzuki
pnpm build            # сборка
pnpm lint             # линтер
```

## Документация

- [Kickoff-решения](docs/kickoff/decisions.md)
- [Контакты-заглушки](docs/kickoff/contacts.md)
- [План эпиков](epics/README.md)
