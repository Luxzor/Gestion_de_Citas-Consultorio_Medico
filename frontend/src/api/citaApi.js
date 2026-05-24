import apiClient from './apiClient';

/** Servicios de citas medicas. */
export const citaApi = {
  crear:          (data)             => apiClient.post('/citas', data),
  listar:         (params)           => apiClient.get('/citas', { params }),
  obtener:        (id)               => apiClient.get(`/citas/${id}`),
  actualizar:     (id, data)         => apiClient.put(`/citas/${id}`, data),
  cancelar:       (id)               => apiClient.delete(`/citas/${id}`),
  disponibilidad: (idMedico, fecha)  => apiClient.get('/citas/disponibilidad', { params: { idMedico, fecha } }),
};
