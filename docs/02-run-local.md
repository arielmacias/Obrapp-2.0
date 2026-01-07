# Run local

## Requisitos
- Node.js 18+
- MySQL 8+

## 1) Base de datos
```bash
mysql -u <user> -p -e "CREATE DATABASE obrapp;"
mysql -u <user> -p obrapp < backend/src/db/schema.sql
mysql -u <user> -p obrapp < backend/src/db/seed.sql
```

## 2) Backend
```bash
cd backend
cp .env.example .env
# define DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, FRONTEND_ORIGIN
npm install
npm run dev
```

## 3) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## 4) Acceso
- Frontend: http://localhost:5173
- API: http://localhost:4000/api

## PWA (instalación)
- En Chrome/Edge: abre el sitio, clic en el ícono “Instalar” en la barra de URL.
- En móvil: “Agregar a pantalla de inicio”.

## Checklist de verificación
1. Login admin funciona.
2. Login resid funciona.
3. F5 en `/app` mantiene sesión (rehidratación `/me`).
4. Token inválido → logout automático y redirige `/login`.
5. Logout limpia localStorage y redirige `/login`.
6. Errores visibles sin pantalla blanca.
