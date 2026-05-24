package com.consultorio.app.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** DTO para actualizar los datos de un paciente. Todos los campos son opcionales. */
@Data
public class PacienteUpdateRequest {
    @Size(max=150) private String nombre;
    @Size(max=300) private String direccion;
    @Email @Size(max=150) private String correo;
    @Size(max=20)  private String telefono;
    @Min(0) @Max(150) private Integer edad;
    private String sexo;
}
