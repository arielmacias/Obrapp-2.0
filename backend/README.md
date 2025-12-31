# ObrAPP Backend

Backend base para la aplicación ObrAPP.

## Requisitos
- Node.js 18+
- MySQL 8+

## Configuración
Crear un archivo `.env` en `/backend` con:

```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=obrapp
JWT_SECRET=dev_secret
```

## Instalación

```
npm install
```

## Ejecución

```
npm run dev
```

## Endpoints base
- `GET /health`
- `POST /api/auth/login`

### Login dummy
- Usuario: `admin@obrapp.local`
- Contraseña: `password`
