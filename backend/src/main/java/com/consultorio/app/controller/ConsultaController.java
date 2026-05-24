package com.consultorio.app.controller;

import com.consultorio.app.dto.request.ConsultaRequest;
import com.consultorio.app.dto.response.ConsultaResponse;
import com.consultorio.app.service.ConsultaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la historia clinica.
 * La creacion de consultas es exclusiva del medico.
 * La consulta del historial es accesible para el medico y el propio paciente.
 */
@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaService consultaService;

    /**
     * POST /api/consultas
     * Registra la historia clinica de una cita. Solo el medico puede crear.
     * Los datos se cifran con AES-256-GCM antes de persistir.
     */
    @PostMapping
    public ResponseEntity<ConsultaResponse> registrar(
            @Valid @RequestBody ConsultaRequest req,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        ConsultaResponse resp = consultaService.registrar(req, idUsuario, httpReq.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /**
     * PUT /api/consultas/{id}
     * Actualiza la historia clinica de una consulta. Solo el medico puede modificar.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConsultaResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ConsultaRequest req,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        ConsultaResponse resp = consultaService.actualizar(id, req, idUsuario, httpReq.getRemoteAddr());
        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/consultas/paciente/{idPaciente}
     * Obtiene el historial clinico completo de un paciente (descifrado en memoria).
     */
    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<ConsultaResponse>> historialPorPaciente(
            @PathVariable Long idPaciente,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String rol = extraerRol();
        return ResponseEntity.ok(
                consultaService.obtenerHistorialPorPaciente(
                        idPaciente, idUsuario, rol, httpReq.getRemoteAddr()));
    }

    /**
     * GET /api/consultas/{id}
     * Obtiene una consulta por id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConsultaResponse> obtener(
            @PathVariable Long id,
            @AuthenticationPrincipal Long idUsuario) {
        String rol = extraerRol();
        return ResponseEntity.ok(consultaService.obtenerPorId(id, idUsuario, rol));
    }

    private String extraerRol() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
