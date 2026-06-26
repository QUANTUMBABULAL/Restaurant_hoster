import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dineflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith('/menu') && !path.startsWith('/login') && !path.startsWith('/register') && path !== '/') {
        localStorage.removeItem('dineflow_token');
        localStorage.removeItem('dineflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return path;
}

export function formatPrice(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
