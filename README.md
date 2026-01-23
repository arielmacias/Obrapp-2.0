# ObrApp MVP 0.1 — Auth E2E

Repositorio reiniciado para un flujo de autenticación E2E estable con UX/UI minimalista.

## Quickstart

1) **Backend**

```bash
cd backend
cp .env.example .env
# completa variables de DB + JWT_SECRET
npm install
npm run dev
```

2) **Base de datos (MySQL)**

```bash
# crea la base de datos
mysql -u <user> -p -e "CREATE DATABASE obrapp;"

# aplica schema + seed
mysql -u <user> -p obrapp < ./src/db/schema.sql
mysql -u <user> -p obrapp < ./src/db/seed.sql
```

3) **Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

4) Abre `http://localhost:5173`.

## Usuarios seed

- admin: `admin@obrapp.local` / `Admin123!`
- resid: `resid@obrapp.local` / `Resid123!`

## Docs

- [Flujo Auth + endpoints](docs/01-auth-flow.md)
- [Correr local](docs/02-run-local.md)
- [Guías UX/UI](docs/03-ux-ui-guidelines.md)

## Cuentas (MVP)

### Migración / DDL

- `db/001_create_cuentas.sql` (DDL standalone para crear la tabla `cuentas`).
- También se añadió la tabla en `backend/src/db/schema.sql` para setups nuevos.

### Endpoints

`GET /api/cuentas`

- **Admin**: lista sus cuentas (`created_by = user.id`).
- **Residente (MVP)**: lista cuentas del primer admin del mismo `equipo_id`.
  - **Supuesto**: existe al menos un admin asociado al equipo del residente.
  - **TODO**: ajustar a una relación explícita obra -> admin cuando esté disponible.

Query params opcionales:

- `activa=1|0`
- `tipo=efectivo|bancaria_personal|bancaria_empresarial`
- `q=texto` (busca por nombre)

Ejemplo:

```bash
curl -H "Authorization: Bearer <token>" \\
  "http://localhost:4000/api/cuentas?activa=1&tipo=efectivo&q=caja"
```

`POST /api/cuentas` (solo admin)

Payload:

```json
{
  "nombre": "Caja chica",
  "descripcion": "Gastos menores",
  "tipo": "efectivo",
  "activa": true
}
```

Ejemplo:

```bash
curl -X POST -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"nombre":"Caja chica","tipo":"efectivo","activa":true}' \\
  "http://localhost:4000/api/cuentas"
```
