# Implementation Plan (MVP v0.1)

## Campos mínimos de Obra (según /docs/puntocero.md)
- **nombre_proyecto** (Nombre del proyecto)
- **clave** (3 caracteres alfanuméricos)
- **direccion**
- **ubicacion** (seleccionar del mapa)
- **clientes**
- **responsable_obra**
- **fecha_inicio**
- **porcentaje_honorarios** (ej. 10–20%)
- **estado** (activa / archivada)

## Endpoints deseados
- **POST /api/auth/login**
- **POST /api/obras** (requiere JWT)
- **GET /api/obras** (requiere JWT)

## Validaciones
- Campos requeridos de Obra: todos los listados arriba.
- **clave**: exactamente 3 caracteres alfanuméricos.
- **porcentaje_honorarios**: número.
- **estado**: `activa` o `archivada`.
- Usuario no autenticado: **401**.
- Datos faltantes o inválidos: **400** con mensaje claro.

## Decisiones asumidas
- Ver /docs/DECISIONS.md.
