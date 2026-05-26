# E-Commerce Shop

Демонстрационный интернет-магазин: каталог товаров, корзина (localStorage + синхронизация с сервером), оформление заказа с оплатой через **Stripe** (test mode / mock), управление складом и панель администратора.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Vue 3, Vite, Pinia, Vue Router, Axios, Stripe.js |
| Backend | Node.js, Express, JWT, RBAC |
| БД | PostgreSQL |
| Платежи | Stripe API |
| Инфраструктура | Docker, docker-compose |

## Роли (RBAC)

- **customer** — каталог, корзина, заказы, оплата
- **admin** — всё выше + CRUD товаров и изменение остатков (`/admin`)

Демо-администратор (после seed): `admin@shop.local` / `Admin123!`

## Быстрый старт (Docker)

```bash
cd ecommerce
cp .env.example .env
# при необходимости укажите STRIPE_* ключи из https://dashboard.stripe.com/test/apikeys
docker compose up --build
```

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000/api/health |
| PostgreSQL | localhost:5432 |

При первом запуске API автоматически выполняет миграции и seed.

### Stripe webhook (локальная разработка)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Скопируйте `whsec_…` в `.env` → `STRIPE_WEBHOOK_SECRET`.

Без ключей Stripe приложение работает в **mock-режиме** (кнопка «Complete mock payment» на checkout).

## Локальная разработка без Docker

**Backend:**

```bash
cd backend
cp ../.env.example .env
npm install
# PostgreSQL должен быть доступен по DATABASE_URL
npm run migrate
npm run seed
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173 (прокси `/api` → backend).

## Тесты и покрытие

```bash
# из корня
npm install --prefix backend
npm install --prefix frontend
npm run test:coverage
```

Порог покрытия: **≥50%** (Jest — backend, Vitest — frontend).

## API (кратко)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход, JWT |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/products` | Каталог (`q`, `category`, `minPrice`, `maxPrice`, `page`, `limit`) |
| GET/PUT/DELETE | `/api/cart` | Корзина (auth) |
| POST | `/api/cart/sync` | Merge localStorage → сервер |
| POST | `/api/orders` | Создать заказ |
| GET | `/api/orders` | История заказов |
| POST | `/api/checkout/payment-intent` | Stripe PaymentIntent |
| POST | `/api/admin/products` | CRUD товаров (admin) |
| PATCH | `/api/admin/products/:id/stock` | Остаток на складе |

## Структура репозитория

```text
ecommerce/
├── backend/     # Express API
├── frontend/    # Vue SPA
├── docker-compose.yml
└── README.md
```

## Git remote

```bash
git remote add origin https://github.com/Fayman7/Frontend-And-Backend-Development-2sem-5kr.git
git push -u origin main
```
