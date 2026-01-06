# ObrAPP MVP (Obrapp-2.0)

Repositorio para el MVP de ObrAPP (Node.js + Express + MySQL + React + Vite).

## Requisitos
- Node.js 18+
- MySQL 8+

## 1) Configuración de variables de entorno

### Backend
1. Copia `backend/.env.example` a `backend/.env`.
2. Ajusta `DB_PASSWORD` según tu entorno local.

Ejemplo:
```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=obrapp
JWT_SECRET=dev_secret
```

### Frontend
1. Copia `frontend/.env.example` a `frontend/.env`.
2. Ajusta `VITE_API_URL` si cambias el puerto del backend.

```
VITE_API_URL=http://localhost:3001
```

## 2) Base de datos (schema + seed)

1. Crea la base y tablas:
```
mysql -u root -p < database/schema.sql
```

2. (Opcional) Inserta datos de demo:
```
mysql -u root -p < database/seed.sql
```

Datos de demo incluidos:
- 1 obra
- 1 cuenta
- 2 gastos
- 1 pago

## 3) Levantar backend

```
cd backend
npm install
npm run dev
```

## 4) Levantar frontend

```
cd frontend
npm install
npm run dev
```

## Credenciales de prueba (dummy)
- Admin: `admin@obrapp.local` / `password`
- Residente: `residente@obrapp.local` / `password`

## Flujo manual sugerido para pruebas end-to-end

1. **Login** (admin o residente).
2. **Obras** → crear obra o seleccionar una existente.
3. **Gastos** → registrar gasto con comprobante (PDF/JPG).
4. **Detalle de gasto** → cambiar status o pagar (solo admin).
5. **Pagos** → verificar el pago en la semana en curso.
6. **Estimaciones** → generar estimación semanal y descargar PDF.

## Postman
Importa la colección actualizada en `postman/ObrAPP.postman_collection.json` y configura:
- `baseUrl` (por defecto `http://localhost:3001`)
- `token` (Bearer token del login)
- `obra_id` (id de obra seleccionada)

