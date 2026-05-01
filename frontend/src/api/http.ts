import axios from 'axios';

interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL?: string;
    readonly DEV?: boolean;
  };
}

const rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) {
    console.info('[API]', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      const status = error?.response?.status;
      const url = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`;
      console.error('[API ERROR]', status || 'NO_STATUS', url, error?.response?.data || error?.message);
    }
    return Promise.reject(error);
  }
);

export default http;
