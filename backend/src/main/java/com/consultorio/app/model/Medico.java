package com.consultorio.app.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad que almacena los datos profesionales del medico.
 * Tiene una relacion uno-a-uno con la entidad Usuario.
 */
@Entity
@Table(name = "medico")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medico")
    private Long idMedico;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "especialidad", nullable = false, length = 100)
    private String especialidad;

    @Column(name = "cedula", nullable = false, length = 30)
    private String cedula;
}
