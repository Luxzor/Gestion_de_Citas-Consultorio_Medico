package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Representacion publica de una cita medica. */
@Data @Builder
public class CitaResponse {
    private Long   idCita;
    private String fecha;
    private String horaInicio;
    private String horaFin;
    private String estado;
    private Long   idPaciente;
    private String nombrePaciente;
    private Long   idMedico;
    private String nombreMedico;
    private String fechaCreacion;
}
