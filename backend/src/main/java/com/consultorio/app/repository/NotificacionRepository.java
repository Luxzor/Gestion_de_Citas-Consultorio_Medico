package com.consultorio.app.repository;

import com.consultorio.app.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** Repositorio JPA para la entidad Notificacion. */
@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioDestino_IdUsuarioOrderByFechaDesc(Long idUsuario);

    Optional<Notificacion> findByIdNotificacionAndUsuarioDestino_IdUsuario(
            Long idNotificacion, Long idUsuario);

    long countByUsuarioDestino_IdUsuarioAndLeidaFalse(Long idUsuario);
}
