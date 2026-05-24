package com.consultorio.app.repository;

import com.consultorio.app.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** Repositorio JPA para la entidad Consulta (historia clinica). */
@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    Optional<Consulta> findByCita_IdCita(Long idCita);

    /** Historial clinico completo de un paciente ordenado por fecha. */
    @Query("SELECT con FROM Consulta con JOIN FETCH con.cita c JOIN FETCH c.paciente " +
           "WHERE c.paciente.idPaciente = :idPaciente ORDER BY con.fechaConsulta DESC")
    List<Consulta> findByPacienteIdOrderByFecha(@Param("idPaciente") Long idPaciente);
}
