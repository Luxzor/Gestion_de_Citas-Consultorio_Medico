package com.consultorio.app.controller;

import com.consultorio.app.dto.response.NotificacionResponse;
import com.consultorio.app.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para notificaciones de usuario.
 * Cada usuario solo puede ver y marcar sus propias notificaciones.
 */
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    /**
     * GET /api/notificaciones
     * Devuelve todas las notificaciones del usuario autenticado.
     */
    @GetMapping
    public ResponseEntity<List<NotificacionResponse>> listar(
            @AuthenticationPrincipal Long idUsuario) {
        return ResponseEntity.ok(notificacionService.obtenerPorUsuario(idUsuario));
    }

    /**
     * PUT /api/notificaciones/{id}/leida
     * Marca una notificacion como leida. Solo el destinatario puede hacerlo.
     */
    @PutMapping("/{id}/leida")
    public ResponseEntity<NotificacionResponse> marcarLeida(
            @PathVariable Long id,
            @AuthenticationPrincipal Long idUsuario) {
        return ResponseEntity.ok(notificacionService.marcarLeida(id, idUsuario));
    }
}
