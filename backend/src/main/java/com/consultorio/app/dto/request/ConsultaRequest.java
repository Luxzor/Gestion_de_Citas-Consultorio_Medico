package com.consultorio.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** DTO para registrar la historia clinica de una consulta. */
@Data
public class ConsultaRequest {
    @NotNull  private Long   idCita;
    @NotBlank private String temperatura;
    @NotBlank private String peso;
    @NotBlank private String altura;
    @NotBlank private String presion;
    @NotBlank private String relatoria;
    @NotBlank private String diagnostico;
    @NotBlank private String prescripcion;
    private String resultados; // opcional
}
