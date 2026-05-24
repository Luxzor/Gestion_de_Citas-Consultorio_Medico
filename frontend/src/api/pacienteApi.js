import apiClient from './apiClient';

/** Servicios CRUD de pacientes. */
export const pacienteApi = {
  listar:    ()           => apiClient.get('/pacientes'),
  obtenerMe: ()           => apiClient.get('/pacientes/me'),
  obtener:   (id)         => apiClient.get(`/pacientes/${id}`),
  actualizar:(id, data)   => apiClient.put(`/pacientes/${id}`, data),
  eliminar:  (id)         => apiClient.delete(`/pacientes/${id}`),
};
