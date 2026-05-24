package com.consultorio.app.controller;

import com.consultorio.app.dto.response.PacienteResponse;
import com.consultorio.app.service.ReporteService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controlador REST para la generacion de reportes.
 * Todos los endpoints requieren autenticacion valida.
 */
@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    /**
     * GET /api/reportes/pacientes
     * Lista de todos los pacientes. Solo medico.
     */
    @GetMapping("/pacientes")
    public ResponseEntity<List<PacienteResponse>> reportePacientes(
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        return ResponseEntity.ok(
                reporteService.reportePacientes(idUsuario, httpReq.getRemoteAddr()));
    }

    /**
     * GET /api/reportes/calendario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
     * Calendario de citas agrupado por fecha. Solo medico.
     * Si no se proporcionan fechas, devuelve los proximos 30 dias.
     */
    @GetMapping("/calendario")
    public ResponseEntity<List<ReporteService.DiaCalendario>> reporteCalendario(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String desdeEfectivo = (desde != null && !desde.isBlank())
                ? desde : LocalDate.now().toString();
        String hastaEfectivo = (hasta != null && !hasta.isBlank())
                ? hasta : LocalDate.now().plusDays(30).toString();
        return ResponseEntity.ok(
                reporteService.reporteCalendario(desdeEfectivo, hastaEfectivo,
                        idUsuario, httpReq.getRemoteAddr()));
    }

    /**
     * GET /api/reportes/historial/{idPaciente}
     * Historial clinico completo de un paciente. Medico o el propio paciente.
     */
    @GetMapping("/historial/{idPaciente}")
    public ResponseEntity<ReporteService.HistorialPaciente> reporteHistorial(
            @PathVariable Long idPaciente,
            @AuthenticationPrincipal Long idUsuario,
            HttpServletRequest httpReq) {
        String rol = extraerRol();
        return ResponseEntity.ok(
                reporteService.reporteHistorial(idPaciente, idUsuario, rol, httpReq.getRemoteAddr()));
    }

    private String extraerRol() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
