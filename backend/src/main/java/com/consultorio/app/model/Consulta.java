package com.consultorio.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que almacena la historia clinica de una consulta.
 * Todos los campos sensibles se almacenan cifrados con AES-256-GCM.
 * Formato de cada columna BLOB: [IV 12b][Ciphertext][GCM Tag 16b].
 */
@Entity
@Table(name = "consulta")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long idConsulta;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false, unique = true)
    private Cita cita;

    @Lob @Column(name = "temperatura_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] temperaturaCif;

    @Lob @Column(name = "peso_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] pesoCif;

    @Lob @Column(name = "altura_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] alturaCif;

    @Lob @Column(name = "presion_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] presionCif;

    @Lob @Column(name = "relatoria_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] relatoriaCif;

    @Lob @Column(name = "diagnostico_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] diagnosticoCif;

    @Lob @Column(name = "prescripcion_cif", nullable = false, columnDefinition = "BLOB")
    private byte[] prescripcionCif;

    @Lob @Column(name = "resultados_cif", columnDefinition = "BLOB")
    private byte[] resultadosCif;

    @Column(name = "fecha_consulta", nullable = false)
    private LocalDateTime fechaConsulta;

    @PrePersist
    protected void onPersist() {
        if (fechaConsulta == null) fechaConsulta = LocalDateTime.now();
    }
}
