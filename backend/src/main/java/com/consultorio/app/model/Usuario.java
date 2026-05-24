package com.consultorio.app.model;

import com.consultorio.app.model.enums.EstadoUsuario;
import com.consultorio.app.model.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa la cuenta de acceso de cualquier usuario del sistema.
 * Almacena credenciales (hash bcrypt) y el rol que determina los permisos.
 */
@Entity
@Table(name = "usuario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 80)
    private String nombreUsuario;

    /** Hash bcrypt (factor de costo 12) de la contrasena del usuario. */
    @Column(name = "contrasena_hash", nullable = false, length = 255)
    private String contrasenaHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Rol rol;

    @Column(name = "fecha_alta", nullable = false, updatable = false)
    private LocalDateTime fechaAlta;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoUsuario estado;

    /** Contador de intentos de autenticacion fallidos consecutivos. */
    @Column(name = "intentos_fallidos", nullable = false, columnDefinition = "TINYINT")
    private int intentosFallidos;

    /** Fecha hasta la que la cuenta esta bloqueada por multiples fallos. */
    @Column(name = "bloqueado_hasta")
    private LocalDateTime bloqueadoHasta;

    @PrePersist
    protected void onPersist() {
        if (fechaAlta == null) fechaAlta = LocalDateTime.now();
        if (estado == null)    estado = EstadoUsuario.activo;
    }
}
