# Authentication Backend — CLAUDE.md

## Project Overview

Production-grade authentication backend built from scratch in TypeScript with Node.js, Express v5, and MongoDB. The developer is building this manually — avoid auto-generating large code blocks unless explicitly asked.

## Stack

| Layer | Library |
|---|---|
| Framework | Express v5 |
| Language | TypeScript (ES2022, NodeNext modules) |
| Database | MongoDB via Mongoose v9 |
| Auth | jsonwebtoken (JWT) |
| Password | bcryptjs (12 salt rounds) |
| Validation | Zod v4 |
| Cookies | cookie-parser |
| Runtime | Node.js (ES Modules, `"type": "module"`) |

## Commands

```bash
npm run dev      # Development — nodemon + tsx (hot reload)
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled output (production)
```

## Project Structure

```
backend/src/
├── config/
│   ├── db.ts              # MongoDB connection (exits on failure)
│   └── env.ts             # Zod-validated env config (frozen object)
├── controllers/
│   └── auth.controller.ts # Thin controllers — delegate to services
├── models/
│   └── User.ts            # Mongoose User schema + IUser interface
├── modules/
│   └── auth/
│       └── auth.validation.ts  # Zod schemas: registerSchema, loginSchema
├── routes/
│   ├── auth.routes.ts     # POST /register, POST /login
│   └── index.ts           # Mounts routes under /api/user
├── services/
│   └── auth.services.ts   # Business logic (register, login)
├── utils/
│   ├── asynchHandler.ts   # Wraps async controllers, forwards errors
│   ├── customError.ts     # AppError class (extends Error, has statusCode)
│   ├── password.ts        # hashPassword / comparePassword (bcryptjs)
│   ├── token.ts           # generateAccessToken / generateRefreshToken / verify*
│   └── validate.ts        # Middleware factory: validates req.body via Zod schema
├── app.ts                 # Express app, middleware, global error handler
└── index.ts               # Entry point: connect DB, start server
```

## Architecture Patterns

**Request flow:** `Route → validate() middleware → Controller → Service → Model`

**Error handling:**
- `AppError(message, statusCode)` for expected errors (401, 400, 422, etc.)
- `asyncHandler(fn)` wraps all async controllers — no try/catch in controllers
- Global error middleware in `app.ts` catches both `AppError` and generic `Error`

**Validation:**
- Zod schemas live in `src/modules/auth/auth.validation.ts`
- `validate(schema)` middleware in `src/utils/validate.ts` runs before controllers
- Validation failure throws `AppError` with 422 status

**Token architecture:**
- Access token: 15m expiry, signed with `JWT_ACCESS_SECRET`
- Refresh token: 7d expiry, signed with `JWT_REFRESH_SECRET`
- Payload shape: `{ userId: string, tokenVersion: number }`
- `tokenVersion` on the User model enables per-user token revocation

## User Model Fields

| Field | Type | Notes |
|---|---|---|
| name | string | lowercase, min 2 chars |
| email | string | unique, lowercase, regex validated |
| password | string | `select: false` by default |
| isEmailVerified | boolean | default false |
| isActive | boolean | default true |
| loginAttempts | number | for brute-force protection |
| lockUntil | Date | account lock expiry |
| tokenVersion | number | increment to invalidate all tokens |
| lastLoginAt | Date | |
| isLocked | virtual | computed: `lockUntil > Date.now()` |

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/auth-system
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

All env vars are validated at startup via Zod in `src/config/env.ts`. The process exits if any required variable is missing or invalid.

## Current Auth Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/user/register | Register new user |
| POST | /api/user/login | Login (tokens not yet wired in) |

## What Is Built vs. What Is Planned

**Built:**
- User registration with hashed password
- Login with password comparison
- JWT token generation and verification utilities
- Custom error handling + async wrapper
- Zod validation middleware
- Env config validation

**Planned / In Progress:**
- Return JWT tokens on login (access + refresh)
- Auth middleware (protect routes)
- Refresh token endpoint
- Logout + token revocation (tokenVersion)
- Email verification
- Account locking after failed login attempts

## Key Conventions

- All async route handlers must be wrapped with `asyncHandler`
- Never use `any` in TypeScript
- Always use `AppError` for expected HTTP errors — never throw plain `Error` in services/controllers
- Password is never returned in responses — `select: false` on schema + explicitly excluded in services
- Import paths must include `.js` extensions (NodeNext module resolution)
