# Digital Wallet API (Express + TypeScript + Neon)

## Setup

1. Create a free project at https://neon.tech and copy the connection string.
2. Copy `.env.example` to `.env` and paste your string into `DATABASE_URL`.
3. Install and run:

```bash
npm install
npm run dev
```

Tables (`users`, `wallets`, `transactions`) are created automatically on start.

## Endpoints

| Method | URL | Body |
|---|---|---|
| POST | `/api/v1/users` | `{ name, email, password, age }` (also creates a wallet) |
| GET | `/api/v1/users` | |
| GET | `/api/v1/users/:id` | |
| PUT | `/api/v1/users/:id` | any of `{ name, password, age, is_active }` |
| DELETE | `/api/v1/users/:id` | |
| GET | `/api/v1/wallets/:userId` | |
| POST | `/api/v1/wallets/:userId/deposit` | `{ amount, note? }` |
| POST | `/api/v1/wallets/:userId/withdraw` | `{ amount, note? }` |
| POST | `/api/v1/wallets/transfer` | `{ fromUserId, toUserId, amount, note? }` |
| GET | `/api/v1/wallets/:userId/transactions` | |

## Quick test

```bash
curl -X POST localhost:5000/api/v1/users -H "Content-Type: application/json" \
  -d '{"name":"Ali","email":"ali@test.com","password":"123456","age":25}'

curl -X POST localhost:5000/api/v1/wallets/1/deposit -H "Content-Type: application/json" \
  -d '{"amount":500}'
```
# Digital-Wallet-NeonDB
