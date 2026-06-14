const API_BASE = process.env.API_BASE || 'http://localhost:8080';

export async function callApi(path, method = 'GET', token, body, isForm = false) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

