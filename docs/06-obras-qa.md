# QA / Verificación (MVP)

## Backend (cURL)
Reemplaza `<TOKEN_ADMIN>` y `<TOKEN_USER>` con tokens reales.

1. Admin crea obra (201)
```bash
curl -X POST http://localhost:4000/api/obras \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Obra Demo","clave":"ABC"}'
```

2. Clave duplicada en mismo equipo -> 409
```bash
curl -X POST http://localhost:4000/api/obras \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Obra Demo 2","clave":"ABC"}'
```

3. Usuario no admin intenta crear -> 403
```bash
curl -X POST http://localhost:4000/api/obras \
  -H "Authorization: Bearer <TOKEN_USER>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Obra Demo","clave":"DEF"}'
```

4. Listar obras devuelve solo las del equipo
```bash
curl -X GET http://localhost:4000/api/obras \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

## Frontend (checklist manual)
- Login -> /obras
- Crear obra con solo nombre+clave -> OK
- Crear obra con mapa opcional -> OK
- Seleccionar obra y ver resumen -> OK
- Refresh (F5) mantiene obra seleccionada -> OK
