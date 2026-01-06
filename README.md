# ObrAPP MVP v0.1

MVP mínimo con flujo end-to-end:
- Autenticación JWT
- Crear obra
- Listar obras

## Requisitos
- Node.js 18+
- MySQL 8+

## 1) Base de datos

Crear la base y tablas usando el script:

```bash
cd backend
npm install
npm run db:setup
```

Esto crea la BD `obrapp`, las tablas `usuarios` y `obras`, y un usuario demo:
- **Email:** demo@obrapp.local
- **Password:** demo1234

## 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend por defecto en `http://localhost:4000`.

## 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend por defecto en `http://localhost:5173`.

> Si el backend no corre en localhost:4000, setea `VITE_API_URL`.

## 4) Verificación E2E

Con el backend corriendo:

```bash
cd backend
node scripts/verify-e2e.js
```

## Endpoints principales
- `POST /api/auth/login`
- `POST /api/obras` (JWT)
- `GET /api/obras` (JWT)

## Estructura
```
/docs            (no modificar)
/backend
/frontend
/db
```
