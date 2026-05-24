package com.consultorio.app.service;

import com.consultorio.app.dto.request.PacienteUpdateRequest;
import com.consultorio.app.dto.response.PacienteResponse;
import com.consultorio.app.exception.AccesoDenegadoException;
import com.consultorio.app.exception.RecursoNoEncontradoException;
import com.consultorio.app.model.Paciente;
import com.consultorio.app.model.enums.EstadoUsuario;
import com.consultorio.app.model.enums.Rol;
import com.consultorio.app.model.enums.Sexo;
import com.consultorio.app.repository.PacienteRepository;
import com.consultorio.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de gestion de pacientes.
 * Aplica control de acceso: el medico puede ver y eliminar cualquier paciente;
 * el paciente solo puede ver y modificar su propio perfil.
 */
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository  usuarioRepository;
    private final BitacoraService    bitacoraService;

    /** Lista todos los pacientes. Solo accesible por el medico. */
    @Transactional(readOnly = true)
    public List<PacienteResponse> listarTodos() {
        return pacienteRepository.findAllWithUsuario()
                .stream()
                .map(this::mapearRespuesta)
                .collect(Collectors.toList());
    }

    /** Obtiene el perfil del paciente buscando por idUsuario (usado en /me). */
    @Transactional(readOnly = true)
    public PacienteResponse obtenerPorIdUsuario(Long idUsuario) {
        Paciente paciente = pacienteRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Paciente no encontrado para usuario: " + idUsuario));
        return mapearRespuesta(paciente);
    }

    /** Obtiene un paciente por id. Verifica que el solicitante tenga acceso. */
    @Transactional(readOnly = true)
    public PacienteResponse obtenerPorId(Long idPaciente, Long idUsuario, String rol) {
        Paciente paciente = buscarPaciente(idPaciente);
        verificarAcceso(paciente, idUsuario, rol);
        return mapearRespuesta(paciente);
    }

    /** Actualiza los datos de un paciente. Paciente solo puede modificar su propio perfil. */
    @Transactional
    public PacienteResponse actualizar(Long idPaciente, PacienteUpdateRequest req,
                                       Long idUsuario, String rol, String ip) {
        Paciente paciente = buscarPaciente(idPaciente);
        verificarAcceso(paciente, idUsuario, rol);

        if (req.getNombre()    != null) paciente.setNombre(req.getNombre());
        if (req.getDireccion() != null) paciente.setDireccion(req.getDireccion());
        if (req.getCorreo()    != null) paciente.setCorreo(req.getCorreo());
        if (req.getTelefono()  != null) paciente.setTelefono(req.getTelefono());
        if (req.getEdad()      != null) paciente.setEdad(req.getEdad());
        if (req.getSexo()      != null) paciente.setSexo(Sexo.valueOf(req.getSexo()));

        Paciente actualizado = pacienteRepository.save(paciente);
        bitacoraService.registrar(idUsuario, "MODIFICAR_PACIENTE",
                "Paciente id=" + idPaciente, ip);
        return mapearRespuesta(actualizado);
    }

    /** Desactiva un paciente (soft delete). Solo accesible por el medico. */
    @Transactional
    public void eliminar(Long idPaciente, Long idUsuario, String ip) {
        Paciente paciente = buscarPaciente(idPaciente);
        paciente.getUsuario().setEstado(EstadoUsuario.inactivo);
        usuarioRepository.save(paciente.getUsuario());
        bitacoraService.registrar(idUsuario, "ELIMINAR_PACIENTE",
                "Paciente id=" + idPaciente, ip);
    }

    private Paciente buscarPaciente(Long idPaciente) {
        return pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Paciente no encontrado: " + idPaciente));
    }

    /** Un paciente solo puede acceder a su propio perfil; el medico puede acceder a cualquiera. */
    private void verificarAcceso(Paciente paciente, Long idUsuario, String rol) {
        if ("MEDICO".equalsIgnoreCase(rol)) return;
        if (!paciente.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new AccesoDenegadoException(
                    "No tiene permiso para acceder al perfil de este paciente");
        }
    }

    public PacienteResponse mapearRespuesta(Paciente p) {
        return PacienteResponse.builder()
                .idPaciente(p.getIdPaciente())
                .idUsuario(p.getUsuario().getIdUsuario())
                .nombreUsuario(p.getUsuario().getNombreUsuario())
                .nombre(p.getNombre())
                .direccion(p.getDireccion())
                .correo(p.getCorreo())
                .telefono(p.getTelefono())
                .edad(p.getEdad())
                .sexo(p.getSexo().name())
                .build();
    }
}
