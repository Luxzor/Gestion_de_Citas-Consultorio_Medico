package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Respuesta del endpoint de disponibilidad de horarios. */
@Data @Builder
public class DisponibilidadResponse {
    private String  horaInicio;
    private String  horaFin;
    private boolean disponible;
}
