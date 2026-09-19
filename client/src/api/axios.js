import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.PROD
  ? 'https://eventra-backend-bio5.onrender.com/api'
  : '/api';
const apiUrl = configuredApiUrl && /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl.replace(/\/+$/, '')
  : defaultApiUrl;

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
