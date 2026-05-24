package com.consultorio.app.service;

import com.consultorio.app.dto.response.NotificacionResponse;
import com.consultorio.app.exception.RecursoNoEncontradoException;
import com.consultorio.app.model.Notificacion;
import com.consultorio.app.model.Usuario;
import com.consultorio.app.repository.NotificacionRepository;
import com.consultorio.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestion de notificaciones de usuario.
 * Las notificaciones se generan automaticamente cuando:
 * - El medico cancela una cita de un paciente.
 * - El medico crea una nueva cita para un paciente.
 */
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository      usuarioRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /** Crea y persiste una nueva notificacion para el usuario indicado. */
    @Transactional
    public void crearNotificacion(Long idUsuarioDestino, String mensaje) {
        Usuario destino = usuarioRepository.findById(idUsuarioDestino)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario destino no encontrado: " + idUsuarioDestino));

        Notificacion notif = Notificacion.builder()
                .usuarioDestino(destino)
                .mensaje(mensaje)
                .leida(false)
                .build();
        notificacionRepository.save(notif);
    }

    /** Devuelve todas las notificaciones del usuario autenticado, mas recientes primero. */
    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerPorUsuario(Long idUsuario) {
        return notificacionRepository
                .findByUsuarioDestino_IdUsuarioOrderByFechaDesc(idUsuario)
                .stream()
                .map(this::mapearRespuesta)
                .collect(Collectors.toList());
    }

    /** Marca una notificacion como leida. Verifica que pertenezca al usuario. */
    @Transactional
    public NotificacionResponse marcarLeida(Long idNotificacion, Long idUsuario) {
        Notificacion notif = notificacionRepository
                .findByIdNotificacionAndUsuarioDestino_IdUsuario(idNotificacion, idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Notificacion no encontrada: " + idNotificacion));
        notif.setLeida(true);
        return mapearRespuesta(notificacionRepository.save(notif));
    }

    private NotificacionResponse mapearRespuesta(Notificacion n) {
        return NotificacionResponse.builder()
                .idNotificacion(n.getIdNotificacion())
                .mensaje(n.getMensaje())
                .leida(n.isLeida())
                .fecha(n.getFecha().format(FORMATTER))
                .build();
    }
}
