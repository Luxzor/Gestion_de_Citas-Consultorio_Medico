package com.consultorio.app.controller;

import com.consultorio.app.dto.request.CitaRequest;
import com.consultorio.app.dto.response.CitaResponse;
import com.consultorio.app.dto.response.DisponibilidadResponse;
import com.consultorio.app.service.CitaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestion de citas medicas.
 * Incluye el mecanismo de control de concurrencia en el endpoint POST.
 */
@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    /**
     * POST /api/citas
     * Crea una nueva cita aplicando exclusion mutua distribuida (Redlock).
     * Puede responder 409 si el horario ya fue tomado concurrentemente.
     */
    @PostMapping
    public ResponseEntity<CitaResponse> crear(
            @Valid @RequestBody CitaRequest req,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String rol = extraerRol();
        CitaResponse resp = citaService.crear(req, idUsuario, rol, httpReq.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /**
     * GET /api/citas
     * Lista citas con filtros opcionales: id_paciente, id_medico, desde, hasta.
     */
    @GetMapping
    public ResponseEntity<List<CitaResponse>> listar(
            @RequestParam(required = false) Long idPaciente,
            @RequestParam(required = false) Long idMedico,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @AuthenticationPrincipal Long idUsuario) {
        String rol = extraerRol();
        return ResponseEntity.ok(
                citaService.listar(idPaciente, idMedico, desde, hasta, idUsuario, rol));
    }

    /**
     * GET /api/citas/disponibilidad
     * Consulta la disponibilidad de horarios de un medico en una fecha.
     * Responde con bloques de 30 minutos de 8:00 a 17:00.
     */
    @GetMapping("/disponibilidad")
    public ResponseEntity<List<DisponibilidadResponse>> disponibilidad(
            @RequestParam Long idMedico,
            @RequestParam String fecha) {
        return ResponseEntity.ok(citaService.consultarDisponibilidad(idMedico, fecha));
    }

    /**
     * GET /api/citas/{id}
     * Obtiene una cita por id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CitaResponse> obtener(
            @PathVariable Long id,
            @AuthenticationPrincipal Long idUsuario) {
        String rol = extraerRol();
        return ResponseEntity.ok(citaService.obtenerPorId(id, idUsuario, rol));
    }

    /**
     * PUT /api/citas/{id}
     * Actualiza fecha, hora o estado de una cita.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CitaResponse> actualizar(
            @PathVariable Long id,
            @RequestBody CitaRequest req,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String rol = extraerRol();
        return ResponseEntity.ok(
                citaService.actualizar(id, req, idUsuario, rol, httpReq.getRemoteAddr()));
    }

    /**
     * DELETE /api/citas/{id}
     * Cancela una cita. Si la cancela el medico, genera notificacion al paciente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String rol = extraerRol();
        citaService.eliminar(id, idUsuario, rol, httpReq.getRemoteAddr());
        return ResponseEntity.ok(Map.of("mensaje", "Cita cancelada exitosamente"));
    }

    private String extraerRol() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
