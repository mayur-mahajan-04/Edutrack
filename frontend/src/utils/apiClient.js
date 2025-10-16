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
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;