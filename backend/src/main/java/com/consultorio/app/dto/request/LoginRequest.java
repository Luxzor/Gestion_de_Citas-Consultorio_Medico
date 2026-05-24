package com.consultorio.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** DTO para el inicio de sesion. */
@Data
public class LoginRequest {
    @NotBlank private String nombreUsuario;
    @NotBlank private String contrasena;
}
