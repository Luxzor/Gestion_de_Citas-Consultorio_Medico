package com.consultorio.app.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** DTO para el registro de un nuevo paciente. */
@Data
public class RegistroRequest {
    @NotBlank @Size(min=4, max=80)
    private String nombreUsuario;
    @NotBlank @Size(min=8, max=100)
    private String contrasena;
    @NotBlank @Size(max=150)
    private String nombre;
    @NotBlank @Size(max=300)
    private String direccion;
    @NotBlank @Email @Size(max=150)
    private String correo;
    @NotBlank @Size(max=20)
    private String telefono;
    @Min(0) @Max(150)
    private int edad;
    @NotNull
    private String sexo;
}
