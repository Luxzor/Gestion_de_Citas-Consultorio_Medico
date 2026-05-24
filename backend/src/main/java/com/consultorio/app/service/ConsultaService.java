package com.consultorio.app.service;

import com.consultorio.app.dto.request.ConsultaRequest;
import com.consultorio.app.dto.response.ConsultaResponse;
import com.consultorio.app.exception.AccesoDenegadoException;
import com.consultorio.app.exception.RecursoNoEncontradoException;
import com.consultorio.app.model.Cita;
import com.consultorio.app.model.Consulta;
import com.consultorio.app.model.Paciente;
import com.consultorio.app.model.enums.EstadoCita;
import com.consultorio.app.repository.CitaRepository;
import com.consultorio.app.repository.ConsultaRepository;
import com.consultorio.app.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de historia clinica.
 * Cifra todos los campos sensibles antes de persistir y los descifra
 * al recuperar. Solo el medico puede crear registros de consulta;
 * el medico y el paciente propietario pueden leer el historial.
 */
@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository  consultaRepository;
    private final CitaRepository      citaRepository;
    private final PacienteRepository  pacienteRepository;
    private final CifradoService      cifradoService;
    private final BitacoraService     bitacoraService;

    private static final DateTimeFormatter DT_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Registra la historia clinica de una consulta.
     * Todos los campos sensibles se cifran con AES-256-GCM antes de persistir.
     */
    @Transactional
    public ConsultaResponse registrar(ConsultaRequest req, Long idUsuario, String ip) {
        Cita cita = citaRepository.findById(req.getIdCita())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Cita no encontrada: " + req.getIdCita()));

        Consulta consulta = Consulta.builder()
                .cita(cita)
                // Cifrar cada campo sensible individualmente con AES-256-GCM
                .temperaturaCif(cifradoService.cifrar(req.getTemperatura()))
                .pesoCif(cifradoService.cifrar(req.getPeso()))
                .alturaCif(cifradoService.cifrar(req.getAltura()))
                .presionCif(cifradoService.cifrar(req.getPresion()))
                .relatoriaCif(cifradoService.cifrar(req.getRelatoria()))
                .diagnosticoCif(cifradoService.cifrar(req.getDiagnostico()))
                .prescripcionCif(cifradoService.cifrar(req.getPrescripcion()))
                .resultadosCif(req.getResultados() != null
                        ? cifradoService.cifrar(req.getResultados()) : null)
                .build();

        consulta = consultaRepository.save(consulta);

        // Cambiar estado de la cita a 'atendida'
        cita.setEstado(EstadoCita.atendida);
        citaRepository.save(cita);

        bitacoraService.registrar(idUsuario, "REGISTRAR_CONSULTA",
                "Consulta id=" + consulta.getIdConsulta() + " cita=" + req.getIdCita(), ip);
        return mapearRespuesta(consulta);
    }

    /**
     * Obtiene el historial clinico de un paciente.
     * Verifica que el solicitante sea el medico o el propio paciente.
     */
    @Transactional(readOnly = true)
    public List<ConsultaResponse> obtenerHistorialPorPaciente(
            Long idPaciente, Long idUsuario, String rol, String ip) {

        if ("PACIENTE".equalsIgnoreCase(rol)) {
            Paciente p = pacienteRepository.findByUsuario_IdUsuario(idUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Perfil no encontrado"));
            if (!p.getIdPaciente().equals(idPaciente)) {
                throw new AccesoDenegadoException(
                        "No tiene permiso para ver el historial de este paciente");
            }
        }

        bitacoraService.registrar(idUsuario, "ACCESO_HISTORIAL",
                "Paciente id=" + idPaciente, ip);

        return consultaRepository.findByPacienteIdOrderByFecha(idPaciente)
                .stream()
                .map(this::mapearRespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza la historia clinica de una consulta existente.
     * Re-cifra todos los campos proporcionados con AES-256-GCM.
     * Solo el medico puede modificar registros.
     */
    @Transactional
    public ConsultaResponse actualizar(Long idConsulta, ConsultaRequest req,
                                       Long idUsuario, String ip) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Consulta no encontrada: " + idConsulta));

        consulta.setTemperaturaCif(cifradoService.cifrar(req.getTemperatura()));
        consulta.setPesoCif(cifradoService.cifrar(req.getPeso()));
        consulta.setAlturaCif(cifradoService.cifrar(req.getAltura()));
        consulta.setPresionCif(cifradoService.cifrar(req.getPresion()));
        consulta.setRelatoriaCif(cifradoService.cifrar(req.getRelatoria()));
        consulta.setDiagnosticoCif(cifradoService.cifrar(req.getDiagnostico()));
        consulta.setPrescripcionCif(cifradoService.cifrar(req.getPrescripcion()));
        consulta.setResultadosCif(req.getResultados() != null
                ? cifradoService.cifrar(req.getResultados()) : null);

        consulta = consultaRepository.save(consulta);
        bitacoraService.registrar(idUsuario, "ACTUALIZAR_CONSULTA",
                "Consulta id=" + idConsulta, ip);
        return mapearRespuesta(consulta);
    }

    /** Obtiene una consulta especifica por id. */
    @Transactional(readOnly = true)
    public ConsultaResponse obtenerPorId(Long idConsulta, Long idUsuario, String rol) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Consulta no encontrada: " + idConsulta));

        if ("PACIENTE".equalsIgnoreCase(rol)) {
            Long idPacienteConsulta = consulta.getCita().getPaciente().getUsuario().getIdUsuario();
            if (!idPacienteConsulta.equals(idUsuario)) {
                throw new AccesoDenegadoException(
                        "No tiene permiso para ver esta consulta");
            }
        }

        return mapearRespuesta(consulta);
    }

    /**
     * Descifra los campos de la consulta en memoria para devolver al cliente.
     * Los datos descifrados nunca se persisten en texto plano.
     */
    private ConsultaResponse mapearRespuesta(Consulta c) {
        return ConsultaResponse.builder()
                .idConsulta(c.getIdConsulta())
                .idCita(c.getCita().getIdCita())
                .fechaConsulta(c.getFechaConsulta().format(DT_FMT))
                .temperatura(cifradoService.descifrar(c.getTemperaturaCif()))
                .peso(cifradoService.descifrar(c.getPesoCif()))
                .altura(cifradoService.descifrar(c.getAlturaCif()))
                .presion(cifradoService.descifrar(c.getPresionCif()))
                .relatoria(cifradoService.descifrar(c.getRelatoriaCif()))
                .diagnostico(cifradoService.descifrar(c.getDiagnosticoCif()))
                .prescripcion(cifradoService.descifrar(c.getPrescripcionCif()))
                .resultados(c.getResultadosCif() != null
                        ? cifradoService.descifrar(c.getResultadosCif()) : null)
                .idPaciente(c.getCita().getPaciente().getIdPaciente())
                .nombrePaciente(c.getCita().getPaciente().getNombre())
                .build();
    }
}
