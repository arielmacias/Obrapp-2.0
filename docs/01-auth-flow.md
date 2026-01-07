# Auth Flow (E2E)

## Objetivo
Flujo completo de autenticación con sesión persistente, rutas protegidas y logout seguro.

## Endpoints
Base path: `/api`

### `POST /api/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **200**: `{ token, user: { id, nombre, email, rol } }`
- **400**: `{ error: "email y password son requeridos" }`
- **401**: `{ error: "Credenciales inválidas" }`

### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **200**: `{ user: { id, nombre, email, rol } }`
- **401**: `{ error: "No autorizado" }`

## JWT
- Expira en **7 días**.
- `JWT_SECRET` desde `.env`.
- Middleware `requireAuth` valida Bearer token y expone `req.user`.

## Seguridad mínima
- Passwords con **bcrypt** en DB.
- JWT en `Authorization: Bearer`.

## Seed
El seed usa hashes bcrypt ya generados (en `backend/src/db/seed.sql`).
