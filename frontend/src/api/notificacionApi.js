import apiClient from './apiClient';

/** Servicios de notificaciones. */
export const notificacionApi = {
  listar:     ()   => apiClient.get('/notificaciones'),
  marcarLeida:(id) => apiClient.put(`/notificaciones/${id}/leida`),
};
