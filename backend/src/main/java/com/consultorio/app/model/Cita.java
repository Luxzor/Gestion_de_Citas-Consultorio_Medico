package com.consultorio.app.model;

import com.consultorio.app.model.enums.EstadoCita;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entidad que representa una cita medica.
 * El indice unico (id_medico, fecha, hora_inicio) garantiza a nivel de BD
 * que no existan dos citas en el mismo horario para el mismo medico.
 */
@Entity
@Table(name = "cita",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_cita_medico_horario",
           columnNames = {"id_medico", "fecha", "hora_inicio"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Long idCita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medico", nullable = false)
    private Medico medico;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCita estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creada_por", nullable = false)
    private Usuario creadaPor;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onPersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (estado == null)        estado = EstadoCita.programada;
    }
}
