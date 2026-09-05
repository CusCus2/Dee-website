const configuredBase = import.meta.env.VITE_API_URL?.trim();
export const API_BASE = (configuredBase || 'http://127.0.0.1:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  // Only send JSON Content-Type when we actually have a JSON request body.
  // Setting it on a GET causes an unnecessary CORS preflight.
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  let payload = null;

  if (response.status !== 204) {
    payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);
  }

  if (!response.ok) {
    const detail = payload?.detail;
    const validationMessage = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(' • ')
      : null;

    throw new ApiError(
      validationMessage || detail || 'Something went wrong. Please try again.',
      response.status,
      payload
    );
  }

  return payload;
}
