package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Respuesta al login o registro exitoso. */
@Data @Builder
public class AuthResponse {
    private String  token;
    private String  rol;
    private Long    idUsuario;
    private Long    idPaciente;  // null para usuarios con rol medico
    private String  expiracion;
}
