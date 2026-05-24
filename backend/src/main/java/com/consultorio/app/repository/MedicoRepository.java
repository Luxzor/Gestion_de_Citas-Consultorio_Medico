package com.consultorio.app.repository;

import com.consultorio.app.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/** Repositorio JPA para la entidad Medico. */
@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    Optional<Medico> findByUsuario_IdUsuario(Long idUsuario);
}
