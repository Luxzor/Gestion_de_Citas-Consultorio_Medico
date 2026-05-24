package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Representacion publica de una notificacion. */
@Data @Builder
public class NotificacionResponse {
    private Long    idNotificacion;
    private String  mensaje;
    private boolean leida;
    private String  fecha;
}
