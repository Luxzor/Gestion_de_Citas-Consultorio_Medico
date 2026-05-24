import apiClient from './apiClient';

/** Servicios de autenticacion. */
export const authApi = {
  login:    (data) => apiClient.post('/auth/login', data),
  registro: (data) => apiClient.post('/auth/registro', data),
  logout:   ()     => apiClient.post('/auth/logout'),
};
