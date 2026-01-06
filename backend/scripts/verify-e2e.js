const apiUrl = process.env.API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function run() {
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'demo@obrapp.local',
      password: 'demo1234',
    }),
  });

  if (!login.token) {
    throw new Error('No token returned from login');
  }

  const obraPayload = {
    nombre_proyecto: 'Obra Demo',
    clave: 'ODM',
    direccion: 'Calle 123',
    ubicacion: '19.4326,-99.1332',
    clientes: 'Cliente Demo',
    responsable_obra: 'Responsable Demo',
    fecha_inicio: '2024-01-01',
    porcentaje_honorarios: 10,
    estado: 'activa',
  };

  const created = await request('/api/obras', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${login.token}`,
    },
    body: JSON.stringify(obraPayload),
  });

  if (!created || created.nombre_proyecto !== obraPayload.nombre_proyecto) {
    throw new Error('Obra no creada correctamente');
  }

  const list = await request('/api/obras', {
    headers: {
      Authorization: `Bearer ${login.token}`,
    },
  });

  if (!Array.isArray(list)) {
    throw new Error('Listado de obras inválido');
  }

  const found = list.find((item) => item.id === created.id);
  if (!found) {
    throw new Error('La obra creada no aparece en el listado');
  }

  console.log('E2E OK');
}

run().catch((error) => {
  console.error('E2E FAILED:', error.message);
  process.exit(1);
});
