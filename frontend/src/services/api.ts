import axios from 'axios';
import { useAuthStore } from '../store/authStore.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://classroomconnect.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Token Refresh Rotation (Automatic 401 recovery)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('cc_refreshToken');
      if (!refreshToken) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('cc_accessToken', accessToken);
        localStorage.setItem('cc_refreshToken', newRefreshToken);
        
        // Update store session in place
        const user = useAuthStore.getState().user;
        if (user) {
          useAuthStore.getState().setSession(user, accessToken, newRefreshToken);
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
