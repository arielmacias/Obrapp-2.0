const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getToken = () => localStorage.getItem('obrapp_token');

const request = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || 'Error en la petición');
  }

  return response.json();
};

const requestBlob = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || 'Error en la petición');
  }

  return response.blob();
};

const apiClient = {
  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  listarObras: () => request('/api/obras'),
  obtenerObra: (obraId) => request(`/api/obras/${obraId}`),
  crearObra: (payload) =>
    request('/api/obras', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  actualizarObra: (obraId, payload) =>
    request(`/api/obras/${obraId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  archivarObra: (obraId) =>
    request(`/api/obras/${obraId}/archivar`, {
      method: 'PATCH'
    }),
  listarCuentas: (obraId) => request(`/api/obras/${obraId}/cuentas`),
  crearCuenta: (obraId, payload) =>
    request(`/api/obras/${obraId}/cuentas`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  listarGastos: (obraId, params = '') => request(`/api/obras/${obraId}/gastos${params}`),
  obtenerGasto: (gastoId) => request(`/api/gastos/${gastoId}`),
  crearGasto: (obraId, formData) => {
    const token = getToken();
    return fetch(`${API_URL}/api/obras/${obraId}/gastos`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
        throw new Error(error.message || 'Error en la petición');
      }
      return response.json();
    });
  },
  actualizarGasto: (gastoId, payload) =>
    request(`/api/gastos/${gastoId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  registrarPago: (obraId, gastoId, payload) =>
    request(`/api/obras/${obraId}/gastos/${gastoId}/pagos`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  listarPagos: (obraId, params = '') => request(`/api/obras/${obraId}/pagos${params}`),
  listarEstimaciones: (obraId) => request(`/api/obras/${obraId}/estimaciones`),
  obtenerEstimacion: (estimacionId) => request(`/api/estimaciones/${estimacionId}`),
  generarEstimacion: (obraId, payload) =>
    request(`/api/obras/${obraId}/estimaciones`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),
  previsualizarEstimacion: (obraId, payload) =>
    request(`/api/obras/${obraId}/estimaciones?preview=true`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),
  descargarPdfEstimacion: (estimacionId) => requestBlob(`/api/estimaciones/${estimacionId}/pdf`)
};

export default apiClient;
