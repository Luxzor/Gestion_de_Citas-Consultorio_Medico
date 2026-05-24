package com.consultorio.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad utilizada como coordinador de exclusion mutua basado en SGBD.
 * La clave primaria es el identificador del recurso bloqueado:
 * "lock:medico:{id}:fecha:{f}:hora:{h}".
 */
@Entity
@Table(name = "bloqueo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bloqueo {

    @Id
    @Column(name = "recurso", length = 150)
    private String recurso;

    @Column(name = "id_propietario", nullable = false, length = 100)
    private String idPropietario;

    @Column(name = "timestamp_expiracion", nullable = false)
    private LocalDateTime timestampExpiracion;
}
