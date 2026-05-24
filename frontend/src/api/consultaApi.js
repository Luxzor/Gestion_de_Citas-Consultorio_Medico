import apiClient from './apiClient';

/** Servicios de historia clinica. */
export const consultaApi = {
  registrar:        (data)         => apiClient.post('/consultas', data),
  historialPaciente:(idPaciente)   => apiClient.get(`/consultas/paciente/${idPaciente}`),
  obtener:          (id)           => apiClient.get(`/consultas/${id}`),
};
