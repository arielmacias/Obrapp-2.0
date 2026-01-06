const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
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
