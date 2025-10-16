import axios from 'axios';

// Simple cache for GET requests
const cache = new Map();
const CACHE_TIME = 300000; // 5 minutes

// Production-ready axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://edutrack-si4v.onrender.com/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Optimized request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Simple GET request caching
  if (config.method === 'get') {
    const key = config.url + JSON.stringify(config.params || {});
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < CACHE_TIME) {
      return Promise.resolve({ data: cached.data, status: 200, config });
    }
  }
  return config;
});

// Response interceptor with caching
apiClient.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      const key = response.config.url + JSON.stringify(response.config.params || {});
      cache.set(key, { data: response.data, time: Date.now() });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;