package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Estructura uniforme de respuesta para errores de la API. */
@Data @Builder
public class ErrorResponse {
    private String codigo;
    private String mensaje;
    private String detalle;
}
