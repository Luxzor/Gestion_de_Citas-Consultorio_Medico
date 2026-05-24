package com.consultorio.app.repository;

import com.consultorio.app.model.Cita;
import com.consultorio.app.model.enums.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/** Repositorio JPA para la entidad Cita. */
@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    /** Verifica si existe una cita para el medico en el horario indicado (para exclusion mutua). */
    boolean existsByMedico_IdMedicoAndFechaAndHoraInicioAndEstadoNot(
            Long idMedico, LocalDate fecha, LocalTime horaInicio, EstadoCita estado);

    /** Obtiene todas las citas de un paciente ordenadas por fecha descendente. */
    List<Cita> findByPaciente_IdPacienteOrderByFechaDescHoraInicioDesc(Long idPaciente);

    /** Obtiene todas las citas de un medico en un rango de fechas. */
    @Query("SELECT c FROM Cita c JOIN FETCH c.paciente JOIN FETCH c.medico " +
           "WHERE c.medico.idMedico = :idMedico AND c.fecha BETWEEN :desde AND :hasta " +
           "ORDER BY c.fecha, c.horaInicio")
    List<Cita> findByMedicoAndFechaRange(
            @Param("idMedico") Long idMedico,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);

    /** Obtiene citas en un rango de fechas para el reporte de calendario. */
    @Query("SELECT c FROM Cita c JOIN FETCH c.paciente JOIN FETCH c.medico " +
           "WHERE c.fecha BETWEEN :desde AND :hasta ORDER BY c.fecha, c.horaInicio")
    List<Cita> findByFechaRange(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    /** Cita especifica de un medico en dia y hora (para verificacion de disponibilidad). */
    Optional<Cita> findByMedico_IdMedicoAndFechaAndHoraInicio(
            Long idMedico, LocalDate fecha, LocalTime horaInicio);
}
