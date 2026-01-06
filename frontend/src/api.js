const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function handleResponse(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  if (!response.ok) {
    const message = data?.message || `Error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function login(email, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function listObras(token) {
  const response = await fetch(`${baseUrl}/api/obras`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function createObra(token, payload) {
  const response = await fetch(`${baseUrl}/api/obras`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
