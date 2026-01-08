# API Obras (MVP)

Base URL: `/api`

## Auth
Todas las rutas requieren token Bearer.

## GET `/obras`
Lista obras del equipo del usuario autenticado.

**Respuesta 200**
```json
{
  "data": [
    {
      "id": 1,
      "equipo_id": 1,
      "created_by": 2,
      "nombre": "Obra Paseo Norte",
      "clave": "ABC",
      "cliente_nombre": "Cliente",
      "status": "ACTIVA",
      "fecha_inicio": "2024-08-10",
      "direccion_estado": "Jalisco",
      "direccion_ciudad": "Guadalajara",
      "direccion_colonia": null,
      "direccion_calle": null,
      "direccion_numero": null,
      "direccion_cp": null,
      "lat": 19.432608,
      "lng": -99.133209,
      "portada_url": null,
      "created_at": "2024-08-20T10:00:00.000Z"
    }
  ]
}
```

## POST `/obras`
Crea una obra (solo role=admin).

**Body**
```json
{
  "nombre": "Obra Paseo Norte",
  "clave": "ABC",
  "cliente_nombre": "Cliente",
  "status": "ACTIVA",
  "fecha_inicio": "2024-08-10",
  "direccion_estado": "Jalisco",
  "direccion_ciudad": "Guadalajara",
  "direccion_colonia": "Centro",
  "direccion_calle": "Av. México",
  "direccion_numero": "120",
  "direccion_cp": "44100",
  "lat": 19.432608,
  "lng": -99.133209,
  "portada_url": "https://example.com/cover.jpg"
}
```

**Respuesta 201**
```json
{
  "data": {
    "id": 1,
    "equipo_id": 1,
    "created_by": 1,
    "nombre": "Obra Paseo Norte",
    "clave": "ABC",
    "cliente_nombre": "Cliente",
    "status": "ACTIVA",
    "fecha_inicio": "2024-08-10",
    "direccion_estado": "Jalisco",
    "direccion_ciudad": "Guadalajara",
    "direccion_colonia": "Centro",
    "direccion_calle": "Av. México",
    "direccion_numero": "120",
    "direccion_cp": "44100",
    "lat": 19.432608,
    "lng": -99.133209,
    "portada_url": "https://example.com/cover.jpg",
    "created_at": "2024-08-20T10:00:00.000Z"
  }
}
```

**Errores**
- 400: validación
- 403: role no autorizado
- 409: clave duplicada por equipo

## GET `/obras/:id`
Obtiene el detalle de una obra del mismo equipo.

**Respuesta 200**
```json
{
  "data": {
    "id": 1,
    "equipo_id": 1,
    "created_by": 1,
    "nombre": "Obra Paseo Norte",
    "clave": "ABC",
    "cliente_nombre": "Cliente",
    "status": "ACTIVA",
    "fecha_inicio": "2024-08-10",
    "direccion_estado": "Jalisco",
    "direccion_ciudad": "Guadalajara",
    "direccion_colonia": "Centro",
    "direccion_calle": "Av. México",
    "direccion_numero": "120",
    "direccion_cp": "44100",
    "lat": 19.432608,
    "lng": -99.133209,
    "portada_url": "https://example.com/cover.jpg",
    "created_at": "2024-08-20T10:00:00.000Z"
  }
}
```

**Errores**
- 403: obra no pertenece al equipo
- 404: obra no encontrada
