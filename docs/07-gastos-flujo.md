# Flujo 3 - Registrar gasto (cómo probar)

## Requisitos previos
- Backend y frontend corriendo en local (ver `docs/02-run-local.md`).
- Base de datos con tablas nuevas (`gastos`, `proveedores`) y la columna `saldo` en `cuentas` (ver `backend/src/db/schema.sql`).
- Cuentas creadas por un admin (menú **Cuentas**).

## Pasos rápidos
1. Inicia sesión con un usuario admin o residente.
2. En el navbar, entra a **Gastos**.
3. Da clic en **+ Nuevo gasto**.
4. Completa el formulario:
   - Selecciona una obra.
   - Selecciona una cuenta (obligatorio).
   - Tipo/Partida/Concepto.
   - Importe (MXN) y estatus de pago.
   - Comprobante: subir PDF/JPG o marcar **Subir después**.
5. Guarda el gasto y verifica en la lista:
   - Si el pago es **PAGADO**, el saldo de la cuenta disminuye.
   - Si es **POR_PAGAR**, no hay impacto.
6. Edita el gasto para cambiar importe/cuenta/pago:
   - El saldo revierte el impacto anterior y aplica el nuevo.
7. Elimina (soft delete):
   - El saldo revierte el impacto previo.

## Regla por rol (semana en curso)
- **Admin**: puede editar y borrar cualquier gasto.
- **Residente**: solo puede editar/borrar gastos dentro de la semana calendario actual (lunes a domingo, horario local).
- Si intenta editar/borrar fuera de la semana, el backend responde **403**.

## Endpoints útiles
- `GET /api/gastos` (paginado + filtros).
- `POST /api/gastos` (crear).
- `GET /api/gastos/:id` (detalle).
- `PUT /api/gastos/:id` (editar, soporta archivo).
- `DELETE /api/gastos/:id` (soft delete).
- `GET /api/gastos/:id/comprobante` (descarga protegida).
- `GET /api/proveedores?q=...` (autocomplete).
