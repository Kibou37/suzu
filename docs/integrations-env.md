# Integrations env (фаза 4 MVP)

Ключи на проде вставляются в `.env` / secrets. Без них код **не падает**: CRM и SMS пишут debug-log, GA4 — no-op.

## Bitrix24 (`BITRIX24_WEBHOOK_URL`)

1. В портале Bitrix24: **Разработчикам → Другое → Входящий вебхук**.
2. Права: `crm` (создание лидов).
3. Скопировать URL вида `https://YOUR.bitrix24.ru/rest/1/xxxxxxxx/` в `BITRIX24_WEBHOOK_URL`.
4. Legacy alias: `CRM_WEBHOOK_URL`.

Лиды уходят из:

- тест-драйв / сервис (`type: test_drive | service`)
- quote (`type: quote`)
- сохранение конфигурации (`type: configuration_saved`)
- форма контактов (`type: contact`)

Метод: `{webhook}crm.lead.add.json`.

## SMS.ru (`SMSRU_API_KEY`)

1. Получить api_id в [sms.ru](https://sms.ru/).
2. `SMSRU_API_KEY=...`
3. Опционально отправитель: `SMSRU_FROM=...`
4. Legacy: `SMS_API_ID`, `SMS_FROM`.

Без ключа OTP для регистрации логируется. В non-prod (или `SMS_DEV_ECHO=1`) код может вернуться в ответе API как `devCode` — только для отладки.

Используется для:

- SMS verify при регистрации по телефону
- подтверждение бронирования (E6)

## GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)

1. Создать поток Web в GA4, скопировать Measurement ID (`G-XXXX`).
2. Прописать в frontend env и пересобрать образ (Next inlines `NEXT_PUBLIC_*` на build).

События: `generate_lead`, `sign_up`, `login`, `save_configuration`, `catalog_filter`, `view_item`, `chat_open`, `chat_message`.

## Showroom 360° (E8)

Без материалов показывается placeholder на `/about#showroom-tour`.

1. Открыть `frontend/public/showroom-tour.json`
2. Вставить `embedUrl` (Matterport / Kuula / Pannellum) **или** `videoUrl`
3. Либо env `NEXT_PUBLIC_SHOWROOM_TOUR_EMBED_URL` / `NEXT_PUBLIC_SHOWROOM_TOUR_VIDEO_URL` (+ rebuild)

## Finance (E7)

Ставки: `FINANCE_CREDIT_RATE_PERCENT`, `FINANCE_LEASING_RATE_PERCENT`, `FINANCE_MIN_DOWN_PERCENT`, `FINANCE_CURRENCY=USD`.  
UI: `/finance`, также виджет на карточке авто.

## AI chat agent (E10)

Полноценный агент с tools:

- `search_cars` — инвентарь
- `search_faq` — FAQ из БД
- `get_dealer_info` — адрес/часы
- `estimate_finance` — расчёт USD
- `escalate_to_manager` — CRM lead

С `OPENAI_API_KEY` — OpenAI function-calling loop (`OPENAI_CHAT_MODEL`, default `gpt-4o-mini`).  
Без ключа — локальный tool-агент (те же tools, эвристики).

`CHAT_RATE_LIMIT_PER_MIN` — лимит запросов чата с IP (default 30).  
`API_RATE_LIMIT_PER_MIN` — общий лимит API (default 120).

## Phase 6 launch prep

Без боевых ключей: SEO (`/robots.txt`, `/sitemap.xml`), security headers, runbook, smoke.

См. [runbook.md](./runbook.md), [test-plan.md](./test-plan.md).

## Forgot password (email)

Нужны `GMAIL_USER` + `GMAIL_APP_PASSWORD` (или настроенный SMTP через тот же MailService). Без почты ссылка сброса пишется в лог backend.
