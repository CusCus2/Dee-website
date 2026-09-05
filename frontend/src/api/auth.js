import { apiFetch, ApiError } from './client.js';

export function signup({ username, email, password }) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}

export function login({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  try {
    return await apiFetch('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
