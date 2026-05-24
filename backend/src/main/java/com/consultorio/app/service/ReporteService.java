package com.consultorio.app.service;

import com.consultorio.app.dto.response.CitaResponse;
import com.consultorio.app.dto.response.ConsultaResponse;
import com.consultorio.app.dto.response.PacienteResponse;
import com.consultorio.app.exception.AccesoDenegadoException;
import com.consultorio.app.exception.RecursoNoEncontradoException;
import com.consultorio.app.model.Cita;
import com.consultorio.app.model.Paciente;
import com.consultorio.app.repository.CitaRepository;
import com.consultorio.app.repository.ConsultaRepository;
import com.consultorio.app.repository.PacienteRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio de generacion de reportes. Todos los endpoints requieren autenticacion.
 * Solo el medico puede acceder a la lista de pacientes y el calendario completo.
 * El historial clinico puede ser consultado por el medico o el propio paciente.
 */
@Service
@RequiredArgsConstructor
public class ReporteService {

    private final PacienteRepository  pacienteRepository;
    private final CitaRepository      citaRepository;
    private final ConsultaRepository  consultaRepository;
    private final PacienteService     pacienteService;
    private final CitaService         citaService;
    private final ConsultaService     consultaService;
    private final BitacoraService     bitacoraService;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /** Reporte: lista de todos los pacientes (solo medico). */
    @Transactional(readOnly = true)
    public List<PacienteResponse> reportePacientes(Long idUsuario, String ip) {
        bitacoraService.registrar(idUsuario, "REPORTE_PACIENTES", null, ip);
        return pacienteRepository.findAllWithUsuario()
                .stream()
                .map(pacienteService::mapearRespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Reporte: calendario de citas agrupado por fecha (solo medico).
     * Devuelve una lista de objetos {fecha, citas[]} para el rango indicado.
     */
    @Transactional(readOnly = true)
    public List<DiaCalendario> reporteCalendario(String desdeStr, String hastaStr,
                                                  Long idUsuario, String ip) {
        LocalDate desde = LocalDate.parse(desdeStr, DATE_FMT);
        LocalDate hasta = LocalDate.parse(hastaStr, DATE_FMT);

        bitacoraService.registrar(idUsuario, "REPORTE_CALENDARIO",
                "desde=" + desdeStr + " hasta=" + hastaStr, ip);

        List<Cita> citas = citaRepository.findByFechaRange(desde, hasta);

        // Agrupar citas por fecha
        Map<LocalDate, List<CitaResponse>> porFecha = new TreeMap<>();
        for (Cita c : citas) {
            porFecha.computeIfAbsent(c.getFecha(), k -> new ArrayList<>())
                    .add(citaService.mapearRespuesta(c));
        }

        return porFecha.entrySet().stream()
                .map(e -> new DiaCalendario(e.getKey().format(DATE_FMT), e.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Reporte: historial clinico completo de un paciente.
     * Accesible por el medico y por el propio paciente.
     */
    @Transactional(readOnly = true)
    public HistorialPaciente reporteHistorial(Long idPaciente,
                                               Long idUsuario, String rol, String ip) {
        // Verificar acceso
        if ("PACIENTE".equalsIgnoreCase(rol)) {
            Paciente p = pacienteRepository.findByUsuario_IdUsuario(idUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Perfil no encontrado"));
            if (!p.getIdPaciente().equals(idPaciente)) {
                throw new AccesoDenegadoException(
                        "No tiene permiso para ver el historial de este paciente");
            }
        }

        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Paciente no encontrado: " + idPaciente));

        List<ConsultaResponse> consultas = consultaService
                .obtenerHistorialPorPaciente(idPaciente, idUsuario, rol, ip);

        return new HistorialPaciente(
                pacienteService.mapearRespuesta(paciente),
                consultas);
    }

    /** DTO interno para el reporte de calendario. */
    @Data @Builder
    public static class DiaCalendario {
        private String            fecha;
        private List<CitaResponse> citas;

        public DiaCalendario(String fecha, List<CitaResponse> citas) {
            this.fecha = fecha;
            this.citas = citas;
        }
    }

    /** DTO interno para el reporte de historial clinico. */
    @Data @Builder
    public static class HistorialPaciente {
        private PacienteResponse        paciente;
        private List<ConsultaResponse>  consultas;

        public HistorialPaciente(PacienteResponse paciente, List<ConsultaResponse> consultas) {
            this.paciente  = paciente;
            this.consultas = consultas;
        }
    }
}
