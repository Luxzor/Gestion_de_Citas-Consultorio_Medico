package com.consultorio.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa un aviso generado automaticamente
 * para notificar a un usuario de cambios en sus citas.
 */
@Entity
@Table(name = "notificacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long idNotificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_destino", nullable = false)
    private Usuario usuarioDestino;

    @Column(name = "mensaje", nullable = false, length = 500)
    private String mensaje;

    @Column(name = "leida", nullable = false, columnDefinition = "BOOLEAN")
    private boolean leida;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onPersist() {
        if (fecha == null) fecha = LocalDateTime.now();
    }
}
