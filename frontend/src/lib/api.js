/**
 * Thin fetch wrapper around the HealthPlate API.
 *
 * In dev, Vite proxies /api to the local backend (see vite.config.js). In
 * production, set VITE_API_URL to the deployed Render backend origin.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path) {
  return `${API_BASE}/api${path}`;
}

const TOKEN_KEY = 'healthplate_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private browsing mode - the token simply does not persist.
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = true, signal } = {}) {
  const token = auth ? getToken() : null;

  let res;
  try {
    res = await fetch(apiUrl(path), {
      method,
      signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  if (res.status === 204) return null;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(payload.error || `Request failed (${res.status})`, res.status);
  }

  return payload;
}

/** Builds a query string, dropping empty values and joining arrays with commas. */
export function toQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (!value.length) continue;
      search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  health: () => request('/health', { auth: false }),

  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  filterConfig: () => request('/auth/config', { auth: false }),

  listRestaurants: (params, signal) =>
    request(`/restaurants${toQuery(params)}`, { signal }),
  getRestaurant: (id, params) => request(`/restaurants/${id}${toQuery(params || {})}`),
  filterOptions: () => request('/restaurants/meta/filters', { auth: false }),
  searchNearby: (params) => request('/restaurants/search-nearby', { method: 'POST' }),

  listDishes: (params, signal) => request(`/dishes${toQuery(params)}`, { signal }),
  getDish: (id) => request(`/dishes/${id}`),
  createDish: (payload) => request('/dishes', { method: 'POST', body: payload }),
  updateDish: (id, payload) => request(`/dishes/${id}`, { method: 'PATCH', body: payload }),
  voteDish: (id, direction) => request(`/dishes/${id}/vote`, { method: 'POST', body: { direction } }),

  getCart: () => request('/cart'),
  addToCart: (payload) => request('/cart/add', { method: 'POST', body: payload }),
  updateCart: (payload) => request('/cart/update', { method: 'PUT', body: payload }),
  removeCartItem: (itemId) => request(`/cart/remove/${itemId}`, { method: 'DELETE' }),
  checkout: () => request('/checkout', { method: 'POST' }),
  listOrders: () => request('/orders'),
};
