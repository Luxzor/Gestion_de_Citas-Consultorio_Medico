package com.consultorio.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Registro de auditoria de todas las operaciones criticas del sistema.
 * Es de solo insercion: ningun endpoint permite modificar ni eliminar registros.
 */
@Entity
@Table(name = "bitacora")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bitacora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bitacora")
    private Long idBitacora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "accion", nullable = false, length = 60)
    private String accion;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "ip", nullable = false, length = 45)
    private String ip;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onPersist() {
        if (fecha == null) fecha = LocalDateTime.now();
    }
}
