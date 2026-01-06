# Decisions

- **Ubicación**: se guarda como texto libre (ej. "Lat,Lon" o descripción) porque /docs no define formato.
- **Clientes**: se guarda como texto libre (lista separada por comas) por falta de especificación de estructura.
- **Responsable de obra**: se guarda como texto libre.
- **Autenticación**: login con email/password y JWT básico, con un usuario seed demo.
- **Contraseña**: se almacena con hash SHA-256 (hex) para evitar dependencias extra; puede migrarse a bcrypt en el futuro.
