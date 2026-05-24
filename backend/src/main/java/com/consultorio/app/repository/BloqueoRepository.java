package com.consultorio.app.repository;

import com.consultorio.app.model.Bloqueo;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

/** Repositorio JPA para la entidad Bloqueo (exclusion mutua via SGBD). */
@Repository
public interface BloqueoRepository extends JpaRepository<Bloqueo, String> {

    /** Busca un bloqueo activo con SELECT FOR UPDATE para evitar condicion de carrera. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bloqueo b WHERE b.recurso = :recurso")
    Optional<Bloqueo> findByRecursoForUpdate(@Param("recurso") String recurso);

    /** Elimina bloqueos expirados para limpieza periodica. */
    @Modifying
    @Query("DELETE FROM Bloqueo b WHERE b.timestampExpiracion < :ahora")
    int deleteExpiredLocks(@Param("ahora") LocalDateTime ahora);
}
