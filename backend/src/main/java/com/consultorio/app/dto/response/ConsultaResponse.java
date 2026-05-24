package com.consultorio.app.dto.response;

import lombok.Builder;
import lombok.Data;

/** Representacion de la historia clinica descifrada de una consulta. */
@Data @Builder
public class ConsultaResponse {
    private Long   idConsulta;
    private Long   idCita;
    private String fechaConsulta;
    // Signos vitales (descifrados en memoria, nunca persistidos en plano)
    private String temperatura;
    private String peso;
    private String altura;
    private String presion;
    // Historia clinica
    private String relatoria;
    private String diagnostico;
    private String prescripcion;
    private String resultados;
    // Datos del paciente asociado
    private Long   idPaciente;
    private String nombrePaciente;
}
