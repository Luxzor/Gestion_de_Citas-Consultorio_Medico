package com.consultorio.app.repository;

import com.consultorio.app.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** Repositorio JPA para la entidad Paciente. */
@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByUsuario_IdUsuario(Long idUsuario);

    @Query("SELECT p FROM Paciente p JOIN FETCH p.usuario ORDER BY p.nombre")
    List<Paciente> findAllWithUsuario();

    boolean existsByCorreo(String correo);
}
