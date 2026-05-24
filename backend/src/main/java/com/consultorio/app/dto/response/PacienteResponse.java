package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Representacion publica de un paciente. */
@Data @Builder
public class PacienteResponse {
    private Long   idPaciente;
    private Long   idUsuario;
    private String nombreUsuario;
    private String nombre;
    private String direccion;
    private String correo;
    private String telefono;
    private int    edad;
    private String sexo;
}
