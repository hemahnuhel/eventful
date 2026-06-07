# Eventful API

Ticketing platform API built with Node.js, TypeScript, PostgreSQL, and Redis.

## Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL via Prisma ORM
- **Cache**: Redis via ioredis
- **Queue**: BullMQ (reminder/email jobs)
- **Auth**: JWT + Passport.js
- **Payments**: Paystack
- **Docs**: Swagger (OpenAPI 3.0)
- **Tests**: Jest + Supertest

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Fill in values in .env

# 3. Start Postgres + Redis
docker-compose up -d

# 4. Run migrations
npm run prisma:migrate

# 5. Start dev server
npm run dev
```


## API Docs
Visit `http://localhost:3000/api-docs` after starting the server.

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run prisma:migrate` | Run DB migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## Roles
- **CREATOR** — Creates and manages events, views analytics and payments
- **EVENTEE** — Browses events, purchases tickets, sets reminders

## Key Endpoints
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register |
| POST | `/auth/login` | Public | Login |
| GET | `/events` | Public | List events |
| POST | `/events` | CREATOR | Create event |
| GET | `/events/:id/share` | Public | Get share links |
| POST | `/payments/initiate` | EVENTEE | Start payment |
| POST | `/payments/webhook` | Paystack | Handle payment callback |
| PATCH | `/tickets/:id/verify` | CREATOR | Scan QR / verify ticket |
| GET | `/analytics/overview` | CREATOR | Creator stats |
