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
