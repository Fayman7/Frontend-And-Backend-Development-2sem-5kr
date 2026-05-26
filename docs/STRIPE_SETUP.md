# Настройка Stripe API

Проект использует **Payment Intents** + **Payment Element** (тестовый режим Stripe).

## 1. Получить ключи

1. Зарегистрируйтесь на [stripe.com](https://stripe.com).
2. Откройте [Test API keys](https://dashboard.stripe.com/test/apikeys).
3. Скопируйте:
   - **Publishable key** → `pk_test_…`
   - **Secret key** → `sk_test_…`

## 2. Файл `.env` в корне `ecommerce/`

```bash
cp .env.example .env
```

Заполните в `.env`:

```env
STRIPE_SECRET_KEY=sk_test_ВАШ_СЕКРЕТНЫЙ_КЛЮЧ
STRIPE_WEBHOOK_SECRET=whsec_…   # шаг 3
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ
```

Проверка:

```bash
cd backend
npm run stripe:check
```

## 3. Webhook (локально)

Установите [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

CLI выведет `whsec_…` — вставьте в `.env` как `STRIPE_WEBHOOK_SECRET` и **перезапустите API**.

События, которые обрабатывает backend:

- `payment_intent.succeeded` → заказ `paid`
- `payment_intent.payment_failed` → заказ `failed`, возврат stock

Если webhook не запущен, после оплаты на checkout фронт вызывает `POST /api/checkout/sync-status` (подтянет статус из Stripe).

## 4. Docker

После правки `.env` пересоберите фронт (ключ вшивается при build):

```bash
docker compose down
docker compose build --no-cache web api
docker compose up -d
```

В другом терминале — `stripe listen` на хост `localhost:3000` (порт API проброшен).

## 5. Тестовая карта

| Поле | Значение |
|------|----------|
| Номер | `4242 4242 4242 4242` |
| Срок | любой будущий |
| CVC | любые 3 цифры |

Другие сценарии: [Stripe test cards](https://docs.stripe.com/testing#cards).

## 6. Mock-режим

Если ключи не заданы (placeholder в `.env` / docker-compose), checkout показывает **Complete mock payment** — без Stripe.

## Переменные

| Переменная | Где используется |
|------------|------------------|
| `STRIPE_SECRET_KEY` | Backend: PaymentIntent, webhook |
| `STRIPE_WEBHOOK_SECRET` | Backend: проверка подписи webhook |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend: Stripe.js / Payment Element |

Секретные ключи **не коммитьте** — только `.env.example`.
