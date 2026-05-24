/**
 * Cliente HTTP centralizado con Axios.
 * Agrega automaticamente el token JWT en cada peticion autenticada.
 * Intercepta respuestas 401 para redirigir al login.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Interceptor de peticion: agrega Authorization: Bearer <token>
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: maneja 401 globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
