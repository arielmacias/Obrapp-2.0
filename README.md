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

