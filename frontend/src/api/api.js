const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const getToken = () => localStorage.getItem("token");

const request = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = data?.error || data?.message || "Error de servidor";
    throw new Error(error);
  }

  return data;
};

const requestFormData = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = data?.error || data?.message || "Error de servidor";
    throw new Error(error);
  }

  return data;
};

export const loginRequest = (payload) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const meRequest = () => request("/auth/me");

export const fetchObrasRequest = () => request("/obras");

export const createObraRequest = (payload) =>
  request("/obras", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchObraRequest = (obraId) => request(`/obras/${obraId}`);

export const updateObraRequest = (obraId, payload) =>
  request(`/obras/${obraId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteObraRequest = (obraId) =>
  request(`/obras/${obraId}`, {
    method: "DELETE",
  });

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.append(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const fetchCuentasRequest = (params) =>
  request(`/cuentas${buildQuery(params)}`);

export const createCuentaRequest = (payload) =>
  request("/cuentas", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCuentas = (params) => fetchCuentasRequest(params);

export const fetchGastosRequest = (params) =>
  request(`/gastos${buildQuery(params)}`);

export const fetchGastoRequest = (gastoId) => request(`/gastos/${gastoId}`);

const buildFormData = (payload, file) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    formData.append(key, value);
  });
  if (file) {
    formData.append("comprobante", file);
  }
  return formData;
};

export const createGastoRequest = (payload, file) => {
  if (file) {
    return requestFormData("/gastos", {
      method: "POST",
      body: buildFormData(payload, file),
    });
  }
  return request("/gastos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateGastoRequest = (gastoId, payload, file) => {
  if (file) {
    return requestFormData(`/gastos/${gastoId}`, {
      method: "PUT",
      body: buildFormData(payload, file),
    });
  }
  return request(`/gastos/${gastoId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteGastoRequest = (gastoId) =>
  request(`/gastos/${gastoId}`, { method: "DELETE" });

export const fetchProveedoresRequest = (query) =>
  request(`/proveedores${buildQuery({ q: query })}`);

export const downloadComprobanteRequest = async (gastoId) => {
  const token = getToken();
  const response = await fetch(`${baseUrl}/gastos/${gastoId}/comprobante`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = data?.error || data?.message || "Error de servidor";
    throw new Error(error);
  }
  return response.blob();
};
