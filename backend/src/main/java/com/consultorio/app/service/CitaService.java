package com.consultorio.app.service;

import com.consultorio.app.dto.request.CitaRequest;
import com.consultorio.app.dto.response.CitaResponse;
import com.consultorio.app.dto.response.DisponibilidadResponse;
import com.consultorio.app.exception.AccesoDenegadoException;
import com.consultorio.app.exception.HorarioNoDisponibleException;
import com.consultorio.app.exception.RecursoNoEncontradoException;
import com.consultorio.app.model.*;
import com.consultorio.app.model.enums.EstadoCita;
import com.consultorio.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de gestion de citas medicas.
 *
 * Implementa el mecanismo de exclusion mutua distribuida para la reserva de citas:
 * 1. Adquiere bloqueo en Redis con la clave medico+fecha+hora.
 * 2. Verifica disponibilidad real en la BD dentro de la zona critica.
 * 3. Persiste la cita dentro de una transaccion.
 * 4. Libera el bloqueo Redis.
 * La restriccion UNIQUE de la BD actua como segunda linea de defensa.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CitaService {

    private final CitaRepository       citaRepository;
    private final PacienteRepository   pacienteRepository;
    private final MedicoRepository     medicoRepository;
    private final UsuarioRepository    usuarioRepository;
    private final ConcurrenciaService  concurrenciaService;
    private final NotificacionService  notificacionService;
    private final BitacoraService      bitacoraService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DT_FMT   = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Crea una nueva cita aplicando exclusion mutua distribuida.
     *
     * @param req       Datos de la cita a crear
     * @param idUsuario Id del usuario que realiza la reserva
     * @param rol       Rol del usuario (paciente o medico)
     * @param ip        IP de origen para la bitacora
     */
    @Transactional
    public CitaResponse crear(CitaRequest req, Long idUsuario, String rol, String ip) {
        LocalDate fecha      = LocalDate.parse(req.getFecha(), DATE_FMT);
        LocalTime horaInicio = LocalTime.parse(req.getHoraInicio(), TIME_FMT);
        LocalTime horaFin    = LocalTime.parse(req.getHoraFin(), TIME_FMT);

        // Construir clave de bloqueo para el horario solicitado
        String clave       = concurrenciaService.construirClave(req.getIdMedico(), fecha, horaInicio);
        String propietario = concurrenciaService.generarIdPropietario();

        // Paso 1: Intentar adquirir bloqueo distribuido en Redis
        if (!concurrenciaService.adquirirBloqueo(clave, propietario)) {
            throw new HorarioNoDisponibleException(
                    "El horario ya esta siendo reservado por otro usuario");
        }

        try {
            // Paso 2: Verificar disponibilidad real en BD (zona critica)
            boolean ocupado = citaRepository
                    .existsByMedico_IdMedicoAndFechaAndHoraInicioAndEstadoNot(
                            req.getIdMedico(), fecha, horaInicio, EstadoCita.cancelada);
            if (ocupado) {
                throw new HorarioNoDisponibleException(
                        "El horario solicitado ya esta reservado");
            }

            Paciente paciente = pacienteRepository.findById(req.getIdPaciente())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Paciente no encontrado: " + req.getIdPaciente()));
            Medico medico = medicoRepository.findById(req.getIdMedico())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Medico no encontrado: " + req.getIdMedico()));
            Usuario creadaPor = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Usuario no encontrado: " + idUsuario));

            // Paso 3: Persistir la cita dentro de transaccion
            Cita cita = Cita.builder()
                    .paciente(paciente)
                    .medico(medico)
                    .fecha(fecha)
                    .horaInicio(horaInicio)
                    .horaFin(horaFin)
                    .estado(EstadoCita.programada)
                    .creadaPor(creadaPor)
                    .build();
            cita = citaRepository.save(cita);

            // Notificar al paciente si la cita fue creada por el medico
            if ("MEDICO".equalsIgnoreCase(rol)) {
                notificacionService.crearNotificacion(
                        paciente.getUsuario().getIdUsuario(),
                        String.format("El medico ha registrado una nueva cita para usted el %s a las %s.",
                                fecha.format(DATE_FMT), horaInicio.format(TIME_FMT)));
            }

            bitacoraService.registrar(idUsuario, "CREAR_CITA",
                    "Cita id=" + cita.getIdCita() + " paciente=" + req.getIdPaciente(), ip);
            return mapearRespuesta(cita);

        } finally {
            // Paso 4: Siempre liberar el bloqueo al terminar (exito o error)
            concurrenciaService.liberarBloqueo(clave, propietario);
        }
    }

    /** Lista citas filtradas por paciente, medico o rango de fechas. */
    @Transactional(readOnly = true)
    public List<CitaResponse> listar(Long idPaciente, Long idMedico,
                                     String desde, String hasta, Long idUsuario, String rol) {
        List<Cita> citas;

        if (idMedico != null && desde != null && hasta != null) {
            citas = citaRepository.findByMedicoAndFechaRange(
                    idMedico,
                    LocalDate.parse(desde, DATE_FMT),
                    LocalDate.parse(hasta, DATE_FMT));
        } else if (idPaciente != null) {
            // Un paciente solo puede ver sus propias citas
            if ("PACIENTE".equalsIgnoreCase(rol)) {
                Paciente p = pacienteRepository.findByUsuario_IdUsuario(idUsuario)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Perfil no encontrado"));
                if (!p.getIdPaciente().equals(idPaciente)) {
                    throw new AccesoDenegadoException("No puede ver citas de otro paciente");
                }
            }
            citas = citaRepository.findByPaciente_IdPacienteOrderByFechaDescHoraInicioDesc(idPaciente);
        } else {
            // Sin filtros: el medico ve todas; el paciente solo las suyas
            if ("PACIENTE".equalsIgnoreCase(rol)) {
                Paciente p = pacienteRepository.findByUsuario_IdUsuario(idUsuario)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Perfil no encontrado"));
                citas = citaRepository
                        .findByPaciente_IdPacienteOrderByFechaDescHoraInicioDesc(p.getIdPaciente());
            } else {
                citas = citaRepository.findAll();
            }
        }

        return citas.stream().map(this::mapearRespuesta).collect(Collectors.toList());
    }

    /** Obtiene una cita por id. */
    @Transactional(readOnly = true)
    public CitaResponse obtenerPorId(Long idCita, Long idUsuario, String rol) {
        Cita cita = buscarCita(idCita);
        verificarAccesoCita(cita, idUsuario, rol);
        return mapearRespuesta(cita);
    }

    /** Actualiza estado, fecha u hora de una cita. */
    @Transactional
    public CitaResponse actualizar(Long idCita, CitaRequest req,
                                   Long idUsuario, String rol, String ip) {
        Cita cita = buscarCita(idCita);
        verificarAccesoCita(cita, idUsuario, rol);

        if (req.getFecha()      != null) cita.setFecha(LocalDate.parse(req.getFecha(), DATE_FMT));
        if (req.getHoraInicio() != null) cita.setHoraInicio(LocalTime.parse(req.getHoraInicio(), TIME_FMT));
        if (req.getHoraFin()    != null) cita.setHoraFin(LocalTime.parse(req.getHoraFin(), TIME_FMT));
        if (req.getEstado()     != null) cita.setEstado(EstadoCita.fromString(req.getEstado()));

        bitacoraService.registrar(idUsuario, "MODIFICAR_CITA",
                "Cita id=" + idCita, ip);
        return mapearRespuesta(citaRepository.save(cita));
    }

    /** Elimina una cita y notifica al paciente si la elimina el medico. */
    @Transactional
    public void eliminar(Long idCita, Long idUsuario, String rol, String ip) {
        Cita cita = buscarCita(idCita);

        // Si el medico elimina, notificar al paciente
        if ("MEDICO".equalsIgnoreCase(rol)) {
            notificacionService.crearNotificacion(
                    cita.getPaciente().getUsuario().getIdUsuario(),
                    String.format("Su cita del %s a las %s ha sido cancelada por el medico.",
                            cita.getFecha().format(DATE_FMT),
                            cita.getHoraInicio().format(TIME_FMT)));
        } else {
            // Un paciente solo puede cancelar sus propias citas
            verificarAccesoCita(cita, idUsuario, rol);
        }

        cita.setEstado(EstadoCita.cancelada);
        citaRepository.save(cita);
        bitacoraService.registrar(idUsuario, "CANCELAR_CITA",
                "Cita id=" + idCita, ip);
    }

    /**
     * Devuelve la disponibilidad de horarios para un medico en una fecha.
     * Los horarios disponibles son los de 8:00 a 17:00 con bloques de 30 minutos.
     */
    @Transactional(readOnly = true)
    public List<DisponibilidadResponse> consultarDisponibilidad(Long idMedico, String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr, DATE_FMT);
        List<DisponibilidadResponse> resultado = new ArrayList<>();

        LocalTime hora = LocalTime.of(8, 0);
        LocalTime fin  = LocalTime.of(17, 0);

        while (hora.isBefore(fin)) {
            LocalTime horaFin = hora.plusMinutes(30);
            boolean ocupado = citaRepository
                    .existsByMedico_IdMedicoAndFechaAndHoraInicioAndEstadoNot(
                            idMedico, fecha, hora, EstadoCita.cancelada);
            resultado.add(DisponibilidadResponse.builder()
                    .horaInicio(hora.format(TIME_FMT))
                    .horaFin(horaFin.format(TIME_FMT))
                    .disponible(!ocupado)
                    .build());
            hora = horaFin;
        }
        return resultado;
    }

    private Cita buscarCita(Long idCita) {
        return citaRepository.findById(idCita)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Cita no encontrada: " + idCita));
    }

    private void verificarAccesoCita(Cita cita, Long idUsuario, String rol) {
        if ("MEDICO".equalsIgnoreCase(rol)) return;
        if (!cita.getPaciente().getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new AccesoDenegadoException(
                    "No tiene permiso para acceder a esta cita");
        }
    }

    public CitaResponse mapearRespuesta(Cita c) {
        return CitaResponse.builder()
                .idCita(c.getIdCita())
                .fecha(c.getFecha().format(DATE_FMT))
                .horaInicio(c.getHoraInicio().format(TIME_FMT))
                .horaFin(c.getHoraFin().format(TIME_FMT))
                .estado(c.getEstado().name())
                .idPaciente(c.getPaciente().getIdPaciente())
                .nombrePaciente(c.getPaciente().getNombre())
                .idMedico(c.getMedico().getIdMedico())
                .nombreMedico(c.getMedico().getNombre())
                .fechaCreacion(c.getFechaCreacion().format(DT_FMT))
                .build();
    }
}
