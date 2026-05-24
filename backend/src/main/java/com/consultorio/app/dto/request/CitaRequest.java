package com.consultorio.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** DTO para crear o modificar una cita medica. */
@Data
public class CitaRequest {
    @NotNull private Long idPaciente;
    @NotNull private Long idMedico;
    @NotNull private String fecha;       // formato YYYY-MM-DD
    @NotNull private String horaInicio;  // formato HH:MM
    @NotNull private String horaFin;     // formato HH:MM
    private String estado;               // solo para actualizacion
}
