import axios from 'axios';

// Target live production Render backend
const LIVE_BACKEND_URL = 'https://edufind-api-wy4u.onrender.com';

let rawApiUrl = import.meta.env.VITE_API_URL;
// Override stale/dead Render URL or empty env var
if (!rawApiUrl || typeof rawApiUrl !== 'string' || rawApiUrl.includes('p9y8') || rawApiUrl.trim() === '') {
  rawApiUrl = LIVE_BACKEND_URL;
}

let apiBaseUrl = `${LIVE_BACKEND_URL}/api`;
if (rawApiUrl && typeof rawApiUrl === 'string' && rawApiUrl.trim() !== '') {
  const trimmed = rawApiUrl.trim().replace(/\/+$/, '');
  apiBaseUrl = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edufind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking /auth/me
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('edufind_token');
        localStorage.removeItem('edufind_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
