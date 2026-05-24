import apiClient from './apiClient';

/** Servicios de reportes. */
export const reporteApi = {
  pacientes:  ()                    => apiClient.get('/reportes/pacientes'),
  calendario: (desde, hasta)        => apiClient.get('/reportes/calendario', { params: { desde, hasta } }),
  historial:  (idPaciente)          => apiClient.get(`/reportes/historial/${idPaciente}`),
};
