# DB: Obras (MVP)

## Archivo SQL
El schema actualizado vive en:
- `backend/src/db/schema.sql`

Incluye tablas `equipos`, `usuarios` (con `equipo_id`) y `obras` con el índice único `(equipo_id, clave)`.

## Cómo correrlo (local)
1. Crear la base de datos si no existe.
2. Ejecutar el schema:

```bash
mysql -u <usuario> -p <nombre_db> < backend/src/db/schema.sql
```

3. (Opcional) cargar datos de ejemplo:

```bash
mysql -u <usuario> -p <nombre_db> < backend/src/db/seed.sql
```
