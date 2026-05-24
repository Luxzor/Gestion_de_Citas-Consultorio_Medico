package com.consultorio.app.controller;

import com.consultorio.app.dto.request.PacienteUpdateRequest;
import com.consultorio.app.dto.response.PacienteResponse;
import com.consultorio.app.service.PacienteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestion de pacientes.
 * El acceso esta restringido por rol segun la configuracion de seguridad.
 */
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    /**
     * GET /api/pacientes
     * Lista todos los pacientes. Solo el medico puede acceder.
     */
    @GetMapping
    public ResponseEntity<List<PacienteResponse>> listar() {
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    /**
     * GET /api/pacientes/me
     * Devuelve el perfil del paciente autenticado (busca por idUsuario del JWT).
     */
    @GetMapping("/me")
    public ResponseEntity<PacienteResponse> obtenerMiPerfil(
            @AuthenticationPrincipal Long idUsuario) {
        return ResponseEntity.ok(pacienteService.obtenerPorIdUsuario(idUsuario));
    }

    /**
     * GET /api/pacientes/{id}
     * Obtiene un paciente por id. Medico o el propio paciente.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponse> obtener(
            @PathVariable Long id,
            @AuthenticationPrincipal Long idUsuario) {
        String rol = extraerRol();
        return ResponseEntity.ok(pacienteService.obtenerPorId(id, idUsuario, rol));
    }

    /**
     * PUT /api/pacientes/{id}
     * Actualiza datos del paciente. Medico o el propio paciente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PacienteUpdateRequest req,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String rol = extraerRol();
        return ResponseEntity.ok(
                pacienteService.actualizar(id, req, idUsuario, rol, httpReq.getRemoteAddr()));
    }

    /**
     * DELETE /api/pacientes/{id}
     * Elimina un paciente. Solo el medico puede eliminar.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        pacienteService.eliminar(id, idUsuario, httpReq.getRemoteAddr());
        return ResponseEntity.ok(Map.of("mensaje", "Paciente eliminado exitosamente"));
    }

    private String extraerRol() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
