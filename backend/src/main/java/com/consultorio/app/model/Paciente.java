package com.consultorio.app.model;

import com.consultorio.app.model.enums.Sexo;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad que almacena los datos demograficos del paciente.
 * Tiene una relacion uno-a-uno con la entidad Usuario.
 */
@Entity
@Table(name = "paciente")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Long idPaciente;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "direccion", nullable = false, length = 300)
    private String direccion;

    @Column(name = "correo", nullable = false, length = 150)
    private String correo;

    @Column(name = "telefono", nullable = false, length = 20)
    private String telefono;

    @Column(name = "edad", nullable = false, columnDefinition = "TINYINT")
    private int edad;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false)
    private Sexo sexo;
}
